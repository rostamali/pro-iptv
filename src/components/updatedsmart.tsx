import { useEffect, useRef, useState } from 'react';
import Hls from 'hls.js';
import { usePlayChannel } from '../hooks/usePlayChannel';
import { useAutoHideControls } from '../hooks/useAutoHideControls';
import { useFullscreen } from '../hooks/useFullscreen';
import { proxyStream } from '../utils/proxy';
import { loadVolume, saveVolume, loadMuted, saveMuted } from '../utils/storage';
import VolumeControl from './VolumeControl';
import type { Channel } from '../types';

interface Props {
    channel: Channel;
    onPrevChannel: () => void;
    onNextChannel: () => void;
    hasPrev: boolean;
    hasNext: boolean;
}

export default function SmartPlayer({
    channel,
    onPrevChannel,
    onNextChannel,
    hasPrev,
    hasNext,
}: Props) {
    const containerRef = useRef<HTMLDivElement>(null);
    const videoRef = useRef<HTMLVideoElement>(null);
    const hlsRef = useRef<Hls | null>(null);

    const [loading, setLoading] = useState(true);
    const [isPlaying, setIsPlaying] = useState(false);
    const [volume, setVolume] = useState(() => loadVolume());
    const [muted, setMuted] = useState(() => loadMuted());

    const { isFullscreen, toggle: toggleFullscreen } =
        useFullscreen(containerRef);
    const {
        visible: controlsVisible,
        show: showControls,
        lock,
        unlock,
    } = useAutoHideControls(3000);

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

    // ✅ Reset stream sources cleanly when channel changes
    useEffect(() => {
        reset();
        // Don't reset volume/muted/fullscreen — those persist across channels
    }, [channel.id, reset]);

    // Stream loading
    useEffect(() => {
        const video = videoRef.current;
        if (!video || !currentSource) return;

        let cancelled = false;
        hlsRef.current?.destroy();

        const streamUrl = proxyStream(
            currentSource.url,
            currentSource.userAgent,
            currentSource.referer,
        );

        const onPlay = () => setIsPlaying(true);
        const onPause = () => setIsPlaying(false);
        const onWaiting = () => setLoading(true);
        const onPlaying = () => setLoading(false);
        const onCanPlay = () => setLoading(false);
        const onVolumeChange = () => {
            // Sync state from video element (e.g. when set programmatically)
            setVolume(video.volume);
            setMuted(video.muted);
        };

        video.addEventListener('play', onPlay);
        video.addEventListener('pause', onPause);
        video.addEventListener('waiting', onWaiting);
        video.addEventListener('playing', onPlaying);
        video.addEventListener('canplay', onCanPlay);
        video.addEventListener('volumechange', onVolumeChange);

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
                if (cancelled) return;
                video.play().catch(() => {});
            });
            hls.on(Hls.Events.ERROR, (_, data) => {
                if (cancelled) return;
                if (data.fatal) tryNext();
            });
        } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
            video.src = streamUrl;
        }

        return () => {
            cancelled = true;
            hlsRef.current?.destroy();
            video.removeEventListener('play', onPlay);
            video.removeEventListener('pause', onPause);
            video.removeEventListener('waiting', onWaiting);
            video.removeEventListener('playing', onPlaying);
            video.removeEventListener('canplay', onCanPlay);
            video.removeEventListener('volumechange', onVolumeChange);
        };
    }, [currentSource, currentIdx, tryNext]);

    // Apply volume/muted to video element when state changes
    useEffect(() => {
        const video = videoRef.current;
        if (!video) return;
        video.volume = volume;
        video.muted = muted;
        saveVolume(volume);
        saveMuted(muted);
    }, [volume, muted]);

    const togglePlayPause = () => {
        const video = videoRef.current;
        if (!video) return;
        if (video.paused) video.play().catch(() => {});
        else video.pause();
    };

    const handleVolumeChange = (v: number) => {
        setVolume(v);
        if (v > 0 && muted) setMuted(false);
    };

    const toggleMute = () => setMuted((m) => !m);

    // Click on video → toggle controls (in fullscreen) or play/pause (windowed)
    const handleVideoClick = () => {
        if (isFullscreen) {
            showControls();
        } else {
            togglePlayPause();
        }
    };

    if (!hasWorkingSource) {
        return (
            <div className="bg-black rounded-lg overflow-hidden">
                <div className="aspect-video flex flex-col items-center justify-center text-white p-6">
                    <div className="text-5xl mb-4">📡</div>
                    <p className="text-xl mb-2">All Servers Offline</p>
                    <p className="text-sm text-gray-400 mb-4">
                        Tried all {totalSources} source
                        {totalSources > 1 ? 's' : ''} for {channel.name}
                    </p>
                    <div className="flex gap-2">
                        <button
                            onClick={reset}
                            className="px-6 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg transition"
                        >
                            🔄 Retry All
                        </button>
                        {hasNext && (
                            <button
                                onClick={onNextChannel}
                                className="px-6 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg transition"
                            >
                                ⏭ Next Channel
                            </button>
                        )}
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-black rounded-lg overflow-hidden">
            <div
                ref={containerRef}
                className={`relative bg-black ${
                    isFullscreen ? 'w-screen h-screen' : 'aspect-video'
                }`}
                onMouseMove={isFullscreen ? showControls : undefined}
            >
                {/* Video — NO native controls */}
                <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    onClick={handleVideoClick}
                    className="w-full h-full cursor-pointer"
                />

                {/* Loading spinner */}
                {loading && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/60 pointer-events-none z-20">
                        <div className="text-center">
                            <div className="animate-spin h-12 w-12 border-4 border-white border-t-transparent rounded-full mx-auto mb-2" />
                            <p className="text-white text-sm">
                                Loading {currentSource?.label}...
                            </p>
                        </div>
                    </div>
                )}

                {/* Live badge */}
                <div className="absolute top-3 right-3 bg-red-600 text-white text-xs px-3 py-1 rounded-full flex items-center gap-1.5 z-10">
                    <span className="w-2 h-2 bg-white rounded-full animate-pulse" />
                    LIVE · {currentSource?.quality}
                </div>

                {/* Channel name in fullscreen */}
                {isFullscreen && controlsVisible && (
                    <div className="absolute top-4 left-4 z-30 text-white">
                        <h2 className="text-2xl font-bold drop-shadow-lg">
                            {channel.name}
                        </h2>
                        <p className="text-sm text-gray-300 drop-shadow-lg">
                            {channel.country} · {currentSource?.label}
                        </p>
                    </div>
                )}

                {/* ─── FULLSCREEN OVERLAY CONTROLS ─── */}
                {isFullscreen && (
                    <div
                        onMouseEnter={lock}
                        onMouseLeave={unlock}
                        className={`absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/90 via-black/60 to-transparent p-6 transition-opacity duration-300 z-20 ${
                            controlsVisible
                                ? 'opacity-100'
                                : 'opacity-0 pointer-events-none'
                        }`}
                    >
                        <div className="flex items-center justify-between gap-4 max-w-5xl mx-auto">
                            {/* Left: Volume */}
                            <VolumeControl
                                volume={volume}
                                muted={muted}
                                onVolumeChange={handleVolumeChange}
                                onToggleMute={toggleMute}
                            />

                            {/* Center: Channel + Play */}
                            <div className="flex items-center gap-3">
                                <button
                                    onClick={onPrevChannel}
                                    disabled={!hasPrev}
                                    className="w-12 h-12 rounded-full bg-white/10 hover:bg-purple-600 disabled:opacity-30 disabled:hover:bg-white/10 transition flex items-center justify-center text-white"
                                    title="Previous Channel"
                                >
                                    <svg
                                        className="w-6 h-6"
                                        fill="currentColor"
                                        viewBox="0 0 24 24"
                                    >
                                        <path d="M6 6h2v12H6zm3.5 6l8.5 6V6z" />
                                    </svg>
                                </button>

                                <button
                                    onClick={togglePlayPause}
                                    className="w-16 h-16 rounded-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 transition flex items-center justify-center text-white shadow-2xl"
                                >
                                    {isPlaying ? (
                                        <svg
                                            className="w-8 h-8"
                                            fill="currentColor"
                                            viewBox="0 0 24 24"
                                        >
                                            <path d="M6 4h4v16H6zM14 4h4v16h-4z" />
                                        </svg>
                                    ) : (
                                        <svg
                                            className="w-8 h-8 ml-1"
                                            fill="currentColor"
                                            viewBox="0 0 24 24"
                                        >
                                            <path d="M8 5v14l11-7z" />
                                        </svg>
                                    )}
                                </button>

                                <button
                                    onClick={onNextChannel}
                                    disabled={!hasNext}
                                    className="w-12 h-12 rounded-full bg-white/10 hover:bg-purple-600 disabled:opacity-30 disabled:hover:bg-white/10 transition flex items-center justify-center text-white"
                                    title="Next Channel"
                                >
                                    <svg
                                        className="w-6 h-6"
                                        fill="currentColor"
                                        viewBox="0 0 24 24"
                                    >
                                        <path d="M6 18l8.5-6L6 6v12zM16 6h2v12h-2z" />
                                    </svg>
                                </button>
                            </div>

                            {/* Right: Exit Fullscreen */}
                            <button
                                onClick={toggleFullscreen}
                                className="w-10 h-10 rounded-full hover:bg-white/10 flex items-center justify-center text-white transition"
                                title="Exit Fullscreen"
                            >
                                <svg
                                    className="w-6 h-6"
                                    fill="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path d="M5 16h3v3h2v-5H5v2zm3-8H5v2h5V5H8v3zm6 11h2v-3h3v-2h-5v5zm2-11V5h-2v5h5V8h-3z" />
                                </svg>
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* ─── WINDOWED MODE: Controls under the video ─── */}
            {!isFullscreen && (
                <>
                    <div className="bg-gray-900 p-3 flex items-center justify-between gap-3 border-t border-white/10">
                        {/* Left: Volume */}
                        <VolumeControl
                            volume={volume}
                            muted={muted}
                            onVolumeChange={handleVolumeChange}
                            onToggleMute={toggleMute}
                        />

                        {/* Center: Channel + Play/Pause */}
                        <div className="flex items-center gap-3">
                            <button
                                onClick={onPrevChannel}
                                disabled={!hasPrev}
                                className="w-12 h-12 rounded-full bg-gray-800 hover:bg-purple-600 disabled:opacity-30 disabled:hover:bg-gray-800 transition flex items-center justify-center text-white"
                                title="Previous Channel"
                            >
                                <svg
                                    className="w-6 h-6"
                                    fill="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path d="M6 6h2v12H6zm3.5 6l8.5 6V6z" />
                                </svg>
                            </button>

                            <button
                                onClick={togglePlayPause}
                                className="w-14 h-14 rounded-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 transition flex items-center justify-center text-white shadow-lg"
                            >
                                {isPlaying ? (
                                    <svg
                                        className="w-7 h-7"
                                        fill="currentColor"
                                        viewBox="0 0 24 24"
                                    >
                                        <path d="M6 4h4v16H6zM14 4h4v16h-4z" />
                                    </svg>
                                ) : (
                                    <svg
                                        className="w-7 h-7 ml-1"
                                        fill="currentColor"
                                        viewBox="0 0 24 24"
                                    >
                                        <path d="M8 5v14l11-7z" />
                                    </svg>
                                )}
                            </button>

                            <button
                                onClick={onNextChannel}
                                disabled={!hasNext}
                                className="w-12 h-12 rounded-full bg-gray-800 hover:bg-purple-600 disabled:opacity-30 disabled:hover:bg-gray-800 transition flex items-center justify-center text-white"
                                title="Next Channel"
                            >
                                <svg
                                    className="w-6 h-6"
                                    fill="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path d="M6 18l8.5-6L6 6v12zM16 6h2v12h-2z" />
                                </svg>
                            </button>
                        </div>

                        {/* Right: Fullscreen */}
                        <button
                            onClick={toggleFullscreen}
                            className="w-10 h-10 rounded-full hover:bg-white/10 flex items-center justify-center text-white transition"
                            title="Fullscreen"
                        >
                            <svg
                                className="w-6 h-6"
                                fill="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path d="M7 14H5v5h5v-2H7v-3zm-2-4h2V7h3V5H5v5zm12 7h-3v2h5v-5h-2v3zM14 5v2h3v3h2V5h-5z" />
                            </svg>
                        </button>
                    </div>

                    {/* Server selector */}
                    {availableSources.length > 1 && (
                        <div className="bg-gray-900 px-3 pb-3 flex flex-wrap gap-2 justify-center border-t border-white/5 pt-3">
                            <span className="text-gray-400 text-xs self-center mr-2">
                                Servers ({failedCount} failed):
                            </span>
                            {availableSources.map((src, idx) => (
                                <button
                                    key={src.url}
                                    onClick={() => switchTo(idx)}
                                    className={`px-3 py-1 text-xs rounded-full transition ${
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
                </>
            )}
        </div>
    );
}
