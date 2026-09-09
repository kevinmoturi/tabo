import { useEffect } from 'react';
import { AppState } from 'react-native';
import { onEventsChanged, syncFromNative } from '../utils/UnlockAttempts';

/**
 * Keeps the AsyncStorage mirror in step with the native capture store. Called
 * once at the app root.
 *
 * Three triggers, because native captures while the UI is dead: on mount, on
 * every return to the foreground, and on the live native event when the app
 * happens to be open at the moment of capture.
 */
export function useUnlockListener(): void {
  useEffect(() => {
    syncFromNative();

    const stopListening = onEventsChanged(() => {
      syncFromNative();
    });

    const subscription = AppState.addEventListener('change', state => {
      if (state === 'active') {
        syncFromNative();
      }
    });

    return () => {
      stopListening();
      subscription.remove();
    };
  }, []);
}
