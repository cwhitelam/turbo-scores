import { GameData, GameSituation } from '../../shared/types/game';
import { formatGameClock, formatPeriod, formatGameSituation } from '../../shared/utils/gameUtils';

export function formatNHLGameClock(clock: string | undefined): string {
    return formatGameClock(clock, 'NHL');
}

export function formatNHLPeriod(period: number): string {
    return formatPeriod(period, 'NHL');
}

export function formatNHLSituation(situation: GameSituation): string {
    return formatGameSituation(situation, 'NHL');
}

export function getGamePhase(game: GameData): 'pregame' | 'ingame' | 'intermission' | 'timeout' | 'postgame' {
    if (game.status.state === 'pre') return 'pregame';
    if (game.status.state === 'post') return 'postgame';

    if (!game.status.clock) {
        return 'intermission';
    }
    if (game.status.detail?.toLowerCase().includes('timeout')) {
        return 'timeout';
    }

    return 'ingame';
}

export function getPowerPlayStatus(situation: GameSituation): string {
    if (!situation.powerPlay) return '';

    const { team, timeRemaining, players } = situation.powerPlay;
    if (!timeRemaining || !players) return '';

    return `${team} PP (${players}v${players - 1}) ${formatNHLGameClock(timeRemaining)}`;
}

export function isEmptyNet(situation: GameSituation): boolean {
    return situation.emptyNet || false;
}

export function getScoringSummary(game: GameData): string {
    const { home, away } = game.teams;
    return `${away.abbreviation} ${away.score} - ${home.score} ${home.abbreviation}`;
}

export function getTimeRemaining(game: GameData): string {
    if (game.status.state === 'pre') {
        return 'Game starts soon';
    }
    if (game.status.state === 'post') {
        return 'FINAL';
    }

    const period = formatNHLPeriod(game.status.period);
    const clock = formatNHLGameClock(game.status.clock);

    return `${period} ${clock}`;
}

export function isShootout(game: GameData): boolean {
    return game.status.period > 4;
}

export function getGoalDifferential(game: GameData): number {
    return Math.abs(game.teams.home.score - game.teams.away.score);
}

export function isPulledGoalie(game: GameData): boolean {
    const differential = getGoalDifferential(game);
    const period = game.status.period;
    const clock = game.status.clock;

    if (!clock || period < 3) return false;

    const [minutes] = clock.split(':').map(Number);
    return period === 3 && minutes <= 3 && differential <= 2;
} 