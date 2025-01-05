import React from 'react';
import { SportTicker } from '../../shared/components/SportTicker';

interface NHLTickerProps {
    gameId?: string;
    className?: string;
    startTime?: string;
}

export function NHLTicker({ gameId, className, startTime }: NHLTickerProps) {
    return (
        <SportTicker
            gameId={gameId}
            className={className}
            startTime={startTime}
            sport="NHL"
        />
    );
} 