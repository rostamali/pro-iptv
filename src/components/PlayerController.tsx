import VolumeControl from './VolumeControl';

type props = {
    toggleFullscreen: () => void;
    toggleMute: () => void;
    togglePlayPause: () => void;
    handleVolumeChange: (value: number) => void;
    onNextChannel: () => void;
    isPlaying: boolean;
    onPrevChannel: () => void;
    hasPrev: boolean;
    hasNext: boolean;
    muted: boolean;
    volume: number;
    fillMode: 'contain' | 'cover';
    toggleFillMode: () => void;
    isFullscreen: boolean;
};
export default function PlayerController({
    toggleMute,
    toggleFullscreen,
    onPrevChannel,
    onNextChannel,
    togglePlayPause,
    hasPrev,
    hasNext,
    isPlaying,
    volume,
    muted,
    handleVolumeChange,
    toggleFillMode,
    fillMode,
    isFullscreen,
}: props) {
    return (
        <>
            {/* <div className="grid md:grid-cols-3 grid-cols-2 items-center xl:py-[30px] xl:px-[45px] py-[15px] px-[10px] gap-4">
                <div className="md:order-1 order-2">
                    <VolumeControl
                        volume={volume}
                        muted={muted}
                        onVolumeChange={handleVolumeChange}
                        onToggleMute={toggleMute}
                    />
                </div>

                <div className="md:order-2 order-1 md:col-span-1 col-span-2 flex items-center gap-[20px] justify-center">
                    <button
                        onClick={onPrevChannel}
                        disabled={!hasPrev}
                        className="player-controller-prev-next__btn"
                        title="Previous Channel"
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
                            className="lg:h-[18px] lg:w-[18px] w-[14px] h-[14px]"
                        >
                            <polygon points="19 20 9 12 19 4 19 20"></polygon>
                            <line x1="5" x2="5" y1="19" y2="5"></line>
                        </svg>
                    </button>

                    <button
                        onClick={togglePlayPause}
                        className="player-controller-play__btn"
                    >
                        {isPlaying ? (
                            <svg
                                className="md:w-6 md:h-6 w-4.5 h-4.5"
                                fill="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path d="M6 4h4v16H6zM14 4h4v16h-4z" />
                            </svg>
                        ) : (
                            <div className="play-icon"></div>
                        )}
                    </button>

                    <button
                        onClick={onNextChannel}
                        disabled={!hasNext}
                        className="player-controller-prev-next__btn"
                        title="Next Channel"
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
                            className="lg:h-[18px] lg:w-[18px] w-[14px] h-[14px]"
                        >
                            <polygon points="5 4 15 12 5 20 5 4"></polygon>
                            <line x1="19" x2="19" y1="5" y2="19"></line>
                        </svg>
                    </button>
                </div>

                <div className="md:order-3 order-2 flex items-center justify-end">
                    <button
                        onClick={toggleFullscreen}
                        className="player-controller-sm__btn"
                        title="Fullscreen"
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
            </div> */}
            <div className="grid md:grid-cols-3 grid-cols-2 items-center xl:py-[30px] xl:px-[45px] py-[15px] px-[10px] gap-4">
                <div className="md:order-1 order-2">
                    <VolumeControl
                        volume={volume}
                        muted={muted}
                        onVolumeChange={handleVolumeChange}
                        onToggleMute={toggleMute}
                    />
                </div>

                <div className="md:order-2 order-1 md:col-span-1 col-span-2 flex items-center gap-[20px] justify-center">
                    <button
                        onClick={onPrevChannel}
                        disabled={!hasPrev}
                        className="player-controller-prev-next__btn"
                        title="Previous Channel"
                    >
                        <svg
                            fill="none"
                            height="18"
                            stroke="currentColor"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2.2"
                            viewBox="0 0 24 24"
                            width="18"
                            className="lg:h-[18px] lg:w-[18px] w-[14px] h-[14px]"
                        >
                            <polygon points="19 20 9 12 19 4 19 20"></polygon>
                            <line x1="5" x2="5" y1="19" y2="5"></line>
                        </svg>
                    </button>

                    <button
                        onClick={togglePlayPause}
                        className="player-controller-play__btn"
                    >
                        {isPlaying ? (
                            <svg
                                className="md:w-6 md:h-6 w-4.5 h-4.5"
                                fill="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path d="M6 4h4v16H6zM14 4h4v16h-4z" />
                            </svg>
                        ) : (
                            <div className="play-icon"></div>
                        )}
                    </button>

                    <button
                        onClick={onNextChannel}
                        disabled={!hasNext}
                        className="player-controller-prev-next__btn"
                        title="Next Channel"
                    >
                        <svg
                            fill="none"
                            height="18"
                            stroke="currentColor"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2.2"
                            viewBox="0 0 24 24"
                            width="18"
                            className="lg:h-[18px] lg:w-[18px] w-[14px] h-[14px]"
                        >
                            <polygon points="5 4 15 12 5 20 5 4"></polygon>
                            <line x1="19" x2="19" y1="5" y2="19"></line>
                        </svg>
                    </button>
                </div>

                <div className="md:order-3 order-2 flex items-center justify-end gap-2">
                    {/* ✅ NEW: Fill mode toggle — only show in fullscreen */}
                    {isFullscreen && (
                        <button
                            onClick={toggleFillMode}
                            className="player-controller-sm__btn"
                            title={
                                fillMode === 'contain'
                                    ? 'Fill Screen'
                                    : 'Fit Screen'
                            }
                        >
                            {fillMode === 'contain' ? (
                                // "Stretch to fill" icon
                                <svg
                                    className="w-[15px] h-[15px]"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="2"
                                    viewBox="0 0 24 24"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        d="M4 8V4m0 0h4M4 4l5 5m11-5h-4m4 0v4m0-4l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4"
                                    />
                                </svg>
                            ) : (
                                // "Fit to screen" icon
                                <svg
                                    className="w-[15px] h-[15px]"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="2"
                                    viewBox="0 0 24 24"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        d="M9 9V4.5M9 9H4.5M9 9 3.75 3.75M9 15v4.5M9 15H4.5M9 15l-5.25 5.25M15 9h4.5M15 9V4.5M15 9l5.25-5.25M15 15h4.5M15 15v4.5m0-4.5 5.25 5.25"
                                    />
                                </svg>
                            )}
                        </button>
                    )}

                    <button
                        onClick={toggleFullscreen}
                        className="player-controller-sm__btn"
                        title={isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}
                    >
                        {isFullscreen ? (
                            // Exit fullscreen icon
                            <svg
                                fill="none"
                                height="15"
                                stroke="currentColor"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="2"
                                viewBox="0 0 24 24"
                                width="15"
                            >
                                <path d="M8 3v3a2 2 0 0 1-2 2H3m18 0h-3a2 2 0 0 1-2-2V3m0 18v-3a2 2 0 0 1 2-2h3M3 16h3a2 2 0 0 1 2 2v3"></path>
                            </svg>
                        ) : (
                            <svg
                                fill="none"
                                height="15"
                                stroke="currentColor"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="2"
                                viewBox="0 0 24 24"
                                width="15"
                            >
                                <path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3"></path>
                            </svg>
                        )}
                    </button>
                </div>
            </div>
        </>
    );
}
