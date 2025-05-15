import React from 'react';
function formatTime(unixTimestamp, timezoneOffsetSeconds) {
  if (!unixTimestamp) return '';
  // Create date object adjusted for UTC + timezone offset
  const date = new Date((unixTimestamp + timezoneOffsetSeconds) * 1000);
  // Get hours and minutes in UTC 
  let hours = date.getUTCHours();
  const minutes = date.getUTCMinutes();
  const ampm = hours >= 12 ? 'PM' : 'AM';
  hours = hours % 12;
  hours = hours ? hours : 12; 
  const minutesStr = minutes < 10 ? '0' + minutes : minutes;
  return `${hours}:${minutesStr} ${ampm}`;
}

function formatVisibility(visibilityMeters) {
    if (visibilityMeters == null) return 'N/A'; 
    if (visibilityMeters >= 1000) {
        return `${(visibilityMeters / 1000).toFixed(1)} km`;
    }
    return `${visibilityMeters} m`;
}


function WeatherCard({ data, iconCode }) {
  if (!data) return null;

  const iconUrl = `https://openweathermap.org/img/wn/${iconCode}@2x.png`;
  const rain1h = data.rain?.['1h']; 
  const snow1h = data.snow?.['1h'];

  return (
    <div className="weather-card">
      <h2>
        {data.name}, {data.sys?.country} 
        {iconCode && <img src={iconUrl} alt={data.weather?.[0]?.description} className="weather-icon" />}
      </h2>

      {/* Temperature Details */}
      <p><strong>Temperature:</strong> {Math.round(data.main.temp)}°C</p>
      <p><strong>Feels Like:</strong> {Math.round(data.main.feels_like)}°C</p>
      <p><strong>Today's High:</strong> {Math.round(data.main.temp_max)}°C</p>
      <p><strong>Today's Low:</strong> {Math.round(data.main.temp_min)}°C</p>

      {/* Conditions */}
      <p><strong>Condition:</strong> {data.weather?.[0]?.main} - {data.weather?.[0]?.description}</p>

      {/* Atmosphere */}
      <p><strong>Humidity:</strong> {data.main.humidity}%</p>
      <p><strong>Cloud Cover:</strong> {data.clouds?.all}%</p>
      <p><strong>Pressure:</strong> {data.main.pressure} hPa</p>
      <p><strong>Visibility:</strong> {formatVisibility(data.visibility)}</p>

      {/* Wind */}
      <p><strong>Wind Speed:</strong> {data.wind?.speed} m/s {data.wind?.deg != null ? `(${data.wind.deg}°)` : ''}</p>
      {data.wind?.gust && <p><strong>Wind Gusts:</strong> {data.wind.gust} m/s</p>} {/* Conditionally show gusts */}

      {/* Precipitation */}
      {rain1h != null && <p><strong>Rain (last 1h):</strong> {rain1h} mm</p>}
      {snow1h != null && <p><strong>Snow (last 1h):</strong> {snow1h} mm</p>}

      {/* Sunrise/Sunset */}
      <p><strong>Sunrise:</strong> {formatTime(data.sys?.sunrise, data.timezone)}</p>
      <p><strong>Sunset:</strong> {formatTime(data.sys?.sunset, data.timezone)}</p>

    </div>
  );
}

export default WeatherCard;
