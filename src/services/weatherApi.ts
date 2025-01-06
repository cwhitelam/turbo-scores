import { GameWeather, VenueInfo } from '../types/game';
import { logFetch, logFetchSuccess, logFetchError } from '../utils/loggingUtils';

// Debug all environment variables in production
if (import.meta.env.PROD) {
  console.log('DEBUG: All Vite env variables:', {
    VITE_OPENWEATHER_API_KEY: import.meta.env.VITE_OPENWEATHER_API_KEY,
    MODE: import.meta.env.MODE,
    PROD: import.meta.env.PROD,
    DEV: import.meta.env.DEV,
  });
}

const API_KEY = import.meta.env.VITE_OPENWEATHER_API_KEY;
const BASE_URL = 'https://api.openweathermap.org/data/2.5';

// Default weather values when API is not available
const DEFAULT_WEATHER: GameWeather = {
  temp: 70,
  condition: 'Clear'
};

export async function getWeatherForVenue(venue: VenueInfo): Promise<GameWeather> {
  // Debug all environment variables in production
  if (import.meta.env.PROD) {
    console.log('Weather API Debug:', {
      hasApiKey: !!API_KEY,
      isProd: import.meta.env.PROD,
      mode: import.meta.env.MODE,
      venue
    });
  }

  // Log API key status (without exposing the key)
  logFetch('Weather API', {
    status: API_KEY ? 'Present' : 'Missing',
    mode: import.meta.env.MODE,
    isProd: import.meta.env.PROD
  });

  // If no API key is configured, return default weather without making API call
  if (!API_KEY) {
    logFetchError('Weather API', {
      error: 'API key is not configured',
      mode: import.meta.env.MODE,
      isProd: import.meta.env.PROD
    });
    return DEFAULT_WEATHER;
  }

  try {
    const url = `${BASE_URL}/weather?q=${venue.city},${venue.state},US&units=imperial&appid=${API_KEY}`;
    logFetch('Weather API', {
      location: `${venue.city}, ${venue.state}`,
      mode: import.meta.env.MODE
    });

    const response = await fetch(url);

    if (!response.ok) {
      const errorText = await response.text();
      logFetchError('Weather API', { status: response.status, error: errorText });
      return DEFAULT_WEATHER;
    }

    const data = await response.json();
    logFetchSuccess('Weather API', { temp: data.main.temp, condition: data.weather[0].main });

    return {
      temp: Math.round(data.main.temp),
      condition: formatFootballCondition(data.weather[0].main, data.wind.speed, data.snow?.['1h'], data.rain?.['1h'])
    };
  } catch (error) {
    logFetchError('Weather API', error);
    return DEFAULT_WEATHER;
  }
}

function formatFootballCondition(
  condition: string,
  windSpeed: number,
  snowfall?: number,
  rainfall?: number
): string {
  // Check for severe weather first
  if (condition === 'Tornado' || condition === 'Hurricane') {
    return 'Severe Weather';
  }

  // Check precipitation
  if (snowfall && snowfall > 0) {
    return snowfall > 2 ? 'Heavy Snow' : 'Light Snow';
  }

  if (rainfall && rainfall > 0) {
    return rainfall > 2.5 ? 'Heavy Rain' : 'Light Rain';
  }

  // Check wind conditions (speeds in mph)
  if (windSpeed > 25) {
    return 'High Winds';
  }
  if (windSpeed > 15) {
    return 'Windy';
  }

  // Map other conditions relevant to football
  const footballConditions: { [key: string]: string } = {
    'Thunderstorm': 'Storm',
    'Drizzle': 'Light Rain',
    'Rain': 'Rain',
    'Snow': 'Snow',
    'Fog': 'Foggy',
    'Clear': 'Clear',
    'Clouds': 'Overcast'
  };

  return footballConditions[condition] || 'Clear';
}