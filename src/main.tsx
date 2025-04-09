import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import serviceWorker from './utils/serviceWorkerUtil';

// Create root and render app
createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>
);

// Register service worker for offline support and caching
serviceWorker.register({
  onSuccess: (registration) => {
    console.log('Service worker registered successfully:', registration);
  },
  onUpdate: (registration) => {
    // Show a notification that there's an update available
    const updateAvailable = document.createElement('div');
    updateAvailable.style.position = 'fixed';
    updateAvailable.style.bottom = '20px';
    updateAvailable.style.left = '20px';
    updateAvailable.style.backgroundColor = '#4caf50';
    updateAvailable.style.color = 'white';
    updateAvailable.style.padding = '10px 20px';
    updateAvailable.style.borderRadius = '4px';
    updateAvailable.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.2)';
    updateAvailable.style.zIndex = '9999';
    updateAvailable.innerHTML = `
      Update available! <button id="update-btn" style="margin-left: 10px; background: white; color: #4caf50; border: none; padding: 5px 10px; border-radius: 3px; cursor: pointer;">Refresh</button>
    `;

    document.body.appendChild(updateAvailable);

    document.getElementById('update-btn')?.addEventListener('click', () => {
      serviceWorker.update(true);
    });
  },
  onOffline: () => {
    // Show offline indicator
    if (!document.getElementById('offline-indicator')) {
      const offlineIndicator = document.createElement('div');
      offlineIndicator.id = 'offline-indicator';
      offlineIndicator.style.position = 'fixed';
      offlineIndicator.style.top = '0';
      offlineIndicator.style.left = '0';
      offlineIndicator.style.right = '0';
      offlineIndicator.style.backgroundColor = '#ff9800';
      offlineIndicator.style.color = 'white';
      offlineIndicator.style.textAlign = 'center';
      offlineIndicator.style.padding = '5px';
      offlineIndicator.style.zIndex = '9999';
      offlineIndicator.innerHTML = 'You are offline. Some features may be limited.';

      document.body.prepend(offlineIndicator);
    }
  },
  onOnline: () => {
    // Remove offline indicator
    const offlineIndicator = document.getElementById('offline-indicator');
    if (offlineIndicator) {
      offlineIndicator.remove();
    }
  }
});
