import { GameWeather, VenueInfo } from '../types/game';
import { logFetch, logFetchSuccess, logFetchError } from '../utils/loggingUtils';

// Default weather values when API is not available
const DEFAULT_WEATHER: GameWeather = {
  temp: 70,
  condition: 'Clear'
};

// Get the base URL for API calls
const API_BASE_URL = import.meta.env.PROD ? 'https://turboscores.live' : '';

export async function getWeatherForVenue(venue: VenueInfo): Promise<GameWeather> {
  logFetch('Weather API', {
    venue: `${venue.city}, ${venue.state}`
  });

  try {
    const url = `${API_BASE_URL}/api/weather?city=${encodeURIComponent(venue.city)}&state=${encodeURIComponent(venue.state)}`;
    console.log('Fetching weather from:', url);

    const response = await fetch(url, {
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      }
    });

    // Try to read the response as text first
    const text = await response.text();
    let data;

    try {
      // Then parse it as JSON
      data = JSON.parse(text);
    } catch (error) {
      console.error('Weather API Parse Error:', {
        text,
        error,
        status: response.status
      });
      throw new Error('Invalid JSON response from weather API');
    }

    if (!response.ok) {
      console.error('Weather API Error:', data);
      logFetchError('Weather API', data);
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
      venue: `${venue.city}, ${venue.state}`
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