import { useEffect, useRef, useState } from 'react';
import Hls from 'hls.js';
import { usePlayChannel } from '../hooks/usePlayChannel';
import { proxyStream } from '../utils/proxy';
import type { Channel } from '../types';

interface Props {
    channel: Channel;
}

export default function SmartPlayer({ channel }: Props) {
    const videoRef = useRef<HTMLVideoElement>(null);
    const playerRef = useRef<HTMLDivElement>(null);
    const hlsRef = useRef<Hls | null>(null);

    const [loading, setLoading] = useState(true);
    const [isPlaying, setIsPlaying] = useState(true);
    const [volume, setVolume] = useState(1);
    const [isMuted, setIsMuted] = useState(false);

    const {
        currentSource,
        currentIdx,
        availableSources,
        totalSources,
        failedCount,
        tryNext,
        switchTo,
        reset,
        hasWorkingSource,
    } = usePlayChannel(channel.sources);

    useEffect(() => {
        const video = videoRef.current;

        if (!video || !currentSource) return;

        setLoading(true);

        hlsRef.current?.destroy();

        const streamUrl = proxyStream(
            currentSource.url,
            currentSource.userAgent,
            currentSource.referer,
        );

        if (Hls.isSupported()) {
            const hls = new Hls({
                manifestLoadingTimeOut: 10000,
                manifestLoadingMaxRetry: 1,
                levelLoadingTimeOut: 10000,
                fragLoadingTimeOut: 10000,
                lowLatencyMode: true,
            });

            hlsRef.current = hls;

            hls.loadSource(streamUrl);
            hls.attachMedia(video);

            hls.on(Hls.Events.MANIFEST_PARSED, () => {
                setLoading(false);

                video
                    .play()
                    .then(() => setIsPlaying(true))
                    .catch(() => setIsPlaying(false));
            });

            hls.on(Hls.Events.ERROR, (_, data) => {
                if (data.fatal) {
                    console.warn(
                        `[Player] Fatal error on source ${currentIdx + 1}`,
                        data.type,
                    );

                    tryNext();
                }
            });
        } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
            video.src = streamUrl;

            video.addEventListener('loadedmetadata', () => {
                setLoading(false);

                video
                    .play()
                    .then(() => setIsPlaying(true))
                    .catch(() => setIsPlaying(false));
            });

            video.addEventListener('error', () => {
                tryNext();
            });
        }

        return () => {
            hlsRef.current?.destroy();
        };
    }, [currentSource, currentIdx, tryNext]);

    const togglePlay = () => {
        const video = videoRef.current;

        if (!video) return;

        if (video.paused) {
            video.play();
            setIsPlaying(true);
        } else {
            video.pause();
            setIsPlaying(false);
        }
    };

    const toggleMute = () => {
        const video = videoRef.current;

        if (!video) return;

        video.muted = !video.muted;
        setIsMuted(video.muted);
    };

    const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = Number(e.target.value);

        setVolume(value);

        const video = videoRef.current;

        if (video) {
            video.volume = value;

            if (value > 0) {
                video.muted = false;
                setIsMuted(false);
            }
        }
    };

    const goNext = () => {
        tryNext();
    };

    const goPrevious = () => {
        if (currentIdx > 0) {
            switchTo(currentIdx - 1);
        }
    };

    const enterFullscreen = () => {
        if (playerRef.current?.requestFullscreen) {
            playerRef.current.requestFullscreen();
        }
    };

    if (!hasWorkingSource) {
        return (
            <div className="aspect-video bg-black flex flex-col items-center justify-center text-white rounded-lg">
                <div className="text-5xl mb-4">📡</div>

                <p className="text-xl mb-2">All Servers Offline</p>

                <p className="text-sm text-gray-400 mb-4">
                    Tried all {totalSources} source
                    {totalSources > 1 ? 's' : ''} for {channel.name}
                </p>

                <button
                    onClick={reset}
                    className="px-6 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg"
                >
                    Retry All Servers
                </button>
            </div>
        );
    }

    return (
        <div
            ref={playerRef}
            className="bg-card-bg border border-card-border rounded-[20px] overflow-hidden p-[5px]"
        >
            <div className="rounded-[18px] overflow-hidden">
                <div className="relative aspect-video">
                    <video
                        ref={videoRef}
                        autoPlay
                        playsInline
                        className="w-full h-full bg-black"
                    />

                    {loading && (
                        <div className="absolute inset-0 flex items-center justify-center bg-black/70">
                            <div className="text-center">
                                <div className="animate-spin h-12 w-12 border-4 border-white border-t-transparent rounded-full mx-auto mb-3" />

                                <p className="text-white text-sm">
                                    Loading {currentSource?.label}...
                                </p>
                            </div>
                        </div>
                    )}

                    <div className="absolute top-3 right-3 bg-red-600 text-white text-xs px-3 py-1 rounded-full flex items-center gap-2">
                        <span className="w-2 h-2 bg-white rounded-full animate-pulse" />
                        LIVE · {currentSource?.quality}
                    </div>
                </div>
            </div>

            {/* Custom Controls */}
            <div className="grid grid-cols-3 items-center py-[30px] px-[45px]">
                <div className="flex">
                    <button
                        onClick={toggleMute}
                        className="player-controller__btn h-[32px] w-[32px]"
                    >
                        {isMuted ? (
                            <svg
                                id="volumeIcon"
                                width="15"
                                height="15"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                stroke-width="2"
                                stroke-linecap="round"
                                stroke-linejoin="round"
                            >
                                <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon>
                                <line x1="23" y1="9" x2="17" y2="15"></line>
                                <line x1="17" y1="9" x2="23" y2="15"></line>
                            </svg>
                        ) : (
                            <svg
                                fill="none"
                                height="15"
                                id="volumeIcon"
                                stroke="currentColor"
                                stroke-linecap="round"
                                stroke-linejoin="round"
                                stroke-width="2"
                                viewBox="0 0 24 24"
                                width="15"
                            >
                                <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon>
                                <path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07"></path>
                            </svg>
                        )}
                    </button>

                    <div className="flex items-center gap-2">
                        <input
                            type="range"
                            min="0"
                            max="1"
                            step="0.01"
                            value={volume}
                            onChange={handleVolumeChange}
                            className="w-32"
                        />

                        <span className="text-white text-sm w-10">
                            {Math.round(volume * 100)}%
                        </span>
                    </div>
                </div>
                <div className="flex items-center gap-[20px] justify-center">
                    <button
                        onClick={goPrevious}
                        className="player-controller__btn h-[40px] w-[40px]"
                    >
                        <svg
                            fill="none"
                            height="18"
                            stroke="currentColor"
                            stroke-linecap="round"
                            stroke-linejoin="round"
                            stroke-width="2.2"
                            viewBox="0 0 24 24"
                            width="18"
                        >
                            <polygon points="19 20 9 12 19 4 19 20"></polygon>
                            <line x1="5" x2="5" y1="19" y2="5"></line>
                        </svg>
                    </button>

                    <button
                        onClick={togglePlay}
                        className="player-controller-play__btn h-[54px] w-[54px]"
                    >
                        {isPlaying ? (
                            <>
                                <svg
                                    id="playIcon"
                                    width="22"
                                    height="22"
                                    viewBox="0 0 24 24"
                                    fill="currentColor"
                                    stroke="none"
                                >
                                    <rect
                                        x="6"
                                        y="4"
                                        width="4"
                                        height="16"
                                        rx="1"
                                    ></rect>
                                    <rect
                                        x="14"
                                        y="4"
                                        width="4"
                                        height="16"
                                        rx="1"
                                    ></rect>
                                </svg>
                            </>
                        ) : (
                            '▶'
                        )}
                    </button>

                    <button
                        onClick={goNext}
                        className="player-controller__btn h-[40px] w-[40px]"
                    >
                        <svg
                            fill="none"
                            height="18"
                            stroke="currentColor"
                            stroke-linecap="round"
                            stroke-linejoin="round"
                            stroke-width="2.2"
                            viewBox="0 0 24 24"
                            width="18"
                        >
                            <polygon points="5 4 15 12 5 20 5 4"></polygon>
                            <line x1="19" x2="19" y1="5" y2="19"></line>
                        </svg>
                    </button>
                </div>

                <div className="flex justify-end">
                    <button
                        onClick={enterFullscreen}
                        className="player-controller__btn h-[32px] w-[32px]"
                    >
                        <svg
                            fill="none"
                            height="15"
                            stroke="currentColor"
                            stroke-linecap="round"
                            stroke-linejoin="round"
                            stroke-width="2"
                            viewBox="0 0 24 24"
                            width="15"
                        >
                            <path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3"></path>
                        </svg>
                    </button>
                </div>
            </div>

            {/* Server Selector */}
            {availableSources.length > 1 && (
                <div className="bg-gray-950 p-3 flex flex-wrap gap-2">
                    <span className="text-gray-400 text-sm self-center mr-2">
                        Servers ({failedCount} failed):
                    </span>

                    {availableSources.map((src, idx) => (
                        <button
                            key={src.url}
                            onClick={() => switchTo(idx)}
                            className={`px-3 py-1 text-sm rounded-full transition ${
                                idx === currentIdx
                                    ? 'bg-purple-600 text-white'
                                    : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                            }`}
                        >
                            {src.label || `Server ${idx + 1}`}
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
}
