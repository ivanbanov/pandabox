import { defineConfig } from 'vite'
import Inspect from 'vite-plugin-inspect'
import react from '@vitejs/plugin-react-swc'
import panda from '../dist/vite'

export default defineConfig({
  plugins: [
    Inspect(),
    panda({
      outfile: './panda.css',
      optimizeJs: 'auto',
    }),
    react(),
  ],
})
