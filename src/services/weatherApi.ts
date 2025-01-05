import { GameWeather, VenueInfo } from '../types/game';

const API_KEY = import.meta.env.VITE_OPENWEATHER_API_KEY;
const BASE_URL = 'https://api.openweathermap.org/data/2.5';

export async function getWeatherForVenue(venue: VenueInfo): Promise<GameWeather> {
  try {
    const response = await fetch(
      `${BASE_URL}/weather?q=${venue.city},${venue.state},US&units=imperial&appid=${API_KEY}`
    );
    
    if (!response.ok) {
      throw new Error('Weather data unavailable');
    }

    const data = await response.json();
    
    return {
      temp: Math.round(data.main.temp),
      condition: formatFootballCondition(data.weather[0].main, data.wind.speed, data.snow?.['1h'], data.rain?.['1h'])
    };
  } catch (error) {
    console.error('Weather API error:', error);
    return {
      temp: 70,
      condition: 'Clear'
    };
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