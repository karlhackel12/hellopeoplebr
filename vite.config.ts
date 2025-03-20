
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
    allowedHosts: [
      "2957122e-35c8-47f8-b3a7-61041915b7f2.lovableproject.com",
      "localhost",
    ],
  },
  plugins: [
    react(),
    mode === 'development' &&
    componentTagger(),
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  define: {
    'import.meta.env.VITE_USE_EDGE_FUNCTIONS': JSON.stringify('true'),
    'import.meta.env.VITE_SUPABASE_PROJECT_REF': JSON.stringify('roljsmhhptuwtsbirsxe')
  }
}));
