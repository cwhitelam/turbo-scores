import { NBALeaderCategory, GameLeaders, NBAStatCategory } from '../types/gameStats';

/**
 * Extracts the primary leader for each main statistical category
 * @param leaders Array of leader categories from the ESPN API
 * @returns Object containing the top leader for points, rebounds, and assists
 */
export function extractGameLeaders(leaders: NBALeaderCategory[]): GameLeaders {
    const result: GameLeaders = {};

    // Helper function to find a specific stat category
    const findCategory = (name: NBAStatCategory): NBALeaderCategory | undefined => {
        return leaders.find(cat => cat.name === name);
    };

    // Get points leader
    const pointsCategory = findCategory('points');
    if (pointsCategory?.leaders?.[0]) {
        result.points = pointsCategory.leaders[0];
    }

    // Get rebounds leader
    const reboundsCategory = findCategory('rebounds');
    if (reboundsCategory?.leaders?.[0]) {
        result.rebounds = reboundsCategory.leaders[0];
    }

    // Get assists leader
    const assistsCategory = findCategory('assists');
    if (assistsCategory?.leaders?.[0]) {
        result.assists = assistsCategory.leaders[0];
    }

    return result;
}

/**
 * Formats a leader entry for display
 * @param entry The leader entry to format
 * @param statAbbrev The abbreviation for the stat (e.g., "PTS", "REB", "AST")
 * @returns Formatted string like "32 PTS - C. Cunningham"
 */
export function formatLeaderDisplay(entry: NBALeaderCategory['leaders'][0], statAbbrev: string): string {
    return `${entry.displayValue} ${statAbbrev} - ${entry.athlete.shortName}`;
} 