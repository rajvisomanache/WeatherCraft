import React, { useState, useEffect } from 'react';
import axios from 'axios';
import WeatherCard from './WeatherCard';
import './App.css'; 

function App() {
  const [city, setCity] = useState('');
  const [weather, setWeather] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [favorites, setFavorites] = useState(
    () => JSON.parse(localStorage.getItem('favorites')) || []
  );

 //background decider
  const getBodyBackgroundClass = (currentWeather) => {
    if (!currentWeather || !currentWeather.weather || !currentWeather.weather[0] || !currentWeather.sys) {
      return 'bg-day-default';
    }

    const condition = currentWeather.weather[0].main.toLowerCase();
    // timezones to ms
    const currentTime = (currentWeather.dt + currentWeather.timezone) * 1000;
    const sunriseTime = (currentWeather.sys.sunrise + currentWeather.timezone) * 1000;
    const sunsetTime = (currentWeather.sys.sunset + currentWeather.timezone) * 1000;

    // interval of time
    const transitionWindow = 30 * 60 * 1000; 
    const sunriseWindowStart = sunriseTime - transitionWindow;
    const sunriseWindowEnd = sunriseTime + transitionWindow;
    const sunsetWindowStart = sunsetTime - transitionWindow;
    const sunsetWindowEnd = sunsetTime + transitionWindow;

    let timeOfDay = 'day';

    if (currentTime >= sunriseWindowStart && currentTime <= sunriseWindowEnd) {
      return 'bg-sunrise';
    } else if (currentTime >= sunsetWindowStart && currentTime <= sunsetWindowEnd) {
      return 'bg-sunset';
    } else if (currentTime < sunriseTime || currentTime > sunsetTime) {
      timeOfDay = 'night';
    }
   
    //middle conditions
    switch (condition) {
      case 'clear': return `bg-${timeOfDay}-clear`;
      case 'clouds': return `bg-${timeOfDay}-clouds`;
      case 'rain': case 'drizzle': case 'thunderstorm': return `bg-${timeOfDay}-rain`;
      case 'snow': return `bg-${timeOfDay}-snow`;
      case 'mist': case 'smoke': case 'haze': case 'dust': case 'fog': case 'sand': case 'ash': case 'squall': case 'tornado':
        return `bg-${timeOfDay}-mist`;
      default: return `bg-${timeOfDay}-default`;
    }
  };

  useEffect(() => {
    localStorage.setItem('favorites', JSON.stringify(favorites));
  }, [favorites]);

  // changes the bg
  useEffect(() => {
    let bgClassToSet = 'bg-day-default';
    if (weather) {
      bgClassToSet = getBodyBackgroundClass(weather);
    }
    
    document.body.classList.forEach(className => {
      if (className.startsWith('bg-')) {
        document.body.classList.remove(className);
      }
    });
    document.body.classList.add(bgClassToSet);
  }, [weather]);


  const handleSearch = async () => {
    if (!city) return;
    setLoading(true);
    setError('');
    setWeather(null); 
    try {
      const res = await axios.get(`http://localhost:5050/api/weather?city=${city}`);
      if (res.data) {
        setWeather(res.data);
      } else {
         setError('Weather data not found.');
      }
    } catch (err) {
      console.error("Search Error:", err);
      const message = err.response?.data?.message || 'City not found or API error.';
      setError(message);
    } finally {
       setLoading(false);
    }
  };

  const saveFavorite = () => {
    if (weather && weather.name && !favorites.includes(weather.name)) {
      setFavorites(prevFavorites => [...prevFavorites, weather.name]);
    } else if (!weather?.name) {
       setError("Search for a city before saving.");
    } else if (favorites.includes(weather.name)) {
       setError(`${weather.name} is already in favorites.`);
    }
  };

  const loadFavorite = async (favCity) => {
    setCity(favCity);
    setLoading(true);
    setError('');
    setWeather(null);
    try {
      const res = await axios.get(`http://localhost:5050/api/weather?city=${favCity}`);
      setWeather(res.data);
    } catch (err) {
       console.error("Load Favorite Error:", err);
       const message = err.response?.data?.message || `Could not load weather for ${favCity}.`;
       setError(message);
    } finally {
        setLoading(false);
    }
  };

  const removeFavorite = (cityToRemove) => {
    setFavorites(prevFavorites => prevFavorites.filter(fav => fav !== cityToRemove));
  };

  const handleKeyPress = (event) => {
    if (event.key === 'Enter') {
      handleSearch();
    }
  };

  return (
    <div className="app-container">
      <h1>
        <span role="img" aria-label="Sun behind cloud emoji" className="weather-emoji">
            🌤️
        </span>{' '}
        Weather Dashboard
      </h1>

      <div className="search-container">
        <input
          value={city}
          onChange={(e) => setCity(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="Enter city name"
        />
        <button onClick={handleSearch} disabled={loading || !city}>
          {loading ? 'Searching...' : 'Search'}
        </button>
        <button onClick={saveFavorite} disabled={!weather?.name || favorites.includes(weather?.name) || loading }>
          Save Favorite
        </button>
      </div>

       {error && <p className="error-message">{error}</p>}

      {weather && <WeatherCard data={weather} iconCode={weather.weather[0].icon} />}

      {favorites.length > 0 && (
         <div className="favorites-container">
           <h3>Favorites</h3>
           <ul className="favorites-list">
             {favorites.map((fav, i) => (
               <li key={i}>
                 <span onClick={() => loadFavorite(fav)} style={{ cursor: 'pointer' }}>
                   {fav}
                 </span>
                 <button onClick={() => removeFavorite(fav)} className="remove-fav-button" title={`Remove ${fav}`}>
                   ×
                 </button>
               </li>
             ))}
           </ul>
         </div>
      )}
    </div>
  );
}

export default App;