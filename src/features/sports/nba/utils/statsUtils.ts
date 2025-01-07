import { NBALeaderCategory, GameLeaders, NBAStatCategory } from '../types/gameStats';

/**
 * Extracts the primary leader for each main statistical category
 * @param leaders Array of leader categories from the ESPN API
 * @returns Object containing the top leader for points, rebounds, and assists
 */
export function extractGameLeaders(leaders: NBALeaderCategory[], boxScore?: any): GameLeaders {
    const result: GameLeaders = {};

    // Create a map of player stats from boxscore
    const boxScoreStats = new Map<string, string[]>();
    if (boxScore?.players) {
        boxScore.players.forEach((teamStats: any) => {
            teamStats.statistics[0]?.athletes?.forEach((athlete: any) => {
                if (athlete.athlete?.id && athlete.stats) {
                    boxScoreStats.set(athlete.athlete.id, athlete.stats);
                }
            });
        });
    }

    // Helper function to find a specific stat category
    const findCategory = (name: NBAStatCategory): NBALeaderCategory | undefined => {
        return leaders.find(cat => cat.name === name);
    };

    // Helper function to attach stats to a leader
    const attachStats = (leader: NBALeaderCategory['leaders'][0]) => {
        if (leader.athlete?.id) {
            const stats = boxScoreStats.get(leader.athlete.id);
            if (stats) {
                leader.athlete.stats = stats;
            }
        }
        return leader;
    };

    // Get points leader
    const pointsCategory = findCategory('points');
    if (pointsCategory?.leaders?.[0]) {
        result.points = attachStats(pointsCategory.leaders[0]);
    }

    // Get rebounds leader
    const reboundsCategory = findCategory('rebounds');
    if (reboundsCategory?.leaders?.[0]) {
        result.rebounds = attachStats(reboundsCategory.leaders[0]);
    }

    // Get assists leader
    const assistsCategory = findCategory('assists');
    if (assistsCategory?.leaders?.[0]) {
        result.assists = attachStats(assistsCategory.leaders[0]);
    }

    return result;
}

/**
 * Formats a leader entry for display
 * @param entry The leader entry to format
 * @param statAbbrev The abbreviation for the stat (e.g., "PTS", "REB", "AST")
 * @returns Formatted string like "32 PTS, 5 REB, 4 AST"
 */
export function formatLeaderDisplay(entry: NBALeaderCategory['leaders'][0], statAbbrev: string): string {
    // Get the stats from the boxscore data if available
    const boxScoreStats = entry.athlete?.stats;
    if (boxScoreStats) {
        // Stats array indices based on the API response:
        // [MIN, FG, 3PT, FT, OREB, DREB, REB, AST, STL, BLK, TO, PF, +/-, PTS]
        const pts = parseInt(boxScoreStats[13]) || 0;  // PTS
        const reb = parseInt(boxScoreStats[6]) || 0;   // REB
        const ast = parseInt(boxScoreStats[7]) || 0;   // AST

        return `${pts} PTS, ${reb} REB, ${ast} AST`;
    }

    // Fallback to the leader's displayValue if boxscore not available
    const value = parseInt(entry.displayValue);
    let pts = 0, reb = 0, ast = 0;

    switch (statAbbrev) {
        case 'PTS':
            pts = value;
            break;
        case 'REB':
            reb = value;
            break;
        case 'AST':
            ast = value;
            break;
    }

    return `${pts} PTS, ${reb} REB, ${ast} AST`;
} 