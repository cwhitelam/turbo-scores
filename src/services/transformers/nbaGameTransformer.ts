import { Game } from '../../types/game';
import { transformTeamData } from './teamTransformer';
import { transformVenueData } from './venueTransformer';

export async function transformNBAGameData(event: any): Promise<Game> {
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

  // Handle pregame state first
  if (status?.type?.state === 'pre') {
    return {
      id: event.id,
      homeTeam: transformTeamData(homeTeam),
      awayTeam: transformTeamData(awayTeam),
      venue: transformVenueData(venue),
      weather: { temp: 72, condition: 'Indoor' },
      quarter: '0Q',
      timeLeft: '',
      startTime: status?.type?.shortDetail || ''
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
    return {
      id: event.id,
      homeTeam: transformTeamData(homeTeam),
      awayTeam: transformTeamData(awayTeam),
      venue: transformVenueData(venue),
      weather: { temp: 72, condition: 'Indoor' },
      quarter,
      timeLeft: '',
      startTime: status?.type?.shortDetail || ''
    };
  }

  // Handle halftime
  if (status?.period === 2 && status?.type?.state === 'in' && !status?.displayClock) {
    return {
      id: event.id,
      homeTeam: transformTeamData(homeTeam),
      awayTeam: transformTeamData(awayTeam),
      venue: transformVenueData(venue),
      weather: { temp: 72, condition: 'Indoor' },
      quarter: 'HALF',
      timeLeft: '',
      startTime: status?.type?.shortDetail || ''
    };
  }

  // Handle end of quarter states
  if (status?.type?.state === 'in' && status?.displayClock === '0.0' && status?.period < 4) {
    const periodNames = ['1st', '2nd', '3rd', '4th'];
    const quarterName = periodNames[status.period - 1];
    return {
      id: event.id,
      homeTeam: transformTeamData(homeTeam),
      awayTeam: transformTeamData(awayTeam),
      venue: transformVenueData(venue),
      weather: { temp: 72, condition: 'Indoor' },
      quarter: `End of ${quarterName}`,
      timeLeft: '',
      startTime: status?.type?.shortDetail || ''
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

  return {
    id: event.id,
    homeTeam: transformTeamData(homeTeam),
    awayTeam: transformTeamData(awayTeam),
    venue: transformVenueData(venue),
    weather: { temp: 72, condition: 'Indoor' },
    quarter,
    timeLeft,
    startTime: status?.type?.shortDetail || ''
  };
}

function getNBAQuarter(period: number): string {
  if (!period) return '0Q';
  if (period <= 4) return `${period}Q`;
  return `OT${period - 4}`; // Multiple OT periods
}