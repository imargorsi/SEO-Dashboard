import axios from 'axios';

function isPrivateDevHostname(hostname) {
    return (
        hostname === 'localhost' ||
        hostname === '127.0.0.1' ||
        /^192\.168\.\d{1,3}\.\d{1,3}$/.test(hostname) ||
        /^10\.\d{1,3}\.\d{1,3}\.\d{1,3}$/.test(hostname) ||
        /^172\.(1[6-9]|2\d|3[0-1])\.\d{1,3}\.\d{1,3}$/.test(hostname)
    );
}

/** Normalize API base URL during Vite dev (private hosts → http; public hosts → https to avoid redirect CORS). */
function normalizeDevApiUrl(url) {
    if (!url || import.meta.env.PROD) {
        return url;
    }
    const trimmed = String(url).trim();
    try {
        const parsed = new URL(trimmed);
        if (parsed.protocol === 'https:' && isPrivateDevHostname(parsed.hostname)) {
            parsed.protocol = 'http:';
            console.warn(
                '[SeoDashboard] Switched API URL from https:// to http:// for a local/private host. ' +
                    'The PHP built-in server has no TLS; use http:// or Laragon/nginx HTTPS.'
            );
        } else if (parsed.protocol === 'http:' && !isPrivateDevHostname(parsed.hostname)) {
            parsed.protocol = 'https:';
            console.warn(
                '[SeoDashboard] Switched API URL from http:// to https:// for a public host. ' +
                    'HTTP→HTTPS redirects break CORS on cross-origin POST requests.'
            );
        }
        return parsed.toString().replace(/\/$/, '');
    } catch {
        return trimmed.replace(/\/$/, '');
    }
}

window.axios = axios;
window.axios.defaults.headers.common['X-Requested-With'] = 'XMLHttpRequest';

const envApi = import.meta.env.VITE_API_URL;
const hasExplicitApi =
    envApi !== undefined && envApi !== null && String(envApi).trim() !== '';

if (import.meta.env.DEV) {
    window.axios.defaults.baseURL = hasExplicitApi ? normalizeDevApiUrl(String(envApi)) : '';
} else {
    window.axios.defaults.baseURL = hasExplicitApi ? String(envApi).trim().replace(/\/$/, '') : '';
}

if (import.meta.env.DEV) {
    axios.interceptors.request.use((config) => {
        if (typeof config.baseURL === 'string' && config.baseURL.startsWith('https://')) {
            try {
                if (isPrivateDevHostname(new URL(config.baseURL).hostname)) {
                    config.baseURL = normalizeDevApiUrl(config.baseURL);
                }
            } catch {
                /* ignore */
            }
        }
        if (typeof config.url === 'string' && config.url.startsWith('https://')) {
            try {
                if (isPrivateDevHostname(new URL(config.url).hostname)) {
                    config.url = 'http://' + config.url.slice(8);
                }
            } catch {
                /* ignore */
            }
        }
        return config;
    });
}
