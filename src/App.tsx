import React from 'react';
import { Header } from './components/layout/Header';
import { AutoScrollContainer } from './components/common/AutoScrollContainer';
import { ScoreCard } from './components/common/ScoreCard';
import { useSportsDataQuery } from './hooks/useSportsDataQuery';
import { AutoScrollProvider } from './context/AutoScrollContext';
import { GlobalGameProvider } from './context/GlobalGameContext';
import { SportProvider } from './context/SportContext';
import { QueryProvider } from './providers/QueryProvider';
import { useSport } from './context/SportContext';
import AppErrorBoundary from './components/ErrorBoundary/AppErrorBoundary';

const GameContainer = React.memo(function GameContainer() {
  const { currentSport } = useSport();
  const { games, loading, error } = useSportsDataQuery(currentSport);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 p-4 flex items-center justify-center">
        <div className="text-white text-xl">Loading {currentSport} games...</div>
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
          <AppErrorBoundary key={game.id} componentName={`ScoreCard-${game.id}`}>
            <ScoreCard {...game} />
          </AppErrorBoundary>
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
              <AppErrorBoundary componentName="Header">
                <Header />
              </AppErrorBoundary>

              <AppErrorBoundary componentName="GameContainer">
                <AutoScrollContainer>
                  <GameContainer />
                </AutoScrollContainer>
              </AppErrorBoundary>
            </div>
          </AutoScrollProvider>
        </GlobalGameProvider>
      </SportProvider>
    </QueryProvider>
  );
}