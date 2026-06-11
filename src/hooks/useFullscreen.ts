import { useEffect, useState, useCallback } from 'react';
import type { RefObject } from 'react'; // ✅ type-only import

// ✅ Generic to accept any HTMLElement subtype + nullable ref
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
            } catch (e) {
                console.warn('Fullscreen failed:', e);
            }
        }
    }, [ref]);

    const exit = useCallback(async () => {
        if (document.fullscreenElement) {
            try {
                await document.exitFullscreen();
            } catch {
                console.log('');
            }
        }
    }, []);

    const toggle = useCallback(() => {
        if (isFullscreen) exit();
        else enter();
    }, [isFullscreen, enter, exit]);

    return { isFullscreen, enter, exit, toggle };
}
