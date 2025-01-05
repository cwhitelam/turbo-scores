import React, { useEffect } from 'react';
import { Header } from './components/layout/Header';
import { AutoScrollContainer } from './components/common/AutoScrollContainer';
import { ScoreCard } from './components/common/ScoreCard';
import { useGameData, GameDataProvider } from './context/GameDataContext';
import { AutoScrollProvider } from './context/AutoScrollContext';
import { GlobalGameProvider } from './context/GlobalGameContext';
import { SportProvider, useSport } from './context/SportContext';
import { assertEnvVars } from './config/env';
import { Game } from './types/game';

function GameContainer() {
  const { currentSport } = useSport();
  const { games, loading, error } = useGameData(currentSport);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[200px]">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center text-red-500 p-4">
        {error}
      </div>
    );
  }

  return (
    <div className="flex flex-wrap gap-4 justify-center p-4">
      {games.map((game: Game) => (
        <ScoreCard
          key={game.id}
          id={game.id}
          homeTeam={game.homeTeam}
          awayTeam={game.awayTeam}
          venue={game.venue}
          weather={game.weather}
          quarter={game.quarter}
          timeLeft={game.timeLeft}
          startTime={game.startTime}
          situation={game.situation}
        />
      ))}
    </div>
  );
}

export default function App() {
  useEffect(() => {
    assertEnvVars();
  }, []);

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