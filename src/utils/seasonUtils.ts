import { Sport } from '../types/sport';

export function isInSeason(sport: Sport): boolean {
  const now = new Date();
  const month = now.getMonth(); // 0-based (0 = January)

  switch (sport) {
    case 'NBA':
      // NBA: October through June
      return month >= 9 || month <= 5;
    case 'NHL':
      // NHL: October through June
      return month >= 9 || month <= 5;
    case 'NFL':
      // NFL: September through February
      return month >= 8 || month <= 1;
    case 'MLB':
      // MLB: April through October
      return month >= 3 && month <= 9;
    default:
      return false;
  }
}

export function getSortedSports(): Sport[] {
  const sports: Sport[] = ['NFL', 'NBA', 'NHL', 'MLB'];
  return sports.sort((a, b) => {
    const aInSeason = isInSeason(a);
    const bInSeason = isInSeason(b);
    if (aInSeason === bInSeason) return 0;
    return aInSeason ? -1 : 1;
  });
}

export function isPlayoffWeek(): boolean {
  const now = new Date();
  const month = now.getMonth(); // 0-based (0 = January)
  const date = now.getDate();

  // NFL playoffs typically start in January (month 0)
  // and run through early February (month 1)
  return (month === 0) || (month === 1 && date <= 15);
}