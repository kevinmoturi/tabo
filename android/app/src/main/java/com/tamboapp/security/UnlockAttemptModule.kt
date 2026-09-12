package com.tamboapp.security

import android.app.KeyguardManager
import android.app.admin.DevicePolicyManager
import android.content.Context
import android.content.Intent
import android.net.Uri
import android.provider.Settings
import android.util.Log
import com.facebook.react.bridge.Promise
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod
import com.facebook.react.bridge.ReadableArray
import com.facebook.react.bridge.WritableMap
import com.facebook.react.bridge.Arguments
import com.facebook.react.modules.core.DeviceEventManagerModule

/**
 * The read side of the capture path. Native code writes lock-screen events
 * without any help from JavaScript; this module lets the owner's UI read them,
 * acknowledge what it has stored, and turn protection on.
 */
class UnlockAttemptModule(reactContext: ReactApplicationContext) :
    ReactContextBaseJavaModule(reactContext) {

    companion object {
        private const val EVENT_NAME = "UNLOCK_EVENTS_CHANGED"
        private const val TAG = "TamboUnlock"

        @Volatile
        private var instance: UnlockAttemptModule? = null

        /**
         * Nudges the UI if it happens to be running. Receivers must never
         * depend on this: the event is already durable in
         * [UnlockAttemptStore] by the time this is called, and on a stolen
         * phone there is no JS runtime to nudge.
         */
        fun notifyJs() {
            instance?.emitChanged()
        }
    }

    init {
        instance = this
    }

    override fun getName() = "UnlockAttemptModule"

    override fun invalidate() {
        if (instance === this) {
            instance = null
        }
        super.invalidate()
    }

    /** Every stored event as a JSON array string, oldest first. */
    @ReactMethod
    fun getEvents(promise: Promise) {
        try {
            promise.resolve(UnlockAttemptStore.readAll(reactApplicationContext))
        } catch (error: Throwable) {
            promise.reject("read_failed", error)
        }
    }

    /**
     * Called only once JS has durably written the events. Anything not
     * acknowledged is handed out again next time, so nothing is lost to a
     * crash in between.
     */
    @ReactMethod
    fun acknowledgeEvents(ids: ReadableArray, promise: Promise) {
        try {
            val seen = mutableSetOf<String>()
            for (i in 0 until ids.size()) {
                ids.getString(i)?.let { seen.add(it) }
            }
            UnlockAttemptStore.acknowledge(reactApplicationContext, seen)
            promise.resolve(true)
        } catch (error: Throwable) {
            promise.reject("acknowledge_failed", error)
        }
    }

    @ReactMethod
    fun clearEvents(promise: Promise) {
        try {
            UnlockAttemptStore.clear(reactApplicationContext)
            promise.resolve(true)
        } catch (error: Throwable) {
            promise.reject("clear_failed", error)
        }
    }

    /**
     * Whether failed unlocks are actually being recorded. Both flags have to
     * be true, and either can change outside the app, so the UI re-reads this
     * rather than remembering it.
     *
     * `deviceSecure` is the one that bites: with no PIN, pattern or password
     * set there is no credential to fail, so `onPasswordFailed` never fires no
     * matter how healthy the rest of the setup looks.
     */
    @ReactMethod
    fun getProtectionStatus(promise: Promise) {
        try {
            val status: WritableMap = Arguments.createMap().apply {
                putBoolean("deviceAdminActive", isAdminActive())
                putBoolean("deviceSecure", isDeviceSecure())
                putInt(
                    "currentAttemptStreak",
                    UnlockAttemptStore.currentAttemptStreak(reactApplicationContext),
                )
            }
            promise.resolve(status)
        } catch (error: Throwable) {
            Log.e(TAG, "getProtectionStatus failed", error)
            promise.reject("status_failed", error)
        }
    }

    /**
     * Opens the system device-admin consent screen and reports what actually
     * happened, so the caller never claims a screen appeared when it did not.
     * Consent itself arrives out of band — re-read [getProtectionStatus] when
     * the app returns to the foreground.
     */
    @ReactMethod
    fun requestDeviceAdmin(promise: Promise) {
        try {
            if (isAdminActive()) {
                promise.resolve(
                    Arguments.createMap().apply {
                        putBoolean("opened", false)
                        putBoolean("alreadyActive", true)
                    },
                )
                return
            }

            val intent = Intent(DevicePolicyManager.ACTION_ADD_DEVICE_ADMIN).apply {
                putExtra(
                    DevicePolicyManager.EXTRA_DEVICE_ADMIN,
                    MyDeviceAdminReceiver.componentName(reactApplicationContext),
                )
                putExtra(
                    DevicePolicyManager.EXTRA_ADD_EXPLANATION,
                    "Tambo uses this to record failed unlock attempts if your phone is stolen.",
                )
            }

            // Launch from the visible activity when there is one. Starting
            // from the application context needs NEW_TASK and lands the
            // consent screen in its own task, where returning to the app can
            // drop the user somewhere unexpected.
            val activity = reactApplicationContext.currentActivity
            if (activity != null) {
                activity.startActivity(intent)
            } else {
                intent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
                reactApplicationContext.startActivity(intent)
            }

            promise.resolve(
                Arguments.createMap().apply {
                    putBoolean("opened", true)
                    putBoolean("alreadyActive", false)
                },
            )
        } catch (error: Throwable) {
            Log.e(TAG, "requestDeviceAdmin failed", error)
            promise.reject("request_failed", error)
        }
    }

    /**
     * Turns protection off by dropping Tambo's own device-admin grant. No
     * system screen is involved; the receiver's onDisabled records an
     * ADMIN_DISABLED event so the log shows when capture stopped. The system
     * applies the removal asynchronously, so a status read immediately after
     * can still say active — callers re-check.
     */
    @ReactMethod
    fun removeDeviceAdmin(promise: Promise) {
        try {
            if (!isAdminActive()) {
                promise.resolve(false)
                return
            }
            val dpm = reactApplicationContext
                .getSystemService(Context.DEVICE_POLICY_SERVICE) as DevicePolicyManager
            dpm.removeActiveAdmin(MyDeviceAdminReceiver.componentName(reactApplicationContext))
            promise.resolve(true)
        } catch (error: Throwable) {
            Log.e(TAG, "removeDeviceAdmin failed", error)
            promise.reject("remove_failed", error)
        }
    }

    /** Where the user sets a PIN, pattern or password. */
    @ReactMethod
    fun openSecuritySettings(promise: Promise) {
        try {
            startExternal(Intent(Settings.ACTION_SECURITY_SETTINGS))
            promise.resolve(true)
        } catch (error: Throwable) {
            Log.e(TAG, "openSecuritySettings failed", error)
            promise.reject("open_failed", error)
        }
    }

    @ReactMethod
    fun openAppSettings() {
        try {
            startExternal(
                Intent(Settings.ACTION_APPLICATION_DETAILS_SETTINGS).apply {
                    data = Uri.fromParts("package", reactApplicationContext.packageName, null)
                },
            )
        } catch (error: Throwable) {
            Log.e(TAG, "openAppSettings failed", error)
        }
    }

    private fun startExternal(intent: Intent) {
        val activity = reactApplicationContext.currentActivity
        if (activity != null) {
            activity.startActivity(intent)
        } else {
            intent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
            reactApplicationContext.startActivity(intent)
        }
    }

    @ReactMethod
    fun addListener(@Suppress("UNUSED_PARAMETER") eventName: String) {
        // Required by NativeEventEmitter
    }

    @ReactMethod
    fun removeListeners(@Suppress("UNUSED_PARAMETER") count: Int) {
        // Required by NativeEventEmitter
    }

    private fun isAdminActive(): Boolean {
        val dpm = reactApplicationContext
            .getSystemService(Context.DEVICE_POLICY_SERVICE) as? DevicePolicyManager
            ?: return false
        return dpm.isAdminActive(MyDeviceAdminReceiver.componentName(reactApplicationContext))
    }

    /** True only for PIN, pattern or password — swipe-to-unlock is not secure. */
    private fun isDeviceSecure(): Boolean {
        val keyguard = reactApplicationContext
            .getSystemService(Context.KEYGUARD_SERVICE) as? KeyguardManager
            ?: return false
        return keyguard.isDeviceSecure
    }

    private fun emitChanged() {
        try {
            reactApplicationContext
                .getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter::class.java)
                ?.emit(EVENT_NAME, null)
        } catch (_: Throwable) {
            // No live React context. The event is already on disk; the UI
            // picks it up on next foreground.
        }
    }
}
