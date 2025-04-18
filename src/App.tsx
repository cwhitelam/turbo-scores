import React from 'react';
import { Header } from './components/layout/Header';
import { AutoScrollContainer } from './components/common/AutoScrollContainer';
import { AutoScrollProvider } from './context/AutoScrollContext';
import { GlobalGameProvider } from './context/GlobalGameContext';
import { SportProvider } from './context/SportContext';
import { QueryProvider } from './providers/QueryProvider';
import { GameContainer } from './features/sports/shared';
import AppErrorBoundary from './components/ErrorBoundary/AppErrorBoundary';
import { PollingMonitor } from './components/debug/PollingMonitor';

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

              {/* Debug components only rendered in development */}
              {import.meta.env.DEV && <PollingMonitor />}
            </div>
          </AutoScrollProvider>
        </GlobalGameProvider>
      </SportProvider>
    </QueryProvider>
  );
}