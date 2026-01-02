import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";

// https://vitejs.dev/config/
export default defineConfig({
  server: {
    host: "::",
    port: 8080
  },
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
      "react": path.resolve(__dirname, "./node_modules/react"),
      "react-dom": path.resolve(__dirname, "./node_modules/react-dom")
    },
    dedupe: ["react", "react-dom", "react/jsx-runtime", "react/jsx-dev-runtime"]
  },
  optimizeDeps: {
    include: ["react", "react-dom", "react/jsx-runtime", "react/jsx-dev-runtime"],
    force: true
  },
  cacheDir: "node_modules/.vite-v4",
  build: {
    chunkSizeWarningLimit: 1000,
    cssCodeSplit: true,
    minify: 'esbuild',
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules')) {
            if (id.includes('react') || id.includes('react-dom') || id.includes('react-router-dom') || id.includes('scheduler')) {
              return 'vendor_core';
            }
            if (id.includes('recharts') || id.includes('jspdf') || id.includes('xlsx')) {
              return 'vendor_heavy';
            }
            if (id.includes('framer-motion')) {
              return 'vendor_motion';
            }
            if (id.includes('react-joyride') || id.includes('react-floater') || id.includes('popper.js')) {
              return 'vendor_tour';
            }
            if (id.includes('@supabase')) {
              return 'vendor_db';
            }
            if (id.includes('react-hook-form') || id.includes('zod') || id.includes('@hookform')) {
              return 'vendor_forms';
            }
            if (id.includes('@tanstack')) {
              return 'vendor_data';
            }
            if (id.includes('@radix-ui') || id.includes('lucide-react') || id.includes('cmdk') || id.includes('vaul') || id.includes('sonner') || id.includes('input-otp')) {
              return 'vendor_ui';
            }
            if (id.includes('date-fns')) {
              return 'vendor_utils';
            }
            return 'vendor';
          }
        }
      }
    }
  }
});
