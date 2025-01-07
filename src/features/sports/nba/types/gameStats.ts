export interface NBAPlayerPosition {
    abbreviation: string;
}

export interface NBAHeadshot {
    href: string;
    alt: string;
}

export interface NBAPlayer {
    id?: string;
    fullName: string;
    shortName: string;
    headshot?: NBAHeadshot;
    jersey: string;
    position: NBAPlayerPosition;
    stats?: string[];
}

export interface NBAStatistic {
    name: string;
    displayName: string;
    shortDisplayName: string;
    description: string;
    abbreviation: string;
    value: number;
    displayValue: string;
}

export interface NBALeaderEntry {
    displayValue: string;
    value: number;
    athlete: NBAPlayer;
    statistics: NBAStatistic[];
}

export interface NBALeaderCategory {
    name: string;
    displayName: string;
    shortDisplayName: string;
    abbreviation: string;
    leaders: NBALeaderEntry[];
}

// Main stats categories we want to display
export type NBAStatCategory = 'points' | 'rebounds' | 'assists';

// Helper type for accessing leader stats
export interface GameLeaders {
    points?: NBALeaderEntry;
    rebounds?: NBALeaderEntry;
    assists?: NBALeaderEntry;
} 