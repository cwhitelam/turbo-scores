import { SportConfig } from '../types/sport';
import { getSortedSports } from '../utils/seasonUtils';

const sportConfigs: Record<string, Omit<SportConfig, 'name'>> = {
  NFL: {
    apiPath: 'football/nfl'
  },
  MLB: {
    apiPath: 'baseball/mlb'
  },
  NBA: {
    apiPath: 'basketball/nba',
    isIndoor: true
  },
  NHL: {
    apiPath: 'hockey/nhl',
    isIndoor: true
  }
};

export const SPORTS: SportConfig[] = getSortedSports().map(sport => ({
  name: sport,
  ...sportConfigs[sport]
}));