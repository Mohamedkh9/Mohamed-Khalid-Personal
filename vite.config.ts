import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, (process as any).cwd(), '');
  return {
    plugins: [react()],
    build: {
      outDir: 'dist',
    },
    define: {
      // Define process.env.API_KEY for the @google/genai SDK
      // Using the provided key as fallback for immediate functionality
      'process.env.API_KEY': JSON.stringify(env.API_KEY || "AIzaSyB91c-CMNqi2jUkNJqfAyOfIBd2pQhtooM")
    }
  }
})