import { useState, useEffect } from 'react';
import { sportApiServices, getApiServiceForSport } from '../services/api';

interface GameDetailsState {
    loading: boolean;
    data: any | null;
    error: string | null;
    lastUpdated: Date | null;
}

const initialState: GameDetailsState = {
    loading: true,
    data: null,
    error: null,
    lastUpdated: null
};

/**
 * Hook to fetch and manage detailed game data
 * 
 * @param gameId - The ID of the game to fetch details for
 * @param sport - The sport of the game (if not included in gameId)
 * @param pollingInterval - Optional polling interval in ms (default: 30s)
 */
export function useGameDetails(gameId: string, sport?: string, pollingInterval: number = 30000) {
    const [state, setState] = useState<GameDetailsState>(initialState);

    useEffect(() => {
        if (!gameId) {
            setState({
                loading: false,
                data: null,
                error: 'Game ID is required',
                lastUpdated: null
            });
            return;
        }

        // Determine sport from gameId if not provided
        let sportName = sport;
        if (!sportName) {
            // ESPN game IDs are formatted as {sport}_{id}
            const parts = gameId.split('_');
            if (parts.length > 1) {
                sportName = parts[0].toUpperCase();
            }
        }

        if (!sportName) {
            setState({
                loading: false,
                data: null,
                error: 'Unable to determine sport for game',
                lastUpdated: null
            });
            return;
        }

        // Get the appropriate API service
        const apiService = getApiServiceForSport(sportName);
        if (!apiService) {
            setState({
                loading: false,
                data: null,
                error: `Unsupported sport: ${sportName}`,
                lastUpdated: null
            });
            return;
        }

        // Function to fetch game details
        const fetchGameDetails = async () => {
            try {
                setState(prev => ({ ...prev, loading: true }));
                const data = await apiService.getGameStats(gameId);

                setState({
                    loading: false,
                    data,
                    error: null,
                    lastUpdated: new Date()
                });
            } catch (error) {
                console.error(`Error fetching game details:`, error);
                setState(prev => ({
                    ...prev,
                    loading: false,
                    error: `Failed to load game details. Please try again.`
                }));
            }
        };

        // Fetch data immediately
        fetchGameDetails();

        // Set up polling with the provided interval
        const intervalId = setInterval(fetchGameDetails, pollingInterval);

        // Cleanup on unmount or gameId/sport change
        return () => clearInterval(intervalId);
    }, [gameId, sport, pollingInterval]);

    return {
        ...state,
        refetch: () => setState(prev => ({ ...prev, loading: true }))
    };
} 