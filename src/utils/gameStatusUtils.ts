export function getGameStatusDisplay(quarter: string, timeLeft: string): string {
  // Check for final states
  if (quarter.startsWith('FINAL')) {
    return quarter;  // Return FINAL, FINAL/OT, FINAL/2OT as is
  }

  // Check for halftime
  if (quarter === 'HALF') {
    return quarter;
  }

  // Check for final in regulation
  if (quarter === '4Q' && timeLeft === '0:00') {
    return 'FINAL';
  }

  // Check for final in overtime (OT, 2OT, etc.)
  if (quarter.includes('OT') && timeLeft === '0:00') {
    const otPeriod = quarter.match(/\d+/)?.[0];
    return otPeriod ? `FINAL/${otPeriod}OT` : 'FINAL/OT';
  }

  // Check for halftime
  if (quarter === '2Q' && timeLeft === '0:00') {
    return 'HALF';
  }

  // Only use bullet for in-progress games
  return `${quarter} • ${timeLeft}`;
}