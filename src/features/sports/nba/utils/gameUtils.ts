import { GameData, GameSituation } from '../../shared/types/game';
import { formatGameClock, formatPeriod, formatGameSituation } from '../../shared/utils/gameUtils';

export function formatNBAGameClock(clock: string | undefined): string {
    return formatGameClock(clock, 'NBA');
}

export function formatNBAPeriod(period: number): string {
    return formatPeriod(period, 'NBA');
}

export function formatNBASituation(situation: GameSituation): string {
    return formatGameSituation(situation, 'NBA');
}

export function getGamePhase(game: GameData): 'pregame' | 'ingame' | 'halftime' | 'timeout' | 'postgame' {
    if (game.status.state === 'pre') return 'pregame';
    if (game.status.state === 'post') return 'postgame';

    const period = game.status.period;
    if (period === 2 && !game.status.clock) {
        return 'halftime';
    }
    if (game.status.detail?.toLowerCase().includes('timeout')) {
        return 'timeout';
    }

    return 'ingame';
}

export function isClutchTime(game: GameData): boolean {
    if (game.status.state !== 'in') return false;

    const period = game.status.period;
    const clock = game.status.clock;
    if (!clock) return false;

    const [minutes] = clock.split(':').map(Number);
    const isLastPeriod = period >= 4; // 4th quarter or overtime
    const isLastFiveMinutes = minutes <= 5;
    const scoreDiff = Math.abs(game.teams.home.score - game.teams.away.score);

    return isLastPeriod && isLastFiveMinutes && scoreDiff <= 10;
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
        return 'Final';
    }

    const period = formatNBAPeriod(game.status.period);
    const clock = formatNBAGameClock(game.status.clock);

    return `${period} ${clock}`;
}

export function getPointDifferential(game: GameData): number {
    return Math.abs(game.teams.home.score - game.teams.away.score);
} 