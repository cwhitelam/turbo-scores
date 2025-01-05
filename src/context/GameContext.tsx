import React, { createContext, ReactNode } from 'react';
import { TeamInfo } from '../types/game';

interface GameContextType {
  quarter: string;
  timeLeft: string;
  homeTeam: TeamInfo;
  awayTeam: TeamInfo;
}

export const GameContext = createContext<GameContextType | null>(null);

interface GameContextProviderProps {
  children: ReactNode;
  quarter: string;
  timeLeft: string;
  homeTeam: TeamInfo;
  awayTeam: TeamInfo;
}

export function GameContextProvider({ 
  children,
  quarter,
  timeLeft,
  homeTeam,
  awayTeam
}: GameContextProviderProps) {
  return (
    <GameContext.Provider value={{
      quarter,
      timeLeft,
      homeTeam,
      awayTeam
    }}>
      {children}
    </GameContext.Provider>
  );
}