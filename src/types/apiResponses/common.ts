/**
 * Common TypeScript definitions shared across API response types
 */

/**
 * Common team information structure
 */
export interface ApiTeam {
    id: string;
    name: string;
    abbreviation: string;
    displayName?: string;
    shortDisplayName?: string;
    location?: string;
    logo?: string;
    color?: string;
    alternateColor?: string;
    record?: string;
}

/**
 * Common venue information
 */
export interface ApiVenue {
    id: string;
    name: string;
    capacity?: number;
    indoor: boolean;
    city: string;
    state?: string;
    country?: string;
    address?: {
        city: string;
        state: string;
        zipCode: string;
    };
    images?: {
        href: string;
        width: number;
        height: number;
    }[];
}

/**
 * Common game status information
 */
export interface ApiGameStatus {
    clock: number;
    displayClock: string;
    period: number;
    type: {
        id: string;
        name: string;
        state: string;
        completed: boolean;
        description: string;
        detail: string;
        shortDetail: string;
    };
}

/**
 * Common broadcast information
 */
export interface ApiBroadcast {
    market: string;
    network: string;
    locale?: string;
    type?: string;
}

/**
 * Common weather information
 */
export interface ApiWeather {
    temperature?: number;
    displayTemperature?: string;
    conditionId?: string;
    condition?: string;
    highTemperature?: number;
    lowTemperature?: number;
    precipitation?: number;
    windSpeed?: number;
    windDirection?: string;
    humidity?: number;
    dewPoint?: number;
    icon?: string;
}

/**
 * Common structure for generic API responses
 */
export interface ApiResponse<T> {
    data: T;
    timestamp: number;
    status: number;
    error?: {
        message: string;
        code: string;
    };
}

/**
 * Common cache metadata structure
 */
export interface ApiCacheMetadata {
    timestamp: number;
    ttl: number;
    version: string;
    source?: string;
} 