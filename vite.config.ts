import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

// https://vitejs.dev/config/
export default defineConfig(({ command, mode }) => {
  // Load env file based on `mode` in the current working directory.
  const env = loadEnv(mode, process.cwd(), '');

  // Debug environment loading
  console.log('Vite Config - Environment Mode:', mode);
  console.log('Vite Config - Environment Variables:', {
    VITE_OPENWEATHER_API_KEY: !!env.VITE_OPENWEATHER_API_KEY ? '[SET]' : '[NOT SET]',
    NODE_ENV: env.NODE_ENV,
    VITE_APP_ENV: env.VITE_APP_ENV
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
      host: true, // Listen on all addresses
      watch: {
        usePolling: true,
      },
    },
    preview: {
      port: parseInt(env.PORT || '3000'),
      host: true, // Listen on all addresses
    },
    define: {
      __APP_ENV__: JSON.stringify(env.VITE_APP_ENV),
      'import.meta.env.VITE_OPENWEATHER_API_KEY': JSON.stringify(env.VITE_OPENWEATHER_API_KEY),
      'import.meta.env.MODE': JSON.stringify(mode),
    },
  };
});
