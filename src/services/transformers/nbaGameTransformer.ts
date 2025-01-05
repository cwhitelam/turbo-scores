import { Game } from '../../types/game';
import { transformTeamData } from './teamTransformer';
import { transformVenueData } from './venueTransformer';

export async function transformNBAGameData(event: any): Promise<Game> {
  try {
    const competition = event.competitions?.[0];
    if (!competition) {
      throw new Error('Invalid game data: missing competition');
    }

    const homeTeam = competition.competitors.find((team: any) => team.homeAway === 'home');
    const awayTeam = competition.competitors.find((team: any) => team.homeAway === 'away');
    
    if (!homeTeam || !awayTeam) {
      throw new Error('Invalid game data: missing team information');
    }

    const venue = competition.venue;
    const status = event.status;
    const situation = competition.situation;
    
    return {
      id: event.id,
      homeTeam: transformTeamData(homeTeam),
      awayTeam: transformTeamData(awayTeam),
      venue: transformVenueData(venue),
      weather: { temp: 72, condition: 'Indoor' }, // NBA games are indoor
      quarter: getNBAQuarter(status?.period),
      timeLeft: status?.displayClock || '',
      startTime: status?.type?.shortDetail || '',
      situation: transformNBASituation(situation)
    };
  } catch (error) {
    console.error('Error transforming NBA game data:', error);
    throw error;
  }
}

function getNBAQuarter(period: number): string {
  if (!period) return '0Q';
  if (period <= 4) return `${period}Q`;
  return `OT${period - 4}`; // Multiple OT periods
}

function transformNBASituation(situation: any) {
  if (!situation) return undefined;
  
  return {
    possession: situation.possession,
    shotClock: situation.shotClock || 24,
    lastPlay: situation.lastPlay?.text || '',
    fouls: {
      home: situation.fouls?.home || 0,
      away: situation.fouls?.away || 0
    },
    bonus: {
      home: situation.bonus?.home || false,
      away: situation.bonus?.away || false
    }
  };
}