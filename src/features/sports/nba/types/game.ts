import { GameData, GameSituation } from '../../shared/types/game';

export interface NBAGameStats {
    points: number;
    rebounds: number;
    assists: number;
    steals: number;
    blocks: number;
    turnovers: number;
    fouls: number;
    fieldGoalsAttempted: number;
    fieldGoalsMade: number;
    threePointersAttempted: number;
    threePointersMade: number;
    freeThrowsAttempted: number;
    freeThrowsMade: number;
}

export interface NBAPlayerStats extends NBAGameStats {
    playerId: string;
    name: string;
    position: string;
    minutes: string;
    plusMinus: number;
    starter: boolean;
}

export interface NBATeamStats extends NBAGameStats {
    fastBreakPoints: number;
    pointsInPaint: number;
    secondChancePoints: number;
    pointsOffTurnovers: number;
    biggestLead: number;
    timeLeading: string;
}

export interface NBAShotChartData {
    playerId: string;
    x: number;
    y: number;
    made: boolean;
    value: 2 | 3;
    time: string;
    quarter: number;
}

export interface NBAGameSituation extends GameSituation {
    shotClock?: number;
    inBonus?: boolean;
    timeouts: {
        home: number;
        away: number;
    };
    possession?: 'home' | 'away';
    lastPlay?: {
        type: string;
        description: string;
        time: string;
        score?: {
            points: number;
            team: 'home' | 'away';
        };
    };
}

export interface NBAGameData extends GameData {
    situation: NBAGameSituation;
    stats: {
        home: NBATeamStats;
        away: NBATeamStats;
        players: NBAPlayerStats[];
    };
    shots?: NBAShotChartData[];
} 