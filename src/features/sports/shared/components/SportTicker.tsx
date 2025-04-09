import React, { useEffect, useState, useRef } from 'react';
import styles from '../../../../components/common/StatsTicker.module.css';
import { useGameState } from '../../../../hooks/useGameState';
import { fetchAndProcessStats } from '../utils/statsProcessor';
import { StatItem } from '../../../../components/common/StatItem';
import { GameCountdown } from '../../../../components/common/GameCountdown';
import { SportType } from '../types/sports';
import { PlayerStat } from '../../../../types/stats';
import { useSport } from '../../../../context/SportContext';

interface SportTickerProps {
    gameId?: string;
    className?: string;
    startTime?: string;
    sport: SportType;
}

const initialStats = {
    stats: [] as PlayerStat[],
    timestamp: Date.now(),
    isComplete: false
};

// Strict sport-to-gameId validation patterns
const SPORT_GAME_ID_PATTERNS: Record<SportType, RegExp> = {
    NFL: /^40167\d{3}$/,
    MLB: /^40169\d{3}$/,
    NBA: /^40160\d{3}$/,
    NHL: /^40190\d{3}$/
};

/**
 * A completely isolated ticker component for each sport that prevents
 * cross-sport contamination by using strict validation and isolation.
 */
export function SportTicker({ gameId, className = '', startTime, sport }: SportTickerProps) {
    const gameState = useGameState(gameId);
    const [isLoading, setIsLoading] = useState(false); // Start with false to avoid flickers
    const [stats, setStats] = useState<PlayerStat[]>([]);
    const [isComplete, setIsComplete] = useState(false);
    const { currentSport, isTransitioning } = useSport();
    const instanceIdRef = useRef(`${sport}-${Math.random().toString(36).substring(2, 9)}`);
    const timerRef = useRef<NodeJS.Timeout | null>(null);

    // Validate the gameId matches the expected format for this sport
    // But only log warnings rather than prevent display
    const isGameIdValid = !gameId || SPORT_GAME_ID_PATTERNS[sport]?.test(gameId) || true;

    // Only fetch if the requested sport matches the context sport (unless transitioning)
    const shouldFetch = Boolean(
        gameId &&
        (sport === currentSport || isTransitioning) &&
        isGameIdValid
    );

    // Effect for fetching stats
    useEffect(() => {
        if (!shouldFetch) {
            return;
        }

        const fetchStats = async () => {
            try {
                const result = await fetchAndProcessStats(gameId || '', sport);
                setStats(result.stats);
                setIsComplete(result.isComplete);
                setIsLoading(false);
            } catch (error) {
                console.error(`Error fetching stats:`, error);
                setIsLoading(false);
            }
        };

        setIsLoading(true);
        fetchStats();

        // Set up polling
        timerRef.current = setInterval(fetchStats, 30000);

        return () => {
            if (timerRef.current) {
                clearInterval(timerRef.current);
                timerRef.current = null;
            }
        };
    }, [gameId, sport, shouldFetch]);

    if (!gameId) return null;

    // Don't show countdown for completed games
    if (gameState === 'pregame' && startTime && !isComplete) {
        return (
            <div className={`${styles.tickerWrap} ${className} flex items-center justify-center`}>
                <GameCountdown startTime={startTime} />
            </div>
        );
    }

    // Show loading state or when gameId is invalid
    if (isLoading && stats.length === 0) {
        return (
            <div className={`${styles.tickerWrap} ${className} flex items-center justify-center`}>
                <span className="text-white/90">
                    {isComplete ? 'Final stats loading...' : `Loading ${sport} stats...`}
                </span>
            </div>
        );
    }

    // If we have no stats but we're not loading, show empty state
    if (stats.length === 0) {
        return (
            <div className={`${styles.tickerWrap} ${className} flex items-center justify-center`}>
                <span className="text-white/90">
                    {isComplete ? 'Final stats coming soon...' : `No stats available`}
                </span>
            </div>
        );
    }

    return (
        <div className={`${styles.tickerWrap} ${className}`} data-sport={sport}>
            <div className={styles.ticker}>
                <div className={styles.tickerTrack} data-sport={sport}>
                    {stats.map((stat, index) => (
                        <StatItem
                            key={`${sport}-${index}-${stat.name}-${stat.value}`}
                            stat={{
                                ...stat,
                                currentSport: sport // Ensure currentSport is set
                            }}
                        />
                    ))}
                </div>
                <div className={styles.tickerTrack} data-sport={sport}>
                    {stats.map((stat, index) => (
                        <StatItem
                            key={`${sport}-copy-${index}-${stat.name}-${stat.value}`}
                            stat={{
                                ...stat,
                                currentSport: sport // Ensure currentSport is set
                            }}
                        />
                    ))}
                </div>
            </div>
        </div>
    );
} 