/**
 * Service Worker Registration Utility
 * 
 * Provides functions for registering and updating the service worker.
 */

// Flag to indicate whether we're in a development environment
const isLocalhost = Boolean(
    window.location.hostname === 'localhost' ||
    window.location.hostname === '[::1]' ||
    window.location.hostname.match(/^127(?:\.(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)){3}$/)
);

/**
 * Register the service worker
 */
export function register(config?: {
    onSuccess?: (registration: ServiceWorkerRegistration) => void;
    onUpdate?: (registration: ServiceWorkerRegistration) => void;
}): void {
    // Only register in production and if service workers are supported
    if (process.env.NODE_ENV === 'production' && 'serviceWorker' in navigator) {
        // Get the URL for the service worker
        const swUrl = `/service-worker.js`;

        // Delay registration until after the page load
        window.addEventListener('load', () => {
            if (isLocalhost) {
                // This is running on localhost - check if a service worker still exists
                checkValidServiceWorker(swUrl, config);

                // Log to console
                console.log('Service Worker enabled on localhost for development testing');
            } else {
                // Not localhost - register the service worker
                registerValidSW(swUrl, config);
            }
        });
    }
}

/**
 * Register a valid service worker
 */
function registerValidSW(swUrl: string, config?: {
    onSuccess?: (registration: ServiceWorkerRegistration) => void;
    onUpdate?: (registration: ServiceWorkerRegistration) => void;
}): void {
    navigator.serviceWorker
        .register(swUrl)
        .then(registration => {
            // Handle updates
            registration.onupdatefound = () => {
                const installingWorker = registration.installing;
                if (!installingWorker) return;

                installingWorker.onstatechange = () => {
                    if (installingWorker.state === 'installed') {
                        if (navigator.serviceWorker.controller) {
                            // New service worker is available
                            console.log('New service worker available - update available');

                            // Notify app of update if callback provided
                            if (config && config.onUpdate) {
                                config.onUpdate(registration);
                            }
                        } else {
                            // First time install
                            console.log('Service Worker installed - content is cached for offline use');

                            // Notify app of success if callback provided
                            if (config && config.onSuccess) {
                                config.onSuccess(registration);
                            }
                        }
                    }
                };
            };
        })
        .catch(error => {
            console.error('Error during service worker registration:', error);
        });
}

/**
 * Check if a service worker is valid
 */
function checkValidServiceWorker(swUrl: string, config?: {
    onSuccess?: (registration: ServiceWorkerRegistration) => void;
    onUpdate?: (registration: ServiceWorkerRegistration) => void;
}): void {
    // Check if the service worker can be found
    fetch(swUrl, {
        headers: { 'Service-Worker': 'script' }
    })
        .then(response => {
            // Ensure service worker exists and response is valid
            const contentType = response.headers.get('content-type');
            if (
                response.status === 404 ||
                (contentType != null && contentType.indexOf('javascript') === -1)
            ) {
                // No service worker found - probably a different app
                navigator.serviceWorker.ready
                    .then(registration => {
                        registration.unregister()
                            .then(() => {
                                window.location.reload();
                            });
                    });
            } else {
                // Service worker found - proceed as normal
                registerValidSW(swUrl, config);
            }
        })
        .catch(() => {
            console.log('No internet connection found. App is running in offline mode.');
        });
}

/**
 * Unregister the service worker
 */
export function unregister(): void {
    if ('serviceWorker' in navigator) {
        navigator.serviceWorker.ready
            .then(registration => {
                registration.unregister();
            })
            .catch(error => {
                console.error('Error unregistering service worker:', error);
            });
    }
}

/**
 * Check for service worker updates
 * Can be called periodically to check for updates
 */
export function checkForUpdates(): Promise<boolean> {
    return new Promise((resolve, reject) => {
        if (!('serviceWorker' in navigator)) {
            resolve(false);
            return;
        }

        navigator.serviceWorker.ready
            .then(registration => {
                registration.update()
                    .then(() => {
                        resolve(true);
                    })
                    .catch(error => {
                        console.error('Error checking for service worker updates:', error);
                        reject(error);
                    });
            })
            .catch(error => {
                console.error('Error accessing service worker registration:', error);
                reject(error);
            });
    });
} 