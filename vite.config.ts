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

  // Get the API key from Railway's environment variables during build
  const apiKey = process.env.VITE_OPENWEATHER_API_KEY || env.VITE_OPENWEATHER_API_KEY;

  console.log('Vite Config - API Key Status:', {
    hasKey: !!apiKey,
    source: process.env.VITE_OPENWEATHER_API_KEY ? 'Railway' : (env.VITE_OPENWEATHER_API_KEY ? 'Env File' : 'None')
  });

  const isDev = mode === 'development';

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
      // Replace process.env with a static object containing our env vars
      'process.env': {
        NODE_ENV: JSON.stringify(process.env.NODE_ENV),
      },
      // Explicitly inject the API key into import.meta.env
      'import.meta.env.VITE_OPENWEATHER_API_KEY': JSON.stringify(apiKey),
      'import.meta.env.MODE': JSON.stringify(mode),
      'import.meta.env.PROD': mode === 'production',
      'import.meta.env.DEV': mode === 'development',
    },
  };
});
