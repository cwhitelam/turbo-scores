interface EnvConfig {
    isProduction: boolean;
    isDevelopment: boolean;
    appUrl: string;
    openWeatherApiKey?: string;
}

export const env: EnvConfig = {
    isProduction: import.meta.env.VITE_APP_ENV === 'production',
    isDevelopment: import.meta.env.VITE_APP_ENV === 'development',
    appUrl: import.meta.env.VITE_APP_URL,
    openWeatherApiKey: import.meta.env.VITE_OPENWEATHER_API_KEY,
};

export function assertEnvVars() {
    const required = ['VITE_APP_ENV', 'VITE_APP_URL'];
    const missing = required.filter(key => !import.meta.env[key]);

    if (missing.length > 0) {
        throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
    }

    // OpenWeather API key is only required in development
    if (env.isDevelopment && !env.openWeatherApiKey) {
        throw new Error('Missing required environment variable: VITE_OPENWEATHER_API_KEY');
    }
} 