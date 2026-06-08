import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import path from 'path'

// Konfigurasi khusus pengujian (terpisah dari vite.config.ts untuk build).
// Vitest otomatis memakai file ini bila ada.
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  test: {
    globals: true,            // pakai describe/it/expect tanpa import
    environment: 'jsdom',     // DOM palsu untuk render komponen React
    setupFiles: ['./src/test/setup.ts'],
    css: false,               // abaikan import CSS saat test
    include: ['src/**/*.{test,spec}.{ts,tsx}'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html'],
      include: [
        'src/features/**',
        'src/lib/**',
        'src/utils/**',
        'src/components/shared/**',
        'src/routes/**',
      ],
    },
  },
})
