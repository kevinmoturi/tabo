import { PermissionsAndroid, Platform } from 'react-native';
import { openAppSettings } from './UnlockAttempts';

/**
 * Location permission helpers.
 *
 * Note what is no longer here: this module used to sync unlock events into
 * AsyncStorage and tag each one with GPS coordinates. That path recorded the
 * *owner's* successful unlocks and movements, which is a standing privacy cost
 * that buys no theft evidence. Failed-attempt capture now lives in
 * ./UnlockAttempts, backed by native code that runs without the app open.
 */

export async function requestLocationPermission(): Promise<boolean> {
  if (Platform.OS !== 'android') {
    return true;
  }

  const granted = await PermissionsAndroid.request(
    PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
    {
      title: 'Location Permission',
      message:
        'Tabo uses your location to show where your device was when an alert was raised.',
      buttonPositive: 'OK',
    },
  );

  return granted === PermissionsAndroid.RESULTS.GRANTED;
}

/** Opens this app's system settings page, where location access is granted. */
export function openLocationSettings(): void {
  openAppSettings();
}
