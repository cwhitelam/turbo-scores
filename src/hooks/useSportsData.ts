import { useState, useEffect } from 'react';
import { Game } from '../types/game';
import { sportApiServices } from '../services/api';
import { getUpdateInterval } from '../utils/updateIntervalUtils';

interface SportsDataState {
  loading: boolean;
  games: Game[];
  error: string | null;
  lastUpdated: Date | null;
}

const initialState: SportsDataState = {
  loading: true,
  games: [],
  error: null,
  lastUpdated: null
};

/**
 * Hook to fetch and manage sports data
 * Provides automatic polling with dynamic intervals based on game state
 */
export function useSportsData(sport: string) {
  const [state, setState] = useState<SportsDataState>(initialState);
  const [pollingInterval, setPollingInterval] = useState<number>(30000); // Default 30s

  // Normalize sport name to match API service keys
  const normalizedSport = sport.toUpperCase();

  // Get the appropriate API service for the sport
  const apiService = sportApiServices[normalizedSport as keyof typeof sportApiServices];

  const fetchData = async () => {
    if (!apiService) {
      setState(prev => ({
        ...prev,
        loading: false,
        error: `Unsupported sport: ${sport}`
      }));
      return;
    }

    try {
      const games = await apiService.getScoreboard();

      setState({
        loading: false,
        games,
        error: null,
        lastUpdated: new Date()
      });

      // Determine next polling interval based on game states
      const newInterval = getUpdateInterval(games);
      setPollingInterval(newInterval);
    } catch (error) {
      console.error(`Error fetching ${sport} data:`, error);
      setState(prev => ({
        ...prev,
        loading: false,
        error: `Failed to load ${sport} data. Please try again.`
      }));
    }
  };

  // Initial data fetch and polling setup
  useEffect(() => {
    // Reset state when sport changes
    setState(initialState);

    // Fetch data immediately
    fetchData();

    // Set up polling with dynamic interval
    const intervalId = setInterval(fetchData, pollingInterval);

    // Cleanup on unmount or sport change
    return () => clearInterval(intervalId);
  }, [sport, pollingInterval]);

  return {
    ...state,
    refetch: fetchData
  };
}