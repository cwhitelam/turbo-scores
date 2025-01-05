import { PlayerStat, StatType } from '../types/stats';
import { logFetch, logFetchSuccess, logFetchError } from './loggingUtils';

const statsCache = new Map<string, { stats: PlayerStat[]; timestamp: number; isComplete: boolean }>();
const CACHE_TTL = 30000; // 30 seconds
const pendingFetches = new Map<string, Promise<{ stats: PlayerStat[]; timestamp: number; isComplete: boolean }>>();

export async function fetchAndProcessStats(gameId: string) {
  if (!gameId) {
    return { stats: [], timestamp: Date.now(), isComplete: false };
  }

  const now = Date.now();
  const cached = statsCache.get(gameId);

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
      const endpoint = `https://site.api.espn.com/apis/site/v2/sports/football/nfl/summary?event=${gameId}`;
      logFetch(endpoint);

      const response = await fetch(endpoint, { cache: 'no-store' });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      // Validate required data structure
      if (!data?.leaders?.length) {
        return { stats: [], timestamp: now, isComplete: false };
      }

      const isComplete = data?.header?.competitions?.[0]?.status?.type?.state === 'post';
      const stats: PlayerStat[] = [];

      // Process each team's leaders
      for (const teamLeaders of data.leaders) {
        if (!teamLeaders?.team?.abbreviation) continue;

        const teamId = teamLeaders.team.abbreviation;
        const leaders = teamLeaders.leaders || [];

        for (const category of leaders) {
          if (!category?.leaders?.[0]) continue;

          const leader = category.leaders[0];
          if (!leader.athlete?.shortName || !leader.displayValue) continue;

          const statInfo = parseStatValue(category.name, leader.displayValue);
          if (!statInfo) continue;

          stats.push({
            name: leader.athlete.shortName,
            team: teamId,
            value: statInfo.value,
            statType: statInfo.type,
            displayValue: leader.displayValue
          });
        }
      }

      const result = {
        stats: stats.sort((a, b) => b.value - a.value),
        timestamp: now,
        isComplete
      };

      statsCache.set(gameId, result);
      logFetchSuccess(endpoint, { statsCount: stats.length, isComplete });
      return result;

    } catch (error) {
      logFetchError(`NFL Stats for game ${gameId}`, error);
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

function parseStatValue(category: string, displayValue: string): { value: number; type: StatType } | null {
  if (!displayValue) return null;

  try {
    switch (category) {
      case 'passingYards': {
        const match = displayValue.match(/(\d+)\/(\d+),\s*(\d+)\s*YDS/);
        return match ? { value: parseInt(match[3]), type: 'PASS' } : null;
      }
      case 'rushingYards': {
        const match = displayValue.match(/(\d+)\s*CAR,\s*(\d+)\s*YDS/);
        return match ? { value: parseInt(match[2]), type: 'RUSH' } : null;
      }
      case 'receivingYards': {
        const match = displayValue.match(/(\d+)\s*REC,\s*(\d+)\s*YDS/);
        return match ? { value: parseInt(match[2]), type: 'REC' } : null;
      }
      case 'sacks': {
        const match = displayValue.match(/([\d.]+)\s*SACKS?/);
        return match ? { value: parseFloat(match[1]), type: 'SACK' } : null;
      }
      case 'totalTackles': {
        const match = displayValue.match(/(\d+)\s*TCKL/);
        return match ? { value: parseInt(match[1]), type: 'TACKLE' } : null;
      }
      case 'interceptions': {
        const match = displayValue.match(/(\d+)\s*INT/);
        return match ? { value: parseInt(match[1]), type: 'INT' } : null;
      }
      default:
        return null;
    }
  } catch (error) {
    logFetchError(`Stat parsing for ${category}`, { error, displayValue });
    return null;
  }
}