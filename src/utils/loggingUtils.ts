const LOG_STYLES = {
    fetch: 'color: #4CAF50; font-weight: bold',
    error: 'color: #f44336; font-weight: bold',
    success: 'color: #2196F3; font-weight: bold',
    warning: 'color: #FFC107; font-weight: bold'
};

export function logFetch(endpoint: string, params?: any) {
    console.log(
        `%c🔄 Fetching data from ${endpoint}`,
        LOG_STYLES.fetch,
        params ? { params } : ''
    );
}

export function logFetchSuccess(endpoint: string, data?: any) {
    console.log(
        `%c✅ Successfully fetched data from ${endpoint}`,
        LOG_STYLES.success,
        data ? { data } : ''
    );
}

export function logFetchError(endpoint: string, error: any) {
    console.error(
        `%c❌ Error fetching data from ${endpoint}`,
        LOG_STYLES.error,
        { error }
    );
}

export function logGameUpdate(gameId: string, data: any) {
    console.log(
        `%c🎮 Game ${gameId} updated`,
        LOG_STYLES.warning,
        { data }
    );
} 