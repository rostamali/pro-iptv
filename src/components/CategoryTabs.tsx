import type { ChannelCategory } from '../types';

const TABS: { id: ChannelCategory | 'all'; label: string }[] = [
    { id: 'all', label: 'All' },
    { id: 'sports', label: 'Sports' },
    { id: 'general', label: 'General' },
    { id: 'documentary', label: 'Documentary' },
    { id: 'news', label: 'News' },
    { id: 'movies', label: 'Movies' },
    { id: 'kids', label: 'Kids' },
    { id: 'worldcup', label: 'World Cup' },
    { id: 'religious', label: 'Religious' },
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
                    {tab.label}
                </button>
            ))}
        </div>
    );
}
