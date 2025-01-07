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

    // Get today's games first to check if there are any early games
    let todayEvents;
    try {
      todayEvents = await fetchNBAGames(now);
    } catch (error) {
      console.error('Error fetching today\'s games:', error);
      todayEvents = [];
    }

    // Before 5 PM, show yesterday's games unless there are games scheduled before 5 PM
    if (hour < 17) {
      const hasEarlyGames = todayEvents.some((event: any) => {
        const gameTime = new Date(event.date);
        return gameTime.getHours() < 17;
      });

      if (!hasEarlyGames) {
        const yesterday = new Date(now);
        yesterday.setDate(yesterday.getDate() - 1);
        try {
          const yesterdayEvents = await fetchNBAGames(yesterday);
          if (yesterdayEvents.length > 0) {
            const games = await Promise.all(yesterdayEvents.map(transformNBAGameData));
            return games;
          }
        } catch (error) {
          console.error('Error fetching yesterday\'s games:', error);
        }
      }
    }

    // Show today's games if we have them
    if (todayEvents.length > 0) {
      const games = await Promise.all(todayEvents.map(transformNBAGameData));
      return games;
    }

    // Only look for next day's games if it's late and we have no games today
    if (hour >= 23) {
      const nextGameDay = await findNextGameDay();
      if (nextGameDay) {
        try {
          const nextDayEvents = await fetchNBAGames(nextGameDay);
          const games = await Promise.all(nextDayEvents.map(transformNBAGameData));
          return games.map(game => ({
            ...game,
            isUpcoming: true,
            gameDate: formatDate(nextGameDay)
          }));
        } catch (error) {
          console.error('Error fetching next game day:', error);
        }
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