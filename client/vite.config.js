import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { nodePolyfills } from 'vite-plugin-node-polyfills';
import path from 'path';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    nodePolyfills()
  ],
  publicDir: path.join(process.cwd(), 'public'),
  resolve: {
    alias: {
      '@': path.resolve(process.cwd(), './src'),
      'assets': path.resolve(process.cwd(), './src/assets'),
      'components': path.resolve(process.cwd(), './src/Components'),
      'utils': path.resolve(process.cwd(), './src/utility'),
      'react-router-dom': path.resolve(process.cwd(), 'node_modules/react-router-dom'),
      '~bootstrap': path.resolve(process.cwd(), 'node_modules/react-bootstrap')
    }
  },
  optimizeDeps: {
    include: [
      'react-router-dom'
    ],
  },
  build: {
    target: 'es2015',
    polyfillDynamicImport: false,
    nodePolyfills: ['url'],
  },
  server: {
    host: 'localhost',
    port: process.env.VITE_PORT || process.env.PORT || 80,
    nodePolyfills: ['url'],
  }
});