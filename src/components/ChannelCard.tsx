import type { Channel } from '../types';

interface Props {
    channel: Channel;
    onClick: () => void;
    isActive: boolean;
}

export default function ChannelCard({ channel, onClick, isActive }: Props) {
    return (
        <button
            onClick={onClick}
            className={`channel-card ${!isActive ? 'border-card-border' : 'border-gradient-primary '}`}
            disabled={isActive}
        >
            <div className="channel-meta flex justify-between p-[10px] absolute w-full">
                {/* {channel.categories && (
                    <div className="channel-category__badge">
                        {channel.category}
                    </div>
                )} */}
                {channel.isLive && (
                    <div className="h-1.5 w-1.5 rounded-full bg-green-500 animate-pulse"></div>
                )}
            </div>
            <div className="aspect-video flex items-center justify-center p-4">
                {channel.logo && (
                    <img
                        src={channel.logo}
                        alt={channel.name}
                        className={`h-[40px] max-h-full max-w-full object-contain transition ${
                            isActive ? 'scale-110' : 'group-hover:scale-110'
                        }`}
                    />
                )}
            </div>

            <div className="bg-primary-bg px-3 pt-5 pb-3 relative">
                {isActive && (
                    <div className="active-channel">
                        <span className="flex gap-0.5 items-end h-3">
                            <span className="w-0.5 bg-white animate-[wave_1s_ease-in-out_infinite] h-2" />
                            <span className="w-0.5 bg-white animate-[wave_1s_ease-in-out_0.2s_infinite] h-3" />
                            <span className="w-0.5 bg-white animate-[wave_1s_ease-in-out_0.4s_infinite] h-1.5" />
                        </span>
                        Now Playing
                    </div>
                )}
                <h3 className="text-[15px] text-white font-normal line-clamp-1">
                    {channel.name}
                </h3>
                <p className="text-[12px] font-light text-gray-300 mt-1">
                    {channel.country} · {channel.source.quality}
                </p>
            </div>
        </button>
    );
}
