import { Game } from '../types/game';
import { parseGameTime } from './dateUtils';

export function shouldPollWinProbability(): boolean {
  const currentHour = new Date().getHours();
  // Poll during typical NFL game hours (1 PM ET - 12 AM ET)
  return currentHour >= 13 && currentHour < 24;
}

export function isGameInProgress(game: Game): boolean {
  return game.quarter !== '0Q' &&
    !(game.quarter === '4Q' && game.timeLeft === '0:00') &&
    !game.quarter.includes('OT');
}

export function isGameOver(game: Game): boolean {
  return (game.quarter === '4Q' || game.quarter.includes('OT')) &&
    game.timeLeft === '0:00';
}

export function isGameStartingSoon(game: Game): boolean {
  const now = new Date();
  const gameTime = parseGameTime(game.startTime);
  const timeDiff = gameTime.getTime() - now.getTime();
  return timeDiff <= 30 * 60 * 1000; // 30 minutes before game time
}