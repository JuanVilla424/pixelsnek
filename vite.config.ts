/// <reference types="vitest/config" />
import { defineConfig } from 'vite'

export default defineConfig({
  base: '/pixelsnek/',
  test: {
    globals: true,
    environment: 'node',
  },
})
