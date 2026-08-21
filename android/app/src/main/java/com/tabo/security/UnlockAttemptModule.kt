package com.tabo.security

import android.content.Context
import android.content.Intent
import android.net.Uri
import android.provider.Settings
import com.facebook.react.bridge.Callback
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod
import com.facebook.react.modules.core.DeviceEventManagerModule
import org.json.JSONArray
import org.json.JSONObject

class UnlockAttemptModule(reactContext: ReactApplicationContext) : ReactContextBaseJavaModule(reactContext) {

    companion object {
        private const val PREFS_NAME = "UnlockAttemptPrefs"
        private const val PENDING_EVENTS_KEY = "pending_unlock_events"
        private const val UNLOCK_EVENT = "UNLOCK_DETECTED"

        @Volatile
        private var instance: UnlockAttemptModule? = null

        fun onDeviceUnlocked(
            context: Context,
            latitude: Double? = null,
            longitude: Double? = null,
            accuracy: Float? = null
        ) {
            val prefs = context.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE)
            val events = JSONArray(prefs.getString(PENDING_EVENTS_KEY, "[]") ?: "[]")
            events.put(
                JSONObject().apply {
                    put("time", System.currentTimeMillis())
                    if (latitude != null) put("latitude", latitude)
                    if (longitude != null) put("longitude", longitude)
                    if (accuracy != null) put("accuracy", accuracy)
                }
            )
            prefs.edit().putString(PENDING_EVENTS_KEY, events.toString()).apply()

            instance?.emitUnlockEvent()
        }
    }

    init {
        instance = this
    }

    override fun getName() = "UnlockAttemptModule"

    @ReactMethod
    fun getPendingEvents(callback: Callback) {
        val prefs = reactApplicationContext.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE)
        val eventsJson = prefs.getString(PENDING_EVENTS_KEY, "[]") ?: "[]"
        callback.invoke(null, eventsJson)
        prefs.edit().remove(PENDING_EVENTS_KEY).apply()
    }

    @ReactMethod
    fun clearPendingEvents() {
        reactApplicationContext.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE)
            .edit()
            .remove(PENDING_EVENTS_KEY)
            .apply()
    }

    @ReactMethod
    fun openLocationSettings() {
        val intent = Intent(Settings.ACTION_APPLICATION_DETAILS_SETTINGS).apply {
            data = Uri.fromParts("package", reactApplicationContext.packageName, null)
            addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
        }
        reactApplicationContext.startActivity(intent)
    }

    @ReactMethod
    fun addListener(@Suppress("UNUSED_PARAMETER") eventName: String) {
        // Required by NativeEventEmitter
    }

    @ReactMethod
    fun removeListeners(@Suppress("UNUSED_PARAMETER") count: Int) {
        // Required by NativeEventEmitter
    }

    private fun emitUnlockEvent() {
        try {
            reactApplicationContext
                .getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter::class.java)
                ?.emit(UNLOCK_EVENT, null)
        } catch (_: Throwable) {
            // React context may not be active; event is already persisted in SharedPreferences
        }
    }
}
