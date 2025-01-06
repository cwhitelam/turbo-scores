import { SportType } from '../types/sports';
import { GameStats } from '../../../../hooks/game/useGameData';
import { PlayerStat, StatType } from '../../../../types/stats';
import { SPORTS } from '../../../../config/sports';

const CACHE_DURATION = 30000; // 30 seconds
const statsCache = new Map<string, GameStats>();

export async function fetchAndProcessStats(gameId: string, sport: SportType): Promise<GameStats> {
    const cacheKey = `${gameId}-${sport}`;
    const cachedStats = statsCache.get(cacheKey);
    const now = Date.now();

    if (cachedStats && now - cachedStats.timestamp < CACHE_DURATION) {
        return cachedStats;
    }

    // Fetch and process stats based on sport type
    const stats = await fetchStats(gameId, sport);
    const processedStats = processStats(stats, sport);
    const result: GameStats = {
        stats: processedStats,
        timestamp: now,
        isComplete: isGameComplete(stats)
    };

    statsCache.set(cacheKey, result);
    return result;
}

async function fetchStats(gameId: string, sport: SportType) {
    const sportConfig = SPORTS.find(s => s.name === sport);
    if (!sportConfig) {
        throw new Error(`Invalid sport: ${sport}`);
    }

    const response = await fetch(
        `https://site.api.espn.com/apis/site/v2/sports/${sportConfig.apiPath}/summary?event=${gameId}`
    );

    if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data;
}

function processStats(data: any, sport: SportType): PlayerStat[] {
    if (!data?.boxscore?.players?.[0]?.statistics) {
        return [];
    }

    const stats: PlayerStat[] = [];
    const players = data.boxscore.players[0].statistics;

    // Process based on sport type
    switch (sport) {
        case 'NFL': {
            // Process passing stats
            const passing = players.find((stat: any) => stat.name === "passing");
            if (passing?.leaders?.[0]) {
                const leader = passing.leaders[0];
                stats.push({
                    name: leader.athlete.shortName,
                    team: leader.team.abbreviation,
                    value: parseInt(leader.displayValue.match(/\d+/g)?.[1] || '0'),
                    statType: 'PASS',
                    displayValue: leader.displayValue
                });
            }

            // Process rushing stats
            const rushing = players.find((stat: any) => stat.name === "rushing");
            if (rushing?.leaders?.[0]) {
                const leader = rushing.leaders[0];
                stats.push({
                    name: leader.athlete.shortName,
                    team: leader.team.abbreviation,
                    value: parseInt(leader.displayValue.match(/\d+/g)?.[1] || '0'),
                    statType: 'RUSH',
                    displayValue: leader.displayValue
                });
            }

            // Process receiving stats
            const receiving = players.find((stat: any) => stat.name === "receiving");
            if (receiving?.leaders?.[0]) {
                const leader = receiving.leaders[0];
                stats.push({
                    name: leader.athlete.shortName,
                    team: leader.team.abbreviation,
                    value: parseInt(leader.displayValue.match(/\d+/g)?.[1] || '0'),
                    statType: 'REC',
                    displayValue: leader.displayValue
                });
            }
            break;
        }
        // Add other sports here as needed
    }

    return stats;
}

function isGameComplete(data: any): boolean {
    return data?.header?.competitions?.[0]?.status?.type?.state === 'post';
} 