import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';

// Enhanced context with more controls
interface AutoScrollContextType {
  isAutoScrolling: boolean;
  scrollSpeed: number;
  resumeDelay: number;
  toggleAutoScroll: () => void;
  setScrollSpeed: (speed: number) => void;
  setResumeDelay: (delay: number) => void;
}

// Storage keys for persistence
const STORAGE_KEY_AUTO_SCROLL = 'turbo-scores-auto-scroll';
const STORAGE_KEY_SCROLL_SPEED = 'turbo-scores-scroll-speed';
const STORAGE_KEY_RESUME_DELAY = 'turbo-scores-resume-delay';

// Default values
const DEFAULT_SCROLL_SPEED = 30;
const DEFAULT_RESUME_DELAY = 5000;

const AutoScrollContext = createContext<AutoScrollContextType | null>(null);

interface AutoScrollProviderProps {
  children: ReactNode;
}

export function AutoScrollProvider({ children }: AutoScrollProviderProps) {
  // Initialize state from localStorage if available
  const [isAutoScrolling, setIsAutoScrolling] = useState(() => {
    const saved = localStorage.getItem(STORAGE_KEY_AUTO_SCROLL);
    return saved ? JSON.parse(saved) : false;
  });

  const [scrollSpeed, setScrollSpeed] = useState(() => {
    const saved = localStorage.getItem(STORAGE_KEY_SCROLL_SPEED);
    return saved ? Number(JSON.parse(saved)) : DEFAULT_SCROLL_SPEED;
  });

  const [resumeDelay, setResumeDelay] = useState(() => {
    const saved = localStorage.getItem(STORAGE_KEY_RESUME_DELAY);
    return saved ? Number(JSON.parse(saved)) : DEFAULT_RESUME_DELAY;
  });

  // Toggle auto-scrolling on/off
  const toggleAutoScroll = () => {
    setIsAutoScrolling((prev: boolean) => !prev);
  };

  // Update scroll speed with bounds checking
  const updateScrollSpeed = (speed: number) => {
    const boundedSpeed = Math.min(Math.max(speed, 5), 100);
    setScrollSpeed(boundedSpeed);
  };

  // Update resume delay with bounds checking
  const updateResumeDelay = (delay: number) => {
    const boundedDelay = Math.min(Math.max(delay, 1000), 15000);
    setResumeDelay(boundedDelay);
  };

  // Persist settings to localStorage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_AUTO_SCROLL, JSON.stringify(isAutoScrolling));
  }, [isAutoScrolling]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_SCROLL_SPEED, JSON.stringify(scrollSpeed));
  }, [scrollSpeed]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_RESUME_DELAY, JSON.stringify(resumeDelay));
  }, [resumeDelay]);

  return (
    <AutoScrollContext.Provider value={{
      isAutoScrolling,
      scrollSpeed,
      resumeDelay,
      toggleAutoScroll,
      setScrollSpeed: updateScrollSpeed,
      setResumeDelay: updateResumeDelay
    }}>
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