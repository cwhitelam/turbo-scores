import { GameData, GameSituation } from '../types/game';
import { SportType } from '../types/sports';

export function formatGameClock(clock: string | undefined, sport: SportType): string {
    if (!clock) return '';

    // Format: MM:SS
    const [minutes, seconds] = clock.split(':').map(Number);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
}

export function formatPeriod(period: number, sport: SportType): string {
    if (!period) return '';

    // Handle final states
    if (period === -1) {
        return 'FINAL';
    }

    switch (sport) {
        case 'NBA': {
            // Regular quarters (1-4)
            if (period <= 4) {
                return `Q${period}`;
            }

            // Overtime periods
            const otPeriod = period - 4;
            return `${otPeriod}OT`;
        }

        case 'NFL': {
            // Regular quarters (1-4)
            if (period <= 4) {
                const periodName = ['1st', '2nd', '3rd', '4th'][period - 1];
                return periodName;
            }

            // Overtime
            const otPeriod = period - 4;
            return `${otPeriod}OT`;
        }

        default:
            return `${period}`;
    }
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