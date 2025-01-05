import { parseGameTime } from './dateUtils';

export function compareGameTimes(timeA: string, timeB: string): number {
  const dateA = parseGameTime(timeA);
  const dateB = parseGameTime(timeB);
  return dateA.getTime() - dateB.getTime();
}