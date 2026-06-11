import { useEffect, useRef, useState, useCallback } from 'react';

export function useAutoHideControls(timeout = 3000) {
    const [visible, setVisible] = useState(true);
    const timerRef = useRef<number | null>(null);
    const lockedRef = useRef(false);

    const clearTimer = useCallback(() => {
        if (timerRef.current !== null) {
            window.clearTimeout(timerRef.current);
            timerRef.current = null;
        }
    }, []);

    const scheduleHide = useCallback(() => {
        if (lockedRef.current) return;
        clearTimer();
        timerRef.current = window.setTimeout(() => {
            setVisible(false);
            timerRef.current = null;
        }, timeout);
    }, [timeout, clearTimer]);

    const show = useCallback(() => {
        setVisible(true);
        scheduleHide();
    }, [scheduleHide]);

    // ✅ Toggle for mobile: tap to show, tap again to hide
    const toggle = useCallback(() => {
        if (visible) {
            clearTimer();
            setVisible(false);
        } else {
            setVisible(true);
            scheduleHide();
        }
    }, [visible, clearTimer, scheduleHide]);

    const lock = useCallback(() => {
        lockedRef.current = true;
        clearTimer();
        setVisible(true);
    }, [clearTimer]);

    const unlock = useCallback(() => {
        lockedRef.current = false;
        scheduleHide();
    }, [scheduleHide]);

    useEffect(() => {
        const timerId = window.setTimeout(() => {
            if (!lockedRef.current) setVisible(false);
        }, timeout);
        timerRef.current = timerId;
        return () => {
            window.clearTimeout(timerId);
        };
    }, [timeout]);

    return { visible, show, toggle, lock, unlock };
}
