import { GameWeather, VenueInfo } from '../types/game';
import { logFetch, logFetchSuccess, logFetchError } from '../utils/loggingUtils';

// Debug environment variables
console.log('Weather API Config:', {
  hasApiKey: !!import.meta.env.VITE_OPENWEATHER_API_KEY,
  mode: import.meta.env.MODE,
  isProd: import.meta.env.PROD
});

const API_KEY = import.meta.env.VITE_OPENWEATHER_API_KEY;
const BASE_URL = 'https://api.openweathermap.org/data/2.5';

// Default weather values when API is not available
const DEFAULT_WEATHER: GameWeather = {
  temp: 70,
  condition: 'Clear'
};

export async function getWeatherForVenue(venue: VenueInfo): Promise<GameWeather> {
  logFetch('Weather API', {
    mode: import.meta.env.MODE,
    isProd: import.meta.env.PROD,
    venue: `${venue.city}, ${venue.state}`
  });

  try {
    const url = `/api/weather?city=${encodeURIComponent(venue.city)}&state=${encodeURIComponent(venue.state)}`;

    const response = await fetch(url);
    const data = await response.json();

    if (!response.ok) {
      const error = {
        status: response.status,
        error: data.error,
        venue: `${venue.city}, ${venue.state}`
      };
      console.error('Weather API Response Error:', error);
      logFetchError('Weather API', error);
      return DEFAULT_WEATHER;
    }

    logFetchSuccess('Weather API', {
      temp: data.main.temp,
      condition: data.weather[0].main,
      venue: `${venue.city}, ${venue.state}`
    });

    return {
      temp: Math.round(data.main.temp),
      condition: formatFootballCondition(data.weather[0].main, data.wind.speed, data.snow?.['1h'], data.rain?.['1h'])
    };
  } catch (error) {
    console.error('Weather API Error:', error);
    logFetchError('Weather API', {
      error,
      venue: `${venue.city}, ${venue.state}`,
      mode: import.meta.env.MODE,
      isProd: import.meta.env.PROD
    });
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