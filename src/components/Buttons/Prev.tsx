import type { Channel } from '../types';

interface Props {
    channel: Channel;
    onPrevChannel: () => void;
    onNextChannel: () => void;
    hasPrev: boolean;
    hasNext: boolean;
}

export default function StreamError({}: Props) {
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
