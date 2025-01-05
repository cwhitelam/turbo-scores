import { Game } from '../types/game';
import { transformNBAGameData } from './transformers/nbaGameTransformer';
import { fetchNBAGames } from './api/nbaApi';
import { formatDate } from '../utils/dateUtils';
import { isNBAOffseason, getNextSeasonStartDate } from '../utils/nbaSeasonUtils';

export async function getNBAScoreboard(): Promise<Game[]> {
  try {
    if (isNBAOffseason()) {
      return getNextSeasonGames();
    }

    const now = new Date();
    const hour = now.getHours();

    // If it's before 4 PM, show yesterday's games
    if (hour < 16) {
      const yesterday = new Date(now);
      yesterday.setDate(yesterday.getDate() - 1);
      try {
        const events = await fetchNBAGames(yesterday);
        if (events.length > 0) {
          const games = await Promise.all(events.map(transformNBAGameData));
          return games;
        }
      } catch (error) {
        console.error('Error fetching yesterday\'s games:', error);
      }
    }

    // After 4 PM or if no games yesterday, show today's games
    try {
      const events = await fetchNBAGames(now);
      if (events.length > 0) {
        const games = await Promise.all(events.map(transformNBAGameData));
        return games;
      }
    } catch (error) {
      console.error('Error fetching today\'s games:', error);
    }

    // If no games today, find the next game day
    const nextGameDay = await findNextGameDay();
    if (nextGameDay) {
      try {
        const events = await fetchNBAGames(nextGameDay);
        const games = await Promise.all(events.map(transformNBAGameData));
        return games.map(game => ({
          ...game,
          isUpcoming: true,
          gameDate: formatDate(nextGameDay)
        }));
      } catch (error) {
        console.error('Error fetching next game day:', error);
      }
    }

    return [];
  } catch (error) {
    console.error('NBA API Error:', error);
    return [];
  }
}

async function findNextGameDay(): Promise<Date | null> {
  const today = new Date();
  let searchDate = new Date(today);
  
  for (let i = 1; i <= 7; i++) {
    searchDate.setDate(today.getDate() + i);
    try {
      const events = await fetchNBAGames(searchDate);
      if (events.length > 0) {
        return searchDate;
      }
    } catch (error) {
      console.error('Error searching for next game day:', error);
    }
  }
  
  return null;
}

async function getNextSeasonGames(): Promise<Game[]> {
  const seasonStartDate = getNextSeasonStartDate();
  try {
    const events = await fetchNBAGames(seasonStartDate);
    const games = await Promise.all(events.map(transformNBAGameData));
    return games.map(game => ({
      ...game,
      isUpcoming: true,
      gameDate: formatDate(seasonStartDate),
      isSeasonOpener: true
    }));
  } catch (error) {
    console.error('Error fetching next season games:', error);
    return [];
  }
}