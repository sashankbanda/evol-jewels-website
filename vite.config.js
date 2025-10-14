import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

// This configuration adds aliases so imports like 'context/VibeContext' work directly
// from the src/ folder, avoiding relative path errors (../../).
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      // Map root folders inside src/ to absolute paths
      '@': path.resolve(__dirname, './src'),
      'components': path.resolve(__dirname, './src/components'),
      'context': path.resolve(__dirname, './src/context'),
      'logic': path.resolve(__dirname, './src/logic'),
      'data': path.resolve(__dirname, './src/data'),
    },
  },
});
