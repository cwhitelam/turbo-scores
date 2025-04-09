import { GameTimeState, GameStatus } from './types';
import { parseGameTime, formatDisplayTime, getTimezoneAbbreviation } from '../dateUtils';

export class NBATimeHandler {
    private readonly QUARTERS = ['1st', '2nd', '3rd', '4th'];
    private readonly FINAL_STATES = ['final', 'final/ot', 'final/2ot', 'final/3ot', 'final/4ot'];
    private readonly END_STATES = ['end of 1st', 'end of 2nd', 'end of 3rd', 'end of 4th'];

    parseGameTime(timeString: string, gameStatus?: GameStatus): GameTimeState {
        if (!timeString && !gameStatus) {
            return this.createDefaultState();
        }

        // Handle ESPN API game status format
        if (gameStatus) {
            const { displayClock, period, type } = gameStatus;

            // Handle final state
            if (type?.state === 'post' && type?.completed) {
                const isOT = period ? period > 4 : false;
                const otPeriod = period ? period - 4 : 0;
                const displayTime = isOT
                    ? (otPeriod === 1 ? 'FINAL/OT' : `FINAL/${otPeriod}OT`)
                    : 'FINAL';
                return {
                    isLive: false,
                    displayTime,
                    sortableTime: new Date(),
                    isFinal: true,
                    periodNumber: period,
                    isOvertime: isOT
                };
            }

            // Handle halftime
            if (period === 2 && displayClock === "0.0" && type?.state === 'in') {
                return {
                    isLive: true,
                    displayTime: 'HALFTIME',
                    sortableTime: new Date(),
                    isHalftime: true,
                    periodNumber: period
                };
            }

            // Handle in-progress state
            if (period && displayClock) {
                const isOT = period > 4;
                const isEndOfPeriod = displayClock === "0.0" && type?.state === 'in';
                const periodDisplay = isOT ? `${period - 4}OT` : `${period}Q`;

                // Show "End of X" when quarter concludes (except 4th quarter)
                if (isEndOfPeriod && period < 4) {
                    return {
                        isLive: true,
                        displayTime: `End of ${this.QUARTERS[period - 1]}`,
                        sortableTime: new Date(),
                        period: periodDisplay,
                        periodNumber: period,
                        isOvertime: isOT
                    };
                }

                // For games in 4th quarter with 0.0 left, show FINAL
                if (isEndOfPeriod && period === 4) {
                    return {
                        isLive: false,
                        displayTime: 'FINAL',
                        sortableTime: new Date(),
                        isFinal: true,
                        periodNumber: period,
                        isOvertime: false
                    };
                }

                // Show regular time format with bullet for in-progress games
                return {
                    isLive: true,
                    displayTime: `${periodDisplay} • ${displayClock}`,
                    sortableTime: new Date(),
                    period: periodDisplay,
                    periodNumber: period,
                    isOvertime: isOT
                };
            }
        }

        // Handle string-based time formats (fallback for legacy or different data sources)
        const lowerTimeString = timeString.toLowerCase();

        // Handle final states with multiple OT possibilities
        if (this.FINAL_STATES.includes(lowerTimeString)) {
            const overtimePeriod = this.getOvertimePeriod(lowerTimeString);
            const displayTime = overtimePeriod > 0
                ? (overtimePeriod === 1 ? 'FINAL/OT' : `FINAL/${overtimePeriod}OT`)
                : 'FINAL';
            return {
                isLive: false,
                displayTime,
                sortableTime: new Date(),
                isFinal: true,
                isOvertime: overtimePeriod > 0,
                periodNumber: 4 + overtimePeriod
            };
        }

        // Handle "End of X" states
        if (this.END_STATES.includes(lowerTimeString)) {
            const quarter = this.getQuarterFromEndState(lowerTimeString);
            return {
                isLive: true,
                displayTime: this.capitalizeFirstLetters(timeString),
                sortableTime: new Date(),
                period: this.QUARTERS[quarter - 1],
                periodNumber: quarter
            };
        }

        // Handle in-game time format "11:45 - 3rd"
        if (timeString.includes(' - ')) {
            const [clockTime, period] = timeString.split(' - ');
            const periodNumber = this.getPeriodNumber(period);
            const isOT = period.toUpperCase().includes('OT');
            const overtimePeriod = isOT ? parseInt(period.replace(/\D/g, '') || '1') : 0;

            // Special case for 4th quarter with 0:00 - show as FINAL
            if (period.includes('4th') && clockTime === '0:00') {
                return {
                    isLive: false,
                    displayTime: 'FINAL',
                    sortableTime: new Date(),
                    isFinal: true,
                    periodNumber: 4
                };
            }

            return {
                isLive: true,
                displayTime: timeString,
                sortableTime: new Date(),
                period,
                periodNumber: isOT ? 4 + overtimePeriod : periodNumber,
                isOvertime: isOT
            };
        }

        // Handle future game time "8:00 PM ET"
        try {
            // Use the centralized time parser
            const gameTime = parseGameTime(timeString);

            return {
                isLive: false,
                displayTime: timeString,
                sortableTime: gameTime
            };
        } catch (error) {
            console.error('Error parsing NBA game time:', { timeString, error });
            return this.createDefaultState();
        }
    }

    formatGameTime(state: GameTimeState): string {
        if (state.isFinal) {
            if (!state.isOvertime) return 'FINAL';
            const otPeriod = state.periodNumber ? state.periodNumber - 4 : 1;
            return otPeriod === 1 ? 'FINAL/OT' : `FINAL/${otPeriod}OT`;
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

    private getPeriodNumber(period: string): number {
        const quarterIndex = this.QUARTERS.indexOf(period);
        if (quarterIndex !== -1) {
            return quarterIndex + 1;
        }
        if (period.toUpperCase().includes('OT')) {
            const otNumber = parseInt(period.replace(/\D/g, '') || '1');
            return 4 + otNumber;
        }
        return 0;
    }

    private getOvertimePeriod(finalState: string): number {
        if (!finalState.includes('ot')) return 0;
        if (finalState === 'final/ot') return 1;
        return parseInt(finalState.match(/\d+/)?.[0] || '1');
    }

    private getQuarterFromEndState(endState: string): number {
        for (let i = 0; i < this.QUARTERS.length; i++) {
            if (endState.includes(this.QUARTERS[i].toLowerCase())) {
                return i + 1;
            }
        }
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