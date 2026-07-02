const PROXY_URL = 'https://ros-tv.rostamsardar449.workers.dev';

type ProxyStream = {
    url: string;
    useProxy?: boolean;
};
export function proxyStream({ url, useProxy = false }: ProxyStream): string {
    if (!useProxy) return url;

    const params = new URLSearchParams({ url });
    return `${PROXY_URL}/?${params}`;
}
// type ProxyStream = {
//     url: string;
// };
// export function proxyStream({ url }: ProxyStream): string {
//     return url;
// }
