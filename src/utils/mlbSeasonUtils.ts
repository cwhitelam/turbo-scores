export function isMLBOffseason(): boolean {
  const now = new Date();
  const month = now.getMonth(); // 0-based (0 = January)
  
  // MLB season typically runs from late March/early April through early November
  return month >= 10 || month <= 2; // November through February is offseason
}

export function getNextSeasonStartDate(): Date {
  const now = new Date();
  const year = now.getFullYear();
  
  // MLB season typically starts in late March or early April
  // Using March 28th as an approximate date
  const seasonStart = new Date(year, 2, 28); // Month is 0-based, so 2 = March
  
  // If we're past March, use next year
  if (now > seasonStart) {
    seasonStart.setFullYear(year + 1);
  }
  
  return seasonStart;
}