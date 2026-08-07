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
    allowedHosts: ['pdfora.nimradev.site'],
    proxy: {
      '/api': {
        target: 'http://localhost:5089',
        changeOrigin: true,
        secure: false
      }
    }
  },
  preview: {
    allowedHosts: ['pdfora.nimradev.site'],
  },
  build: {
    chunkSizeWarningLimit: 3000,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules')) {
            if (id.includes('pdf-lib') || id.includes('pdfjs-dist') || id.includes('xlsx') || id.includes('mammoth') || id.includes('jszip')) {
              return 'pdf-vendor';
            }
            return 'vendor';
          }
        },
      },
    },
  },
});
