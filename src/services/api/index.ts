/**
 * Centralized export of all API services
 * This allows for simpler imports in other files
 */

import { mlbApiService } from './MLBApiService';
import { nhlApiService } from './NHLApiService';
import { nbaApiService } from './NBAApiService';
import { nflApiService } from './NFLApiService';

export { BaseApiService } from './BaseApiService';
export { nbaApiService } from './NBAApiService';
export { nflApiService } from './NFLApiService';
export { mlbApiService } from './MLBApiService';
export { nhlApiService } from './NHLApiService';

// Provide a convenience object with all services
export const sportApiServices = {
    NBA: nbaApiService,
    NFL: nflApiService,
    MLB: mlbApiService,
    NHL: nhlApiService,
};

// Get API service by sport name
export function getApiServiceForSport(sport: string) {
    const sportKey = sport.toUpperCase() as keyof typeof sportApiServices;
    return sportApiServices[sportKey];
} 