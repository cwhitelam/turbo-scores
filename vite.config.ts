import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  build: {
    outDir: 'dist',
    sourcemap: true,
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,
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
    port: parseInt(process.env.PORT || '3000'),
    host: true, // Listen on all addresses
  },
  preview: {
    port: parseInt(process.env.PORT || '3000'),
    host: true, // Listen on all addresses
  },
});
