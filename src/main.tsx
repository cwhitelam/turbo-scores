import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { TimeHandlerFactory } from './utils/timeHandlers/TimeHandlerFactory';

// Ensure consistent capitalization across all time handlers
TimeHandlerFactory.ensureCapitalization();

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>
);
