import { useState, useMemo } from 'react';
import { CHANNELS } from './data/channels';
import CategoryTabs from './components/CategoryTabs';
import ChannelCard from './components/ChannelCard';
import SmartPlayer from './components/SmartPlayer';
import type { Channel } from './types';
import './App.css';
import Header from './components/Header';
import Footer from './components/Footer';

export default function App() {
    const [activeCategory, setActiveCategory] = useState<string>('all');
    const [search, setSearch] = useState('');
    const [selected, setSelected] = useState<Channel | null>(null);

    const filteredChannels = useMemo(() => {
        let list = CHANNELS;
        if (activeCategory !== 'all') {
            list = list.filter((c) => c.category === activeCategory);
        }
        if (search) {
            const q = search.toLowerCase();
            list = list.filter(
                (c) =>
                    c.name.toLowerCase().includes(q) ||
                    c.tags?.some((t) => t.toLowerCase().includes(q)),
            );
        }
        return list;
    }, [activeCategory, search]);

    return (
        <div className="bg-primary-bg">
            {/* Header */}
            <Header search={search} setSearch={setSearch} />

            {/* Player Modal */}
            {selected && (
                <div className="container">
                    <div>
                        <div className="flex items-center justify-between mb-3">
                            <div>
                                <h2 className="text-2xl font-bold">
                                    {selected.name}
                                </h2>
                                <p className="text-sm text-gray-400">
                                    {selected.description}
                                </p>
                            </div>
                            <button
                                onClick={() => setSelected(null)}
                                className="w-10 h-10 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center text-xl"
                            >
                                ✕
                            </button>
                        </div>
                        <SmartPlayer channel={selected} />
                        <div className="mt-3 flex flex-wrap gap-2">
                            {selected.tags?.map((tag) => (
                                <span
                                    key={tag}
                                    className="px-3 py-1 bg-white/10 rounded-full text-xs"
                                >
                                    #{tag}
                                </span>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {/* Tabs */}
            <CategoryTabs
                active={activeCategory}
                onChange={setActiveCategory}
            />

            {/* Grid */}
            <main className="max-w-7xl mx-auto p-4">
                <div className="mb-4 text-sm text-gray-400">
                    {filteredChannels.length} channels
                </div>

                {filteredChannels.length === 0 ? (
                    <div className="text-center py-20 text-gray-500">
                        <div className="text-6xl mb-4">🔍</div>
                        <p>No channels found</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                        {filteredChannels.map((channel) => (
                            <ChannelCard
                                key={channel.id}
                                channel={channel}
                                onClick={() => setSelected(channel)}
                            />
                        ))}
                    </div>
                )}
            </main>
            <Footer />
        </div>
    );
}
