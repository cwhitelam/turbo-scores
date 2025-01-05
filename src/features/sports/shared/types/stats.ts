import { SportType } from './sports';

export interface BaseStatistic {
    name: string;
    value: number;
    displayValue: string;
    category: string;
    rank?: number;
}

export interface PlayerStatistic extends BaseStatistic {
    playerId: string;
    playerName: string;
    teamId: string;
    position?: string;
}

export interface TeamStatistic extends BaseStatistic {
    teamId: string;
}

export interface StatCategory {
    id: string;
    name: string;
    displayName: string;
    sport: SportType;
    format: string;
    sortOrder: 'asc' | 'desc';
    primary: boolean;
}

export interface StatUpdate {
    gameId: string;
    timestamp: number;
    stats: (PlayerStatistic | TeamStatistic)[];
    isComplete: boolean;
}

export type StatProcessor = (rawData: any) => Promise<StatUpdate>; 