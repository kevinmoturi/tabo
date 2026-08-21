import { useEffect } from 'react';
import {
  startUnlockListener,
  syncPendingNativeEvents,
} from '../utils/UnlockLogger';

/**
 * Starts the native unlock listener and syncs any pending native events
 * on mount. Should be called once at the app root.
 */
export function useUnlockListener(): void {
  useEffect(() => {
    syncPendingNativeEvents();
    const stop = startUnlockListener();
    return stop;
  }, []);
}
