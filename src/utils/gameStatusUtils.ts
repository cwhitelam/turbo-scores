import { standardizeFinalCapitalization } from './dateUtils';

export function getGameStatusDisplay(quarter: string, timeLeft: string): string {
  let gameStatus: string;

  // Check for final states
  if (quarter.startsWith('FINAL')) {
    gameStatus = quarter;  // Return FINAL, FINAL/OT, FINAL/2OT as is
  }
  // Check for halftime
  else if (quarter === 'HALFTIME') {
    gameStatus = quarter;
  }
  // Check for final in regulation
  else if (quarter === '4Q' && timeLeft === '0:00') {
    gameStatus = 'FINAL';
  }
  // Check for final in overtime (OT, 2OT, etc.)
  else if (quarter.includes('OT') && timeLeft === '0:00') {
    const otPeriod = quarter.match(/\d+/)?.[0];
    gameStatus = otPeriod ? `FINAL/${otPeriod}OT` : 'FINAL/OT';
  }
  // Check for halftime
  else if (quarter === '2Q' && timeLeft === '0:00') {
    gameStatus = 'HALFTIME';
  }
  // Only use bullet for in-progress games
  else {
    gameStatus = `${quarter} • ${timeLeft}`;
  }

  // Ensure consistent capitalization for any Final states
  return standardizeFinalCapitalization(gameStatus);
}