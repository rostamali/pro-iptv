interface Props {
    channelName: string;
}

export default function StreamError({ channelName }: Props) {
    return (
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 text-white text-center">
            Error <br />
            {channelName}
        </div>
    );
}
