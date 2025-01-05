import { WinProbability } from '../types/game';
import { SPORTS } from '../config/sports';

const BASE_URL = 'https://site.api.espn.com/apis/site/v2/sports';

export async function getGameWinProbability(gameId: string): Promise<WinProbability | null> {
  if (!gameId) return null;

  try {
    const sport = SPORTS.find(s => gameId.startsWith(s.name.toLowerCase()));
    if (!sport) return null;

    const url = `${BASE_URL}/${sport.apiPath}/summary?event=${gameId}`;
    const response = await fetch(url);
    
    if (!response.ok) return null;
    
    const data = await response.json();
    
    // Get team IDs and basic game info
    const competition = data.header?.competitions?.[0];
    if (!competition) return null;

    const homeTeam = competition.competitors?.find((team: any) => team.homeAway === 'home');
    const awayTeam = competition.competitors?.find((team: any) => team.homeAway === 'away');
    
    if (!homeTeam?.id || !awayTeam?.id) return null;

    // Get win probability from predictor if available
    const predictor = data.predictor || {};
    const homeProb = predictor.homeTeam?.gameProjection;
    const awayProb = predictor.awayTeam?.gameProjection;

    // If we have valid probabilities from the API, use them
    if (typeof homeProb === 'number' && typeof awayProb === 'number') {
      return {
        homeTeamId: homeTeam.id,
        awayTeamId: awayTeam.id,
        homeWinPercentage: homeProb,
        awayWinPercentage: awayProb,
        lastUpdated: new Date().toISOString()
      };
    }

    // Otherwise calculate based on score and game state
    const homeScore = parseInt(homeTeam.score || '0');
    const awayScore = parseInt(awayTeam.score || '0');
    const period = parseInt(competition.status?.period || '0');
    const clock = competition.status?.displayClock;

    // Default to 50-50 if game hasn't started
    if (period === 0 || !clock) {
      return {
        homeTeamId: homeTeam.id,
        awayTeamId: awayTeam.id,
        homeWinPercentage: 50,
        awayWinPercentage: 50,
        lastUpdated: new Date().toISOString()
      };
    }

    // Calculate probability based on score difference and time remaining
    const scoreDiff = homeScore - awayScore;
    const isGameOver = clock === '0:00' && (period >= 4 || period.toString().includes('OT'));
    
    if (isGameOver) {
      // Game is over - winner gets 100%
      return {
        homeTeamId: homeTeam.id,
        awayTeamId: awayTeam.id,
        homeWinPercentage: scoreDiff > 0 ? 100 : scoreDiff < 0 ? 0 : 50,
        awayWinPercentage: scoreDiff < 0 ? 100 : scoreDiff > 0 ? 0 : 50,
        lastUpdated: new Date().toISOString()
      };
    }

    // Calculate based on score difference and time remaining
    const timeWeight = Math.min(period / 4, 1); // Increases as game progresses
    const baseProb = 50 + (scoreDiff * 2 * timeWeight);
    const homeProb2 = Math.min(Math.max(baseProb, 10), 90); // Clamp between 10-90%

    return {
      homeTeamId: homeTeam.id,
      awayTeamId: awayTeam.id,
      homeWinPercentage: homeProb2,
      awayWinPercentage: 100 - homeProb2,
      lastUpdated: new Date().toISOString()
    };

  } catch (error) {
    // Silently handle errors by returning null
    return null;
  }
}