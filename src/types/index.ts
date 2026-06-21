export interface StreamSource {
    url: string;
    quality?: 'SD' | 'HD' | 'FHD' | '4K' | 'Auto';
    label?: string;
    userAgent?: string;
    referer?: string;
}

export interface Channel {
    id: string;
    name: string;
    logo: string;
    categories: ChannelCategory[];
    country: CountryType;
    description?: string;
    source: StreamSource;
    isLive?: boolean;
    isPremium?: boolean;
    tags?: string[];
}

export type CountryType = 'BD' | 'IN' | 'USA' | 'UK' | 'TR' | 'ES' | 'BR';

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
