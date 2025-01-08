import { SportType } from './sports';

export interface GameStatus {
    state: 'pre' | 'in' | 'post';
    period: number;
    clock?: string;
    detail?: string;
}

export interface Team {
    id: string;
    name: string;
    abbreviation: string;
    score: number;
    record?: string;
}

export interface PowerPlay {
    team: string;
    timeRemaining: string;
    players: number;
}

export interface GameSituation {
    possession?: string;
    down?: number;
    distance?: number;
    yardLine?: number;
    balls?: number;
    strikes?: number;
    outs?: number;
    powerPlay?: PowerPlay;
    emptyNet?: boolean;
    inRedZone?: boolean;
}

export interface GameData {
    id: string;
    sport: SportType;
    startTime: string;
    status: GameStatus;
    teams: {
        home: Team;
        away: Team;
    };
    situation: GameSituation;
    venue?: {
        name: string;
        city: string;
        state: string;
    };
    weather?: {
        condition: string;
        temperature: number;
        windSpeed: number;
    };
} 