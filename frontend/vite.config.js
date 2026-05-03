import { defineConfig } from 'vite'
import { resolve } from 'path'

// https://vitejs.dev/config/
export default defineConfig({
  // GitHub Pages deploys to: https://abhay-maddy.github.io/Disaster-Response-System/
  // Setting base ensures all asset paths are prefixed correctly in the build output.
  base: '/Disaster-Response-System/',

  // Declare all HTML pages so Vite bundles each one properly (multi-page app).
  build: {
    rollupOptions: {
      input: {
        main:           resolve(__dirname, 'index.html'),
        login:          resolve(__dirname, 'login.html'),
        register:       resolve(__dirname, 'register.html'),
        admin:          resolve(__dirname, 'admin.html'),
        adminRegister:  resolve(__dirname, 'admin-register.html'),
      },
    },
    // Output a clean, readable directory name
    outDir: 'dist',
    // Wipe the dist folder before every build so stale files don't linger
    emptyOutDir: true,
  },
})
