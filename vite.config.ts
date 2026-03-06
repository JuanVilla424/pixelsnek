/// <reference types="vitest/config" />
import { defineConfig, type Plugin } from 'vite'

function injectCspPlugin(): Plugin {
  const directives = [
    "default-src 'none'",
    "script-src 'self'",
    "style-src 'self'",
    "img-src 'self' data:",
    "manifest-src 'self'",
    "base-uri 'self'",
    "form-action 'none'",
  ].join('; ')

  return {
    name: 'inject-csp',
    transformIndexHtml: {
      order: 'post',
      handler(html, ctx) {
        if (ctx.server !== undefined) return html
        return {
          html,
          tags: [
            {
              tag: 'meta',
              attrs: { 'http-equiv': 'Content-Security-Policy', content: directives },
              injectTo: 'head-prepend',
            },
          ],
        }
      },
    },
  }
}

export default defineConfig({
  base: '/pixelsnek/',
  plugins: [injectCspPlugin()],
  test: {
    globals: true,
    environment: 'node',
  },
})
