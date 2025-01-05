import { Game, TimeSlate } from '../types/game';

export function groupGamesByTimeSlate(games: Game[]): TimeSlate[] {
  const slates: { [key: string]: Game[] } = {
    'Early': [],
    'Late': [],
    'Night': [],
    'Other': []
  };

  games.forEach(game => {
    const time = game.startTime;
    if (time.includes('1:00 PM')) {
      slates['Early'].push(game);
    } else if (time.includes('4:00 PM') || time.includes('4:25 PM')) {
      slates['Late'].push(game);
    } else if (time.includes('8:00 PM') || time.includes('8:15 PM') || time.includes('8:20 PM')) {
      slates['Night'].push(game);
    } else {
      slates['Other'].push(game);
    }
  });

  return Object.entries(slates)
    .filter(([_, games]) => games.length > 0)
    .map(([name, games]) => ({
      name,
      games
    }));
}