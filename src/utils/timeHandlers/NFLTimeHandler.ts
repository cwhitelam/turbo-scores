import { GameTimeHandler, GameTimeState } from './types';

export class NFLTimeHandler implements GameTimeHandler {
    private readonly QUARTERS = ['1st', '2nd', '3rd', '4th'];
    private readonly FINAL_STATES = ['final', 'final/ot'];

    parseGameTime(timeString: string): GameTimeState {
        if (!timeString) {
            return this.createDefaultState();
        }

        const lowerTimeString = timeString.toLowerCase();

        // Handle final states
        if (this.FINAL_STATES.includes(lowerTimeString)) {
            return {
                isLive: false,
                displayTime: timeString,
                sortableTime: new Date(),
                isFinal: true
            };
        }

        // Handle Halftime
        if (lowerTimeString === 'halftime') {
            return {
                isLive: true,
                displayTime: 'Halftime',
                sortableTime: new Date(),
                isHalftime: true,
                periodNumber: 2
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
            const [time, period, timezone] = timeString.split(' ');
            const [hours, minutes] = time.split(':').map(Number);
            const isPM = period === 'PM';

            const now = new Date();
            const gameTime = new Date(now);

            let hour24 = hours;
            if (isPM && hours !== 12) hour24 += 12;
            if (!isPM && hours === 12) hour24 = 0;

            gameTime.setHours(hour24, minutes, 0, 0);

            if (gameTime < now) {
                gameTime.setDate(gameTime.getDate() + 1);
            }

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
            return state.isOvertime ? 'Final/OT' : 'Final';
        }
        if (state.isHalftime) {
            return 'Halftime';
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
        return date.toLocaleTimeString('en-US', {
            hour: 'numeric',
            minute: '2-digit',
            timeZoneName: 'short'
        });
    }
} 