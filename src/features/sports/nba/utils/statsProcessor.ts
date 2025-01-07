import { PlayerStat } from '../../../../types/stats';

interface NBAPlayerStats {
    name: string;
    team: string;
    pts: number;
    reb: number;
    ast: number;
    athlete?: any;
}

export function processNBAStats(data: any): PlayerStat[] {
    const stats: PlayerStat[] = [];
    const playerStats = new Map<string, NBAPlayerStats>();

    // Check if the game is completed
    const isCompleted = data.header?.competitions?.[0]?.status?.type?.state === 'post';
    if (!isCompleted) {
        console.log('Game is not completed yet');
        return [];
    }

    // Get the boxscore data
    const boxScore = data.boxscore;
    if (!boxScore?.players) {
        console.log('No boxscore data available');
        return [];
    }

    // Create a map of player stats from boxscore
    const boxScoreStats = new Map<string, string[]>();
    boxScore.players.forEach((teamStats: any) => {
        const teamAbbreviation = teamStats.team.abbreviation;
        teamStats.statistics[0]?.athletes?.forEach((athlete: any) => {
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
        if (playerStat.pts > 0 || playerStat.reb > 0 || playerStat.ast > 0) {
            const statLine = `${playerStat.pts} PTS, ${playerStat.reb} REB, ${playerStat.ast} AST`;
            stats.push({
                name: playerStat.name,
                team: playerStat.team,
                value: playerStat.pts,
                statType: 'PTS',
                displayValue: statLine
            });
        }
    }

    return stats;
} 