import { Game } from '../../types/game';
import { transformTeamData } from './teamTransformer';
import { transformVenueData } from './venueTransformer';
import { transformWeatherData } from './weatherTransformer';
import { transformSituationData } from './situationTransformer';
import { getGameQuarter } from '../../utils/gameUtils';

export async function transformGameData(event: any): Promise<Game> {
  const homeTeam = event.competitions[0].competitors.find((team: any) => team.homeAway === 'home');
  const awayTeam = event.competitions[0].competitors.find((team: any) => team.homeAway === 'away');
  const venue = event.competitions[0].venue;
  
  return {
    id: event.id,
    homeTeam: transformTeamData(homeTeam),
    awayTeam: transformTeamData(awayTeam),
    venue: transformVenueData(venue),
    weather: await transformWeatherData(event.weather, venue),
    quarter: getGameQuarter(event.status.period),
    timeLeft: event.status.displayClock,
    startTime: event.status.type.shortDetail,
    situation: transformSituationData(event.competitions[0].situation)
  };
}