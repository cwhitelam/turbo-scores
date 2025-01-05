import React from 'react';
import { SportTicker } from '../../shared/components/SportTicker';

interface NBATicker {
    gameId?: string;
    className?: string;
    startTime?: string;
}

export function NBATicker({ gameId, className, startTime }: NBATicker) {
    return (
        <SportTicker
            gameId={gameId}
            className={className}
            startTime={startTime}
            sport="NBA"
        />
    );
} 