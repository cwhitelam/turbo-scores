import { GameWeather, VenueInfo } from '../types/game';
import apiCacheService from './cache/apiCacheService';

const API_KEY = import.meta.env.VITE_OPENWEATHER_API_KEY;
const BASE_URL = 'https://api.openweathermap.org/data/2.5';

// Cache key for venues - used to avoid fetching weather for indoor venues
const INDOOR_VENUES_CACHE_KEY = 'weather:indoor-venues';

// Default weather values when API is not available
const DEFAULT_WEATHER: GameWeather = {
  temp: 70,
  condition: 'Clear'
};

// Known indoor venues to skip weather fetching
const KNOWN_INDOOR_VENUES: Record<string, boolean> = {
  'State Farm Stadium': true,
  'U.S. Bank Stadium': true,
  'Ford Field': true,
  'Lucas Oil Stadium': true,
  'Caesars Superdome': true,
  'Allegiant Stadium': true,
  'AT&T Stadium': true,
  'NRG Stadium': true,
  'SoFi Stadium': true,
  // NBA Venues (all indoor)
  'Chase Center': true,
  'Crypto.com Arena': true,
  'Barclays Center': true,
  'Madison Square Garden': true,
  // NHL Venues (all indoor)
  'T-Mobile Arena': true,
  'TD Garden': true,
  'Amalie Arena': true
};

/**
 * Check if a venue is indoor (to skip weather fetching)
 */
function isIndoorVenue(venue: VenueInfo): boolean {
  // Check known indoor venues first
  if (KNOWN_INDOOR_VENUES[venue.name]) {
    return true;
  }

  // Check cached indoor venues
  const cachedIndoorVenues = apiCacheService.get<Record<string, boolean>>(
    INDOOR_VENUES_CACHE_KEY,
    { storage: 'localStorage' }
  );

  if (cachedIndoorVenues && cachedIndoorVenues[venue.name]) {
    return true;
  }

  return false;
}

/**
 * Mark a venue as indoor in the cache
 */
function markVenueAsIndoor(venue: VenueInfo): void {
  const cachedIndoorVenues = apiCacheService.get<Record<string, boolean>>(
    INDOOR_VENUES_CACHE_KEY,
    { storage: 'localStorage' }
  ) || {};

  cachedIndoorVenues[venue.name] = true;

  apiCacheService.set(
    INDOOR_VENUES_CACHE_KEY,
    cachedIndoorVenues,
    {
      storage: 'localStorage',
      ttl: 30 * 24 * 60 * 60 * 1000 // 30 days
    }
  );
}

export async function getWeatherForVenue(venue: VenueInfo): Promise<GameWeather> {
  // If no API key is configured, return default weather without making API call
  if (!API_KEY) {
    return DEFAULT_WEATHER;
  }

  // Skip weather lookup for indoor venues
  if (isIndoorVenue(venue)) {
    return {
      ...DEFAULT_WEATHER,
      condition: 'Indoor'
    };
  }

  // Generate a cache key based on venue location
  const cacheKey = `weather:${venue.city},${venue.state}`;

  // Use the cache system to fetch weather
  try {
    return await apiCacheService.cacheWeatherData<GameWeather>(
      cacheKey,
      async () => {
        const url = `${BASE_URL}/weather?q=${venue.city},${venue.state},US&units=imperial&appid=${API_KEY}`;
        const response = await fetch(url);

        if (!response.ok) {
          // If the API returned an error related to indoor venues, mark this venue as indoor
          if (response.status === 404) {
            markVenueAsIndoor(venue);
            return {
              ...DEFAULT_WEATHER,
              condition: 'Indoor'
            };
          }

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
      },
      {
        staleWhileRevalidate: true,
        ttl: 30 * 60 * 1000, // 30 minutes
        keyPrefix: 'weather'
      }
    );
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