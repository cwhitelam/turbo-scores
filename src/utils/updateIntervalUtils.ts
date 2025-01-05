import { Game } from '../types/game';

const ACTIVE_GAME_INTERVAL = 30000; // 30 seconds
const INACTIVE_GAME_INTERVAL = 300000; // 5 minutes

export function getUpdateInterval(games: Game[]): number {
  const now = new Date();

  // Check if any games are currently active
  const hasActiveGames = games.some(game => isGameActive(game, now));

  return hasActiveGames ? ACTIVE_GAME_INTERVAL : INACTIVE_GAME_INTERVAL;
}

function isGameActive(game: Game, now: Date): boolean {
  const gameStart = parseGameTime(game.startTime);

  // Game hasn't started yet
  if (now < gameStart) {
    return false;
  }

  // Game is over (4th quarter or OT with 0:00 left)
  if ((game.quarter === '4Q' || game.quarter.includes('OT')) && game.timeLeft === '0:00') {
    return false;
  }

  return true;
}

function parseGameTime(timeString: string): Date {
  const today = new Date();
  const [time, period] = timeString.split(' ');
  const [hours, minutes] = time.split(':').map(Number);

  // Convert to 24-hour format
  let hour24 = hours;
  if (period === 'PM' && hours !== 12) hour24 += 12;
  if (period === 'AM' && hours === 12) hour24 = 0;

  const gameDate = new Date(today);
  gameDate.setHours(hour24, minutes, 0, 0);

  // If the time has already passed today, assume it's for tomorrow
  if (gameDate < today) {
    gameDate.setDate(gameDate.getDate() + 1);
  }

  return gameDate;
}