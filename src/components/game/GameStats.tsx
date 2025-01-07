import React from 'react';
import { HardHat, User2, Radio, Trophy, CircleDot, Share2 } from 'lucide-react';
import { useSport } from '../../context/SportContext';
import { useGameStats } from '../../hooks/useGameStats';

interface GameStatsProps {
  gameId: string;
  teamColors: {
    primary: string;
    secondary: string;
  };
}

export const GameStats: React.FC<GameStatsProps> = ({ gameId, teamColors }) => {
  const { currentSport } = useSport();
  const { stats, loading } = useGameStats(gameId);

  console.log('🎮 GameStats Component:', {
    gameId,
    currentSport,
    loading,
    stats,
    teamColors
  });

  if (loading || !stats) {
    console.log('⏳ Loading or no stats available');
    return null;
  }

  const hasStats = Object.keys(stats).length > 0;
  if (!hasStats) {
    console.log('📭 No stats found in object');
    return null;
  }

  const baseContainerClasses = "px-3 py-2 flex items-center gap-4 text-sm border-t border-black/10 overflow-x-auto";
  const containerStyle = { backgroundColor: `${teamColors.primary}20` };

  switch (currentSport) {
    case 'NFL': {
      if (!stats.passer) {
        console.log('🏈 No NFL passer stats found');
        return null;
      }
      console.log('🏈 Rendering NFL stats:', stats);

      return (
        <div className={baseContainerClasses} style={containerStyle}>
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

    case 'NBA': {
      if (!stats.scorer) {
        console.log('🏀 No NBA scorer stats found');
        return null;
      }
      console.log('🏀 Rendering NBA stats:', stats);

      return (
        <div className={baseContainerClasses} style={containerStyle}>
          {stats.scorer && (
            <div className="flex items-center gap-1.5 text-white whitespace-nowrap">
              <Trophy className="w-4 h-4 text-white/80" />
              <div>
                <div className="flex items-center gap-1">
                  <span className="font-medium">{stats.scorer.name}</span>
                  <span className="text-white/80">{stats.scorer.stat}</span>
                </div>
              </div>
            </div>
          )}
          {stats.rebounder && (
            <div className="flex items-center gap-1.5 text-white whitespace-nowrap">
              <CircleDot className="w-4 h-4 text-white/80" />
              <div>
                <div className="flex items-center gap-1">
                  <span className="font-medium">{stats.rebounder.name}</span>
                  <span className="text-white/80">{stats.rebounder.stat}</span>
                </div>
              </div>
            </div>
          )}
          {stats.assister && (
            <div className="flex items-center gap-1.5 text-white whitespace-nowrap">
              <Share2 className="w-4 h-4 text-white/80" />
              <div>
                <div className="flex items-center gap-1">
                  <span className="font-medium">{stats.assister.name}</span>
                  <span className="text-white/80">{stats.assister.stat}</span>
                </div>
              </div>
            </div>
          )}
        </div>
      );
    }

    default:
      console.log('⚠️ Unsupported sport:', currentSport);
      return null;
  }
};