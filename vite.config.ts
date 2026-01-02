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
            if (id.includes('lucide-react') || id.includes('recharts') || id.includes('jspdf') || id.includes('xlsx')) {
              return 'vendor_heavy';
            }
            if (id.includes('@radix-ui') || id.includes('framer-motion')) {
              return 'vendor_ui';
            }
            return 'vendor';
          }
        }
      }
    }
  }
});
