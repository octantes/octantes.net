import { fileURLToPath, URL } from 'node:url'
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueDevTools from 'vite-plugin-vue-devtools'

export default defineConfig({
  // base: '/octantes.net/', // correccion del path para ghpages
  plugins: [ vue(), vueDevTools(), ],
  resolve: {
    alias: { '@': fileURLToPath(new URL('./src', import.meta.url)) },
  },
  build: {
    outDir: 'dist', // carpeta de build
    emptyOutDir: true, // limpia dist antes de buildear
  },
})