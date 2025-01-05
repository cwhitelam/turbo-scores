import React from 'react';
import { HardHat, User2, Radio } from 'lucide-react';
import { GameStats as GameStatsType } from '../types/stats';
import { useSport } from '../context/SportContext';

interface GameStatsProps {
  stats: GameStatsType;
  teamColors: {
    primary: string;
    secondary: string;
  };
}

export function GameStats({ stats, teamColors }: GameStatsProps) {
  const { currentSport } = useSport();
  
  if (currentSport !== 'NFL' || !stats.passer) return null;

  return (
    <div 
      className="px-3 py-2 flex items-center gap-4 text-sm border-t border-black/10 overflow-x-auto"
      style={{ backgroundColor: `${teamColors.primary}20` }}
    >
      {stats.passer && (
        <div className="flex items-center gap-1.5 text-white whitespace-nowrap">
          <HardHat className="w-4 h-4 text-white/80" />
          <div>
            <div className="flex items-center gap-1">
              <span className="font-medium">{stats.passer.name}</span>
              <span className="text-white/80">{stats.passer.stat}</span>
            </div>
            {stats.passer.detail && (
              <div className="text-xs text-white/60">{stats.passer.detail}</div>
            )}
          </div>
        </div>
      )}
      {stats.rusher && (
        <div className="flex items-center gap-1.5 text-white whitespace-nowrap">
          <User2 className="w-4 h-4 text-white/80" />
          <div>
            <div className="flex items-center gap-1">
              <span className="font-medium">{stats.rusher.name}</span>
              <span className="text-white/80">{stats.rusher.stat}</span>
            </div>
            {stats.rusher.detail && (
              <div className="text-xs text-white/60">{stats.rusher.detail}</div>
            )}
          </div>
        </div>
      )}
      {stats.receiver && (
        <div className="flex items-center gap-1.5 text-white whitespace-nowrap">
          <Radio className="w-4 h-4 text-white/80" />
          <div>
            <div className="flex items-center gap-1">
              <span className="font-medium">{stats.receiver.name}</span>
              <span className="text-white/80">{stats.receiver.stat}</span>
            </div>
            {stats.receiver.detail && (
              <div className="text-xs text-white/60">{stats.receiver.detail}</div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}