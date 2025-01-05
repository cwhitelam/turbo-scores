import { NHLGameState } from '../types/nhl';

export function getNHLGameState(period: number, clock: string, powerPlay: boolean, strength: string): NHLGameState {
  return {
    period,
    clock,
    powerPlay,
    strength
  };
}

export function isNHLGameActive(period: number, clock: string): boolean {
  return period > 0 && clock !== '0:00';
}

export function isNHLGameOver(period: number, clock: string): boolean {
  return (period >= 3 || period.toString().includes('OT')) && clock === '0:00';
}