import { Game } from '../../types/game';
import { transformTeamData } from './teamTransformer';
import { transformVenueData } from './venueTransformer';

export async function transformNBAGameData(event: any): Promise<Game> {
  try {
    console.log('🏀 Raw Game Data:', {
      eventId: event.id,
      status: event.status,
      rawState: event.status?.type?.state,
      period: event.status?.period,
      displayClock: event.status?.displayClock,
      shortDetail: event.status?.type?.shortDetail,
      completed: event.status?.type?.completed,
      description: event.status?.type?.description
    });

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

    // Handle pregame state first
    if (status?.type?.state === 'pre') {
      console.log('🏀 Game State: PREGAME');
      return {
        id: event.id,
        homeTeam: transformTeamData(homeTeam),
        awayTeam: transformTeamData(awayTeam),
        venue: transformVenueData(venue),
        weather: { temp: 72, condition: 'Indoor' },
        quarter: '0Q',  // Use '0Q' for pregame to match header component expectations
        timeLeft: '',  // Empty timeLeft for pregame
        startTime: status?.type?.shortDetail || '',
        situation: transformNBASituation(situation)
      };
    }

    // Handle final states
    if (status?.type?.state === 'post') {
      let quarter;
      if (status.period <= 4) {
        quarter = 'FINAL';
      } else {
        const otPeriod = status.period - 4;
        quarter = otPeriod === 1 ? 'FINAL/OT' : `FINAL/${otPeriod}OT`;
      }
      console.log('🏀 Game State: FINAL', { quarter, period: status.period });
      return {
        id: event.id,
        homeTeam: transformTeamData(homeTeam),
        awayTeam: transformTeamData(awayTeam),
        venue: transformVenueData(venue),
        weather: { temp: 72, condition: 'Indoor' },
        quarter,
        timeLeft: '',
        startTime: status?.type?.shortDetail || '',
        situation: transformNBASituation(situation)
      };
    }

    // Handle halftime
    if (status?.period === 2 && status?.type?.state === 'in' && !status?.displayClock) {
      console.log('🏀 Game State: HALFTIME');
      return {
        id: event.id,
        homeTeam: transformTeamData(homeTeam),
        awayTeam: transformTeamData(awayTeam),
        venue: transformVenueData(venue),
        weather: { temp: 72, condition: 'Indoor' },
        quarter: 'HALF',
        timeLeft: '',
        startTime: status?.type?.shortDetail || '',
        situation: transformNBASituation(situation)
      };
    }

    // Handle end of quarter states
    if (status?.type?.state === 'in' && status?.displayClock === '0.0' && status?.period < 4) {
      const periodNames = ['1st', '2nd', '3rd', '4th'];
      const quarterName = periodNames[status.period - 1];
      console.log('🏀 Game State: END OF QUARTER', { quarter: quarterName, period: status.period });
      return {
        id: event.id,
        homeTeam: transformTeamData(homeTeam),
        awayTeam: transformTeamData(awayTeam),
        venue: transformVenueData(venue),
        weather: { temp: 72, condition: 'Indoor' },
        quarter: `End of ${quarterName}`,
        timeLeft: '',
        startTime: status?.type?.shortDetail || '',
        situation: transformNBASituation(situation)
      };
    }

    // Handle in-progress games
    let quarter = getNBAQuarter(status?.period);
    let timeLeft = status?.displayClock || '';

    // For in-game states, combine quarter and time with bullet
    if (timeLeft && !quarter.startsWith('FINAL') && quarter !== 'HALF') {
      quarter = `${quarter} • ${timeLeft}`;
      timeLeft = '';
    }
    console.log('🏀 Game State: IN PROGRESS', { quarter, timeLeft, period: status?.period });

    return {
      id: event.id,
      homeTeam: transformTeamData(homeTeam),
      awayTeam: transformTeamData(awayTeam),
      venue: transformVenueData(venue),
      weather: { temp: 72, condition: 'Indoor' },
      quarter,
      timeLeft,
      startTime: status?.type?.shortDetail || '',
      situation: transformNBASituation(situation)
    };
  } catch (error) {
    console.error('Error transforming NBA game data:', error);
    throw error;
  }
}

function getNBAQuarter(period: number): string {
  console.log('🏀 Getting NBA quarter for period:', period);
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