import AsyncStorage from '@react-native-async-storage/async-storage';
import { NativeEventEmitter, NativeModules, Platform } from 'react-native';

/**
 * Reads the lock-screen events captured natively and mirrors them into
 * AsyncStorage for the owner's UI.
 *
 * The split matters: native SharedPreferences is where capture *happens*,
 * because the device-admin broadcast arrives with no JavaScript running (and
 * on a stolen phone, none ever will again). AsyncStorage is a display cache
 * this module keeps in step. Treat native as the source of truth and this as
 * the copy.
 */

const { UnlockAttemptModule } = NativeModules;

const STORAGE_KEY = '@tabo/unlockAttempts';
const MAX_STORED = 500;

export type UnlockEventType =
  | 'UNLOCK_FAILED'
  | 'UNLOCK_SUCCEEDED'
  | 'ADMIN_ENABLED'
  | 'ADMIN_DISABLED'
  | 'BOOT';

export interface UnlockAttemptEvent {
  id: string;
  type: UnlockEventType;
  /** Epoch milliseconds, from the device clock at capture. */
  at: number;
  /** Position within the current run of failures; failures only. */
  attemptNo?: number;
  /**
   * Always "unknown" today. The broadcast does not say whether a PIN, pattern
   * or password was tried, and biometric failures never arrive at all.
   */
  method?: string;
}

export interface ProtectionStatus {
  /** The user has approved Tambo as a device admin. */
  deviceAdminActive: boolean;
  /**
   * A PIN, pattern or password is set. Without one there is no credential to
   * fail, so nothing is ever recorded however healthy the rest looks.
   */
  deviceSecure: boolean;
  /** Failures since the last successful unlock. */
  currentAttemptStreak: number;
}

/** Both conditions must hold before a single attempt can be captured. */
export const isProtectionActive = (status: ProtectionStatus): boolean =>
  status.deviceAdminActive && status.deviceSecure;

export const isSupported = (): boolean =>
  Platform.OS === 'android' && !!UnlockAttemptModule;

const emitter = isSupported()
  ? new NativeEventEmitter(UnlockAttemptModule)
  : null;

// --- Local mirror ------------------------------------------------------------

const readStored = async (): Promise<UnlockAttemptEvent[]> => {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return [];
    }
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

const writeStored = async (events: UnlockAttemptEvent[]): Promise<void> => {
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(events));
};

/**
 * Pulls anything new out of the native store, writes it to AsyncStorage, and
 * only then tells native it may forget those ids. Acknowledging first would
 * mean a crash in between silently loses an attempt; acknowledging last means
 * the worst case is a repeat, which the id dedupe below absorbs.
 */
export const syncFromNative = async (): Promise<UnlockAttemptEvent[]> => {
  const stored = await readStored();
  if (!isSupported()) {
    return stored;
  }

  let incoming: UnlockAttemptEvent[] = [];
  try {
    const raw: string = await UnlockAttemptModule.getEvents();
    const parsed = JSON.parse(raw);
    incoming = Array.isArray(parsed) ? parsed : [];
  } catch {
    return stored;
  }

  if (incoming.length === 0) {
    return stored;
  }

  const byId = new Map(stored.map(event => [event.id, event]));
  for (const event of incoming) {
    if (event?.id) {
      byId.set(event.id, event);
    }
  }

  const merged = Array.from(byId.values())
    .sort((a, b) => a.at - b.at)
    .slice(-MAX_STORED);

  await writeStored(merged);

  try {
    await UnlockAttemptModule.acknowledgeEvents(incoming.map(e => e.id));
  } catch {
    // Native keeps them; the next sync dedupes by id.
  }

  return merged;
};

export const getEvents = async (): Promise<UnlockAttemptEvent[]> => {
  const events = await syncFromNative();
  return [...events].sort((a, b) => b.at - a.at);
};

export const getFailedAttempts = async (): Promise<UnlockAttemptEvent[]> =>
  (await getEvents()).filter(event => event.type === 'UNLOCK_FAILED');

export const clearEvents = async (): Promise<void> => {
  await AsyncStorage.removeItem(STORAGE_KEY);
  if (isSupported()) {
    try {
      await UnlockAttemptModule.clearEvents();
    } catch {
      // nothing actionable
    }
  }
};

// --- Protection status -------------------------------------------------------

const UNAVAILABLE: ProtectionStatus = {
  deviceAdminActive: false,
  deviceSecure: false,
  currentAttemptStreak: 0,
};

export const getProtectionStatus = async (): Promise<ProtectionStatus> => {
  if (!isSupported()) {
    return UNAVAILABLE;
  }
  try {
    return await UnlockAttemptModule.getProtectionStatus();
  } catch (error) {
    // A default that reads "off" is honest here, but swallowing the reason
    // silently is what made this impossible to debug the first time.
    console.warn('[Tambo] getProtectionStatus failed', error);
    return UNAVAILABLE;
  }
};

export interface DeviceAdminRequestResult {
  /** The system consent screen was actually launched. */
  opened: boolean;
  /** Already approved; no screen was needed. */
  alreadyActive: boolean;
}

/**
 * Opens the system consent screen. Resolving means the screen was shown, not
 * that the user agreed — the answer comes back out of band, so re-check
 * {@link getProtectionStatus} when the app returns to the foreground.
 *
 * Throws rather than returning a quiet false: a caller that cannot open the
 * screen must say so instead of telling the user to look for it.
 */
export const requestDeviceAdmin =
  async (): Promise<DeviceAdminRequestResult> => {
    if (!isSupported()) {
      throw new Error(
        'Failed-unlock detection is only available on Android builds of Tambo.',
      );
    }
    return await UnlockAttemptModule.requestDeviceAdmin();
  };

const sleep = (ms: number) =>
  new Promise<void>(resolve => setTimeout(resolve, ms));

/**
 * Turns protection off by giving up Tambo's device-admin grant. Android
 * applies the removal asynchronously, so this waits (briefly) for the status
 * to actually flip before resolving; the returned status is what the UI
 * should show. Resolves false if nothing was active to begin with.
 */
export const removeDeviceAdmin = async (): Promise<boolean> => {
  if (!isSupported()) {
    throw new Error(
      'Failed-unlock detection is only available on Android builds of Tambo.',
    );
  }
  const removed: boolean = await UnlockAttemptModule.removeDeviceAdmin();
  if (!removed) {
    return false;
  }
  for (let attempt = 0; attempt < 10; attempt += 1) {
    const status = await getProtectionStatus();
    if (!status.deviceAdminActive) {
      return true;
    }
    await sleep(200);
  }
  // Still reported active after ~2s: the system will get there; the hook's
  // foreground re-read catches up.
  return true;
};

/** Opens system security settings, where a screen lock is set. */
export const openSecuritySettings = async (): Promise<void> => {
  if (!isSupported()) {
    throw new Error('Security settings are only available on Android.');
  }
  await UnlockAttemptModule.openSecuritySettings();
};

export const openAppSettings = (): void => {
  UnlockAttemptModule?.openAppSettings?.();
};

/** Fires when native captures anything, but only while the UI is running. */
export const onEventsChanged = (listener: () => void): (() => void) => {
  if (!emitter) {
    return () => {};
  }
  const subscription = emitter.addListener('UNLOCK_EVENTS_CHANGED', listener);
  return () => subscription.remove();
};
