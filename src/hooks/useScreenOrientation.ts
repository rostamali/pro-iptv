import { useCallback } from 'react';

export function useScreenOrientation() {
    const lockLandscape = useCallback(async () => {
        try {
            if (screen.orientation && 'lock' in screen.orientation) {
                await screen.orientation.lock('landscape');
            }
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        } catch (e) {
            // Ignored — desktop browsers reject this, which is fine
        }
    }, []);

    const unlockOrientation = useCallback(() => {
        try {
            if (screen.orientation && 'unlock' in screen.orientation) {
                screen.orientation.unlock();
            }
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        } catch (e) {
            // Ignored
        }
    }, []);

    return { lockLandscape, unlockOrientation };
}
