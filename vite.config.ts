import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

// https://vitejs.dev/config/
export default defineConfig(({ command, mode }) => {
  // Load env file based on `mode` in the current working directory.
  const env = loadEnv(mode, process.cwd(), '');

  // Debug environment loading
  console.log('Vite Config - Environment Variables:', {
    NODE_ENV: process.env.NODE_ENV,
    VITE_APP_ENV: env.VITE_APP_ENV,
    hasOpenWeatherKey: !!env.VITE_OPENWEATHER_API_KEY,
    mode,
    command,
  });

  const isDev = mode === 'development';

  // Explicitly define environment variables for the client
  const envVars = {
    VITE_APP_ENV: env.VITE_APP_ENV,
    VITE_APP_URL: env.VITE_APP_URL,
    VITE_API_BASE_URL: env.VITE_API_BASE_URL,
    VITE_OPENWEATHER_API_KEY: env.VITE_OPENWEATHER_API_KEY,
    VITE_FEATURE_DEBUG_MODE: env.VITE_FEATURE_DEBUG_MODE,
    MODE: mode,
    DEV: mode === 'development',
    PROD: mode === 'production',
    SSR: false
  };

  return {
    plugins: [react()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
      },
    },
    build: {
      outDir: 'dist',
      sourcemap: isDev,
      minify: isDev ? false : 'terser',
      terserOptions: isDev ? undefined : {
        compress: {
          drop_console: false,
        },
      },
      rollupOptions: {
        output: {
          manualChunks: {
            vendor: ['react', 'react-dom'],
            utils: ['@heroicons/react', 'lucide-react'],
          },
        },
      },
    },
    server: {
      port: isDev ? 5173 : parseInt(env.PORT || '3000'),
      host: true,
      watch: {
        usePolling: true,
      },
    },
    preview: {
      port: parseInt(env.PORT || '3000'),
      host: true,
    },
    define: {
      __APP_ENV__: JSON.stringify(env.VITE_APP_ENV),
      // Explicitly inject each environment variable
      'import.meta.env.VITE_APP_ENV': JSON.stringify(env.VITE_APP_ENV),
      'import.meta.env.VITE_APP_URL': JSON.stringify(env.VITE_APP_URL),
      'import.meta.env.VITE_API_BASE_URL': JSON.stringify(env.VITE_API_BASE_URL),
      'import.meta.env.VITE_OPENWEATHER_API_KEY': JSON.stringify(env.VITE_OPENWEATHER_API_KEY),
      'import.meta.env.VITE_FEATURE_DEBUG_MODE': JSON.stringify(env.VITE_FEATURE_DEBUG_MODE),
      'import.meta.env.MODE': JSON.stringify(mode),
      'import.meta.env.DEV': mode === 'development',
      'import.meta.env.PROD': mode === 'production',
      'import.meta.env.SSR': false,
    },
  };
});
