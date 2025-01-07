/**
 * Gets the ESPN CDN URL for a team's logo
 * @param sport - The sport (nba, nfl, mlb, nhl)
 * @param abbreviation - The team's abbreviation
 * @param size - The size of the logo (default: 500)
 * @returns The URL for the team's logo
 */
export function getTeamLogoUrl(sport: string, abbreviation: string, size: number = 500): string {
    return `https://a.espncdn.com/i/teamlogos/${sport.toLowerCase()}/500/${abbreviation.toLowerCase()}.png`;
} 