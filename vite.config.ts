import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { mcpPlugin } from "@lovable.dev/mcp-js/stacks/supabase/vite";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
  },
  // 核心：强制指定基础路径
  base: "/", 
  plugins: [
    react(),
    mcpPlugin(),
  ],

  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  // 确保打包输出到 dist
  build: {
    outDir: 'dist',
  }
}));
