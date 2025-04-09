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
    case 'HR':
    case 'RBI':
    case 'BATTING':
      return 'text-green-500';
    case 'AVG':
    case 'H':
      return 'text-blue-400';
    case 'ERA':
    case 'K':
    case 'W':
    case 'PITCHING':
      return 'text-purple-400';
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
    // MLB stat types
    case 'AVG':
      return 'AVG';
    case 'HR':
      return 'HR';
    case 'RBI':
      return 'RBI';
    case 'H':
      return 'HITS';
    case 'ERA':
      return 'ERA';
    case 'K':
      return 'STRIKEOUTS';
    case 'W':
      return 'WINS';
    case 'TEAM':
      return 'SCORE';
    case 'BATTING':
      return 'BATTING';
    case 'PITCHING':
      return 'PITCHING';
    default:
      return statType;
  }
}