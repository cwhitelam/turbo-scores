import { Game } from '../../types/game';
import { NHLSituation } from '../../types/nhl';
import { transformTeamData } from './teamTransformer';
import { transformVenueData } from './venueTransformer';

export async function transformNHLGameData(event: any): Promise<Game> {
  try {
    if (!event?.competitions?.[0]) {
      throw new Error('Invalid NHL game data: missing competition data');
    }

    const competition = event.competitions[0];
    const homeTeam = competition.competitors?.find((team: any) => team.homeAway === 'home');
    const awayTeam = competition.competitors?.find((team: any) => team.homeAway === 'away');

    if (!homeTeam || !awayTeam) {
      throw new Error('Invalid NHL game data: missing team information');
    }

    const venue = competition.venue;
    const status = event.status;
    const situation = transformNHLSituation(competition.situation);

    // For games that are finished (post-game state)
    if (status?.type?.state === 'post') {
      let quarter = 'FINAL';
      // Check if the game went to overtime (NHL games have 3 periods normally)
      if (status?.period > 3) {
        // Check if it was a shootout (typically period 5)
        if (status.period === 5) {
          quarter = 'FINAL/SO';
        } else {
          // It was regular overtime (period 4)
          quarter = 'FINAL/OT';
        }
      }

      return {
        id: event.id,
        homeTeam: transformTeamData(homeTeam),
        awayTeam: transformTeamData(awayTeam),
        venue: transformVenueData(venue),
        weather: { temp: 70, condition: 'Indoor' }, // NHL games are indoor
        quarter: quarter,
        timeLeft: '',
        startTime: status?.type?.shortDetail || '',
        situation
      };
    }

    return {
      id: event.id,
      homeTeam: transformTeamData(homeTeam),
      awayTeam: transformTeamData(awayTeam),
      venue: transformVenueData(venue),
      weather: { temp: 70, condition: 'Indoor' }, // NHL games are indoor
      quarter: getNHLPeriod(status?.period),
      timeLeft: status?.displayClock || '',
      startTime: status?.type?.shortDetail || '',
      situation
    };
  } catch (error) {
    console.error('Error transforming NHL game:', {
      error,
      eventId: event?.id
    });
    throw error;
  }
}

function getNHLPeriod(period: number): string {
  if (!period) return '0Q';
  if (period <= 3) return `${period}P`;
  return `OT${period - 3}`;
}

function transformNHLSituation(situation: any): NHLSituation | undefined {
  if (!situation) return undefined;

  return {
    powerPlay: Boolean(situation.powerPlay),
    strength: situation.strength || 'even',
    possession: situation.lastPlay?.team?.abbreviation,
    lastPlay: situation.lastPlay?.text
  };
}