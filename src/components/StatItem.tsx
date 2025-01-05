import React from 'react';
import { PlayerStat } from '../types/stats';
import styles from './StatsTicker.module.css';
import { getStatTypeColor, getStatTypeDisplay } from '../utils/statDisplayUtils';

interface StatItemProps {
  stat: PlayerStat;
}

export function StatItem({ stat }: StatItemProps) {
  return (
    <div className={styles.tickerItem}>
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