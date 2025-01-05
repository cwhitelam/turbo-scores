export type StatType = 'PASS' | 'RUSH' | 'REC' | 'SACK' | 'TACKLE' | 'INT' | 'TFL' | 'QB_HIT' | 'BLOCK' | 'PD';

export interface PlayerStat {
  name: string;
  team: string;
  value: number;
  statType: StatType;
  displayValue: string;
}