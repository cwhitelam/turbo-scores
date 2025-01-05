import React from 'react';
import { useGameStats } from '../hooks/useGameStats';
import { useSport } from '../context/SportContext';

interface GameTickerProps {
  gameId: string;
  teamColors: {
    primary: string;
    secondary: string;
  };
}

export function GameTicker({ gameId, teamColors }: GameTickerProps) {
  const { currentSport } = useSport();
  const { stats, loading } = useGameStats(gameId);
  
  if (currentSport !== 'NFL' || loading || !stats.passer) return null;

  const tickerItems = [
    stats.passer && `${stats.passer.name}: ${stats.passer.stat}, ${stats.passer.detail}`,
    stats.rusher && `${stats.rusher.name}: ${stats.rusher.stat}${stats.rusher.detail ? `, ${stats.rusher.detail}` : ''}`,
    stats.receiver && `${stats.receiver.name}: ${stats.receiver.stat}${stats.receiver.detail ? `, ${stats.receiver.detail}` : ''}`
  ].filter(Boolean);

  return (
    <div 
      className="relative overflow-hidden border-t border-black/10"
      style={{ backgroundColor: `${teamColors.primary}20` }}
    >
      <div className="animate-ticker whitespace-nowrap py-2 px-3">
        <span className="text-white/90 text-sm">
          {tickerItems.join(' • ')}
        </span>
      </div>
    </div>
  );
}