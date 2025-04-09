import { Game } from '../types/game';
import { transformMLBGameData } from './transformers/mlbGameTransformer';
import { formatDate } from '../utils/dateUtils';
import { isMLBOffseason, getNextSeasonStartDate } from '../utils/mlbSeasonUtils';

const BASE_URL = 'https://site.api.espn.com/apis/site/v2/sports/baseball/mlb';

export async function getMLBScoreboard(): Promise<Game[]> {
  // Check if we're in the offseason
  if (isMLBOffseason()) {
    return getNextSeasonGames();
  }

  // Try to get today's games first
  const todayGames = await fetchGamesForDate(new Date());
  
  // If no games today, get the next game day
  if (todayGames.length === 0) {
    const nextGameDay = await findNextGameDay();
    if (nextGameDay) {
      const games = await fetchGamesForDate(nextGameDay);
      return games.map(game => ({
        ...game,
        isUpcoming: true,
        gameDate: formatDate(nextGameDay)
      }));
    }
  }
  
  return todayGames;
}

async function getNextSeasonGames(): Promise<Game[]> {
  const seasonStartDate = getNextSeasonStartDate();
  const games = await fetchGamesForDate(seasonStartDate);
  
  return games.map(game => ({
    ...game,
    isUpcoming: true,
    gameDate: formatDate(seasonStartDate),
    isSeasonOpener: true
  }));
}

async function fetchGamesForDate(date: Date): Promise<Game[]> {
  const formattedDate = formatDate(date);
  const response = await fetch(`${BASE_URL}/scoreboard?dates=${formattedDate}`);
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }
  const data = await response.json();
  return Promise.all(data.events.map(transformMLBGameData));
}

async function findNextGameDay(): Promise<Date | null> {
  const today = new Date();
  const searchDate = new Date(today);
  
  // Look up to 7 days ahead
  for (let i = 1; i <= 7; i++) {
    searchDate.setDate(today.getDate() + i);
    const games = await fetchGamesForDate(searchDate);
    if (games.length > 0) {
      return searchDate;
    }
  }
  
  return null;
}