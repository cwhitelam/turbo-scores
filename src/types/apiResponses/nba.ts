/**
 * TypeScript definitions for NBA API responses
 */

export interface NBAAthleteInfo {
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

export interface NBABoxScoreAthlete {
    athlete: NBAAthleteInfo;
    stats: string[];
    didNotPlay?: boolean;
    reason?: string;
}

export interface NBABoxScoreTeamStatistics {
    athletes: NBABoxScoreAthlete[];
    totals: string[];
}

export interface NBABoxScoreTeam {
    team: {
        id: string;
        abbreviation: string;
        name: string;
        logo?: string;
    };
    statistics: NBABoxScoreTeamStatistics[];
}

export interface NBABoxScore {
    players: NBABoxScoreTeam[];
    teams: {
        team: {
            id: string;
            abbreviation: string;
            name: string;
        };
        statistics: string[];
    }[];
}

export interface NBALeader {
    displayValue: string;
    athlete: NBAAthleteInfo;
    value: number;
    team?: {
        id?: string;
        abbreviation?: string;
    };
}

export interface NBALeaderCategory {
    name: string;
    displayName: string;
    shortDisplayName: string;
    leaders: NBALeader[];
}

export interface NBATeamLeaders {
    team: {
        id: string;
        abbreviation: string;
        name?: string;
    };
    leaders: NBALeaderCategory[];
}

export interface NBAGameLeadersResponse {
    boxscore: NBABoxScore;
    leaders: NBATeamLeaders[];
}

export interface NBAGameDetails {
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
    leaders?: NBATeamLeaders[];
}

export interface NBAScoreboardResponse {
    events: NBAGameDetails[];
    day: {
        date: string;
    };
    season: {
        year: number;
        type: number;
    };
} 