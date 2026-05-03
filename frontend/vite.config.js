import { defineConfig } from 'vite'
import { resolve } from 'path'

// https://vitejs.dev/config/
export default defineConfig({
  // GitHub Pages serves at: https://abhay-maddy.github.io/Disaster-Response-System/
  base: '/Disaster-Response-System/',

  build: {
    // Output to repo root so GitHub Pages (main branch / root) serves directly.
    // emptyOutDir:false so source folders are never deleted during a build.
    outDir: '../',
    emptyOutDir: false,

    rollupOptions: {
      input: {
        main:          resolve(__dirname, 'index.html'),       // Landing page
        dashboard:     resolve(__dirname, 'dashboard.html'),   // User dashboard
        login:         resolve(__dirname, 'login.html'),
        register:      resolve(__dirname, 'register.html'),
        admin:         resolve(__dirname, 'admin.html'),
        adminRegister: resolve(__dirname, 'admin-register.html'),
      },
    },
  },
})
