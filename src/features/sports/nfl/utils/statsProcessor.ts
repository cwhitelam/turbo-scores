import { PlayerStat } from '../../../../types/stats';

export function processNFLStats(data: any): PlayerStat[] {
    const stats: PlayerStat[] = [];

    for (const teamLeaders of data.leaders) {
        if (!teamLeaders?.team?.abbreviation) continue;

        const teamId = teamLeaders.team.abbreviation;
        const leaders = teamLeaders.leaders || [];

        for (const category of leaders) {
            if (!category?.leaders?.[0]) continue;

            const leader = category.leaders[0];
            if (!leader.athlete?.shortName || !leader.displayValue) continue;

            const statInfo = parseNFLStatValue(category.name, leader.displayValue);
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

    return stats;
}

function parseNFLStatValue(category: string, displayValue: string): { value: number; type: 'PASS' | 'RUSH' | 'REC' | 'SACK' | 'TACKLE' | 'INT' } | null {
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
        console.error(`Error parsing NFL stat: ${category}`, error);
        return null;
    }
} 