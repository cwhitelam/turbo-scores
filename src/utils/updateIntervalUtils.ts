import { Game } from '../types/game';
import { parseGameTime } from './dateUtils';

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