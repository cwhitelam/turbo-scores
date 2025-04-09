import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { Sport } from '../types/sport';
import { useQueryClient } from '@tanstack/react-query';

interface SportContextType {
  currentSport: Sport;
  isTransitioning: boolean;
  previousSport: Sport | null;
  setCurrentSport: (sport: Sport) => void;
}

const SportContext = createContext<SportContextType | null>(null);

export function SportProvider({ children }: { children: ReactNode }) {
  const [currentSport, setCurrentSport] = useState<Sport>('NFL');
  const [previousSport, setPreviousSport] = useState<Sport | null>(null);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const queryClient = useQueryClient();

  // Use a state transition approach with minimal delays
  const handleSportChange = (newSport: Sport) => {
    if (newSport !== currentSport) {
      console.log(`🔄 Sport change requested: ${currentSport} -> ${newSport}`);

      // Store the previous sport
      setPreviousSport(currentSport);

      // Start transition but update sport immediately
      setIsTransitioning(true);
      setCurrentSport(newSport);

      // Prefetch data for the new sport
      queryClient.prefetchQuery({
        queryKey: ['sports', newSport]
      });

      // End transition after a very short delay
      setTimeout(() => {
        setIsTransitioning(false);
        console.log(`✅ Sport change completed: ${newSport}`);
      }, 100);
    }
  };

  return (
    <SportContext.Provider
      value={{
        currentSport,
        isTransitioning,
        previousSport,
        setCurrentSport: handleSportChange
      }}
    >
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