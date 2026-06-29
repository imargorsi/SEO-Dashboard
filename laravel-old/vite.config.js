import { defineConfig, loadEnv } from 'vite';
import laravel from 'laravel-vite-plugin';
import react from '@vitejs/plugin-react';

function vitePublicBase(appUrl) {
    if (!appUrl || typeof appUrl !== 'string') {
        return '/';
    }
    try {
        const pathname = new URL(appUrl).pathname.replace(/\/+$/, '');
        return pathname ? `${pathname}/` : '/';
    } catch {
        return '/';
    }
}

function devBackendUrl(raw) {
    const fallback = 'http://127.0.0.1:8004';
    const s = (raw || fallback).trim();
    try {
        const u = new URL(s);
        const privateLike =
            u.hostname === 'localhost' ||
            u.hostname === '127.0.0.1' ||
            /^192\.168\.\d{1,3}\.\d{1,3}$/.test(u.hostname) ||
            /^10\.\d{1,3}\.\d{1,3}\.\d{1,3}$/.test(u.hostname) ||
            /^172\.(1[6-9]|2\d|3[0-1])\.\d{1,3}\.\d{1,3}$/.test(u.hostname);
        if (privateLike && u.protocol === 'https:') {
            u.protocol = 'http:';
            return u.toString().replace(/\/$/, '');
        }

        return s.replace(/\/$/, '');
    } catch {
        return fallback;
    }
}

export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, process.cwd(), '');
    const backend = devBackendUrl(env.VITE_DEV_BACKEND_URL);
    const base =
        mode === 'production' ? vitePublicBase(env.APP_URL) : '/';

    return {
        base,
        plugins: [
            laravel({
                input: ['resources/css/app.css', 'resources/js/app.jsx'],
                refresh: true,
            }),
            react(),
        ],
        server: {
            host: true,
            port: 5173,
            strictPort: true,
            proxy: {
                '^/api': {
                    target: backend,
                    changeOrigin: true,
                    secure: false,
                },
                '^/sanctum': {
                    target: backend,
                    changeOrigin: true,
                    secure: false,
                },
            },
        },
    };
});
