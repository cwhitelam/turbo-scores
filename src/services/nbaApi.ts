import { Game } from '../types/game';
import { transformNBAGameData } from './transformers/nbaGameTransformer';
import { fetchNBAGames } from './api/nbaApi';
import { formatDate } from '../utils/dateUtils';
import { isNBAOffseason, getNextSeasonStartDate } from '../utils/nbaSeasonUtils';
import { apiCacheService } from './cache/apiCacheService';

/**
 * Get NBA scoreboard data with caching
 */
export async function getNBAScoreboard(): Promise<Game[]> {
  try {
    // Determine if it's offseason to adjust caching strategy
    if (isNBAOffseason()) {
      return getNextSeasonGames();
    }

    const now = new Date();
    const hour = now.getHours();
    const todayCacheKey = `nba:scoreboard:${formatDate(now)}`;

    // Get today's games first to check if there are any early games
    const fetchTodayGames = async (): Promise<any[]> => {
      try {
        return await fetchNBAGames(now);
      } catch (error) {
        console.error('Error fetching today\'s games:', error);
        return [];
      }
    };

    // Use caching for today's games
    const todayEvents = await apiCacheService.cacheGameData<any[]>(
      todayCacheKey,
      fetchTodayGames,
      {
        // Cache for a shorter time during game hours (10am-11pm)
        ttl: (hour >= 10 && hour < 23) ? 30 * 1000 : 5 * 60 * 1000,
        staleWhileRevalidate: true
      }
    );

    // Before 5 PM, show yesterday's games unless there are games scheduled before 5 PM
    if (hour < 17) {
      const hasEarlyGames = todayEvents.some((event: any) => {
        const gameTime = new Date(event.date);
        return gameTime.getHours() < 17;
      });

      if (!hasEarlyGames) {
        const yesterday = new Date(now);
        yesterday.setDate(yesterday.getDate() - 1);
        const yesterdayCacheKey = `nba:scoreboard:${formatDate(yesterday)}`;

        const fetchYesterdayGames = async (): Promise<any[]> => {
          try {
            return await fetchNBAGames(yesterday);
          } catch (error) {
            console.error('Error fetching yesterday\'s games:', error);
            return [];
          }
        };

        // Use caching for yesterday's games with longer TTL
        const yesterdayEvents = await apiCacheService.cacheGameData<any[]>(
          yesterdayCacheKey,
          fetchYesterdayGames,
          {
            // Yesterday's games don't change, so cache longer
            ttl: 60 * 60 * 1000,  // 1 hour
            storage: 'localStorage', // Store in localStorage for persistence
          }
        );

        if (yesterdayEvents.length > 0) {
          const games = await Promise.all(yesterdayEvents.map(transformNBAGameData));
          return games;
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
        const nextDayCacheKey = `nba:scoreboard:${formatDate(nextGameDay)}:upcoming`;

        const fetchNextDayGames = async (): Promise<Game[]> => {
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
            return [];
          }
        };

        // Use caching for next day's games with longer TTL
        return await apiCacheService.cacheGameData<Game[]>(
          nextDayCacheKey,
          fetchNextDayGames,
          {
            // Upcoming games schedule rarely changes
            ttl: 3 * 60 * 60 * 1000,  // 3 hours
            storage: 'localStorage',
          }
        );
      }
    }

    return [];
  } catch (error) {
    console.error('NBA API Error:', error);
    return [];
  }
}

/**
 * Find the next day with NBA games
 */
async function findNextGameDay(): Promise<Date | null> {
  const today = new Date();
  const searchDate = new Date(today);

  for (let i = 1; i <= 7; i++) {
    searchDate.setDate(today.getDate() + i);
    const searchCacheKey = `nba:schedule:${formatDate(searchDate)}`;

    const fetchDateGames = async (): Promise<any[]> => {
      try {
        return await fetchNBAGames(searchDate);
      } catch (error) {
        console.error(`Error searching for games on ${formatDate(searchDate)}:`, error);
        return [];
      }
    };

    // Cache schedule search results
    const events = await apiCacheService.cacheGameData<any[]>(
      searchCacheKey,
      fetchDateGames,
      {
        // Game schedules don't change often
        ttl: 6 * 60 * 60 * 1000, // 6 hours
        storage: 'localStorage',
      }
    );

    if (events.length > 0) {
      return searchDate;
    }
  }

  return null;
}

/**
 * Get information about next season's games
 */
async function getNextSeasonGames(): Promise<Game[]> {
  const seasonStartDate = getNextSeasonStartDate();
  const cacheKey = `nba:season-opener:${formatDate(seasonStartDate)}`;

  const fetchSeasonOpeners = async (): Promise<Game[]> => {
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
  };

  // Cache season opener data with a long TTL
  return await apiCacheService.cacheGameData<Game[]>(
    cacheKey,
    fetchSeasonOpeners,
    {
      // Season opener info changes very rarely
      ttl: 24 * 60 * 60 * 1000, // 24 hours
      storage: 'localStorage',
    }
  );
}