import React from 'react';
import { SportTicker } from '../../shared/components/SportTicker';

interface MLBTickerProps {
    gameId?: string;
    className?: string;
    startTime?: string;
}

export function MLBTicker({ gameId, className, startTime }: MLBTickerProps) {
    return (
        <SportTicker
            gameId={gameId}
            className={className}
            startTime={startTime}
            sport="MLB"
        />
    );
} 