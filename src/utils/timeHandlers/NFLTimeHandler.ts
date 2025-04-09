import { GameTimeState, GameStatus } from './types';
import { parseGameTime, formatDisplayTime, getTimezoneAbbreviation } from '../dateUtils';

export class NFLTimeHandler {
    private readonly QUARTERS = ['1st', '2nd', '3rd', '4th'];
    private readonly FINAL_STATES = ['final', 'final/ot'];

    parseGameTime(timeString: string, gameStatus?: GameStatus): GameTimeState {
        if (!timeString) {
            return this.createDefaultState();
        }

        const lowerTimeString = timeString.toLowerCase();

        // Handle final states
        if (this.FINAL_STATES.includes(lowerTimeString)) {
            const isOT = lowerTimeString.includes('ot');
            return {
                isLive: false,
                displayTime: isOT ? 'FINAL/OT' : 'FINAL',
                sortableTime: new Date(),
                isFinal: true,
                isOvertime: isOT,
                periodNumber: isOT ? 5 : 4
            };
        }

        // Handle Halftime
        if (lowerTimeString === 'halftime') {
            return {
                isLive: true,
                displayTime: 'HALFTIME',
                sortableTime: new Date(),
                isHalftime: true,
                periodNumber: 2
            };
        }

        // Handle end of game state (4th quarter with 0:00 left)
        if (lowerTimeString.includes('4th') && lowerTimeString.includes('0:00')) {
            return {
                isLive: false,
                displayTime: 'FINAL',
                sortableTime: new Date(),
                isFinal: true,
                periodNumber: 4
            };
        }

        // Handle in-game time format "1:02 - 3rd"
        if (timeString.includes(' - ')) {
            const [time, period] = timeString.split(' - ');
            const periodNumber = this.getPeriodNumber(period);
            const isOT = period.toUpperCase() === 'OT';

            return {
                isLive: true,
                displayTime: timeString,
                sortableTime: new Date(),
                period,
                periodNumber,
                isOvertime: isOT
            };
        }

        // Handle future game time "8:15 PM EST"
        try {
            // Use the centralized time parser
            const gameTime = parseGameTime(timeString);

            return {
                isLive: false,
                displayTime: timeString,
                sortableTime: gameTime
            };
        } catch (error) {
            console.error('Error parsing NFL game time:', { timeString, error });
            return this.createDefaultState();
        }
    }

    formatGameTime(state: GameTimeState): string {
        if (state.isFinal) {
            return state.isOvertime ? 'FINAL/OT' : 'FINAL';
        }
        if (state.isHalftime) {
            return 'HALFTIME';
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

    // Helper methods
    private getPeriodNumber(period: string): number {
        const quarterIndex = this.QUARTERS.indexOf(period);
        if (quarterIndex !== -1) {
            return quarterIndex + 1;
        }
        return period.toUpperCase() === 'OT' ? 5 : 0;
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
} 