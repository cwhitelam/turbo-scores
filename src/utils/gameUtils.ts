import { Game, TimeSlot } from '../types/game';
import { compareGameTimes } from './timeUtils';

export function getDownAndDistance(down?: number, distance?: number): string {
  if (!down || !distance) return '';
  const downText = ['1st', '2nd', '3rd', '4th'][down - 1];
  return `${downText} & ${distance}`;
}

export function getYardLine(yardLine?: number): string {
  if (!yardLine) return '';
  return yardLine > 50
    ? `OPP ${100 - yardLine}`
    : yardLine === 50
      ? '50'
      : `OWN ${yardLine}`;
}

export function getGameQuarter(period?: number): string {
  if (!period) return '0Q';
  if (period <= 4) return `${period}Q`;
  if (period === 5) return 'OT';
  return `${period - 4}OT`;
}

export function groupGamesByStartTime(games: Game[]): TimeSlot[] {
  const sortedGames = [...games].sort((a, b) =>
    compareGameTimes(a.startTime, b.startTime)
  );

  const grouped = sortedGames.reduce((acc, game) => {
    const time = game.startTime;
    if (!acc[time]) acc[time] = [];
    acc[time].push(game);
    return acc;
  }, {} as Record<string, Game[]>);

  return Object.entries(grouped)
    .sort(([timeA], [timeB]) => compareGameTimes(timeA, timeB))
    .map(([time, games]) => ({ time, games }));
}