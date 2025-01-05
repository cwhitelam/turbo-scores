import { Game } from '../types/game';

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

function parseGameTime(timeString: string): Date {
  const today = new Date();
  const [time, period] = timeString.split(' ');
  const [hours, minutes] = time.split(':').map(Number);
  
  let hour24 = hours;
  if (period === 'PM' && hours !== 12) hour24 += 12;
  if (period === 'AM' && hours === 12) hour24 = 0;
  
  const gameDate = new Date(today);
  gameDate.setHours(hour24, minutes, 0, 0);
  
  if (gameDate < today) {
    gameDate.setDate(gameDate.getDate() + 1);
  }
  
  return gameDate;
}