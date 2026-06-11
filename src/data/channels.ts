import type { Channel } from '../types';

export const CHANNELS: Channel[] = [
    {
        id: 't-sports-sd',
        name: 'T Sports',
        logo: '/channel-logos/t-sports.svg',
        category: 'sports',
        country: 'BD',
        language: 'Bengali',
        isLive: true,
        source: {
            url: 'https://tvsen7.aynaott.com/tsports-hd/tracks-v1a1/mono.ts.m3u8',
            quality: 'SD',
            label: 'SD',
        },
    },
    {
        id: 't-sports-hd',
        name: 'T Sports HD',
        logo: '/channel-logos/t-sports.svg',
        category: 'sports',
        country: 'BD',
        language: 'Bengali',
        isLive: true,
        source: {
            url: 'https://tvsen1.aynaott.com/YNMn5kZz8aLm/index.m3u8',
            quality: 'HD',
            label: 'HD',
        },
    },
    {
        id: 'boishakhi-tv-sd',
        name: 'Boishakhi TV',
        logo: '/channel-logos/boishakhi-tv.svg',
        category: 'general',
        country: 'BD',
        language: 'Bengali',
        isLive: true,
        source: {
            url: 'https://boishakhi.sonarbanglatv.com/boishakhi/boishakhitv/index.m3u8',
            quality: 'SD',
            label: 'SD',
        },
    },
    {
        id: 'boishakhi-tv-hd',
        name: 'Boishakhi TV',
        logo: '/channel-logos/boishakhi-tv.svg',
        category: 'general',
        country: 'BD',
        language: 'Bengali',
        isLive: true,
        source: {
            url: 'https://tvsen6.aynaott.com/boishakhitv/index.m3u8?e=1779178086&u=617d0e90-2bc6-4dc5-8897-f5638f8fd01a&token=ce52fc5744a41d23b1b37bdb89b4b9a4',
            quality: 'HD',
            label: 'HD',
        },
    },
    {
        id: 'channel-24',
        name: 'Channel 24',
        logo: '/channel-logos/channel-24.svg',
        category: 'news',
        country: 'BD',
        language: 'Bengali',
        isLive: true,
        source: {
            url: 'https://owrcovcrpy.gpcdn.net/bpk-tv/1703/output/index.m3u8',
            quality: 'HD',
            label: 'Server 1 (Boishakhi)',
        },
    },
    {
        id: 'somoy-tv1',
        name: 'Somoy TV',
        logo: '/channel-logos/somoy-tv.svg',
        category: 'news',
        country: 'BD',
        language: 'Bengali',
        isLive: true,
        source: {
            url: 'https://tvsen6.aynaott.com/somoytv/index.m3u8?e=1779178082&u=617d0e90-2bc6-4dc5-8897-f5638f8fd01a&token=1d4e7c85a1be459e27e7fd3be1fb6287',
            quality: 'HD',
            label: 'Server 1 (Boishakhi)',
        },
    },
    {
        id: 'somoy-tv2',
        name: 'Somoy TV',
        logo: '/channel-logos/somoy-tv.svg',
        category: 'news',
        country: 'BD',
        language: 'Bengali',
        isLive: true,
        source: {
            url: 'https://owrcovcrpy.gpcdn.net/bpk-tv/1702/output/index.m3u8',
            quality: 'HD',
            label: 'Server 2 (Boishakhi)',
        },
    },
    {
        id: 'somoy-tv3',
        name: 'Somoy TV',
        logo: '/channel-logos/somoy-tv.svg',
        category: 'news',
        country: 'BD',
        language: 'Bengali',
        isLive: true,
        source: {
            url: 'https://owrcovcrpy.gpcdn.net/bpk-tv/1702/output/1702-audio_113322_eng=113200-video=2202800.m3u8',
            quality: 'HD',
            label: 'Server 3 (Boishakhi)',
        },
    },
    {
        id: 'tom-and-jerry',
        name: 'Tom & Jerry',
        logo: '/channel-logos/tom-and-jerry.png',
        category: 'kids',
        country: 'USA',
        language: 'English',
        isLive: true,
        source: {
            url: 'https://live20.bozztv.com/giatvplayout7/giatv-208314/tracks-v1a1/mono.ts.m3u8',
            quality: 'HD',
            label: 'Server 1 (Boishakhi)',
        },
    },

    {
        id: 'btv-sd',
        name: 'BTV SD',
        logo: '/channel-logos/btv.svg',
        category: 'general',
        country: 'BD',
        language: 'Bengali',
        isLive: true,
        source: {
            url: 'https://tvsen6.aynaott.com/btvhd/index.m3u8?e=1779178087&u=617d0e90-2bc6-4dc5-8897-f5638f8fd01a&token=bb5352dc1048fb789edc89521e865312',
            quality: 'HD',
            label: 'Server 2 (Aynaott)',
        },
    },
    {
        id: 'btv-hd',
        name: 'BTV HD',
        logo: '/channel-logos/btv.svg',
        category: 'general',
        country: 'BD',
        language: 'Bengali',
        isLive: true,
        source: {
            url: 'https://owrcovcrpy.gpcdn.net/bpk-tv/1709/output/index.m3u8',
            quality: 'SD',
            label: 'Server 1 (GPCDN)',
        },
    },
    {
        id: 'discovery',
        name: 'Discovery',
        logo: '/channel-logos/discovery.svg',
        category: 'documentary',
        country: 'USA',
        language: 'Hindi',
        isLive: true,
        source: {
            url: 'https://ottbanglaplatform.com/tv/toffee/live.php?id=discovery_sd&e=.m3u8',
            quality: 'SD',
            label: 'Server 1 (Toffee)',
        },
    },
    {
        id: 'cazetv',
        name: 'CAZE TV',
        logo: '/channel-logos/caze-tv.svg',
        category: 'sports',
        country: 'BR',
        language: 'Brazil',
        isLive: true,
        source: {
            url: 'https://dfr80qz435crc.cloudfront.net/MNOP/Amagi/Caze/Caze_TV_BR/1080p-vtt/index.m3u8',
            quality: 'HD',
            label: 'CAZE TV',
        },
    },
    {
        id: 'fifa-plus',
        name: 'Fifa +',
        logo: '/channel-logos/caze-tv.svg',
        category: 'sports',
        country: 'USA',
        language: 'English',
        isLive: true,
        source: {
            url: 'https://a62dad94.wurl.com/master/f36d25e7e52f1ba8d7e56eb859c636563214f541/UmFrdXRlblRWLWV1X0ZJRkFQbHVzRW5nbGlzaF9ITFM/playlist.m3u8',
            quality: 'HD',
            label: 'Fifa +',
        },
    },
    {
        id: 'goldmines-movies',
        name: 'GoldMines Movies',
        logo: '/channel-logos/goldmines-movies.png',
        category: 'movies',
        country: 'IN',
        language: 'Hindi',
        isLive: true,
        source: {
            url: 'https://cdn-2.pishow.tv/live/1461/master.m3u8',
            quality: 'HD',
            label: 'Fifa +',
        },
    },
];

// Helpers
export const getChannelsByCategory = (cat: string) =>
    CHANNELS.filter((c) => c.category === cat);

export const getChannelById = (id: string) => CHANNELS.find((c) => c.id === id);

export const getAllCategories = () =>
    Array.from(new Set(CHANNELS.map((c) => c.category)));
