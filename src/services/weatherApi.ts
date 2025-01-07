import { GameWeather, VenueInfo } from '../types/game';

const API_KEY = import.meta.env.VITE_OPENWEATHER_API_KEY;
const BASE_URL = 'https://api.openweathermap.org/data/2.5';

// Default weather values when API is not available
const DEFAULT_WEATHER: GameWeather = {
  temp: 70,
  condition: 'Clear'
};

export async function getWeatherForVenue(venue: VenueInfo): Promise<GameWeather> {
  // If no API key is configured, return default weather without making API call
  if (!API_KEY) {
    return DEFAULT_WEATHER;
  }

  try {
    const url = `${BASE_URL}/weather?q=${venue.city},${venue.state},US&units=imperial&appid=${API_KEY}`;
    const response = await fetch(url);

    if (!response.ok) {
      return DEFAULT_WEATHER;
    }

    const data = await response.json();
    const weather: GameWeather = {
      temp: Math.round(data.main.temp),
      condition: formatFootballCondition(
        data.weather[0].main,
        data.wind?.speed ?? 0,
        data.snow?.['1h'] ?? 0,
        data.rain?.['1h'] ?? 0
      )
    };

    return weather;
  } catch (error) {
    return DEFAULT_WEATHER;
  }
}

function formatFootballCondition(
  condition: string,
  windSpeed: number,
  snowfall?: number,
  rainfall?: number
): string {
  // Convert to uppercase for consistent comparison
  const upperCondition = condition.toUpperCase();

  // Check for precipitation first
  if (snowfall && snowfall > 0) return 'Snow';
  if (rainfall && rainfall > 0) return 'Rain';

  // Strong winds (over 15 mph) should be noted
  if (windSpeed > 15) return 'Windy';

  // Map common conditions
  switch (upperCondition) {
    case 'THUNDERSTORM':
      return 'Storm';
    case 'DRIZZLE':
      return 'Rain';
    case 'RAIN':
      return 'Rain';
    case 'SNOW':
      return 'Snow';
    case 'MIST':
    case 'SMOKE':
    case 'HAZE':
    case 'FOG':
      return 'Hazy';
    case 'CLOUDS':
      return 'Overcast';
    case 'CLEAR':
      return 'Clear';
    default:
      return 'Clear';
  }
}