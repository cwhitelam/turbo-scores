/**
 * TypeScript definitions for NFL API responses
 */

export interface NFLAthleteInfo {
    id: string;
    shortName: string;
    fullName?: string;
    displayName?: string;
    headshot?: string;
    jersey?: string;
    position?: string;
    team?: {
        id?: string;
        abbreviation?: string;
        name?: string;
    };
}

export interface NFLStat {
    name: string;
    displayValue: string;
    value?: number;
}

export interface NFLStatLeader {
    displayValue: string;
    athlete: NFLAthleteInfo;
    team?: {
        id?: string;
        abbreviation?: string;
    };
    stats: NFLStat[];
}

export interface NFLLeaderCategory {
    name: string;
    displayName: string;
    shortDisplayName: string;
    leaders: NFLStatLeader[];
    type?: string;
}

export interface NFLTeamLeaders {
    team: {
        id: string;
        abbreviation: string;
        name?: string;
    };
    leaders: NFLLeaderCategory[];
}

export interface NFLGameSituation {
    lastPlay?: {
        id: string;
        type: {
            id: string;
            text: string;
        };
        description: string;
        team?: {
            id: string;
            name: string;
        };
        clock?: {
            displayValue: string;
        };
        period?: {
            number: number;
        };
        down?: number;
        yardsToGo?: number;
        yardLine?: number;
        isRedZone?: boolean;
    };
    down?: number;
    distance?: number;
    possessionText?: string;
    possession?: string;
    teamInPossession?: {
        id: string;
        abbreviation: string;
    };
    location?: {
        yardLine: number;
        team?: {
            id: string;
            abbreviation: string;
        };
    };
    isRedZone?: boolean;
}

export interface NFLGameDetails {
    id: string;
    date: string;
    name: string;
    shortName: string;
    status: {
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
    };
    teams: {
        home: {
            id: string;
            name: string;
            abbreviation: string;
            score: string;
            logo?: string;
            color?: string;
            record?: string;
        };
        away: {
            id: string;
            name: string;
            abbreviation: string;
            score: string;
            logo?: string;
            color?: string;
            record?: string;
        };
    };
    situation?: NFLGameSituation;
    leaders?: NFLTeamLeaders[];
    venue: {
        id: string;
        name: string;
        city: string;
        state: string;
        indoor: boolean;
    };
    broadcasts: {
        network: string;
        market: string;
        locale: string;
    }[];
    drives?: {
        id: string;
        description: string;
        team: {
            id: string;
            name: string;
            abbreviation: string;
        };
        start: {
            period: number;
            clock: string;
            yardLine: number;
            text: string;
        };
        end: {
            period: number;
            clock: string;
            yardLine: number;
            text: string;
        };
        timeElapsed: {
            displayValue: string;
        };
        plays: number;
        yards: number;
        isScoring: boolean;
        result: string;
    }[];
    scoringPlays?: {
        id: string;
        type: {
            id: string;
            text: string;
        };
        team: {
            id: string;
            name: string;
            abbreviation: string;
        };
        period: {
            number: number;
        };
        clock: {
            displayValue: string;
        };
        text: string;
        awayScore: number;
        homeScore: number;
    }[];
}

export interface NFLScoreboardResponse {
    events: NFLGameDetails[];
    week: {
        number: number;
        text: string;
    };
    season: {
        year: number;
        type: number;
        name: string;
    };
} 