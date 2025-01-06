import { GameWeather } from '../../types/game';
import { getWeatherForVenue } from '../weatherApi';

export async function transformWeatherData(weather: any, venue: any): Promise<GameWeather> {
  try {
    if (!venue?.address?.city || !venue?.address?.state) {
      throw new Error('Venue information incomplete');
    }

    const realWeather = await getWeatherForVenue({
      name: venue.fullName,
      city: venue.address.city,
      state: venue.address.state
    });

    return realWeather;
  } catch (error) {
    // Fallback to ESPN weather data if available
    if (weather?.temperature && weather?.displayValue) {
      return {
        temp: weather.temperature,
        condition: weather.displayValue
      };
    }

    // Default fallback
    return {
      temp: 70,
      condition: 'Clear'
    };
  }
}