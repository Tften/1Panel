import { resolve } from 'node:path';
import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import { defineConfig, loadEnv } from 'vite';

export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, process.cwd());
    return {
        plugins: [react(), tailwindcss()],
        resolve: {
            alias: { '@': resolve(import.meta.dirname, './src') },
        },
        build: {
            outDir: '../core/cmd/server/web',
            emptyOutDir: false,
        },
        server: {
            host: '0.0.0.0',
            port: 4005,
            proxy: {
                '/api': {
                    target: env.VITE_API_PROXY_TARGET || 'http://localhost:9999/',
                    changeOrigin: true,
                    ws: true,
                },
            },
        },
    };
});
