import { useCallback, useEffect, useState } from 'react';
import { AppState } from 'react-native';
import {
  getEvents,
  getProtectionStatus,
  onEventsChanged,
  type ProtectionStatus,
  type UnlockAttemptEvent,
} from '../utils/UnlockAttempts';

interface UnlockAttemptsState {
  events: UnlockAttemptEvent[];
  failedAttempts: UnlockAttemptEvent[];
  failedCount: number;
  status: ProtectionStatus;
  loading: boolean;
  refresh: () => Promise<void>;
}

const EMPTY_STATUS: ProtectionStatus = {
  deviceAdminActive: false,
  deviceSecure: false,
  currentAttemptStreak: 0,
};

/**
 * Screen-level view of the capture store. Re-reads on foreground because
 * device admin can be revoked in system Settings, and attempts accumulate
 * while the app is closed.
 */
export function useUnlockAttempts(): UnlockAttemptsState {
  const [events, setEvents] = useState<UnlockAttemptEvent[]>([]);
  const [status, setStatus] = useState<ProtectionStatus>(EMPTY_STATUS);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    const [nextEvents, nextStatus] = await Promise.all([
      getEvents(),
      getProtectionStatus(),
    ]);
    setEvents(nextEvents);
    setStatus(nextStatus);
    setLoading(false);
  }, []);

  useEffect(() => {
    let active = true;

    const run = () => {
      refresh().catch(() => {
        if (active) {
          setLoading(false);
        }
      });
    };

    run();
    const stopListening = onEventsChanged(run);
    const subscription = AppState.addEventListener('change', state => {
      if (state === 'active') {
        run();
      }
    });

    return () => {
      active = false;
      stopListening();
      subscription.remove();
    };
  }, [refresh]);

  const failedAttempts = events.filter(event => event.type === 'UNLOCK_FAILED');

  return {
    events,
    failedAttempts,
    failedCount: failedAttempts.length,
    status,
    loading,
    refresh,
  };
}
