import { GameTimeHandler, GameTimeState } from './types';
import { NFLTimeHandler } from './NFLTimeHandler';
import { NBATimeHandler } from './NBATimeHandler';
import { MLBTimeHandler } from './MLBTimeHandler';
import { NHLTimeHandler } from './NHLTimeHandler';
import { standardizeFinalCapitalization } from '../dateUtils';

export type Sport = 'NFL' | 'NBA' | 'MLB' | 'NHL';

// The factory now directly creates and returns handler instances without inheritance
export class TimeHandlerFactory {
    private static handlers: Record<Sport, GameTimeHandler> = {
        NFL: new NFLTimeHandler(),
        NBA: new NBATimeHandler(),
        MLB: new MLBTimeHandler(),
        NHL: new NHLTimeHandler()
    };

    static getHandler(sport: Sport): GameTimeHandler {
        return this.handlers[sport];
    }

    // Ensure all handlers are properly checking for final status and returning FINAL in uppercase
    static ensureCapitalization() {
        // Force all handlers to use FINAL in uppercase
        Object.values(this.handlers).forEach(handler => {
            const state: GameTimeState = {
                isLive: false,
                isFinal: true,
                displayTime: 'FINAL',
                sortableTime: new Date()
            };

            // Verify the handler formats final states correctly
            const formatted = handler.formatGameTime(state);
            if (formatted !== 'FINAL') {
                console.warn('Handler returned incorrect capitalization:', formatted);
            }
        });
    }

    // Wrapper method to ensure proper FINAL capitalization
    static formatTime(sport: Sport, state: GameTimeState): string {
        const handler = this.getHandler(sport);
        const formatted = handler.formatGameTime(state);
        return standardizeFinalCapitalization(formatted);
    }
} 