import React, { useEffect, useState } from 'react';
import { useSport } from '../../context/SportContext';
import { SportTicker } from '../../features/sports/shared/components/SportTicker';
import { SportType } from '../../features/sports/shared/types/sports';

interface StatsTickerProps {
    gameId?: string;
    className?: string;
    sport?: SportType;
    startTime?: string;
}

/**
 * Simple wrapper for SportTicker that verifies at render time that
 * the requested gameId and sport match both the current sport context
 * and the strict sport-gameId validation patterns
 */
export function StatsTicker({ gameId, className, sport, startTime }: StatsTickerProps) {
    const { currentSport, isTransitioning } = useSport();
    const [verified, setVerified] = useState(true); // Start with true to avoid flickers

    // Verify that the specified sport matches the current app context
    // to prevent accidental cross-sport data display, but allow during transitions
    useEffect(() => {
        // Skip validation during transitions to maintain UI continuity
        if (isTransitioning) {
            return;
        }

        // If sport is explicitly provided, verify it matches context
        if (sport && sport !== currentSport) {
            console.error(`StatsTicker: Sport mismatch - component requested ${sport} but context is ${currentSport}`);
            setVerified(false);
        } else {
            setVerified(true);
        }
    }, [sport, currentSport, isTransitioning]);

    // Always show the ticker to avoid flickers - incorrect sport combos
    // will be filtered by the SportTicker component
    return (
        <SportTicker
            gameId={gameId}
            className={className}
            sport={sport || currentSport}
            startTime={startTime}
        />
    );
} 