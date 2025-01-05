import { GameData, GameSituation } from '../../shared/types/game';
import { formatGameClock, formatPeriod, formatGameSituation } from '../../shared/utils/gameUtils';

export function formatMLBGameClock(clock: string | undefined): string {
    return formatGameClock(clock, 'MLB');
}

export function formatMLBPeriod(period: number): string {
    return formatPeriod(period, 'MLB');
}

export function formatMLBSituation(situation: GameSituation): string {
    return formatGameSituation(situation, 'MLB');
}

export function getBaseRunners(situation: GameSituation): string {
    const bases = [false, false, false]; // first, second, third
    // Implementation would depend on your data structure
    return bases.map(base => base ? '●' : '○').join(' ');
}

export function getPitchCount(situation: GameSituation): string {
    if (typeof situation.balls !== 'number' || typeof situation.strikes !== 'number') {
        return '';
    }
    return `${situation.balls}-${situation.strikes}`;
}

export function getGamePhase(game: GameData): 'pregame' | 'ingame' | 'delay' | 'postgame' {
    if (game.status.state === 'pre') return 'pregame';
    if (game.status.state === 'post') return 'postgame';
    if (game.status.detail?.toLowerCase().includes('delay')) return 'delay';
    return 'ingame';
}

export function getInningHalf(period: number): 'top' | 'bottom' {
    return period % 2 === 1 ? 'top' : 'bottom';
}

export function getInningNumber(period: number): number {
    return Math.ceil(period / 2);
}

export function formatInning(period: number): string {
    const half = getInningHalf(period);
    const number = getInningNumber(period);
    return `${half.charAt(0).toUpperCase()}${half.slice(1)} ${number}`;
}

export function getScoringSummary(game: GameData): string {
    const { home, away } = game.teams;
    const inning = formatInning(game.status.period);
    return `${away.abbreviation} ${away.score}, ${home.abbreviation} ${home.score} - ${inning}`;
}

export function getTimeRemaining(game: GameData): string {
    if (game.status.state === 'pre') {
        return 'Game starts soon';
    }
    if (game.status.state === 'post') {
        return 'Final';
    }

    return formatInning(game.status.period);
} 