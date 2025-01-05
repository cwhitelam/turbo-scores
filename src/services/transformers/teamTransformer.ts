import { TeamInfo } from '../../types/game';

export function transformTeamData(team: any): TeamInfo {
  return {
    id: team.team.id,
    name: team.team.displayName,
    abbreviation: team.team.abbreviation,
    score: parseInt(team.score ?? '0'),
    record: team.records?.[0]?.summary ?? '0-0-0'
  };
}