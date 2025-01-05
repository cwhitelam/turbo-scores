import React from 'react';
import styles from './StatsTicker.module.css';

interface ComingSoonTickerProps {
  sport: string;
  className?: string;
}

export function ComingSoonTicker({ sport, className = '' }: ComingSoonTickerProps) {
  return (
    <div className={`${styles.tickerWrap} ${className} bg-gradient-to-r from-gray-900 to-gray-800 border-y border-gray-700`}>
      <div className={styles.ticker}>
        <>
          <div className={styles.tickerTrack} style={{ animationDelay: `-${Math.random() * 15}s` }}>
            <div className={styles.tickerItem}>
              <div className="flex items-center space-x-4">
                <span className="font-medium text-white/90">{sport} Stats Coming Soon...</span>
              </div>
            </div>
          </div>
          <div className={styles.tickerTrack} style={{ animationDelay: `-${Math.random() * 15}s` }}>
            <div className={styles.tickerItem}>
              <div className="flex items-center space-x-4">
                <span className="font-medium text-white/90">{sport} Stats Coming Soon...</span>
              </div>
            </div>
          </div>
        </>
      </div>
    </div>
  );
} 