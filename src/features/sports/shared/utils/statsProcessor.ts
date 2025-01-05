import { fetchAndProcessStats as baseFetchAndProcessStats } from '../../../../utils/statsProcessor';

export function fetchAndProcessStats(gameId: string) {
    return baseFetchAndProcessStats(gameId);
} 