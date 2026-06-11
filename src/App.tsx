import { useState, useMemo, useEffect, useCallback } from 'react';
import { CHANNELS } from './data/channels';
import CategoryTabs from './components/CategoryTabs';
import ChannelCard from './components/ChannelCard';
import SmartPlayer from './components/SmartPlayer';
import { saveLastChannel, loadLastChannel } from './utils/storage';
import Header from './components/Header';

export default function App() {
    const [activeCategory, setActiveCategory] = useState<string>('all');
    const [search, setSearch] = useState('');

    // ✅ FIX: Lazy initializer — runs ONCE during initial render, no cascading effect
    const [selectedId, setSelectedId] = useState<string | null>(() => {
        const savedId = loadLastChannel();
        const savedExists = savedId && CHANNELS.some((c) => c.id === savedId);
        if (savedExists) return savedId;
        return CHANNELS.length > 0 ? CHANNELS[0].id : null;
    });

    // ✅ Save when channel changes (this is fine — only runs on change, not on mount cascade)
    useEffect(() => {
        if (selectedId) saveLastChannel(selectedId);
    }, [selectedId]);

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

    const selected = useMemo(
        () => CHANNELS.find((c) => c.id === selectedId) || null,
        [selectedId],
    );

    const currentIndex = useMemo(() => {
        if (!selected) return -1;
        return filteredChannels.findIndex((c) => c.id === selected.id);
    }, [selected, filteredChannels]);

    const hasPrev = currentIndex > 0;
    const hasNext =
        currentIndex >= 0 && currentIndex < filteredChannels.length - 1;

    const goPrev = useCallback(() => {
        if (hasPrev) {
            setSelectedId(filteredChannels[currentIndex - 1].id);
        }
    }, [hasPrev, currentIndex, filteredChannels]);

    const goNext = useCallback(() => {
        if (hasNext) {
            setSelectedId(filteredChannels[currentIndex + 1].id);
        }
    }, [hasNext, currentIndex, filteredChannels]);

    useEffect(() => {
        const handleKey = (e: KeyboardEvent) => {
            if (e.target instanceof HTMLInputElement) return;
            if (e.key === 'ArrowLeft') goPrev();
            if (e.key === 'ArrowRight') goNext();
        };
        window.addEventListener('keydown', handleKey);
        return () => window.removeEventListener('keydown', handleKey);
    }, [goPrev, goNext]);

    return (
        <>
            <main>
                <div className="bg-primary-bg min-h-screen">
                    <Header search={search} setSearch={setSearch} />
                    {selected && (
                        <section className="iptv-player">
                            <div className="container">
                                <div className="xl:px-[0px] px-[20px]">
                                    <div className="mb-3 flex items-baseline justify-between">
                                        <div>
                                            <h2 className="text-2xl font-bold">
                                                {selected.name}
                                            </h2>
                                            <p className="text-sm text-gray-400">
                                                {selected.description}
                                            </p>
                                        </div>
                                        <div className="text-xs text-gray-500">
                                            {currentIndex + 1} /{' '}
                                            {filteredChannels.length}
                                        </div>
                                    </div>
                                    <SmartPlayer
                                        channel={selected}
                                        onPrevChannel={goPrev}
                                        onNextChannel={goNext}
                                        hasPrev={hasPrev}
                                        hasNext={hasNext}
                                    />
                                </div>
                            </div>
                        </section>
                    )}
                    <section className="channel-list">
                        <div className="container">
                            <div className="pt-[20px] pb-[60px] xl:px-[0px] px-[20px] flex flex-col gap-5">
                                <CategoryTabs
                                    active={activeCategory}
                                    onChange={setActiveCategory}
                                />
                                <div className="text-sm text-gray-400 flex items-center justify-between">
                                    <span className="text-white text-[14px] font-heading font-normal">
                                        {filteredChannels.length} Channels
                                    </span>
                                    <div className="text-xs">
                                        💡 Use ← → arrow keys to switch
                                    </div>
                                </div>

                                {filteredChannels.length === 0 ? (
                                    <div className="text-center py-20 text-gray-500">
                                        <div className="text-6xl mb-4">🔍</div>
                                        <p>No channels found</p>
                                    </div>
                                ) : (
                                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-[20px]">
                                        {filteredChannels.map((channel) => (
                                            <ChannelCard
                                                key={channel.id}
                                                channel={channel}
                                                isActive={
                                                    channel.id === selectedId
                                                }
                                                onClick={() =>
                                                    setSelectedId(channel.id)
                                                }
                                            />
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    </section>
                </div>
            </main>
        </>
    );
}
