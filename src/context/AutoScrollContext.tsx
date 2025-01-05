import React, { createContext, useContext, useState, ReactNode } from 'react';

interface AutoScrollContextType {
  isAutoScrolling: boolean;
  toggleAutoScroll: () => void;
}

const AutoScrollContext = createContext<AutoScrollContextType | null>(null);

interface AutoScrollProviderProps {
  children: ReactNode;
}

export function AutoScrollProvider({ children }: AutoScrollProviderProps) {
  const [isAutoScrolling, setIsAutoScrolling] = useState(false); // Default to false

  const toggleAutoScroll = () => {
    setIsAutoScrolling(prev => !prev);
  };

  return (
    <AutoScrollContext.Provider value={{ isAutoScrolling, toggleAutoScroll }}>
      {children}
    </AutoScrollContext.Provider>
  );
}

export function useAutoScrollContext() {
  const context = useContext(AutoScrollContext);
  if (!context) {
    throw new Error('useAutoScrollContext must be used within an AutoScrollProvider');
  }
  return context;
}