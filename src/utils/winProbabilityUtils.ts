import { TeamInfo } from '../types/game';

export function calculateWinProbability(
  quarter: string,
  timeLeft: string,
  homeTeam: TeamInfo,
  awayTeam: TeamInfo,
  defaultProbability: number,
  isHomeTeam: boolean
): number {
  // Check if game is over
  const isGameOver = (quarter === '4Q' || quarter.includes('OT')) && timeLeft === '0:00';
  
  if (isGameOver) {
    const homeWon = homeTeam.score > awayTeam.score;
    const awayWon = awayTeam.score > homeTeam.score;
    
    if (isHomeTeam && homeWon) return 100;
    if (!isHomeTeam && awayWon) return 100;
    if (homeTeam.score === awayTeam.score) return 50;
    return 0;
  }

  return defaultProbability;
}