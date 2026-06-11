const KEYS = {
    channel: 'mystreamz:lastChannelId',
    volume: 'mystreamz:volume',
    muted: 'mystreamz:muted',
};

export function saveLastChannel(id: string) {
    try {
        localStorage.setItem(KEYS.channel, id);
    } catch {console.log();}
}

export function loadLastChannel(): string | null {
    try {
        return localStorage.getItem(KEYS.channel);
    } catch {
        return null;
    }
}

export function saveVolume(vol: number) {
    try {
        localStorage.setItem(KEYS.volume, String(vol));
    } catch {console.log();}
}

export function loadVolume(): number {
    try {
        const v = localStorage.getItem(KEYS.volume);
        return v !== null ? Math.max(0, Math.min(1, parseFloat(v))) : 0.8;
    } catch {
        return 0.8;
    }
}

export function saveMuted(muted: boolean) {
    try {
        localStorage.setItem(KEYS.muted, muted ? '1' : '0');
    } catch {
        console.log();
    }
}

export function loadMuted(): boolean {
    try {
        return localStorage.getItem(KEYS.muted) === '1';
    } catch {
        return false;
    }
}
