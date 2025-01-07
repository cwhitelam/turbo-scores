import { GameTimeHandler } from './types';
import { NFLTimeHandler } from './NFLTimeHandler';
import { NBATimeHandler } from './NBATimeHandler';

export type Sport = 'NFL' | 'NBA' | 'MLB' | 'NHL';

export class TimeHandlerFactory {
    private static handlers: Record<Sport, GameTimeHandler> = {
        NFL: new NFLTimeHandler(),
        NBA: new NBATimeHandler(),
        // TODO: Implement these handlers
        MLB: new NFLTimeHandler(), // Temporary fallback
        NHL: new NFLTimeHandler()  // Temporary fallback
    };

    static getHandler(sport: Sport): GameTimeHandler {
        return this.handlers[sport];
    }
} 