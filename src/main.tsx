import React, { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import RootErrorBoundary from './components/ErrorBoundary/RootErrorBoundary';
import { ErrorFallbackProps } from './components/ErrorBoundary/ErrorFallback';

// Custom error fallback component for the application root
const RootErrorFallback: React.FC<ErrorFallbackProps> = ({ error, resetError, componentName }) => (
  <div className="min-h-screen bg-gray-900 flex items-center justify-center p-6">
    <div className="bg-gray-800 rounded-lg shadow-xl max-w-2xl w-full p-6 text-white">
      <h1 className="text-2xl font-bold text-red-400 mb-4">Something went wrong</h1>
      <p className="mb-4">We're sorry, but the application encountered a critical error:</p>
      <div className="bg-gray-900 p-4 rounded mb-4 overflow-auto">
        <p className="text-red-300">{error.message}</p>
      </div>
      <div className="flex gap-4">
        <button
          onClick={resetError}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
        >
          Try Again
        </button>
        <button
          onClick={() => window.location.reload()}
          className="bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded"
        >
          Reload Application
        </button>
      </div>
    </div>
  </div>
);

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <RootErrorBoundary fallback={RootErrorFallback}>
      <App />
    </RootErrorBoundary>
  </StrictMode>
);
