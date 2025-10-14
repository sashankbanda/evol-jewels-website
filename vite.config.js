// vite.config.js

import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// This is the correct structure: it exports the result of defineConfig, which is an object.
export default defineConfig({
  plugins: [react()],
});