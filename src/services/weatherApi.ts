import { GameWeather, VenueInfo } from '../types/game';
import { apiCacheService } from './cache/apiCacheService';

const API_KEY = import.meta.env.VITE_OPENWEATHER_API_KEY;
const BASE_URL = 'https://api.openweathermap.org/data/2.5';

// Default weather values when API is not available
const DEFAULT_WEATHER: GameWeather = {
  temp: 70,
  condition: 'Clear'
};

/**
 * Cache key for a venue's weather data
 */
const getWeatherCacheKey = (venue: VenueInfo): string => {
  return `weather:${venue.city},${venue.state}`;
};

/**
 * Get weather for a venue with caching
 */
export async function getWeatherForVenue(venue: VenueInfo): Promise<GameWeather> {
  // If no API key is configured, return default weather without making API call
  if (!API_KEY) {
    return DEFAULT_WEATHER;
  }

  // Define the function to fetch weather data
  const fetchWeatherData = async (): Promise<GameWeather> => {
    try {
      const url = `${BASE_URL}/weather?q=${venue.city},${venue.state},US&units=imperial&appid=${API_KEY}`;
      const response = await fetch(url);

      if (!response.ok) {
        throw new Error(`Weather API error: ${response.status}`);
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
      console.error(`Error fetching weather for ${venue.city}:`, error);
      return DEFAULT_WEATHER;
    }
  };

  // Use API cache service to optimize weather data fetching with caching
  try {
    // Indoor venues don't need weather updates - use long TTL
    const isIndoor = venue.roof === 'dome' || venue.roof === 'closed';
    const cacheKey = getWeatherCacheKey(venue);

    const cachedWeather = await apiCacheService.cacheWeatherData<GameWeather>(
      cacheKey,
      fetchWeatherData,
      {
        // Use longer TTL for indoor venues
        ttl: isIndoor ? 24 * 60 * 60 * 1000 : 30 * 60 * 1000,
        // Store in localStorage for better offline experience
        storage: 'localStorage',
        // Use stale-while-revalidate for better UX
        staleWhileRevalidate: true,
      }
    );

    return cachedWeather;
  } catch (error) {
    // Fallback to default weather in case of cache errors
    console.error('Error in weather cache:', error);
    return DEFAULT_WEATHER;
  }
}

/**
 * Format weather condition for football display
 */
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