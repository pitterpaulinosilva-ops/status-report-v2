import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";

// Dev-only middleware to stub /api/webviewClick and avoid request timeouts
const webviewClickStub = () => ({
  name: "webview-click-stub",
  apply: "serve" as const,
  configureServer(server: any) {
    server.middlewares.use((req: any, res: any, next: any) => {
      if (req?.url?.startsWith("/api/webviewClick")) {
        // Respond quickly with no content to satisfy telemetry pings
        res.statusCode = 204;
        res.end();
        return;
      }
      next();
    });
  },
});

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
  },
  define: {
    'process.env': {},
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: (id) => {
          // React core
          if (id.includes('node_modules/react') || id.includes('node_modules/react-dom')) {
            return 'vendor';
          }
          // Radix UI components
          if (id.includes('node_modules/@radix-ui')) {
            return 'ui';
          }
          // Charts library
          if (id.includes('node_modules/recharts')) {
            return 'charts';
          }
          // Supabase
          if (id.includes('node_modules/@supabase')) {
            return 'supabase';
          }
          // Utilities
          if (id.includes('node_modules/date-fns') || 
              id.includes('node_modules/clsx') || 
              id.includes('node_modules/class-variance-authority')) {
            return 'utils';
          }
          // Lucide icons
          if (id.includes('node_modules/lucide-react')) {
            return 'icons';
          }
        }
      }
    },
    chunkSizeWarningLimit: 1500,
    sourcemap: false,
    minify: 'esbuild'
  },
  plugins: [
    react(),
    // Stub the telemetry endpoint in development to avoid timeouts
    mode === "development" && webviewClickStub(),
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
}));
