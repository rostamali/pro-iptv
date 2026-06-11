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
}: props) {
    return (
        <>
            <div className="grid md:grid-cols-3 grid-cols-2 items-center xl:py-[30px] xl:px-[45px] py-[15px] px-[10px] gap-4">
                <div className="order-1">
                    <VolumeControl
                        volume={volume}
                        muted={muted}
                        onVolumeChange={handleVolumeChange}
                        onToggleMute={toggleMute}
                    />
                </div>

                <div className="md:order-2 order-3 md:col-span-1 col-span-2 flex items-center gap-[20px] justify-center">
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
            </div>
        </>
    );
}
