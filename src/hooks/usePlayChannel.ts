import { useState, useCallback } from 'react';
import type { StreamSource } from '../types';

export function usePlayChannel(source: StreamSource) {
    const [failed, setFailed] = useState(false);

    const markFailed = useCallback(() => {
        setFailed(true);
    }, []);

    const reset = useCallback(() => {
        setFailed(false);
    }, []);

    return {
        source,
        failed,
        markFailed,
        reset,
        hasWorkingSource: !failed,
    };
}
