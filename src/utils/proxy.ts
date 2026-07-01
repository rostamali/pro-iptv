const PROXY_URL = import.meta.env.PROD
    ? 'https://ros-tv.rostamsardar449.workers.dev/'
    : '';

export function proxyStream(url: string, ua?: string, ref?: string): string {
    if (!PROXY_URL) return url;
    const params = new URLSearchParams({ url });
    if (ua) params.set('ua', ua);
    if (ref) params.set('ref', ref);
    return `${PROXY_URL}/?${params}`;
}
