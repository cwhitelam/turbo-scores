import React from 'react';
import { Header } from './components/layout/Header';
import { AutoScrollContainer } from './components/common/AutoScrollContainer';
import { ScoreCard } from './components/common/ScoreCard';
import { useGameData } from './context/GameDataContext';
import { AutoScrollProvider } from './context/AutoScrollContext';
import { GlobalGameProvider } from './context/GlobalGameContext';
import { SportProvider, useSport } from './context/SportContext';
import { GameDataProvider } from './context/GameDataContext';

function GameContainer() {
  const { currentSport } = useSport();
  const { games, loading, error } = useGameData(currentSport);

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
    <div className="pt-32 pb-4 px-4 max-w-7xl mx-auto">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {games.map((game) => (
          <ScoreCard key={game.id} {...game} />
        ))}
      </div>
    </div>
  );
}

export default function App() {
  return (
    <SportProvider>
      <GameDataProvider>
        <GlobalGameProvider>
          <AutoScrollProvider>
            <div className="min-h-screen bg-gray-900">
              <Header />
              <AutoScrollContainer speed={40}>
                <GameContainer />
              </AutoScrollContainer>
            </div>
          </AutoScrollProvider>
        </GlobalGameProvider>
      </GameDataProvider>
    </SportProvider>
  );
}