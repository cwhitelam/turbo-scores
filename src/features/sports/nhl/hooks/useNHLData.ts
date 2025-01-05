import { useGameData } from '../../../../context/GameDataContext';
import { useCallback } from 'react';

export function useNHLData() {
    const handleError = useCallback((error: Error) => {
        if (error.message.includes('HTTP error')) {
            return 'NHL API is currently unavailable. Please try again later.';
        }
        if (error.message.includes('Network')) {
            return 'Unable to connect to NHL data service. Please check your internet connection.';
        }
        if (error.message.includes('Invalid NHL game data')) {
            return 'Received malformed NHL game data. Our team has been notified.';
        }
        if (error.message.includes('missing competition data')) {
            return 'NHL game details are incomplete. Please try again later.';
        }
        if (error.message.includes('missing team information')) {
            return 'NHL team information is unavailable. Please try again later.';
        }
        return `Failed to fetch NHL data: ${error.message}`;
    }, []);

    return useGameData('NHL', handleError);
} 