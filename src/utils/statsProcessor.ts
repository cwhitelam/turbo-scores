import { PlayerStat } from '../types/stats';
import { logFetch, logFetchSuccess, logFetchError } from './loggingUtils';
import { SPORTS } from '../config/sports';
import { Sport } from '../types/sport';
import { processNBAStats } from '../features/sports/nba/utils/statsProcessor';
import { processNFLStats } from '../features/sports/nfl/utils/statsProcessor';

const statsCache = new Map<string, { stats: PlayerStat[]; timestamp: number; isComplete: boolean }>();
const CACHE_TTL = 30000; // 30 seconds
const pendingFetches = new Map<string, Promise<{ stats: PlayerStat[]; timestamp: number; isComplete: boolean }>>();

function getCacheKey(gameId: string, sport: Sport): string {
  return `${sport}-${gameId}`;
}

export async function fetchAndProcessStats(gameId: string, sport: Sport = 'NFL') {
  if (!gameId) {
    return { stats: [], timestamp: Date.now(), isComplete: false };
  }

  const now = Date.now();
  const cacheKey = getCacheKey(gameId, sport);
  const cached = statsCache.get(cacheKey);

  // Return cached data if it's still valid
  if (cached && now - cached.timestamp < CACHE_TTL) {
    return cached;
  }

  // If there's already a pending fetch for this game, return that promise
  const pending = pendingFetches.get(gameId);
  if (pending) {
    return pending;
  }

  // Create a new fetch promise
  const fetchPromise = (async () => {
    try {
      const sportConfig = SPORTS.find(s => s.name === sport);
      if (!sportConfig) {
        throw new Error(`Invalid sport: ${sport}`);
      }

      const endpoint = `https://site.api.espn.com/apis/site/v2/sports/${sportConfig.apiPath}/summary?event=${gameId}`;
      logFetch(endpoint);

      const response = await fetch(endpoint, { cache: 'no-store' });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      // Validate required data structure
      if (!data?.leaders?.length) {
        console.log('⚠️ No leaders data found in API response');
        return { stats: [], timestamp: now, isComplete: false };
      }

      const isComplete = data?.header?.competitions?.[0]?.status?.type?.state === 'post';
      let stats: PlayerStat[] = [];

      // Use sport-specific processors
      switch (sport) {
        case 'NBA':
          stats = processNBAStats(data);
          break;
        case 'NFL':
          stats = processNFLStats(data);
          break;
        default:
          console.warn(`No stats processor for sport: ${sport}`);
      }

      const result = {
        stats: stats.sort((a, b) => b.value - a.value),
        timestamp: now,
        isComplete
      };

      // Cache the result
      statsCache.set(cacheKey, result);
      logFetchSuccess(endpoint, { statsCount: stats.length, isComplete });
      return result;

    } catch (error) {
      logFetchError(`${sport} Stats for game ${gameId}`, error);
      return { stats: [], timestamp: now, isComplete: false };
    } finally {
      // Clean up the pending fetch
      pendingFetches.delete(gameId);
    }
  })();

  // Store the pending fetch
  pendingFetches.set(gameId, fetchPromise);
  return fetchPromise;
}