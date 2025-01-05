import { Game } from '../types/game';
import { transformGameData } from './transformers/gameTransformer';

const BASE_URL = 'https://site.api.espn.com/apis/site/v2/sports/football/nfl';

export async function getScoreboard(): Promise<Game[]> {
  const response = await fetch(`${BASE_URL}/scoreboard`);
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }
  const data = await response.json();

  // Transform all games in parallel
  const games = await Promise.all(data.events.map(transformGameData));
  return games;
}