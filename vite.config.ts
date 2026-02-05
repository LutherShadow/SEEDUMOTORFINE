import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";

import { VitePWA } from 'vite-plugin-pwa';

// https://vitejs.dev/config/
export default defineConfig({
  server: {
    port: 8080,
    strictPort: true,
    host: true,
    hmr: {
      clientPort: 8080,
    },
  },
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.ico', 'apple-touch-icon.png', 'mask-icon.svg'],
      manifest: {
        name: 'SEEDUMOTOR FINE',
        short_name: 'SEEDUMOTOR',
        description: 'Sistema de Evaluación Educativa de Motricidad Fina',
        theme_color: '#ffffff',
        icons: [
          {
            src: 'pwa-192x192.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: 'pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png'
          }
        ]
      }
    })
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
      "react": path.resolve(__dirname, "node_modules/react"),
      "react-dom": path.resolve(__dirname, "node_modules/react-dom"),
      "react-router-dom": path.resolve(__dirname, "node_modules/react-router-dom"),
    },
    dedupe: ["react", "react-dom", "react-router-dom"]
  },
  optimizeDeps: {
    include: ["react", "react-dom", "react-router-dom"],
    force: true
  },
  build: {
    chunkSizeWarningLimit: 1000,
    cssCodeSplit: true,
    minify: 'esbuild',
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules')) {
            // Isolate large chart and pdf libraries
            if (id.includes('recharts')) {
              return 'vendor_charts';
            }
            if (id.includes('jspdf')) {
              return 'vendor_pdf';
            }
            if (id.includes('xlsx')) {
              return 'vendor_excel';
            }
            // Isolate Supabase client
            if (id.includes('@supabase')) {
              return 'vendor_db';
            }
            // Keep everything else in the default vendor chunk to prevent circular dependency issues
            // (e.g. Radix UI depending on React in a way that breaks with aggressive splitting)
            return 'vendor';
          }
        }
      }
    }
  }
});
