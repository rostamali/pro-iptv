import type { ChannelCategory } from '../types';

const TABS: { id: ChannelCategory | 'all'; label: string; emoji: string }[] = [
    { id: 'all', label: 'All', emoji: '📺' },
    { id: 'sports', label: 'Sports', emoji: '⚽' },
    { id: 'general', label: 'General', emoji: '🎭' },
    { id: 'documentary', label: 'Documentary', emoji: '🎬' },
    { id: 'news', label: 'News', emoji: '📰' },
    { id: 'movies', label: 'Movies', emoji: '🎥' },
    { id: 'kids', label: 'Kids', emoji: '🧒' },
];

interface Props {
    active: string;
    onChange: (id: string) => void;
}

export default function CategoryTabs({ active, onChange }: Props) {
    return (
        <div className="flex gap-2 flex-wrap">
            {TABS.map((tab) => (
                <button
                    key={tab.id}
                    onClick={() => onChange(tab.id)}
                    className={`category-tab transition-all ${
                        active === tab.id
                            ? 'bg-gradient-to-r from-gradient-primary to-gradient-secondary border border-gradient-primary'
                            : 'bg-card-bg border border-card-border'
                    }`}
                >
                    {/* <span className="mr-1.5">{tab.emoji}</span> */}
                    {tab.label}
                </button>
            ))}
        </div>
    );
}
