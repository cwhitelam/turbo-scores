import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

// https://vitejs.dev/config/
export default defineConfig(({ command, mode }) => {
  // Load env file based on `mode` in the current working directory.
  const env = loadEnv(mode, process.cwd(), '');

  // Debug environment loading
  console.log('Vite Config - Build Info:', {
    command,
    mode,
    NODE_ENV: process.env.NODE_ENV,
    BUILD_ENV: env.VITE_APP_ENV,
  });

  console.log('Vite Config - Critical Vars:', {
    VITE_OPENWEATHER_API_KEY: !!env.VITE_OPENWEATHER_API_KEY ? '[SET]' : '[NOT SET]',
    OPENWEATHER_API_KEY: !!env.OPENWEATHER_API_KEY ? '[SET]' : '[NOT SET]',
    RAILWAY_OPENWEATHER_API_KEY: !!env.RAILWAY_OPENWEATHER_API_KEY ? '[SET]' : '[NOT SET]',
  });

  const isDev = mode === 'development';

  // Ensure we're getting the API key from the right source
  const weatherApiKey = env.VITE_OPENWEATHER_API_KEY || env.OPENWEATHER_API_KEY || env.RAILWAY_OPENWEATHER_API_KEY;
  console.log('Weather API Key Status:', weatherApiKey ? 'Found a key to use' : 'No key available');

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
      // Try multiple possible sources for the API key
      'import.meta.env.VITE_OPENWEATHER_API_KEY': JSON.stringify(weatherApiKey || ''),
      'import.meta.env.MODE': JSON.stringify(mode),
      'import.meta.env.PROD': mode === 'production',
      'import.meta.env.DEV': mode === 'development',
    },
  };
});
