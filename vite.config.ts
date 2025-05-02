import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";
import fs from 'fs';

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // Load env file
  const env: Record<string, string> = {};
  try {
    const envFile = fs.readFileSync('.env', 'utf8');
    envFile.split('\n').forEach(line => {
      const [key, value] = line.split('=');
      if (key && value) {
        env[key] = value.trim();
      }
    });
  } catch (error) {
    console.warn('No .env file found or error reading it:', error);
  }

  return {
    server: {
      host: "::",
      port: 8080,
      strictPort: true,
    },
    plugins: [
      react(),
      mode === 'development' && componentTagger(),
      {
        name: 'html-env-replace',
        transformIndexHtml(html: string): string {
          return html.replace(/%(.+?)%/g, (match: string, p1: string) => {
            return env[p1] || '';
          });
        }
      }
    ].filter(Boolean),
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
    },
  };
});
