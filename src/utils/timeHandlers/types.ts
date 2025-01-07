export interface GameTimeState {
    isLive: boolean;
    displayTime: string;
    sortableTime: Date;
    period?: string;
    periodNumber?: number;
    isHalftime?: boolean;
    isOvertime?: boolean;
    isFinal?: boolean;
}

export interface GameStatusType {
    id: string;
    name: string;
    state: 'pre' | 'in' | 'post';
    completed: boolean;
    description: string;
    detail: string;
    shortDetail: string;
}

export interface GameStatus {
    clock: number;
    displayClock: string;
    period: number;
    type: GameStatusType;
}

export interface GameTimeHandler {
    parseGameTime(timeString: string, gameStatus?: GameStatus): GameTimeState;
    formatGameTime(state: GameTimeState): string;
    isValidGameTime(timeString: string): boolean;
} 