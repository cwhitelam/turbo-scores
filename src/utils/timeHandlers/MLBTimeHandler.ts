import { GameTimeState, GameStatus } from './types';
import { parseGameTime, formatDisplayTime, getTimezoneAbbreviation } from '../dateUtils';

export class MLBTimeHandler {
    private readonly FINAL_STATES = ['final', 'final/10', 'final/11', 'final/12', 'final/13', 'final/14', 'final/15'];

    parseGameTime(timeString: string, gameStatus?: GameStatus): GameTimeState {
        if (!timeString) {
            return this.createDefaultState();
        }

        const lowerTimeString = timeString.toLowerCase();

        // Handle final states with possible extra innings
        if (lowerTimeString.startsWith('final')) {
            // Extract inning number if present (e.g., "final/10" -> 10)
            const inningMatch = lowerTimeString.match(/final\/(\d+)/);
            const extraInnings = inningMatch ? parseInt(inningMatch[1], 10) : 0;
            const isExtraInnings = extraInnings > 9;

            let displayTime = 'FINAL';
            if (isExtraInnings) {
                displayTime = `FINAL/${extraInnings}`;
            }

            return {
                isLive: false,
                displayTime,
                sortableTime: new Date(),
                isFinal: true,
                periodNumber: isExtraInnings ? extraInnings : 9,
                isOvertime: isExtraInnings
            };
        }

        // Handle "Middle X" or "End X" states
        if (lowerTimeString.startsWith('middle') || lowerTimeString.startsWith('end')) {
            const inningMatch = lowerTimeString.match(/(\d+)/);
            const inning = inningMatch ? parseInt(inningMatch[1], 10) : 0;
            const isMiddle = lowerTimeString.startsWith('middle');

            return {
                isLive: true,
                displayTime: this.capitalizeFirstLetters(timeString),
                sortableTime: new Date(),
                periodNumber: inning,
                isMiddleInning: isMiddle,
                isEndInning: !isMiddle
            };
        }

        // Handle active inning (e.g., "Top 3" or "Bot 7")
        if (lowerTimeString.startsWith('top') || lowerTimeString.startsWith('bot')) {
            const inningMatch = lowerTimeString.match(/(\d+)/);
            const inning = inningMatch ? parseInt(inningMatch[1], 10) : 0;
            const isTop = lowerTimeString.startsWith('top');

            return {
                isLive: true,
                displayTime: this.capitalizeFirstLetters(timeString),
                sortableTime: new Date(),
                periodNumber: inning,
                isTopInning: isTop,
                isBottomInning: !isTop
            };
        }

        // Handle end of 9th inning with score format
        if (lowerTimeString.includes('9th') && lowerTimeString.includes('bot') && lowerTimeString.includes('0 out')) {
            return {
                isLive: false,
                displayTime: 'FINAL',
                sortableTime: new Date(),
                isFinal: true,
                periodNumber: 9
            };
        }

        // Handle delayed/postponed states
        if (lowerTimeString === 'delayed' || lowerTimeString === 'postponed') {
            return {
                isLive: false,
                displayTime: lowerTimeString === 'delayed' ? 'DELAYED' : 'POSTPONED',
                sortableTime: new Date(),
                isDelayed: lowerTimeString === 'delayed',
                isPostponed: lowerTimeString === 'postponed'
            };
        }

        // Handle future game time
        try {
            const gameTime = parseGameTime(timeString);

            return {
                isLive: false,
                displayTime: timeString,
                sortableTime: gameTime
            };
        } catch (error) {
            console.error('Error parsing MLB game time:', { timeString, error });
            return this.createDefaultState();
        }
    }

    formatGameTime(state: GameTimeState): string {
        if (state.isFinal) {
            if (!state.isOvertime || state.periodNumber === 9) return 'FINAL';
            return `FINAL/${state.periodNumber}`;
        }
        if (state.isDelayed) {
            return 'DELAYED';
        }
        if (state.isPostponed) {
            return 'POSTPONED';
        }
        if (state.isLive) {
            return state.displayTime;
        }
        return this.formatTimeOnly(state.sortableTime);
    }

    isValidGameTime(timeString: string): boolean {
        try {
            const state = this.parseGameTime(timeString);
            return Boolean(state.displayTime);
        } catch {
            return false;
        }
    }

    private createDefaultState(): GameTimeState {
        return {
            isLive: false,
            displayTime: 'TBD',
            sortableTime: new Date()
        };
    }

    private formatTimeOnly(date: Date): string {
        const formatted = formatDisplayTime(date);
        const timezone = getTimezoneAbbreviation();
        return `${formatted} ${timezone}`;
    }

    private capitalizeFirstLetters(str: string): string {
        return str.split(' ').map(word =>
            word.charAt(0).toUpperCase() + word.slice(1)
        ).join(' ');
    }
} 