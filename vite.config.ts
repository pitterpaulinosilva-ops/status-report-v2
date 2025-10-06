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
        manualChunks: {
          vendor: ['react', 'react-dom'],
          ui: ['@radix-ui/react-dialog', '@radix-ui/react-select', '@radix-ui/react-tabs'],
          charts: ['recharts'],
          utils: ['date-fns', 'clsx', 'class-variance-authority']
        }
      }
    },
    chunkSizeWarningLimit: 1000
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
