import { defineConfig } from 'vite'
import { resolve } from 'path'

// https://vitejs.dev/config/
export default defineConfig({
  // GitHub Pages serves this project at:
  // https://abhay-maddy.github.io/Disaster-Response-System/
  base: '/Disaster-Response-System/',

  build: {
    // Output into /docs at the repo root so GitHub Pages can serve
    // from: main branch → /docs folder (no extra branch needed)
    outDir: '../docs',
    emptyOutDir: true,

    rollupOptions: {
      input: {
        main:          resolve(__dirname, 'index.html'),
        login:         resolve(__dirname, 'login.html'),
        register:      resolve(__dirname, 'register.html'),
        admin:         resolve(__dirname, 'admin.html'),
        adminRegister: resolve(__dirname, 'admin-register.html'),
      },
    },
  },
})
