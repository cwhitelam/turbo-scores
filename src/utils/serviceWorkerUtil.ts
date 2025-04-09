/**
 * Service Worker Utility
 * 
 * Provides utilities for registering, updating, and managing the service worker
 * for offline capabilities and caching.
 */

// Check if service workers are supported
export const isServiceWorkerSupported = (): boolean => {
    return 'serviceWorker' in navigator;
};

// Callback types for service worker events
export type ServiceWorkerCallbacks = {
    onSuccess?: (registration: ServiceWorkerRegistration) => void;
    onUpdate?: (registration: ServiceWorkerRegistration) => void;
    onError?: (error: Error) => void;
    onOffline?: () => void;
    onOnline?: () => void;
};

/**
 * Register the service worker
 */
export const registerServiceWorker = async (
    callbacks: ServiceWorkerCallbacks = {}
): Promise<ServiceWorkerRegistration | undefined> => {
    const {
        onSuccess = () => { },
        onUpdate = () => { },
        onError = () => { },
    } = callbacks;

    // Skip if service workers aren't supported or we're in development
    if (!isServiceWorkerSupported()) {
        console.log('Service workers are not supported in this browser');
        return;
    }

    // In development, we might want to skip service worker registration
    if (import.meta.env.DEV && !import.meta.env.VITE_ENABLE_SW_IN_DEV) {
        console.log('Service worker registration skipped in development');
        return;
    }

    try {
        const registration = await navigator.serviceWorker.register('/serviceWorker.js', {
            scope: '/',
        });

        // Handle successful registration
        registration.onupdatefound = () => {
            const installingWorker = registration.installing;
            if (!installingWorker) return;

            installingWorker.onstatechange = () => {
                if (installingWorker.state === 'installed') {
                    if (navigator.serviceWorker.controller) {
                        // Updated service worker available
                        console.log('New content is available; please refresh');
                        onUpdate(registration);
                    } else {
                        // Initial service worker installation
                        console.log('Content is cached for offline use');
                        onSuccess(registration);
                    }
                }
            };
        };

        // Setup online/offline event listeners
        setupNetworkListeners(callbacks);

        return registration;
    } catch (error) {
        const errorObj = error instanceof Error ? error : new Error(String(error));
        console.error('Error during service worker registration:', errorObj);
        onError(errorObj);
    }
};

/**
 * Unregister the service worker
 */
export const unregisterServiceWorker = async (): Promise<boolean> => {
    if (!isServiceWorkerSupported()) {
        return false;
    }

    try {
        const registration = await navigator.serviceWorker.ready;
        const unregistered = await registration.unregister();
        return unregistered;
    } catch (error) {
        console.error('Error unregistering service worker:', error);
        return false;
    }
};

/**
 * Update the service worker
 */
export const updateServiceWorker = async (
    immediately = false
): Promise<void> => {
    if (!isServiceWorkerSupported()) {
        return;
    }

    try {
        const registration = await navigator.serviceWorker.ready;

        // Check for updates
        await registration.update();

        if (immediately && registration.waiting) {
            // Send a message to the waiting service worker to skip waiting
            registration.waiting.postMessage({ type: 'SKIP_WAITING' });

            // Reload the page to activate the new service worker
            window.location.reload();
        }
    } catch (error) {
        console.error('Error updating service worker:', error);
    }
};

/**
 * Setup network status listeners
 */
const setupNetworkListeners = (callbacks: ServiceWorkerCallbacks): void => {
    const { onOffline = () => { }, onOnline = () => { } } = callbacks;

    // Handle online status changes
    window.addEventListener('online', () => {
        console.log('App is online');
        onOnline();
    });

    window.addEventListener('offline', () => {
        console.log('App is offline');
        onOffline();
    });
};

/**
 * Check if the app is currently offline
 */
export const isOffline = (): boolean => {
    return !navigator.onLine;
};

/**
 * Service worker utility object for easy imports
 */
const serviceWorker = {
    register: registerServiceWorker,
    unregister: unregisterServiceWorker,
    update: updateServiceWorker,
    isSupported: isServiceWorkerSupported,
    isOffline,
};

export default serviceWorker; 