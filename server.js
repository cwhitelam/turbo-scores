import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import fetch from 'node-fetch';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

// Weather API proxy endpoint - MUST come before static file handling
app.get('/api/weather', async (req, res) => {
    const { city, state } = req.query;
    const API_KEY = process.env.VITE_OPENWEATHER_API_KEY;

    if (!API_KEY) {
        console.error('Weather API Error: API key not configured on server');
        return res.status(500).json({ error: 'Weather API key not configured' });
    }

    try {
        const url = `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(city)},${encodeURIComponent(state)},US&units=imperial&appid=${API_KEY}`;
        console.log('Fetching weather for:', { city, state });
        
        const response = await fetch(url);
        const data = await response.json();

        if (!response.ok) {
            console.error('Weather API Error:', data);
            return res.status(response.status).json(data);
        }

        console.log('Weather API Success:', {
            city,
            state,
            temp: data.main.temp,
            condition: data.weather[0].main
        });

        res.json(data);
    } catch (error) {
        console.error('Weather API Error:', error);
        res.status(500).json({ error: 'Failed to fetch weather data' });
    }
});

// Serve static files AFTER API routes
app.use(express.static(path.join(__dirname, 'dist')));

// Handle React routing, return all requests to React app
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
    console.log('Environment:', {
        NODE_ENV: process.env.NODE_ENV,
        hasWeatherKey: !!process.env.VITE_OPENWEATHER_API_KEY
    });
}); 