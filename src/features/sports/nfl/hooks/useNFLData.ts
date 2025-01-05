import { useGameData } from '../../../../context/GameDataContext';
import { useCallback } from 'react';

export function useNFLData() {
    const handleError = useCallback((error: Error) => {
        if (error.message.includes('HTTP error')) {
            return 'NFL API is currently unavailable. Please try again later.';
        }
        if (error.message.includes('Network')) {
            return 'Unable to connect to NFL data service. Please check your internet connection.';
        }
        if (error.message.includes('Invalid')) {
            return 'Received invalid NFL game data format. Our team has been notified.';
        }
        return `Failed to fetch NFL data: ${error.message}`;
    }, []);

    return useGameData('NFL', handleError);
} 