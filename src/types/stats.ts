export type StatType =
  // NFL
  | 'PASS'
  | 'RUSH'
  | 'REC'
  | 'SACK'
  | 'TACKLE'
  | 'INT'
  // NBA
  | 'PTS'
  | 'REB'
  | 'AST'
  // MLB
  | 'AVG'
  | 'HR'
  | 'RBI'
  // NHL
  | 'GOAL'
  | 'ASSIST'
  | 'POINT';

export interface PlayerStat {
  name: string;
  team: string;
  value: number;
  statType: StatType;
  displayValue: string;
}