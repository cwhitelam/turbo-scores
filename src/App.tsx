import React from 'react';
import { Header } from './components/layout/Header';
import { AutoScrollContainer } from './components/common/AutoScrollContainer';
import { AutoScrollProvider } from './context/AutoScrollContext';
import { GlobalGameProvider } from './context/GlobalGameContext';
import { SportProvider } from './context/SportContext';
import { QueryProvider } from './providers/QueryProvider';
import { GameContainer } from './features/sports/shared';
import AppErrorBoundary from './components/ErrorBoundary/AppErrorBoundary';

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