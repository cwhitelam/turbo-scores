import { GameData, GameSituation } from '../../shared/types/game';
import { formatGameClock, formatPeriod, formatGameSituation } from '../../shared/utils/gameUtils';

export function formatNFLGameClock(clock: string | undefined): string {
    return formatGameClock(clock, 'NFL');
}

export function formatNFLPeriod(period: number): string {
    return formatPeriod(period, 'NFL');
}

export function formatNFLSituation(situation: GameSituation): string {
    return formatGameSituation(situation, 'NFL');
}

export function getGamePhase(game: GameData): 'pregame' | 'ingame' | 'halftime' | 'timeout' | 'twominute' | 'postgame' {
    if (game.status.state === 'pre') return 'pregame';
    if (game.status.state === 'post') return 'postgame';

    const period = game.status.period;
    const clock = game.status.clock;

    if (period === 2 && !clock) {
        return 'halftime';
    }
    if (game.status.detail?.toLowerCase().includes('timeout')) {
        return 'timeout';
    }
    if (clock && (period === 2 || period === 4)) {
        const [minutes] = clock.split(':').map(Number);
        if (minutes <= 2) {
            return 'twominute';
        }
    }

    return 'ingame';
}

export function getDownAndDistance(situation: GameSituation): string {
    if (!situation.down || !situation.distance) {
        return '';
    }

    const down = ['1st', '2nd', '3rd', '4th'][situation.down - 1];
    return `${down} & ${situation.distance}`;
}

export function getFieldPosition(situation: GameSituation): string {
    if (!situation.yardLine || !situation.possession) {
        return '';
    }

    return `${situation.possession} ${situation.yardLine}`;
}

export function isRedZone(situation: GameSituation): boolean {
    if (!situation.yardLine) return false;
    return situation.yardLine <= 20;
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

    const period = formatNFLPeriod(game.status.period);
    const clock = formatNFLGameClock(game.status.clock);

    return `${period} ${clock}`;
}

export function getScoreDifferential(game: GameData): number {
    return Math.abs(game.teams.home.score - game.teams.away.score);
}

export function isTwoPointConversionTerritory(game: GameData): boolean {
    const differential = getScoreDifferential(game);
    const period = game.status.period;

    // Common two-point conversion scenarios
    return (
        (differential === 2) || // Down by 2
        (differential === 5) || // Down by 5
        (differential === 10) || // Down by 10
        (period >= 4 && differential === 8) // 4th quarter or OT, down by 8
    );
} 