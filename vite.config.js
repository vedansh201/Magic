import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
export default defineConfig({
  base: '/Magic/',
  plugins: [react()],
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('/node_modules/three/')) return 'three';
          if (id.includes('/node_modules/gsap/')) return 'motion';
          if (/\/node_modules\/(react|react-dom|scheduler)\//.test(id)) return 'react';
        }
      }
    }
  }
});
