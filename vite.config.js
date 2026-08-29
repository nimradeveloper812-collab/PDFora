import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss()
  ],
  server: {
    allowedHosts: true,
    proxy: {
      '/api': {
        target: 'http://localhost:5089',
        changeOrigin: true,
        secure: false
      }
    }
  },
  preview: {
    allowedHosts: true,
  },
  build: {
    chunkSizeWarningLimit: 2000,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules')) {
            if (id.includes('react') || id.includes('react-dom') || id.includes('react-router-dom') || id.includes('react-helmet-async')) {
              return 'react-core';
            }
            if (id.includes('lucide-react')) {
              return 'icons';
            }
            if (id.includes('@imgly') || id.includes('onnxruntime-web')) {
              return 'ai-bg-removal';
            }
            if (
              id.includes('pdf-lib') ||
              id.includes('@pdf-lib') ||
              id.includes('@pdfsmaller') ||
              id.includes('docx') ||
              id.includes('xlsx') ||
              id.includes('mammoth') ||
              id.includes('jszip') ||
              id.includes('archiver') ||
              id.includes('sharp')
            ) {
              return 'pdf-heavy';
            }
            return 'vendor';
          }
        },
      },
    },
  },
});
