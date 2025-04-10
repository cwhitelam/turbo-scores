// Environment checks
const isDevelopment = process.env.NODE_ENV === 'development';
const DEBUG = import.meta.env.VITE_FEATURE_DEBUG_MODE === 'true';

const LOG_STYLES = {
    fetch: 'color: #4CAF50; font-weight: bold',
    error: 'color: #f44336; font-weight: bold',
    success: 'color: #2196F3; font-weight: bold',
    warning: 'color: #FFC107; font-weight: bold',
    info: 'color: #9C27B0; font-weight: bold',
};

/**
 * Only logs in development mode
 */
export const logger = {
    /**
     * General purpose log that only shows in development
     */
    log: (...args: any[]) => {
        if (isDevelopment) {
            console.log(...args);
        }
    },

    /**
     * Error log that only shows in development
     */
    error: (...args: any[]) => {
        if (isDevelopment) {
            console.error(...args);
        }
    },

    /**
     * Warning log that only shows in development
     */
    warn: (...args: any[]) => {
        if (isDevelopment) {
            console.warn(...args);
        }
    },

    /**
     * Debug log that only shows when DEBUG mode is enabled
     * For more detailed debugging beyond normal development logs
     */
    debug: (...args: any[]) => {
        if (isDevelopment && DEBUG) {
            console.log('[DEBUG]', ...args);
        }
    }
};

// Legacy logging functions - now use the central logger internally
export function logFetch(endpoint: string, params?: any) {
    if (!isDevelopment) return;

    console.log(
        `%c🔄 Fetching data from ${endpoint}`,
        LOG_STYLES.fetch,
        params ? { params } : ''
    );
}

export function logFetchSuccess(endpoint: string, data?: any) {
    if (!isDevelopment) return;

    console.log(
        `%c✅ Successfully fetched data from ${endpoint}`,
        LOG_STYLES.success,
        data ? { data } : ''
    );
}

export function logFetchError(endpoint: string, error: any) {
    if (!isDevelopment) return;

    console.error(
        `%c❌ Error fetching data from ${endpoint}`,
        LOG_STYLES.error,
        { error }
    );
}

export function logGameUpdate(gameId: string, data: any) {
    if (!isDevelopment) return;

    console.log(
        `%c🎮 Game ${gameId} updated`,
        LOG_STYLES.warning,
        { data }
    );
} 