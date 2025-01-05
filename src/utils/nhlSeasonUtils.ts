export function isNHLOffseason(): boolean {
  const now = new Date();
  const month = now.getMonth(); // 0-based (0 = January)
  
  // NHL season typically runs from October through June
  return month >= 6 && month <= 8; // July through September is offseason
}

export function getNextSeasonStartDate(): Date {
  const now = new Date();
  const year = now.getFullYear();
  
  // NHL season typically starts in early October
  // Using October 7th as an approximate date
  const seasonStart = new Date(year, 9, 7); // Month is 0-based, so 9 = October
  
  // If we're past October, use next year
  if (now > seasonStart) {
    seasonStart.setFullYear(year + 1);
  }
  
  return seasonStart;
}