import AsyncStorage from '@react-native-async-storage/async-storage';
import Geolocation from '@react-native-community/geolocation';
import {
  NativeEventEmitter,
  NativeModules,
  PermissionsAndroid,
  Platform,
} from 'react-native';

const { UnlockAttemptModule } = NativeModules;
const unlockEmitter = new NativeEventEmitter(UnlockAttemptModule);

const STORAGE_KEY = 'unlock_events';

export type UnlockEvent = {
  time: string;
  latitude?: number;
  longitude?: number;
  accuracy?: number;
};

export async function requestLocationPermission(): Promise<boolean> {
  if (Platform.OS !== 'android') {
    return true;
  }

  const granted = await PermissionsAndroid.request(
    PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
    {
      title: 'Location Permission',
      message: 'This app records your location when the device is unlocked.',
      buttonPositive: 'OK',
    },
  );

  return granted === PermissionsAndroid.RESULTS.GRANTED;
}

async function loadStoredEvents(): Promise<UnlockEvent[]> {
  const raw = await AsyncStorage.getItem(STORAGE_KEY);
  return raw ? JSON.parse(raw) : [];
}

async function saveEvents(events: UnlockEvent[]): Promise<void> {
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(events));
}

export async function captureAndStoreUnlockEvent(): Promise<void> {
  const time = new Date().toISOString();
  const events = await loadStoredEvents();
  const entry: UnlockEvent = { time };

  const hasPermission = await requestLocationPermission();

  if (hasPermission) {
    try {
      const position = await getCurrentPosition();
      entry.latitude = position.coords.latitude;
      entry.longitude = position.coords.longitude;
      entry.accuracy = position.coords.accuracy;
    } catch {
      // location is optional
    }
  }

  events.push(entry);
  await saveEvents(events);
}

type GeoPosition = {
  coords: {
    latitude: number;
    longitude: number;
    accuracy: number;
  };
};

function getCurrentPosition(): Promise<GeoPosition> {
  return new Promise((resolve, reject) => {
    Geolocation.getCurrentPosition(
      resolve,
      reject,
      {
        enableHighAccuracy: true,
        timeout: 15000,
        maximumAge: 10000,
      },
    );
  });
}

type NativeUnlockEvent = {
  time: number;
  latitude?: number;
  longitude?: number;
  accuracy?: number;
};

export async function syncPendingNativeEvents(): Promise<void> {
  if (!UnlockAttemptModule?.getPendingEvents) {
    return;
  }

  const jsonString: string = await new Promise((resolve) => {
    UnlockAttemptModule.getPendingEvents((_error: unknown, events: string) => {
      resolve(events ?? '[]');
    });
  });

  try {
    const nativeEvents: NativeUnlockEvent[] = JSON.parse(jsonString);
    if (nativeEvents.length === 0) {
      return;
    }

    const events = await loadStoredEvents();
    for (const nativeEvent of nativeEvents) {
      events.push({
        time: new Date(nativeEvent.time).toISOString(),
        latitude: nativeEvent.latitude,
        longitude: nativeEvent.longitude,
        accuracy: nativeEvent.accuracy,
      });
    }
    await saveEvents(events);
  } catch {
    // ignore malformed native data
  }
}

export function openLocationSettings(): void {
  UnlockAttemptModule?.openLocationSettings?.();
}

export function startUnlockListener(): () => void {
  const subscription = unlockEmitter.addListener('UNLOCK_DETECTED', () => {
    syncPendingNativeEvents();
  });

  return () => subscription.remove();
}

export async function getUnlockEvents(): Promise<UnlockEvent[]> {
  return loadStoredEvents();
}

export async function clearUnlockEvents(): Promise<void> {
  await AsyncStorage.removeItem(STORAGE_KEY);
  UnlockAttemptModule?.clearPendingEvents?.();
}
