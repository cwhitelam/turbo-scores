import { Game } from '../../types/game';
import { transformTeamData } from './teamTransformer';
import { transformVenueData } from './venueTransformer';
import { transformWeatherData } from './weatherTransformer';

export async function transformMLBGameData(event: any): Promise<Game> {
  const homeTeam = event.competitions[0].competitors.find((team: any) => team.homeAway === 'home');
  const awayTeam = event.competitions[0].competitors.find((team: any) => team.homeAway === 'away');
  const venue = event.competitions[0].venue;
  const situation = event.competitions[0].situation;
  const status = event.status;

  // For games that are finished (post-game state)
  if (status?.type?.state === 'post') {
    // Check if the game went to extra innings (MLB games normally have 9 innings)
    let quarter = 'FINAL';
    if (status?.period > 9) {
      quarter = `FINAL/${status.period}`;
    }

    return {
      id: event.id,
      homeTeam: transformTeamData(homeTeam),
      awayTeam: transformTeamData(awayTeam),
      venue: transformVenueData(venue),
      weather: await transformWeatherData(event.weather, venue),
      quarter: quarter,
      timeLeft: '',
      startTime: status.type.shortDetail,
      situation: transformMLBSituation(situation)
    };
  }

  return {
    id: event.id,
    homeTeam: transformTeamData(homeTeam),
    awayTeam: transformTeamData(awayTeam),
    venue: transformVenueData(venue),
    weather: await transformWeatherData(event.weather, venue),
    quarter: getMLBInning(situation),
    timeLeft: getMLBCount(situation),
    startTime: status.type.shortDetail,
    situation: transformMLBSituation(situation)
  };
}

function getMLBInning(situation: any): string {
  if (!situation?.inning) return '0Q';
  const inning = situation.inning;
  const half = situation.isInningTop ? 'Top' : 'Bot';
  return `${half} ${inning}`;
}

function getMLBCount(situation: any): string {
  if (!situation) return '';
  return `${situation.balls}-${situation.strikes}`;
}

function transformMLBSituation(situation: any) {
  if (!situation) return undefined;

  return {
    balls: situation.balls || 0,
    strikes: situation.strikes || 0,
    outs: situation.outs || 0,
    onFirst: !!situation.onFirst,
    onSecond: !!situation.onSecond,
    onThird: !!situation.onThird,
    possession: situation.batter?.team?.abbreviation
  };
}