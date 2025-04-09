import { PlayerStat } from '../../types/stats';
import styles from './StatsTicker.module.css';
import { getStatTypeColor, getStatTypeDisplay } from '../../utils/statDisplayUtils';
import { useSport } from '../../context/SportContext';

interface StatItemProps {
    stat: PlayerStat;
}

export function StatItem({ stat }: StatItemProps) {
    const { currentSport } = useSport();

    // Safety check: if the stat has a currentSport and it doesn't match the app's current sport,
    // don't render it to prevent cross-sport contamination
    if (stat.currentSport && stat.currentSport !== currentSport) {
        return null;
    }

    // Special handling for NBA grouped stats
    if (stat.displayValue.includes('PTS, ')) {
        return (
            <div className={styles.tickerItem}>
                <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-2">
                        <span className="text-white font-bold">{stat.name}</span>
                        <span className="text-gray-400">{stat.team}</span>
                    </div>
                    <div className="text-white font-medium">{stat.displayValue}</div>
                </div>
            </div>
        );
    }

    // Original format for NFL and other sports
    return (
        <div className={styles.tickerItem} data-sport={stat.currentSport || currentSport}>
            {stat.value > 0 ? (
                <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-2">
                        <span className={`font-bold ${getStatTypeColor(stat.statType)}`}>
                            {getStatTypeDisplay(stat.statType)}
                        </span>
                        <span className="text-gray-400">|</span>
                        <span className="text-white font-bold">{stat.name}</span>
                        <span className="text-gray-400">{stat.team}</span>
                    </div>
                    <div className="text-white font-medium">{stat.displayValue}</div>
                </div>
            ) : (
                <span className="font-medium text-white/90">{stat.name}</span>
            )}
        </div>
    );
} 