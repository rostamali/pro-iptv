export interface StreamSource {
    url: string;
    quality?: 'SD' | 'HD' | 'FHD' | '4K' | 'Auto';
    label?: string; // e.g., "Server 1", "Backup"
    userAgent?: string;
    referer?: string;
}

export interface Channel {
    id: string;
    name: string;
    logo: string;
    categories: ChannelCategory[];
    country: string;
    language: string;
    description?: string;
    source: StreamSource;
    isLive?: boolean;
    isPremium?: boolean;
    tags?: string[];
}

export type ChannelCategory =
    | 'sports'
    | 'news'
    | 'entertainment'
    | 'movies'
    | 'documentary'
    | 'kids'
    | 'music'
    | 'religious'
    | 'general'
    | 'worldcup';
