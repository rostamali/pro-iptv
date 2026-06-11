// In dev: use Vite proxy (configured below)
// In prod: use your Cloudflare Worker
const PROXY_URL = import.meta.env.PROD
    ? 'https://your-worker.workers.dev' // Replace after deploying
    : ''; // Empty in dev — direct fetch via Vite proxy

export function proxyStream(url: string, ua?: string, ref?: string): string {
    // Some streams work directly without proxy — try direct first
    if (!PROXY_URL) return url;

    const params = new URLSearchParams({ url });
    if (ua) params.set('ua', ua);
    if (ref) params.set('ref', ref);

    return `${PROXY_URL}/?${params}`;
}
