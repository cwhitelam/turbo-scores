export interface NBAPlayerPosition {
    abbreviation: string;
}

export interface NBAPlayer {
    id?: string;
    fullName: string;
    shortName: string;
    headshot?: string;
    jersey: string;
    position: NBAPlayerPosition;
}

export interface NBALeaderEntry {
    displayValue: string;
    value: number;
    athlete: NBAPlayer;
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