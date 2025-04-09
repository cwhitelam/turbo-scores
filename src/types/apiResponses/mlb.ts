/**
 * TypeScript definitions for MLB API responses
 */

export interface MLBAthleteInfo {
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

export interface MLBStat {
    name: string;
    displayValue: string;
    value?: number;
}

export interface MLBStatLeader {
    displayValue: string;
    athlete: MLBAthleteInfo;
    team?: {
        id?: string;
        abbreviation?: string;
    };
    stats: MLBStat[];
}

export interface MLBLeaderCategory {
    name: string;
    displayName: string;
    shortDisplayName: string;
    leaders: MLBStatLeader[];
    type?: string;
}

export interface MLBTeamLeaders {
    team: {
        id: string;
        abbreviation: string;
        name?: string;
    };
    leaders: MLBLeaderCategory[];
}

export interface MLBInning {
    number: number;
    isTop: boolean;
    outs: number;
    balls: number;
    strikes: number;
    hasRunner1B: boolean;
    hasRunner2B: boolean;
    hasRunner3B: boolean;
    currentSituation?: {
        batter: MLBAthleteInfo;
        pitcher: MLBAthleteInfo;
    };
}

export interface MLBLineScore {
    innings: {
        inning: number;
        homeScore: number;
        awayScore: number;
    }[];
    totals: {
        home: {
            runs: number;
            hits: number;
            errors: number;
        };
        away: {
            runs: number;
            hits: number;
            errors: number;
        };
    };
}

export interface MLBGameDetails {
    id: string;
    date: string;
    name: string;
    shortName: string;
    status: {
        clock: number;
        displayClock: string;
        inning: number;
        isTop: boolean;
        outs: number;
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
    situation?: MLBInning;
    leaders?: MLBTeamLeaders[];
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
    lineScore?: MLBLineScore;
}

export interface MLBScoreboardResponse {
    events: MLBGameDetails[];
    day: {
        date: string;
    };
    season: {
        year: number;
        type: number;
    };
} 