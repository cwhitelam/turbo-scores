import React, { createContext, useContext, useReducer, useCallback, useEffect } from 'react';
import { Game } from '../types/game';
import { getScoreboard as getNFLScoreboard } from '../services/nflApi';
import { getMLBScoreboard } from '../services/mlbApi';
import { getNBAScoreboard } from '../services/nbaApi';
import { getNHLScoreboard } from '../services/nhlApi';
import { getUpdateInterval } from '../utils/updateIntervalUtils';
import { env } from '../config/env';

type SportType = 'NFL' | 'NBA' | 'MLB' | 'NHL';

interface GameDataState {
    games: Record<SportType, Game[]>;
    loading: Record<SportType, boolean>;
    error: Record<SportType, string | null>;
    lastUpdate: Record<SportType, number>;
}

type GameDataAction =
    | { type: 'SET_GAMES'; sport: SportType; games: Game[] }
    | { type: 'SET_LOADING'; sport: SportType; loading: boolean }
    | { type: 'SET_ERROR'; sport: SportType; error: string | null }
    | { type: 'SET_LAST_UPDATE'; sport: SportType; timestamp: number };

const initialState: GameDataState = {
    games: { NFL: [], NBA: [], MLB: [], NHL: [] },
    loading: { NFL: false, NBA: false, MLB: false, NHL: false },
    error: { NFL: null, NBA: null, MLB: null, NHL: null },
    lastUpdate: { NFL: 0, NBA: 0, MLB: 0, NHL: 0 },
};

const GameDataContext = createContext<{
    state: GameDataState;
    fetchGames: (sport: SportType) => Promise<void>;
} | null>(null);

function gameDataReducer(state: GameDataState, action: GameDataAction): GameDataState {
    switch (action.type) {
        case 'SET_GAMES':
            return {
                ...state,
                games: { ...state.games, [action.sport]: action.games },
            };
        case 'SET_LOADING':
            return {
                ...state,
                loading: { ...state.loading, [action.sport]: action.loading },
            };
        case 'SET_ERROR':
            return {
                ...state,
                error: { ...state.error, [action.sport]: action.error },
            };
        case 'SET_LAST_UPDATE':
            return {
                ...state,
                lastUpdate: { ...state.lastUpdate, [action.sport]: action.timestamp },
            };
        default:
            return state;
    }
}

const MIN_UPDATE_INTERVAL = env.isProduction ? 30000 : 10000; // 30 seconds in prod, 10 in dev

export function GameDataProvider({ children }: { children: React.ReactNode }) {
    const [state, dispatch] = useReducer(gameDataReducer, initialState);

    const fetchGames = useCallback(async (sport: SportType) => {
        const now = Date.now();
        const lastUpdate = state.lastUpdate[sport];

        // Prevent too frequent updates
        if (now - lastUpdate < MIN_UPDATE_INTERVAL) {
            return;
        }

        dispatch({ type: 'SET_LOADING', sport, loading: true });

        try {
            let data: Game[];
            switch (sport) {
                case 'NFL':
                    data = await getNFLScoreboard();
                    break;
                case 'MLB':
                    data = await getMLBScoreboard();
                    break;
                case 'NBA':
                    data = await getNBAScoreboard();
                    break;
                case 'NHL':
                    data = await getNHLScoreboard();
                    break;
                default:
                    throw new Error(`Unsupported sport: ${sport}`);
            }

            dispatch({ type: 'SET_GAMES', sport, games: data });
            dispatch({ type: 'SET_ERROR', sport, error: null });
            dispatch({ type: 'SET_LAST_UPDATE', sport, timestamp: now });
        } catch (err) {
            console.error(`${sport} data fetch error:`, err);
            dispatch({ type: 'SET_ERROR', sport, error: `Failed to fetch ${sport} data` });
        } finally {
            dispatch({ type: 'SET_LOADING', sport, loading: false });
        }
    }, [state.lastUpdate]);

    // Set up update intervals for each sport
    useEffect(() => {
        const intervals: NodeJS.Timeout[] = [];

        Object.keys(state.games).forEach((sport) => {
            const games = state.games[sport as SportType];
            const interval = setInterval(
                () => fetchGames(sport as SportType),
                getUpdateInterval(games)
            );
            intervals.push(interval);
        });

        return () => {
            intervals.forEach(clearInterval);
        };
    }, [fetchGames, state.games]);

    return (
        <GameDataContext.Provider value={{ state, fetchGames }}>
            {children}
        </GameDataContext.Provider>
    );
}

export function useGameData(sport: SportType) {
    const context = useContext(GameDataContext);
    if (!context) {
        throw new Error('useGameData must be used within a GameDataProvider');
    }

    const { state, fetchGames } = context;

    useEffect(() => {
        fetchGames(sport);
    }, [sport, fetchGames]);

    return {
        games: state.games[sport],
        loading: state.loading[sport],
        error: state.error[sport],
    };
}
