export interface GameTimeState {
    isLive: boolean;
    displayTime: string;
    sortableTime: Date;
    periodNumber?: number;
    period?: string;
    isFinal?: boolean;
    isHalftime?: boolean;
    isOvertime?: boolean;
    isShootout?: boolean;
    isEndOfPeriod?: boolean;
    isIntermission?: boolean;
    isDelayed?: boolean;
    isPostponed?: boolean;
    isMiddleInning?: boolean;
    isEndInning?: boolean;
    isTopInning?: boolean;
    isBottomInning?: boolean;
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
    period?: number;
    displayClock?: string;
    type?: {
        state?: string;
        completed?: boolean;
    };
}

export interface GameTimeHandler {
    parseGameTime(timeString: string, gameStatus?: GameStatus): GameTimeState;
    formatGameTime(state: GameTimeState): string;
    isValidGameTime(timeString: string): boolean;
} 