import React, { createContext, useContext, useState, ReactNode } from 'react';
import { Sport } from '../types/sport';

interface SportContextType {
  currentSport: Sport;
  setCurrentSport: (sport: Sport) => void;
}

const SportContext = createContext<SportContextType | null>(null);

export function SportProvider({ children }: { children: ReactNode }) {
  const [currentSport, setCurrentSport] = useState<Sport>('NFL');

  return (
    <SportContext.Provider value={{ currentSport, setCurrentSport }}>
      {children}
    </SportContext.Provider>
  );
}

export function useSport() {
  const context = useContext(SportContext);
  if (!context) {
    throw new Error('useSport must be used within a SportProvider');
  }
  return context;
}