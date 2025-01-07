import { PlayerStat } from '../../../../types/stats';

interface NBAPlayerStats {
    name: string;
    team: string;
    pts: number;
    reb: number;
    ast: number;
}

export function processNBAStats(data: any): PlayerStat[] {
    const stats: PlayerStat[] = [];
    const playerStats = new Map<string, NBAPlayerStats>();

    // Process each team's leaders for NBA
    for (const teamLeaders of data.leaders) {
        if (!teamLeaders?.team?.abbreviation) continue;

        const teamId = teamLeaders.team.abbreviation;
        const leaders = teamLeaders.leaders || [];

        for (const category of leaders) {
            if (!category?.leaders?.[0]) continue;

            const leader = category.leaders[0];
            if (!leader.athlete?.shortName) continue;

            const playerKey = `${leader.athlete.shortName}-${teamId}`;
            if (!playerStats.has(playerKey)) {
                playerStats.set(playerKey, {
                    name: leader.athlete.shortName,
                    team: teamId,
                    pts: 0,
                    reb: 0,
                    ast: 0
                });
            }

            const playerStat = playerStats.get(playerKey)!;
            const value = parseInt(leader.displayValue);

            // Update stats based on category name
            switch (category.name) {
                case 'points':
                    playerStat.pts = value;
                    break;
                case 'rebounds':
                    playerStat.reb = value;
                    break;
                case 'assists':
                    playerStat.ast = value;
                    break;
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