package com.tamboapp.security

import android.app.admin.DeviceAdminReceiver
import android.content.ComponentName
import android.content.Context
import android.content.Intent
import android.os.UserHandle

/**
 * The only thing on Android that reports a **failed** unlock to a third-party
 * app. It needs the `<watch-login/>` policy (already declared in
 * res/xml/device_admin.xml) and the user's explicit consent through the system
 * device-admin screen.
 *
 * Scope, stated plainly: `onPasswordFailed` fires for PIN, pattern and
 * password only. Failed **face and fingerprint** attempts are never delivered
 * to any app — Android exposes no such callback. In practice a run of failed
 * biometrics makes the system demand the PIN, and those failures do land here,
 * so biometric attacks are visible indirectly, late, and undercounted.
 *
 * The system starts the app process to deliver these broadcasts even if the
 * app has never been opened since boot, so detection needs no foreground
 * service and no JavaScript.
 */
class MyDeviceAdminReceiver : DeviceAdminReceiver() {

    // API 26+ delivers this overload. It deliberately does not call super,
    // whose default implementation would forward to the two-arg version below
    // and count the same failure twice.
    override fun onPasswordFailed(context: Context, intent: Intent, user: UserHandle) {
        recordFailure(context)
    }

    @Deprecated("Delivered on API < 26 only; the three-arg overload supersedes it.")
    @Suppress("DEPRECATION", "OVERRIDE_DEPRECATION")
    override fun onPasswordFailed(context: Context, intent: Intent) {
        recordFailure(context)
    }

    override fun onPasswordSucceeded(context: Context, intent: Intent, user: UserHandle) {
        recordSuccess(context)
    }

    @Deprecated("Delivered on API < 26 only; the three-arg overload supersedes it.")
    @Suppress("DEPRECATION", "OVERRIDE_DEPRECATION")
    override fun onPasswordSucceeded(context: Context, intent: Intent) {
        recordSuccess(context)
    }

    override fun onEnabled(context: Context, intent: Intent) {
        UnlockAttemptStore.recordEvent(context, UnlockAttemptStore.TYPE_ADMIN_ENABLED)
        UnlockAttemptModule.notifyJs()
    }

    /**
     * The user can revoke device admin from Settings at any time, and a thief
     * who knows the phone may. Recording the revocation keeps the gap visible
     * in the log rather than looking like a quiet stretch of no attempts.
     */
    override fun onDisabled(context: Context, intent: Intent) {
        UnlockAttemptStore.recordEvent(context, UnlockAttemptStore.TYPE_ADMIN_DISABLED)
        UnlockAttemptModule.notifyJs()
    }

    override fun onDisableRequested(context: Context, intent: Intent): CharSequence =
        "Tambo will stop recording failed unlock attempts on this phone."

    private fun recordFailure(context: Context) {
        // Cheap and synchronous: a DeviceAdminReceiver runs on the main thread
        // with roughly ten seconds before the system considers it hung.
        UnlockAttemptStore.recordFailedUnlock(context)
        UnlockAttemptModule.notifyJs()
    }

    private fun recordSuccess(context: Context) {
        UnlockAttemptStore.resetAttemptCounter(context)
        UnlockAttemptStore.recordEvent(context, UnlockAttemptStore.TYPE_UNLOCK_SUCCEEDED)
        UnlockAttemptModule.notifyJs()
    }

    companion object {
        fun componentName(context: Context): ComponentName =
            ComponentName(context.applicationContext, MyDeviceAdminReceiver::class.java)
    }
}
