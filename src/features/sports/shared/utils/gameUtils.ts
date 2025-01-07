import { GameData, GameSituation } from '../types/game';
import { SportType } from '../types/sports';
import { sportConfigs } from '../constants/sportConfigs';

export function formatGameClock(clock: string | undefined, sport: SportType): string {
    if (!clock) return '';

    // Format: MM:SS
    const [minutes, seconds] = clock.split(':').map(Number);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
}

export function formatPeriod(period: number, sport: SportType): string {
    const config = sportConfigs[sport];
    const periodName = config.periodName;

    // Debug logs
    console.log('🏀 Format Period Debug:', {
        period,
        sport,
        config,
        defaultPeriodCount: config.defaultPeriodCount,
        hasQuarters: config.hasQuarters
    });

    // Handle final state
    if (period === config.defaultPeriodCount && !config.hasQuarters) {
        console.log('🏀 Returning FINAL state');
        return 'FINAL';
    }

    if (period <= config.defaultPeriodCount) {
        if (config.hasQuarters) {
            console.log('🏀 Returning quarter format:', `Q${period}`);
            return `Q${period}`;
        }
        console.log('🏀 Returning period format:', `${period}${periodName}`);
        return `${period}${periodName}`;
    }

    // Overtime periods
    const otPeriod = period - config.defaultPeriodCount;
    console.log('🏀 Returning overtime format:', `${otPeriod}OT`);
    return `${otPeriod}OT`;
}

export function formatGameSituation(situation: GameSituation, sport: SportType): string {
    switch (sport) {
        case 'NFL':
            return `${situation.down} & ${situation.distance} at ${situation.yardLine}`;
        case 'MLB':
            return `${situation.balls}-${situation.strikes}, ${situation.outs} out`;
        case 'NBA':
            return situation.possession ? `${situation.possession} ball` : '';
        case 'NHL':
            return situation.powerPlay && typeof situation.powerPlay === 'object' ? `${situation.powerPlay.team} PP` : '';
        default:
            return '';
    }
}

export function getGameState(game: GameData): 'scheduled' | 'active' | 'final' {
    switch (game.status.state) {
        case 'pre':
            return 'scheduled';
        case 'post':
            return 'final';
        default:
            return 'active';
    }
}

export function isGameActive(game: GameData): boolean {
    return getGameState(game) === 'active';
}

export function isGameComplete(game: GameData): boolean {
    return getGameState(game) === 'final';
}

export function getWinningTeam(game: GameData): string | null {
    if (!isGameComplete(game)) return null;

    const { home, away } = game.teams;
    if (home.score > away.score) return home.abbreviation;
    if (away.score > home.score) return away.abbreviation;

    return null; // Tie game
}

export function formatScore(game: GameData): string {
    const { home, away } = game.teams;
    return `${away.score}-${home.score}`;
}

export function getHomeTeam(game: GameData): string {
    return game.teams.home.abbreviation;
}

export function getAwayTeam(game: GameData): string {
    return game.teams.away.abbreviation;
}

export function getGameDate(game: GameData): Date {
    return new Date(game.startTime);
}

export function getGameTime(game: GameData): string {
    return new Date(game.startTime).toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true
    });
}

export function getGameDay(game: GameData): string {
    return new Date(game.startTime).toLocaleDateString('en-US', {
        weekday: 'short',
        month: 'short',
        day: 'numeric'
    });
} 