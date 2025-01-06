import { fetchAndProcessStats as baseFetchAndProcessStats } from '../../../../utils/statsProcessor';
import { SportType } from '../types/sports';

export function fetchAndProcessStats(gameId: string, sport: SportType) {
    return baseFetchAndProcessStats(gameId, sport);
} 