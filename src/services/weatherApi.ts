import { GameWeather, VenueInfo } from '../types/game';

const API_KEY = import.meta.env.VITE_OPENWEATHER_API_KEY;
const BASE_URL = 'https://api.openweathermap.org/data/2.5';

// Log environment info on module load
console.log('Weather API Environment:', {
  hasApiKey: !!API_KEY,
  isProd: import.meta.env.PROD,
  mode: import.meta.env.MODE
});

// Default weather values when API is not available
const DEFAULT_WEATHER: GameWeather = {
  temp: 70,
  condition: 'Clear'
};

export async function getWeatherForVenue(venue: VenueInfo): Promise<GameWeather> {
  // If no API key is configured, return default weather without making API call
  if (!API_KEY) {
    console.warn('OpenWeather API key is not configured. Weather data will not be fetched.', {
      envVars: import.meta.env,
      venue
    });
    return DEFAULT_WEATHER;
  }

  try {
    const url = `${BASE_URL}/weather?q=${venue.city},${venue.state},US&units=imperial&appid=${API_KEY}`;
    console.log('Fetching weather from:', url.replace(API_KEY, '[REDACTED]'));

    const response = await fetch(url);

    if (!response.ok) {
      console.error('Weather API Error:', {
        status: response.status,
        statusText: response.statusText,
        venue
      });
      return DEFAULT_WEATHER;
    }

    const data = await response.json();

    return {
      temp: Math.round(data.main.temp),
      condition: formatFootballCondition(data.weather[0].main, data.wind.speed, data.snow?.['1h'], data.rain?.['1h'])
    };
  } catch (error) {
    console.error('Weather API Error:', error);
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