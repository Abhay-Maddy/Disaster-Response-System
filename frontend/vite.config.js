import { defineConfig } from 'vite'
import { resolve } from 'path'

// https://vitejs.dev/config/
export default defineConfig({
  // GitHub Pages serves this project at:
  // https://abhay-maddy.github.io/Disaster-Response-System/
  base: '/Disaster-Response-System/',

  build: {
    // Output built files to the repo root so GitHub Pages (main branch, / root)
    // serves index.html directly without any extra settings.
    // NOTE: emptyOutDir is false so backend/ml_model/frontend source folders
    //       are never accidentally deleted during a build.
    outDir: '../',
    emptyOutDir: false,

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
