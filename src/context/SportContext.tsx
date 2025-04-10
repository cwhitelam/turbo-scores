import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { Sport } from '../types/sport';

interface SportContextType {
  currentSport: Sport;
  setCurrentSport: (sport: Sport) => void;
}

const SportContext = createContext<SportContextType | null>(null);

export function SportProvider({ children }: { children: ReactNode }) {
  // Get the stored sport from localStorage or default to 'NFL'
  const [currentSport, setCurrentSport] = useState<Sport>(() => {
    const storedSport = localStorage.getItem('currentSport');
    return (storedSport as Sport) || 'NFL';
  });

  // Update localStorage when sport changes
  useEffect(() => {
    localStorage.setItem('currentSport', currentSport);
  }, [currentSport]);

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