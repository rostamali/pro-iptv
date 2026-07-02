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
import StreamError from './StreamError';

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
        toggle: toggleControls,
        lock,
        unlock,
    } = useAutoHideControls(3000);

    const { source, failed, markFailed, reset, hasWorkingSource } =
        usePlayChannel(channel.source);

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

    useEffect(() => {
        const video = videoRef.current;
        if (!video || failed) return;

        let cancelled = false;
        const oldHls = hlsRef.current;

        const streamUrl = proxyStream({
            url: source.url,
            useProxy: channel.proxy,
            // source.userAgent,
            // source.referer,
        });

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

    return (
        <div className="player-wrapper">
            <div
                ref={containerRef}
                className={`relative bg-black ${
                    isFullscreen
                        ? 'fixed inset-0 z-[9999] !rounded-none'
                        : 'xl:rounded-[18px] md:rounded-[12px] rounded-[8px] overflow-hidden aspect-video'
                }`}
                style={
                    isFullscreen
                        ? {
                              width: '100vw',
                              height: '100vh',
                              minHeight: '100dvh',
                          }
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
                    style={{
                        objectFit: isFullscreen ? fillMode : 'cover',
                    }}
                />

                {!hasWorkingSource && (
                    <StreamError channelName={channel.name} />
                )}

                {hasWorkingSource && loading && (
                    <div className="absolute inset-0 flex items-center justify-center bg-[#00000042] pointer-events-none z-20">
                        <div className="text-center">
                            <div className="animate-spin lg:h-[30px] lg:w-[30px] h-[25px] w-[25px] border-3 border-white border-t-gradient-primary rounded-full mx-auto mb-2" />
                            <p className="text-white uppercase font-heading text-[12px] font-normal tracking-wider">
                                Connecting {channel.name}...
                            </p>
                        </div>
                    </div>
                )}

                {isFullscreen && (
                    <div
                        onMouseEnter={!isTouch ? lock : undefined}
                        onMouseLeave={!isTouch ? unlock : undefined}
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
                            isFullscreen={isFullscreen}
                            resetBtn={reset}
                            hasWorkingSource={hasWorkingSource}
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
                    isFullscreen={isFullscreen}
                    resetBtn={reset}
                    hasWorkingSource={hasWorkingSource}
                />
            )}
        </div>
    );
}
