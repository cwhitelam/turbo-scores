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

export interface GameTimeHandler {
    parseGameTime(timeString: string): GameTimeState;
    formatGameTime(state: GameTimeState): string;
    isValidGameTime(timeString: string): boolean;
} 