import { PlayerStat } from '../../../../types/stats';
import { NBAGameLeadersResponse, NBAAthleteInfo, NBABoxScoreTeam } from '../../../../types/apiResponses/nba';

interface NBAPlayerStats {
    name: string;
    team: string;
    pts: number;
    reb: number;
    ast: number;
    athlete?: NBAAthleteInfo;
}

/**
 * Process NBA game stats from the API response into a standardized format
 * @param data - The raw NBA game leaders API response
 * @returns An array of formatted player stats
 */
export function processNBAStats(data: NBAGameLeadersResponse): PlayerStat[] {
    const stats: PlayerStat[] = [];
    const playerStats = new Map<string, NBAPlayerStats>();

    // Get the boxscore data
    const boxScore = data.boxscore;
    if (!boxScore?.players) {
        return [];
    }

    // Create a map of player stats from boxscore
    const boxScoreStats = new Map<string, string[]>();
    boxScore.players.forEach((teamStats: NBABoxScoreTeam) => {
        const teamAbbreviation = teamStats.team.abbreviation;
        teamStats.statistics[0]?.athletes?.forEach((athlete) => {
            if (athlete.athlete?.id && athlete.stats) {
                boxScoreStats.set(athlete.athlete.id, athlete.stats);
            }
        });
    });

    // Process each team's leaders for NBA
    for (const teamLeaders of data.leaders || []) {
        if (!teamLeaders?.team?.abbreviation) continue;

        const teamId = teamLeaders.team.abbreviation;
        const leaders = teamLeaders.leaders || [];

        for (const category of leaders) {
            if (!category?.leaders?.[0]) continue;

            const leader = category.leaders[0];
            if (!leader.athlete?.shortName || !leader.athlete?.id) continue;

            const playerKey = `${leader.athlete.shortName}-${teamId}`;

            // Get the stats from the boxscore data
            if (!playerStats.has(playerKey)) {
                const playerBoxScore = boxScoreStats.get(leader.athlete.id);
                let pts = 0, reb = 0, ast = 0;

                if (playerBoxScore) {
                    // Stats array indices based on the API response:
                    // [MIN, FG, 3PT, FT, OREB, DREB, REB, AST, STL, BLK, TO, PF, +/-, PTS]
                    pts = parseInt(playerBoxScore[13]) || 0;  // PTS
                    reb = parseInt(playerBoxScore[6]) || 0;   // REB
                    ast = parseInt(playerBoxScore[7]) || 0;   // AST
                } else {
                    // Fallback to the leader's displayValue if boxscore not available
                    const value = parseInt(leader.displayValue);
                    switch (category.name) {
                        case 'points':
                            pts = value;
                            break;
                        case 'rebounds':
                            reb = value;
                            break;
                        case 'assists':
                            ast = value;
                            break;
                    }
                }

                playerStats.set(playerKey, {
                    name: leader.athlete.shortName,
                    team: teamId,
                    pts,
                    reb,
                    ast,
                    athlete: leader.athlete
                });
            }
        }
    }

    // Convert grouped stats into combined stats
    for (const [_, playerStat] of playerStats) {
        // Always show points with rebounds and assists
        stats.push({
            name: playerStat.name,
            team: playerStat.team,
            value: playerStat.pts,  // Use points as the main value for sorting
            statType: 'PTS',
            displayValue: `${playerStat.pts} PTS, ${playerStat.reb} REB, ${playerStat.ast} AST`
        });
    }

    // Sort by points descending
    return stats.sort((a, b) => b.value - a.value);
} 