import { StatType } from '../types/stats';

export function getStatTypeColor(statType: StatType): string {
  switch (statType) {
    case 'SACK':
    case 'TACKLE':
    case 'INT':
    case 'TFL':
    case 'QB_HIT':
    case 'PD':
      return 'text-red-500';
    case 'BLOCK':
      return 'text-blue-500';
    default:
      return 'text-yellow-500';
  }
}

export function getStatTypeDisplay(statType: StatType): string {
  switch (statType) {
    case 'PASS':
      return 'PASSING';
    case 'RUSH':
      return 'RUSHING';
    case 'REC':
      return 'RECEIVING';
    case 'SACK':
    case 'TACKLE':
    case 'INT':
    case 'TFL':
    case 'QB_HIT':
    case 'PD':
      return 'DEFENSE';
    case 'BLOCK':
      return 'O-LINE';
    case 'PTS':
      return 'PTS';
    case 'REB':
      return 'REB';
    case 'AST':
      return 'AST';
    default:
      return statType;
  }
}