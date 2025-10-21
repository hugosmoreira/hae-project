import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
    headers: {
      'Content-Security-Policy': "script-src 'self' 'unsafe-eval' 'unsafe-inline'; object-src 'none';"
    }
  },
  plugins: [react(), mode === "development" && componentTagger()].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  define: {
    // Allow eval in development for better debugging
    ...(mode === 'development' ? { 'process.env.NODE_ENV': '"development"' } : {})
  },
  optimizeDeps: {
    exclude: [
      'AppData',
      'Android',
      'AndroidStudio', 
      'Google',
      'Programs',
      'Downloads',
      'Configurações Locais',
      'Dados de Aplicativos'
    ]
  }
}));
