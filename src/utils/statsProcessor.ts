import { PlayerStat } from '../types/stats';
import { logFetch, logFetchSuccess, logFetchError } from './loggingUtils';
import { SPORTS } from '../config/sports';
import { Sport } from '../types/sport';
import { processNBAStats } from '../features/sports/nba/utils/statsProcessor';
import { processNFLStats } from '../features/sports/nfl/utils/statsProcessor';
import { processMLBStats } from '../features/sports/mlb/utils/statsProcessor';

const statsCache = new Map<string, { stats: PlayerStat[]; timestamp: number; isComplete: boolean }>();
const CACHE_TTL = 30000; // 30 seconds
const pendingFetches = new Map<string, Promise<{ stats: PlayerStat[]; timestamp: number; isComplete: boolean }>>();

function getCacheKey(gameId: string, sport: Sport): string {
  return `${sport}-${gameId}`;
}

// Strict validation for sport-specific gameIds
const SPORT_GAME_ID_PATTERNS: Record<string, RegExp> = {
  NFL: /^40167\d{3}$/,
  MLB: /^40169\d{3}$/,
  NBA: /^40160\d{3}$/,
  NHL: /^40190\d{3}$/
};

/**
 * Validates that a gameId belongs to the specified sport using
 * strict regex patterns
 */
function isValidGameIdForSport(gameId: string, sport: Sport): boolean {
  if (!gameId) return false;

  const pattern = SPORT_GAME_ID_PATTERNS[sport];
  if (!pattern) return true; // Allow if no pattern defined

  const isValid = pattern.test(gameId);
  if (!isValid) {
    console.error(`❌ Invalid gameId ${gameId} for sport ${sport}`);
  }
  return isValid;
}

/**
 * Clears the stats cache when switching sports to prevent
 * stats from one sport showing up when viewing another sport
 */
export function clearStatsCache(): void {
  statsCache.clear();
  pendingFetches.clear();
  console.log('Stats cache cleared due to sport change');
}

export async function fetchAndProcessStats(gameId: string, sport: Sport = 'NFL') {
  if (!gameId) {
    return { stats: [], timestamp: Date.now(), isComplete: false };
  }

  // Log for debugging
  console.log(`🔍 fetchAndProcessStats called for ${sport} game ${gameId}`);

  // First, strictly validate the gameId belongs to the specified sport
  if (!isValidGameIdForSport(gameId, sport)) {
    console.error(`❌ Sport-gameId mismatch detected: ${gameId} is not a valid ${sport} game ID`);
    return {
      stats: [],
      timestamp: Date.now(),
      isComplete: false
    };
  }

  const now = Date.now();
  const cacheKey = getCacheKey(gameId, sport);
  const cached = statsCache.get(cacheKey);

  // Return cached data if it's still valid
  if (cached && now - cached.timestamp < CACHE_TTL) {
    console.log(`🔄 Using cached data for ${cacheKey}`);
    return cached;
  }

  // If there's already a pending fetch for this game+sport, return that promise
  // Using cacheKey instead of just gameId to avoid cross-sport contamination
  const pending = pendingFetches.get(cacheKey);
  if (pending) {
    console.log(`⏳ Using pending fetch for ${cacheKey}`);
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

      // Verify the response URL contains the expected sport path 
      // (e.g. baseball/mlb for MLB, not football/nfl)
      const responseUrl = response.url;
      if (!responseUrl.includes(sportConfig.apiPath)) {
        console.error(`❌ Response URL ${responseUrl} doesn't match expected sport ${sport}`);
        return { stats: [], timestamp: now, isComplete: false };
      }

      // Add a sport check to ensure the data is for the right sport
      if (data?.header?.league?.abbreviation &&
        data.header.league.abbreviation !== sport) {
        console.error(`❌ Sport mismatch! Requested ${sport} but received ${data.header.league.abbreviation}`);
        return { stats: [], timestamp: now, isComplete: false };
      }

      // Validate required data structure - MLB doesn't require leaders at the top level
      if (!data?.leaders?.length && sport !== 'MLB') {
        console.log('⚠️ No leaders data found in API response');
        return { stats: [], timestamp: now, isComplete: false };
      }

      // For MLB, validate there's at least competitors data
      if (sport === 'MLB' && (!data?.header?.competitions?.[0]?.competitors || !data.header.competitions[0].competitors.length)) {
        console.log('⚠️ No MLB competitor data found in API response');
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
        case 'MLB':
          stats = processMLBStats(data);
          console.log(`⚾ Processed ${stats.length} MLB stats for ${cacheKey}`);

          // If no stats were found, add basic fallback stats from competition data
          if (stats.length === 0 && data?.header?.competitions?.[0]?.competitors) {
            console.log('⚾ No MLB stats found, adding fallback stats');

            data.header.competitions[0].competitors.forEach((team: any) => {
              if (team.team && team.score) {
                const teamAbbr = team.team.abbreviation || '';
                const score = parseInt(team.score || '0');

                // Add team score
                if (score > 0) {
                  stats.push({
                    name: team.homeAway === 'home' ? 'HOME' : 'AWAY',
                    team: teamAbbr,
                    statType: 'TEAM',
                    value: score,
                    displayValue: `${teamAbbr}: ${score}`
                  });
                }
              }
            });
          }
          break;
        default:
          console.warn(`No stats processor for sport: ${sport}`);
      }

      // Add sport to each stat for extra safety
      stats = stats.map(stat => ({
        ...stat,
        currentSport: sport
      }));

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
      // Clean up the pending fetch - use the cacheKey not just gameId
      pendingFetches.delete(cacheKey);
    }
  })();

  // Store the pending fetch with the cache key
  pendingFetches.set(cacheKey, fetchPromise);
  return fetchPromise;
}