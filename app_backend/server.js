const express = require('express');
const axios = require('axios');
const cors = require('cors');
require('dotenv').config(); 
const app = express();
app.use(cors()); 

const PORT = 5050; 
const API_KEY = process.env.OPENWEATHER_API_KEY;

if (!API_KEY) 
{
    console.error("FATAL ERROR: OPENWEATHER_API_KEY is not defined in .env file.");
    // process.exit(1);
}


app.get('/api/weather', async (req, res) => 
    {
        const city = req.query.city;
        if (!city) 
        {
            return res.status(400).json({ message: 'City query parameter is required' });
        }
   
        if (!API_KEY) 
        {
            return res.status(500).json({ message: 'Server configuration error: API key missing' });
        }

        const weatherURL = `https://api.openweathermap.org/data/2.5/weather?q=${city}&units=metric&appid=${API_KEY}`;
        console.log(`Requesting weather for ${city} from: ${weatherURL.replace(API_KEY, '***')}`); 


    try 
    {
        const response = await axios.get(weatherURL);
        res.json(response.data);
    } 
    catch (err) 
    {
        const errorStatus = err.response?.status;
        const errorData = err.response?.data;
        console.error(`OpenWeatherMap API Error for city "${city}":`, errorStatus, errorData || err.message);

        const status = errorStatus || 500;
        // Customize message for common errors
        let message = 'Error, please check external API status.';
        if (status === 429) 
            {
                message = 'API rate limit exceeded. Please try again later.';
            } 
        else if (status === 500) 
            {
                message = 'OpenWeatherMap API is currently unavailable.';
            } 
        else if (status === 503) 
            {
                message = 'Service unavailable. Please try again later.';
            } 
        else if (status === 404) 
            {
                message = `City not found: ${city}`;
            } 
        else if (status === 401) 
            {
                message = 'Invalid API Key - Check server configuration.';
            } 
        else if (errorData?.message) 
            {
                message = errorData.message;
            }

        res.status(status).json({ message: message });
    }
});

app.listen(PORT, () => 
    {
    console.log(`Server running on http://localhost:5050`);
    }
);