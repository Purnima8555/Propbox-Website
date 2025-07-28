import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import fs from 'fs'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  server: {
    https: {
      key: fs.readFileSync(
        path.resolve(
          'C:/Users/DELL/Desktop/Propbox Backend/Propbox_System_Server/cert/server.key'
        )
      ),
      cert: fs.readFileSync(
        path.resolve(
          'C:/Users/DELL/Desktop/Propbox Backend/Propbox_System_Server/cert/server.crt'
        )
      ),
    },
    port: 5173,
    proxy: {
      '/api': {
        target: 'https://localhost',
        changeOrigin: true,
        secure: false,
      },
    },
  },
})
