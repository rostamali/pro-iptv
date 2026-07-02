const PROXY_URL = import.meta.env.PROD
    ? 'https://ros-tv.rostamsardar449.workers.dev' // ✅ Your worker
    : '';

/**
 * Route a stream URL through the Cloudflare Worker proxy.
 * @param url - The original stream URL
 * @param useProxy - Whether to proxy this stream (default: false)
 * @param ua - Optional custom User-Agent
 * @param ref - Optional custom Referer
 */
export function proxyStream(
    url: string,
    useProxy: boolean = false, // ✅ NEW — opt-in per channel
    ua?: string,
    ref?: string,
): string {
    // ✅ If proxy is not requested OR no proxy URL configured, return direct URL
    if (!useProxy || !PROXY_URL) return url;

    const params = new URLSearchParams({ url });
    if (ua) params.set('ua', ua);
    if (ref) params.set('ref', ref);
    return `${PROXY_URL}/?${params}`;
}
