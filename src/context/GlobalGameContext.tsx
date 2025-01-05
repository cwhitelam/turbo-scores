import React, { createContext, useContext, useState, ReactNode } from 'react';
import { Game } from '../types/game';

interface GlobalGameContextType {
  selectedGame: Game | null;
  setSelectedGame: (game: Game | null) => void;
}

const GlobalGameContext = createContext<GlobalGameContextType | null>(null);

interface GlobalGameProviderProps {
  children: ReactNode;
}

export function GlobalGameProvider({ children }: GlobalGameProviderProps) {
  const [selectedGame, setSelectedGame] = useState<Game | null>(null);

  return (
    <GlobalGameContext.Provider value={{ selectedGame, setSelectedGame }}>
      {children}
    </GlobalGameContext.Provider>
  );
}

export function useGlobalGameContext() {
  const context = useContext(GlobalGameContext);
  if (!context) {
    throw new Error('useGlobalGameContext must be used within a GlobalGameProvider');
  }
  return context;
}