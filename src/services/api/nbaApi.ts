import { Game } from '../../types/game';
import { formatDate } from '../../utils/dateUtils';

const BASE_URL = 'https://site.api.espn.com/apis/site/v2/sports/basketball/nba';

export async function fetchNBAGames(date: Date): Promise<any> {
  const formattedDate = formatDate(date);
  const response = await fetch(`${BASE_URL}/scoreboard?dates=${formattedDate}`);
  
  if (!response.ok) {
    throw new Error(`NBA API HTTP error! status: ${response.status}`);
  }
  
  const data = await response.json();
  if (!data?.events) {
    throw new Error('Invalid API response: missing events data');
  }
  
  return data.events;
}