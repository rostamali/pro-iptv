import { useEffect, useRef, useState, useMemo } from 'react';
import Hls from 'hls.js';
import { usePlayChannel } from '../hooks/usePlayChannel';
import { useAutoHideControls } from '../hooks/useAutoHideControls';
import { useFullscreen } from '../hooks/useFullscreen';
import { proxyStream } from '../utils/proxy';
import { isTouchDevice } from '../utils/device';
import { loadVolume, saveVolume, loadMuted, saveMuted } from '../utils/storage';
import type { Channel } from '../types';
import PlayerController from './PlayerController';

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
    const wasFullscreenRef = useRef(false);

    const [fillMode, setFillMode] = useState<'contain' | 'cover'>('contain');

    const toggleFillMode = () => {
        setFillMode((m) => (m === 'contain' ? 'cover' : 'contain'));
    };

    // ✅ Detect touch device once
    const isTouch = useMemo(() => isTouchDevice(), []);

    const [loading, setLoading] = useState(true);
    const [isPlaying, setIsPlaying] = useState(false);
    const [volume, setVolume] = useState(() => loadVolume());
    const [muted, setMuted] = useState(() => loadMuted());

    const { isFullscreen, toggle: toggleFullscreen } =
        useFullscreen(containerRef);
    const {
        visible: controlsVisible,
        show: showControls,
        toggle: toggleControls, // ✅ NEW
        lock,
        unlock,
    } = useAutoHideControls(3000);

    const { source, failed, markFailed, reset, hasWorkingSource } =
        usePlayChannel(channel.source);

    // ... [keep all your existing useEffects unchanged] ...

    // Track fullscreen state for safety net
    useEffect(() => {
        wasFullscreenRef.current = isFullscreen;
    }, [isFullscreen]);

    useEffect(() => {
        reset();
    }, [channel.id, reset]);

    useEffect(() => {
        if (
            wasFullscreenRef.current &&
            !document.fullscreenElement &&
            containerRef.current
        ) {
            const id = window.setTimeout(() => {
                if (wasFullscreenRef.current && !document.fullscreenElement) {
                    containerRef.current?.requestFullscreen().catch(() => {});
                }
            }, 100);
            return () => window.clearTimeout(id);
        }
    }, [channel.id]);

    // ... [stream loading effect unchanged] ...
    useEffect(() => {
        const video = videoRef.current;
        if (!video || failed) return;

        let cancelled = false;
        const oldHls = hlsRef.current;

        const streamUrl = proxyStream(
            source.url,
            source.userAgent,
            source.referer,
        );

        const onPlay = () => setIsPlaying(true);
        const onPause = () => setIsPlaying(false);
        const onWaiting = () => setLoading(true);
        const onPlaying = () => setLoading(false);
        const onCanPlay = () => setLoading(false);
        const onVolumeChange = () => {
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

            hls.loadSource(streamUrl);
            hls.attachMedia(video);
            hlsRef.current = hls;

            hls.on(Hls.Events.MANIFEST_PARSED, () => {
                if (cancelled) return;
                if (oldHls && oldHls !== hls) oldHls.destroy();
                video.play().catch(() => {});
            });

            hls.on(Hls.Events.ERROR, (_, data) => {
                if (cancelled) return;
                if (data.fatal) {
                    console.warn(`[Player] Fatal error on ${channel.name}`);
                    markFailed();
                }
            });
        } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
            video.src = streamUrl;
            if (oldHls) oldHls.destroy();
        }

        return () => {
            cancelled = true;
            video.removeEventListener('play', onPlay);
            video.removeEventListener('pause', onPause);
            video.removeEventListener('waiting', onWaiting);
            video.removeEventListener('playing', onPlaying);
            video.removeEventListener('canplay', onCanPlay);
            video.removeEventListener('volumechange', onVolumeChange);
        };
    }, [source, failed, markFailed, channel.name]);

    useEffect(() => {
        return () => {
            hlsRef.current?.destroy();
        };
    }, []);

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

    // ✅ FIX: Different behavior for touch vs mouse devices
    const handleVideoClick = () => {
        if (isFullscreen) {
            if (isTouch) {
                // Touch: tap toggles controls visibility
                toggleControls();
            } else {
                // Desktop: click shows controls (auto-hides after 3s)
                showControls();
            }
        } else {
            togglePlayPause();
        }
    };

    if (!hasWorkingSource) {
        return (
            <div className="bg-black rounded-lg overflow-hidden">
                <div className="aspect-video flex flex-col items-center justify-center text-white p-6">
                    <div className="text-5xl mb-4">📡</div>
                    <p className="text-xl mb-2">Stream Offline</p>
                    <p className="text-sm text-gray-400 mb-4">
                        {channel.name} ({source.label}) is currently unavailable
                    </p>
                    <div className="flex gap-2 flex-wrap justify-center">
                        <button
                            onClick={reset}
                            className="px-6 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg transition"
                        >
                            🔄 Retry
                        </button>
                        {hasNext && (
                            <button
                                onClick={onNextChannel}
                                className="px-6 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg transition"
                            >
                                ⏭ Next Channel
                            </button>
                        )}
                        {hasPrev && (
                            <button
                                onClick={onPrevChannel}
                                className="px-6 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition"
                            >
                                ⏮ Previous Channel
                            </button>
                        )}
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="player-wrapper">
            <div
                ref={containerRef}
                className={`relative bg-black ${
                    isFullscreen
                        ? 'fixed inset-0 w-screen h-screen' // ✅ fixed positioning + viewport units
                        : 'xl:rounded-[18px] md:rounded-[12px] rounded-[8px] overflow-hidden aspect-video'
                }`}
                style={
                    isFullscreen
                        ? { height: '100dvh', width: '100vw' } // ✅ dvh handles mobile address bar
                        : undefined
                }
                onMouseMove={
                    isFullscreen && !isTouch ? showControls : undefined
                }
            >
                <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    webkit-playsinline="true"
                    controls={false}
                    controlsList="nodownload nofullscreen noremoteplayback"
                    disablePictureInPicture
                    onClick={handleVideoClick}
                    className="w-full h-full cursor-pointer"
                    style={{ objectFit: isFullscreen ? fillMode : 'cover' }}
                />

                {loading && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black pointer-events-none z-20">
                        <div className="text-center">
                            <div className="animate-spin lg:h-[30px] lg:w-[30px] h-[25px] w-[25px] border-3 border-white border-t-gradient-primary rounded-full mx-auto mb-2" />
                            <p className="text-white uppercase font-heading text-[12px] font-normal tracking-wider">
                                Connecting stream...
                            </p>
                        </div>
                    </div>
                )}

                {isFullscreen && (
                    <div
                        // ✅ FIX: Only use mouse-based lock/unlock on desktop
                        onMouseEnter={!isTouch ? lock : undefined}
                        onMouseLeave={!isTouch ? unlock : undefined}
                        // ✅ FIX: Stop propagation so tapping controls doesn't toggle visibility
                        onClick={(e) => e.stopPropagation()}
                        className={`player-controller__overlay transition-opacity duration-300 z-20 ${
                            controlsVisible
                                ? 'opacity-100'
                                : 'opacity-0 pointer-events-none'
                        }`}
                    >
                        <PlayerController
                            toggleFullscreen={toggleFullscreen}
                            toggleMute={toggleMute}
                            togglePlayPause={togglePlayPause}
                            handleVolumeChange={handleVolumeChange}
                            onNextChannel={onNextChannel}
                            isPlaying={isPlaying}
                            onPrevChannel={onPrevChannel}
                            hasPrev={hasPrev}
                            hasNext={hasNext}
                            muted={muted}
                            volume={volume}
                            fillMode={fillMode}
                            toggleFillMode={toggleFillMode}
                        />
                    </div>
                )}
            </div>

            {!isFullscreen && (
                <PlayerController
                    toggleFullscreen={toggleFullscreen}
                    toggleMute={toggleMute}
                    togglePlayPause={togglePlayPause}
                    handleVolumeChange={handleVolumeChange}
                    onNextChannel={onNextChannel}
                    isPlaying={isPlaying}
                    onPrevChannel={onPrevChannel}
                    hasPrev={hasPrev}
                    hasNext={hasNext}
                    muted={muted}
                    volume={volume}
                    fillMode={fillMode}
                    toggleFillMode={toggleFillMode}
                />
            )}
        </div>
    );
}
