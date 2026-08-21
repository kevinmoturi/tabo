# Implementation Plan: Recording Failed Unlock Attempts

Implement the ability to detect and record failed device unlock attempts (PIN, Pattern, or Password) by leveraging the Android Device Administration API.

## User Review Required

> [!IMPORTANT]
> This implementation requires the user to manually grant **Device Administrator** permissions to the app. The app will provide a mechanism to trigger this request, but it cannot be enabled automatically.

> [!WARNING]
> Google Play Store policies are very strict about the use of `DeviceAdminReceiver`. Ensure your app's privacy policy and store description clearly state why this permission is needed.

## Proposed Changes

### [Security Component](file:///C:/Projects/React Native/tabo/android/app/src/main/java/com/tabo/security)

#### [NEW] [MyDeviceAdminReceiver.kt](file:///C:/Projects/React Native/tabo/android/app/src/main/java/com/tabo/security/MyDeviceAdminReceiver.kt)
Create a new `DeviceAdminReceiver` class to listen for `onPasswordFailed` events and record them using the existing `UnlockAttemptModule` logic.

#### [MODIFY] [UnlockAttemptModule.kt](file:///C:/Projects/React Native/tabo/android/app/src/main/java/com/tabo/security/UnlockAttemptModule.kt)
- Add a new constant for failed attempt events.
- Implement `onPasswordFailed` static method to record failure events in `SharedPreferences`.
- Add `@ReactMethod` `isAdminActive` to check if the app has device admin privileges.
- Add `@ReactMethod` `requestAdminPrivileges` to open the system settings for device admin activation.

### [Android Resources](file:///C:/Projects/React Native/tabo/android/app/src/main/res)

#### [NEW] [device_admin.xml](file:///C:/Projects/React Native/tabo/android/app/src/main/res/xml/device_admin.xml)
Define the required metadata for the device administrator, specifying that the app needs to monitor unlock attempts.

### [App Configuration](file:///C:/Projects/React Native/tabo/android/app/src/main/AndroidManifest.xml)

#### [MODIFY] [AndroidManifest.xml](file:///C:/Projects/React Native/tabo/android/app/src/main/AndroidManifest.xml)
Register the `MyDeviceAdminReceiver` with the appropriate intent filters and metadata link.

## Verification Plan

### Automated Tests
- I will check the code for syntax errors using `analyze_file`.
- I will verify the build by running a gradle assemble task.

### Manual Verification
1.  **Check Admin Status:** Call `UnlockAttemptModule.isAdminActive()` from React Native.
2.  **Request Admin:** Call `UnlockAttemptModule.requestAdminPrivileges()`, verify the system dialog appears, and activate it.
3.  **Test Failure:** Lock the device and enter an incorrect PIN/Pattern.
4.  **Test Success:** Unlock the device correctly.
5.  **Retrieve Events:** Call `UnlockAttemptModule.getPendingEvents()` and verify both success and failure events are present.
