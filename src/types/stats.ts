export type StatType =
  // NFL
  | 'PASS'
  | 'RUSH'
  | 'REC'
  | 'SACK'
  | 'TACKLE'
  | 'INT'
  | 'TFL'
  | 'QB_HIT'
  | 'PD'
  | 'BLOCK'
  // NBA
  | 'PTS'
  | 'REB'
  | 'AST'
  // MLB
  | 'AVG'
  | 'HR'
  | 'RBI'
  | 'H'
  | '2B'
  | '3B'
  | 'K'
  | 'IP'
  | 'ERA'
  | 'W'
  | 'TEAM'
  | 'BATTING'
  | 'PITCHING'
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
  currentSport?: string;
}