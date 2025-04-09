import { GameTimeState, GameStatus } from './types';
import { parseGameTime, formatDisplayTime, getTimezoneAbbreviation } from '../dateUtils';

export class NHLTimeHandler {
    private readonly PERIODS = ['1st', '2nd', '3rd'];
    private readonly FINAL_STATES = ['final', 'final/ot', 'final/so'];

    parseGameTime(timeString: string, gameStatus?: GameStatus): GameTimeState {
        if (!timeString) {
            return this.createDefaultState();
        }

        const lowerTimeString = timeString.toLowerCase();

        // Handle final states (regulation, overtime, shootout)
        if (this.FINAL_STATES.includes(lowerTimeString)) {
            const isOT = lowerTimeString.includes('ot');
            const isSO = lowerTimeString.includes('so');

            let displayTime = 'FINAL';
            if (isOT) displayTime = 'FINAL/OT';
            if (isSO) displayTime = 'FINAL/SO';

            return {
                isLive: false,
                displayTime,
                sortableTime: new Date(),
                isFinal: true,
                isOvertime: isOT,
                isShootout: isSO,
                periodNumber: isOT || isSO ? 4 : 3
            };
        }

        // Check for 3rd period with 0:00 time - should display as FINAL
        if ((timeString.includes('3rd') || timeString.includes('3P')) && timeString.includes('0:00')) {
            return {
                isLive: false,
                displayTime: 'FINAL',
                sortableTime: new Date(),
                isFinal: true,
                periodNumber: 3
            };
        }

        // Handle in-progress periods
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

        // Handle end of period
        if (lowerTimeString.startsWith('end of')) {
            const periodIndex = this.PERIODS.findIndex(p =>
                lowerTimeString.includes(p.toLowerCase())
            );

            if (periodIndex !== -1) {
                return {
                    isLive: true,
                    displayTime: this.capitalizeFirstLetters(timeString),
                    sortableTime: new Date(),
                    period: this.PERIODS[periodIndex],
                    periodNumber: periodIndex + 1,
                    isEndOfPeriod: true
                };
            }
        }

        // Handle intermission
        if (lowerTimeString.includes('intermission')) {
            // Try to extract period number from intermission text
            const match = lowerTimeString.match(/(\d+)/);
            const periodNumber = match ? parseInt(match[1], 10) : 0;

            return {
                isLive: true,
                displayTime: this.capitalizeFirstLetters(timeString),
                sortableTime: new Date(),
                periodNumber,
                isIntermission: true
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
            console.error('Error parsing NHL game time:', { timeString, error });
            return this.createDefaultState();
        }
    }

    formatGameTime(state: GameTimeState): string {
        if (state.isFinal) {
            if (state.isShootout) return 'FINAL/SO';
            if (state.isOvertime) return 'FINAL/OT';
            return 'FINAL';
        }
        if (state.isIntermission) {
            return `${state.periodNumber} INTERMISSION`;
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

    private getPeriodNumber(period: string): number {
        const periodIndex = this.PERIODS.indexOf(period);
        if (periodIndex !== -1) {
            return periodIndex + 1;
        }
        if (period.toUpperCase() === 'OT') return 4;
        if (period.toUpperCase() === 'SO') return 5;
        return 0;
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