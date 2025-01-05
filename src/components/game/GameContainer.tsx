import React from 'react';
import { useSport } from '../../context/SportContext';
import { useSportsData } from '../../hooks/useSportsData';
import { ScoreCard } from '../common/ScoreCard';
import { GameSkeleton } from './GameSkeleton';
import { formatDisplayDate } from '../../utils/dateUtils';

export function GameContainer() {
  const { currentSport } = useSport();
  const { games, loading, error } = useSportsData(currentSport);

  if (loading) {
    return (
      <div className="pt-32 pb-4 px-4 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {[...Array(4)].map((_, index) => (
            <GameSkeleton key={index} />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-900 p-4 flex items-center justify-center">
        <div className="text-red-500 text-xl">{error}</div>
      </div>
    );
  }

  if (games.length === 0) {
    return (
      <div className="min-h-screen bg-gray-900 p-4 flex items-center justify-center">
        <div className="text-white text-xl">No {currentSport} games scheduled</div>
      </div>
    );
  }

  const isUpcoming = games[0].isUpcoming;
  const isSeasonOpener = games[0].isSeasonOpener;

  return (
    <div className="pt-32 pb-4 px-4 max-w-7xl mx-auto">
      {(isUpcoming || isSeasonOpener) && (
        <div className="text-white text-xl mb-6 text-center">
          {isSeasonOpener ? (
            <div>
              <div className="text-2xl font-bold mb-2">{currentSport} Opening Day</div>
              <div>{formatDisplayDate(new Date(games[0].gameDate!))}</div>
            </div>
          ) : (
            <div>Next games on {formatDisplayDate(new Date(games[0].gameDate!))}</div>
          )}
        </div>
      )}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {games.map((game) => (
          <ScoreCard key={game.id} {...game} />
        ))}
      </div>
    </div>
  );
}