import React from 'react';
import { Header } from './components/layout/Header';
import { AutoScrollContainer } from './components/common/AutoScrollContainer';
import { ScoreCard } from './components/common/ScoreCard';
import { SkeletonScoreCard } from './components/common/SkeletonScoreCard';
import { useSportsDataQuery } from './hooks/useSportsDataQuery';
import { AutoScrollProvider } from './context/AutoScrollContext';
import { GlobalGameProvider } from './context/GlobalGameContext';
import { SportProvider } from './context/SportContext';
import { QueryProvider } from './providers/QueryProvider';
import { useSport } from './context/SportContext';
import { PollingMonitor } from './components/debug/PollingMonitor';

const GameContainer = React.memo(function GameContainer() {
  const { currentSport } = useSport();
  const { games, loading, error } = useSportsDataQuery(currentSport);

  if (loading) {
    return (
      <div className="pt-32 pb-4 px-4 max-w-7xl mx-auto relative">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {[...Array(6)].map((_, index) => (
            <SkeletonScoreCard key={index} />
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

  return (
    <div className="pt-32 pb-4 px-4 max-w-7xl mx-auto relative">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {games.map((game) => (
          <ScoreCard key={game.id} {...game} />
        ))}
      </div>
    </div>
  );
});

export default function App() {
  return (
    <QueryProvider>
      <SportProvider>
        <GlobalGameProvider>
          <AutoScrollProvider>
            <div className="min-h-screen bg-gray-900">
              <Header />
              <AutoScrollContainer>
                <GameContainer />
              </AutoScrollContainer>
              {/* Debug components only rendered in development */}
              {import.meta.env.DEV && <PollingMonitor />}
            </div>
          </AutoScrollProvider>
        </GlobalGameProvider>
      </SportProvider>
    </QueryProvider>
  );
}