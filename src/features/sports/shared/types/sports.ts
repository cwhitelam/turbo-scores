export type SportType = 'NFL' | 'NBA' | 'MLB' | 'NHL';

export interface SportConfig {
    name: SportType;
    displayName: string;
    hasQuarters: boolean;
    defaultPeriodCount: number;
    periodName: string;
    statCategories: string[];
    colors: {
        primary: string;
        secondary: string;
    };
    icons: {
        league: string;
        team: string;
        game: string;
    };
}

export interface SportTeam {
    id: string;
    name: string;
    abbreviation: string;
    location: string;
    colors: {
        primary: string;
        secondary: string;
    };
}

export interface SportVenue {
    id: string;
    name: string;
    city: string;
    state: string;
    country: string;
    capacity?: number;
    surface?: string;
    indoor: boolean;
}

export interface SportGameStatus {
    state: 'pre' | 'in' | 'post';
    period: number;
    clock?: string;
    detail?: string;
} 