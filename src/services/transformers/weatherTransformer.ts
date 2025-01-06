import { GameWeather } from '../../types/game';
import { getWeatherForVenue } from '../weatherApi';

export async function transformWeatherData(weather: any, venue: any): Promise<GameWeather> {
  console.log('DEBUG: transformWeatherData called with:', { weather, venue });

  try {
    if (!venue?.address?.city || !venue?.address?.state) {
      console.log('DEBUG: Venue information incomplete:', venue);
      throw new Error('Venue information incomplete');
    }

    console.log('DEBUG: Calling getWeatherForVenue with:', {
      name: venue.fullName,
      city: venue.address.city,
      state: venue.address.state
    });

    const realWeather = await getWeatherForVenue({
      name: venue.fullName,
      city: venue.address.city,
      state: venue.address.state
    });

    console.log('DEBUG: Got real weather:', realWeather);
    return realWeather;
  } catch (error) {
    console.log('DEBUG: Error in transformWeatherData:', error);
    console.log('DEBUG: Falling back to ESPN weather data:', weather);

    // Fallback to ESPN weather data if available, otherwise use defaults
    return {
      temp: parseInt(weather?.temperature ?? '70'),
      condition: weather?.displayValue ?? 'Clear'
    };
  }
}