import { useEffect, useRef, useState, useCallback } from 'react';

export function useAutoHideControls(timeout = 3000) {
    // ✅ Already starts visible — no need to call show() in mount effect
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

    // ✅ show() called only from event handlers / user actions — not from effects
    const show = useCallback(() => {
        setVisible(true);
        scheduleHide();
    }, [scheduleHide]);

    const lock = useCallback(() => {
        lockedRef.current = true;
        clearTimer();
        setVisible(true);
    }, [clearTimer]);

    const unlock = useCallback(() => {
        lockedRef.current = false;
        scheduleHide();
    }, [scheduleHide]);

    // ✅ Mount effect only schedules the initial hide timer — does NOT setState
    useEffect(() => {
        const timerId = window.setTimeout(() => {
            if (!lockedRef.current) setVisible(false);
        }, timeout);
        timerRef.current = timerId;

        return () => {
            window.clearTimeout(timerId);
        };
    }, [timeout]);

    return { visible, show, lock, unlock };
}
