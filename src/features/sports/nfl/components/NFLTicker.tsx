import React from 'react';
import { SportTicker } from '../../shared/components/SportTicker';

interface NFLTickerProps {
    gameId?: string;
    className?: string;
    startTime?: string;
}

export function NFLTicker({ gameId, className, startTime }: NFLTickerProps) {
    return (
        <SportTicker
            gameId={gameId}
            className={className}
            startTime={startTime}
            sport="NFL"
        />
    );
} 