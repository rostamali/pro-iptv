import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
    plugins: [
        react(),
        tailwindcss(),
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
