import { Game } from '../../types/game';
import { formatDate } from '../../utils/dateUtils';

const BASE_URL = 'https://site.api.espn.com/apis/site/v2/sports/basketball/nba';

export async function fetchNBAGames(date: Date): Promise<any> {
  const formattedDate = formatDate(date);
  const response = await fetch(`${BASE_URL}/scoreboard?dates=${formattedDate}&limit=100`);

  if (!response.ok) {
    throw new Error(`NBA API HTTP error! status: ${response.status}`);
  }

  const data = await response.json();
  if (!data?.events) {
    throw new Error('Invalid API response: missing events data');
  }

  // Fetch box score data for each game
  const gamesWithStats = await Promise.all(
    data.events.map(async (event: any) => {
      try {
        const boxScoreResponse = await fetch(`${BASE_URL}/summary?event=${event.id}`);
        if (!boxScoreResponse.ok) return event;

        const boxScoreData = await boxScoreResponse.json();
        return {
          ...event,
          boxScore: boxScoreData.boxScore,
          stats: boxScoreData.stats,
          leaders: boxScoreData.leaders
        };
      } catch (error) {
        console.error('Error fetching box score:', error);
        return event;
      }
    })
  );

  return gamesWithStats;
}