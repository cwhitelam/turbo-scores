import { GameWeather, VenueInfo } from '../types/game';

const API_KEY = import.meta.env.VITE_OPENWEATHER_API_KEY;
const BASE_URL = 'https://api.openweathermap.org/data/2.5';

// Default weather values when API is not available
const DEFAULT_WEATHER: GameWeather = {
  temp: 70,
  condition: 'Clear'
};

export async function getWeatherForVenue(venue: VenueInfo): Promise<GameWeather> {
  // Log API key status (without exposing the key)
  console.log('Weather API Key status:', API_KEY ? 'Present' : 'Missing');

  // If no API key is configured, return default weather without making API call
  if (!API_KEY) {
    console.warn('OpenWeather API key is not configured');
    return DEFAULT_WEATHER;
  }

  try {
    const url = `${BASE_URL}/weather?q=${venue.city},${venue.state},US&units=imperial&appid=${API_KEY}`;
    console.log('Fetching weather for:', `${venue.city}, ${venue.state}`);

    const response = await fetch(url);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Weather API error:', response.status, errorText);
      return DEFAULT_WEATHER;
    }

    const data = await response.json();
    console.log('Weather data received:', { temp: data.main.temp, condition: data.weather[0].main });

    return {
      temp: Math.round(data.main.temp),
      condition: formatFootballCondition(data.weather[0].main, data.wind.speed, data.snow?.['1h'], data.rain?.['1h'])
    };
  } catch (error) {
    console.error('Weather API error:', error);
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