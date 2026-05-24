import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  // If deploying to GitHub Pages subfolder e.g. yourusername.github.io/aura-app
  // change base to '/aura-app/'
  // If using a custom domain or Hostinger root, keep it as '/'
  base: '/',
  build: {
    outDir: 'dist'
  }
})
