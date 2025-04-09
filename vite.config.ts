import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { visualizer } from 'rollup-plugin-visualizer';

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
  const isAnalyze = env.ANALYZE === 'true';

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

  // Configure plugins based on mode
  const plugins = [
    react({
      // Babel configuration to optimize bundle size
      babel: {
        // Tree shaking optimization
        plugins: [
          ['babel-plugin-transform-react-remove-prop-types', { removeImport: true }]
        ],
      }
    }),
  ];

  // Add visualizer when analyzing the bundle
  if (isAnalyze) {
    plugins.push(
      visualizer({
        filename: './dist/stats.html',
        open: true,
        gzipSize: true,
        brotliSize: true,
        template: 'treemap', // sunburst, treemap, network
      })
    );
  }

  return {
    plugins,
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
      },
    },
    build: {
      outDir: 'dist',
      sourcemap: isDev,
      minify: isDev ? false : 'terser',
      // Target modern browsers for smaller bundles
      target: 'es2020',
      terserOptions: isDev ? undefined : {
        compress: {
          drop_console: mode === 'production',
          drop_debugger: true,
          pure_funcs: mode === 'production' ? ['console.log', 'console.debug', 'console.info'] : [],
        },
        mangle: {
          // Don't mangle in development for better debugging
          toplevel: mode === 'production',
        },
        format: {
          comments: false,
        }
      },
      rollupOptions: {
        output: {
          // Optimize chunk naming for better caching
          chunkFileNames: 'assets/[name]-[hash].js',
          entryFileNames: 'assets/[name]-[hash].js',
          assetFileNames: 'assets/[name]-[hash].[ext]',
          // Improve tree-shaking by splitting per-module chunks
          manualChunks: (id) => {
            // Framework chunks
            if (id.includes('node_modules/react/') || id.includes('node_modules/react-dom/')) {
              return 'vendor-react';
            }

            // UI Components
            if (id.includes('node_modules/@heroicons/') || id.includes('node_modules/lucide-react/')) {
              return 'vendor-ui';
            }

            // Data libraries
            if (id.includes('node_modules/@tanstack/react-query')) {
              return 'vendor-data';
            }

            // Application core
            if (id.includes('/src/components/layout/') || id.includes('/src/components/common/')) {
              return 'app-core';
            }

            // Sport specific chunks
            if (id.includes('/src/features/sports/nfl/')) return 'sport-nfl';
            if (id.includes('/src/features/sports/nba/')) return 'sport-nba';
            if (id.includes('/src/features/sports/mlb/')) return 'sport-mlb';
            if (id.includes('/src/features/sports/nhl/')) return 'sport-nhl';
          }
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
      headers: {
        // Add HTTP cache headers for preview server (simulates production)
        'Cache-Control': 'public, max-age=31536000', // 1 year for immutable assets
      },
    },
    // Optimize dependencies that change infrequently
    optimizeDeps: {
      include: ['react', 'react-dom', 'react-router-dom', '@tanstack/react-query'],
      // Exclude larger libraries that are only used conditionally
      exclude: [],
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
    esbuild: {
      // Enable tree-shaking during development
      treeShaking: true,
      // Smaller bundle size (generates bigger code but compresses better)
      legalComments: 'none',
      // Target modern browsers
      target: 'es2020',
    },
    // Add cache-control headers to static assets for better caching
    experimental: {
      renderBuiltUrl(filename, { hostType }) {
        // Only apply custom URLs for client (not during SSR)
        if (hostType === 'js') {
          // Add a cache-busting query parameter based on a hash
          return { relative: true };
        }
        return filename;
      }
    }
  };
});
