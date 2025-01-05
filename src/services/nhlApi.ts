import { Game } from '../types/game';
import { transformNHLGameData } from './transformers/nhlGameTransformer';
import { formatDate } from '../utils/dateUtils';
import { isNHLOffseason, getNextSeasonStartDate } from '../utils/nhlSeasonUtils';

const BASE_URL = 'https://site.api.espn.com/apis/site/v2/sports/hockey/nhl';

export async function getNHLScoreboard(): Promise<Game[]> {
  try {
    if (isNHLOffseason()) {
      return getNextSeasonGames();
    }

    const todayGames = await fetchGamesForDate(new Date());
    
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
  } catch (error) {
    console.error('NHL API Error:', error);
    throw new Error('Failed to fetch NHL data');
  }
}

async function fetchGamesForDate(date: Date): Promise<Game[]> {
  const formattedDate = formatDate(date);
  const response = await fetch(`${BASE_URL}/scoreboard?dates=${formattedDate}`);
  
  if (!response.ok) {
    throw new Error(`NHL API HTTP error! status: ${response.status}`);
  }
  
  const data = await response.json();
  
  if (!data.events) {
    return [];
  }
  
  return Promise.all(data.events.map(transformNHLGameData));
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

async function findNextGameDay(): Promise<Date | null> {
  const today = new Date();
  let searchDate = new Date(today);
  
  for (let i = 1; i <= 7; i++) {
    searchDate.setDate(today.getDate() + i);
    const games = await fetchGamesForDate(searchDate);
    if (games.length > 0) {
      return searchDate;
    }
  }
  
  return null;
}