export function getGameStatusDisplay(quarter: string, timeLeft: string): string {
  // Check for final in regulation
  if (quarter === '4Q' && timeLeft === '0:00') {
    return 'FINAL';
  }
  
  // Check for final in overtime (OT, 2OT, etc.)
  if (quarter.includes('OT') && timeLeft === '0:00') {
    return 'FINAL/OT';
  }

  // Check for halftime
  if (quarter === '2Q' && timeLeft === '0:00') {
    return 'HALF';
  }
  
  return `${quarter} • ${timeLeft}`;
}