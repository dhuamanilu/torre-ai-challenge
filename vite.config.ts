/// <reference types="vitest" />
import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'

export default defineConfig({
    plugins: [react()],
    server: {
        proxy: {
            '/api': {
                target: 'https://torre.ai',
                changeOrigin: true,
                secure: true,
            },
            '/search-api': {
                target: 'https://search.torre.co',
                changeOrigin: true,
                secure: true,
                rewrite: (path) => path.replace(/^\/search-api/, ''),
            },
        },
    },
    test: {
        globals: true,
        environment: 'jsdom',
    },
})


