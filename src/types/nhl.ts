export interface NHLSituation {
  powerPlay: boolean;
  strength: string;
  possession?: string;
  lastPlay?: string;
}

export interface NHLGameState {
  period: number;
  clock: string;
  powerPlay: boolean;
  strength: string;
}