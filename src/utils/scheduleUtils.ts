import { isPlayoffWeek } from './seasonUtils';
import { parseGameTime } from './dateUtils';

export function shouldResetSchedule(): boolean {
  const now = new Date();
  const day = now.getDay(); // 0 = Sunday, 4 = Thursday, 6 = Saturday
  const hour = now.getHours();
  const isPlayoffs = isPlayoffWeek();

  // During playoffs (Week 17+), reset on Saturday mornings at 7 AM ET
  if (isPlayoffs) {
    return day === 6 && hour >= 7;
  }

  // During regular season, reset on Thursday mornings at 7 AM ET (before TNF)
  return day === 4 && hour >= 7;
}

export function isGameFromPreviousWeek(gameTime: string): boolean {
  const now = new Date();
  const gameDate = parseGameTime(gameTime);
  const isPlayoffs = isPlayoffWeek();

  if (isPlayoffs) {
    // If it's Saturday or later, games from Sunday-Friday are from previous week
    if (now.getDay() >= 6) { // Saturday-Sunday
      return gameDate.getDay() >= 0 && gameDate.getDay() <= 5; // Sunday-Friday
    }
  } else {
    // If it's Thursday or later, games from Sunday-Wednesday are from previous week
    if (now.getDay() >= 4) { // Thursday-Saturday
      return gameDate.getDay() >= 0 && gameDate.getDay() <= 3; // Sunday-Wednesday
    }
  }

  return false;
}