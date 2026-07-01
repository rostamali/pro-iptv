import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import legacy from '@vitejs/plugin-legacy';

export default defineConfig({
    plugins: [
        react(),
        tailwindcss(),
        legacy({
            targets: ['defaults', 'not IE 11'],
        }),
    ],
    server: {
        proxy: {
            '/proxy': {
                target: 'https://corsproxy.io',
                changeOrigin: true,
                rewrite: (path) =>
                    `/?${encodeURIComponent(path.replace('/proxy/', ''))}`,
            },
        },
    },
    build: {
        chunkSizeWarningLimit: 3500,
    },
});
