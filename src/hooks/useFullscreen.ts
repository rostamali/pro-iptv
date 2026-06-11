import { useEffect, useState, useCallback } from 'react';
import type { RefObject } from 'react';

export function useFullscreen<T extends HTMLElement>(ref: RefObject<T | null>) {
    const [isFullscreen, setIsFullscreen] = useState(false);

    useEffect(() => {
        const onChange = () => {
            setIsFullscreen(!!document.fullscreenElement);
        };
        document.addEventListener('fullscreenchange', onChange);
        return () => document.removeEventListener('fullscreenchange', onChange);
    }, []);

    const enter = useCallback(async () => {
        const el = ref.current;
        if (el && !document.fullscreenElement) {
            try {
                await el.requestFullscreen();

                // ✅ Auto-lock to landscape on mobile after entering fullscreen
                try {
                    if (screen.orientation && 'lock' in screen.orientation) {
                        await screen.orientation.lock('landscape');
                    }
                } catch {
                    // Desktop browsers throw — silently ignore
                }
            } catch (e) {
                console.warn('Fullscreen failed:', e);
            }
        }
    }, [ref]);

    const exit = useCallback(async () => {
        if (document.fullscreenElement) {
            try {
                // Unlock orientation before exiting
                if (screen.orientation && 'unlock' in screen.orientation) {
                    screen.orientation.unlock();
                }
                await document.exitFullscreen();
            } catch {
                console.log('')
            }
        }
    }, []);

    const toggle = useCallback(() => {
        if (isFullscreen) exit();
        else enter();
    }, [isFullscreen, enter, exit]);

    return { isFullscreen, enter, exit, toggle };
}
