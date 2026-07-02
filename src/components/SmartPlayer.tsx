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

// ✅ Detect Samsung/LG/other Smart TVs once
const isSmartTV = (): boolean => {
    if (typeof navigator === 'undefined') return false;
    const ua = navigator.userAgent.toLowerCase();
    return (
        ua.includes('tizen') ||
        ua.includes('smart-tv') ||
        ua.includes('smarttv') ||
        ua.includes('webos') ||
        ua.includes('web0s') ||
        ua.includes('netcast') ||
        ua.includes('hbbtv') ||
        ua.includes('viera') ||
        ua.includes('appletv') ||
        // Samsung TVs often have "SamsungBrowser" in UA
        ua.includes('samsungbrowser')
    );
};

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

    // ✅ Track how many recovery attempts have been made per source
    const nativeFailedRef = useRef(false);
    const recoveryAttemptsRef = useRef(0);

    const [fillMode, setFillMode] = useState<'contain' | 'cover'>('contain');
    const toggleFillMode = () => {
        setFillMode((m) => (m === 'contain' ? 'cover' : 'contain'));
    };

    const isTouch = useMemo(() => isTouchDevice(), []);
    const isTV = useMemo(() => isSmartTV(), []);

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

    // Reset recovery state when channel changes
    useEffect(() => {
        nativeFailedRef.current = false;
        recoveryAttemptsRef.current = 0;
        reset();
    }, [channel.id, reset]);

    // Re-enter fullscreen after channel change if user was fullscreen
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

    // ✅ MAIN STREAM LOADING — Samsung TV compatible
    useEffect(() => {
        const video = videoRef.current;
        if (!video || failed) return;

        let cancelled = false;
        const oldHls = hlsRef.current;

        const streamUrl = proxyStream({
            url: source.url,
            // channel.proxy === true,
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

        // ✅ SAMSUNG TV FLOW: Try native HLS FIRST, then hls.js as fallback
        // ✅ REGULAR BROWSER FLOW: Use hls.js if supported, else native
        const canPlayNativeHls =
            video.canPlayType('application/vnd.apple.mpegurl') !== '' ||
            video.canPlayType('application/x-mpegURL') !== '';

        const attachHlsJs = () => {
            if (cancelled) return;
            if (!Hls.isSupported()) {
                console.warn(
                    '[Player] HLS.js not supported, falling back to native',
                );
                video.src = streamUrl;
                return;
            }

            console.log('[Player] Using HLS.js');

            const hls = new Hls({
                // Your existing config...
                manifestLoadingTimeOut: isTV ? 30000 : 10000,
                manifestLoadingMaxRetry: isTV ? 5 : 2,
                levelLoadingTimeOut: isTV ? 30000 : 10000,
                levelLoadingMaxRetry: isTV ? 5 : 2,
                fragLoadingTimeOut: isTV ? 30000 : 10000,
                fragLoadingMaxRetry: isTV ? 6 : 3,
                lowLatencyMode: !isTV,
                enableWorker: !isTV,
                maxBufferLength: isTV ? 60 : 30,
                maxMaxBufferLength: isTV ? 120 : 60,
                maxBufferSize: isTV ? 30 * 1000 * 1000 : 60 * 1000 * 1000,
                startFragPrefetch: false,
                testBandwidth: false,
                nudgeMaxRetry: isTV ? 10 : 3,
                keyLoadPolicy: {
                    default: {
                        maxTimeToFirstByteMs: 8000,
                        maxLoadTimeMs: 20000,
                        timeoutRetry: {
                            maxNumRetry: 4,
                            retryDelayMs: 1000,
                            maxRetryDelayMs: 8000,
                            backoff: 'linear',
                        },
                        errorRetry: {
                            maxNumRetry: 4,
                            retryDelayMs: 1000,
                            maxRetryDelayMs: 8000,
                            backoff: 'linear',
                        },
                    },
                },
                xhrSetup: (xhr, url) => {
                    // ✅ Ensure XHR uses text/blob response type appropriately
                    if (url.includes('.key')) {
                        xhr.responseType = 'arraybuffer'; // keys are binary
                    }
                },
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

                // ✅ Try recoverable errors first (Samsung TV benefits from retries)
                if (data.fatal) {
                    if (data.type === Hls.ErrorTypes.NETWORK_ERROR) {
                        if (recoveryAttemptsRef.current < 3) {
                            recoveryAttemptsRef.current++;
                            console.warn(
                                `[Player] Network error, retry ${recoveryAttemptsRef.current}/3`,
                            );
                            hls.startLoad();
                            return;
                        }
                    } else if (data.type === Hls.ErrorTypes.MEDIA_ERROR) {
                        if (recoveryAttemptsRef.current < 3) {
                            recoveryAttemptsRef.current++;
                            console.warn(
                                `[Player] Media error, recovering ${recoveryAttemptsRef.current}/3`,
                            );
                            hls.recoverMediaError();
                            return;
                        }
                    }

                    console.warn(
                        `[Player] Fatal error on ${channel.name}:`,
                        data.details,
                    );
                    markFailed();
                }
            });
        };

        const attachNativeHls = () => {
            if (cancelled) return;
            console.log('[Player] Using native HLS');
            video.src = streamUrl;
            if (oldHls) oldHls.destroy();

            // If native fails on TV, fallback to hls.js
            const onNativeError = () => {
                if (cancelled || nativeFailedRef.current) return;
                nativeFailedRef.current = true;
                console.warn(
                    '[Player] Native HLS failed, falling back to hls.js',
                );
                video.removeEventListener('error', onNativeError);
                // Small delay for cleanup
                window.setTimeout(() => {
                    if (!cancelled) attachHlsJs();
                }, 200);
            };
            video.addEventListener('error', onNativeError);

            video.play().catch(() => {});
        };

        // ✅ Choose loading strategy based on device
        if (isTV && canPlayNativeHls) {
            // Samsung/LG TV: native player is more reliable, try it first
            attachNativeHls();
        } else if (Hls.isSupported()) {
            attachHlsJs();
        } else if (canPlayNativeHls) {
            attachNativeHls();
        } else {
            console.error('[Player] No HLS support available');
            markFailed();
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
    }, [source, failed, markFailed, channel.name, isTV]);

    useEffect(() => {
        return () => {
            hlsRef.current?.destroy();
        };
    }, []);

    // Sync volume/muted to video
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

    const handleVideoClick = () => {
        if (isFullscreen) {
            if (isTouch) {
                toggleControls();
            } else {
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
                    x5-playsinline="true"
                    controls={false}
                    controlsList="nodownload nofullscreen noremoteplayback"
                    disablePictureInPicture
                    crossOrigin="anonymous"
                    preload="auto"
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
