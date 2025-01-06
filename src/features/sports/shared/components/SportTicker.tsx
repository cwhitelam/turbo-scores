import React from 'react';
import styles from '../../../../components/common/StatsTicker.module.css';
import { useGameState } from '../../../../hooks/useGameState';
import { useGameData } from '../../../../hooks/game/useGameData';
import { fetchAndProcessStats } from '../utils/statsProcessor';
import { StatItem } from '../../../../components/common/StatItem';
import { GameCountdown } from '../../../../components/common/GameCountdown';
import { SportType } from '../types/sports';

interface SportTickerProps {
    gameId?: string;
    className?: string;
    startTime?: string;
    sport: SportType;
}

export function SportTicker({ gameId, className = '', startTime, sport }: SportTickerProps) {
    const gameState = useGameState(gameId);
    const { stats = [], isComplete } = useGameData(
        gameId,
        () => fetchAndProcessStats(gameId || '', sport),
        { stats: [], timestamp: Date.now(), isComplete: false }
    );

    if (!gameId) return null;

    // Don't show countdown for completed games
    if (gameState === 'pregame' && startTime && !isComplete) {
        return (
            <div className={`${styles.tickerWrap} ${className} flex items-center justify-center`}>
                <GameCountdown startTime={startTime} />
            </div>
        );
    }

    if (stats.length === 0) {
        return (
            <div className={`${styles.tickerWrap} ${className} flex items-center justify-center`}>
                <span className="text-white/90">
                    {isComplete ? 'Final stats coming soon...' : 'Loading stats...'}
                </span>
            </div>
        );
    }

    return (
        <div className={`${styles.tickerWrap} ${className}`}>
            <div className={styles.ticker}>
                <div className={styles.tickerTrack}>
                    {stats.map((stat, index) => (
                        <StatItem key={`${index}-${stat.name}-${stat.value}`} stat={stat} />
                    ))}
                </div>
                <div className={styles.tickerTrack}>
                    {stats.map((stat, index) => (
                        <StatItem key={`copy-${index}-${stat.name}-${stat.value}`} stat={stat} />
                    ))}
                </div>
            </div>
        </div>
    );
} 