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
