import { GamePlaySituation } from '../../types/game';

export function transformSituationData(situation: any): GamePlaySituation | undefined {
  if (!situation) return undefined;
  
  return {
    down: situation.down,
    distance: situation.distance,
    yardLine: situation.yardLine,
    possession: situation.possession
  };
}