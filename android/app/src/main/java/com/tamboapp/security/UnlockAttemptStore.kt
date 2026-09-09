package com.tamboapp.security

import android.content.Context
import android.os.Build
import android.os.SystemClock
import org.json.JSONArray
import org.json.JSONObject
import java.util.UUID
import kotlin.math.abs

/**
 * The durable capture store for lock-screen events.
 *
 * Everything here has to work with **no JavaScript running**: the device-admin
 * broadcast that reports a failed unlock arrives whether or not the app was
 * ever opened, and after a theft the owner's UI never runs on that phone
 * again. So capture writes here, natively, and JS only mirrors this into
 * AsyncStorage later for display.
 *
 * Storage is *device-protected* (see [storageContext]) so events survive the
 * direct-boot window — the phone has been switched on but never unlocked,
 * which is exactly when a thief is trying PINs.
 */
object UnlockAttemptStore {

    const val TYPE_UNLOCK_FAILED = "UNLOCK_FAILED"
    const val TYPE_UNLOCK_SUCCEEDED = "UNLOCK_SUCCEEDED"
    const val TYPE_ADMIN_ENABLED = "ADMIN_ENABLED"
    const val TYPE_ADMIN_DISABLED = "ADMIN_DISABLED"
    const val TYPE_BOOT = "BOOT"

    private const val PREFS_NAME = "tambo_unlock_events"
    private const val KEY_EVENTS = "events"
    private const val KEY_ATTEMPT_COUNTER = "attempt_counter"
    private const val KEY_LAST_BOOT = "last_boot_millis"

    /** Slack for clock adjustments between the two boot broadcasts. */
    private const val BOOT_TOLERANCE_MS = 60_000L

    /** Failed unlocks are a few dozen bytes each; this cap is generous. */
    private const val MAX_EVENTS = 1000

    private val lock = Any()

    /**
     * Credential-encrypted storage is unreadable until the user unlocks the
     * phone for the first time after boot — precisely the window we care
     * about. Device-protected storage trades encryption-at-rest-behind-the-PIN
     * for availability during direct boot. The events hold timestamps and
     * counts, never credentials, so that trade is the right way round.
     */
    private fun storageContext(context: Context): Context =
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.N) {
            context.createDeviceProtectedStorageContext()
        } else {
            context
        }

    private fun prefs(context: Context) =
        storageContext(context).getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE)

    /**
     * Records a failed unlock and returns the attempt number within the
     * current run of failures.
     */
    fun recordFailedUnlock(context: Context): Int = synchronized(lock) {
        val store = prefs(context)
        val attemptNo = store.getInt(KEY_ATTEMPT_COUNTER, 0) + 1

        val event = JSONObject()
            .put("id", UUID.randomUUID().toString())
            .put("type", TYPE_UNLOCK_FAILED)
            .put("at", System.currentTimeMillis())
            .put("attemptNo", attemptNo)
            // The broadcast never says which credential was tried, and
            // biometric failures never reach us at all. Claiming otherwise
            // would put a lie in the evidence log.
            .put("method", "unknown")

        appendLocked(store, event)
        store.edit().putInt(KEY_ATTEMPT_COUNTER, attemptNo).commit()
        attemptNo
    }

    /** A non-failure event: status changes, boots, successful unlocks. */
    fun recordEvent(context: Context, type: String) = synchronized(lock) {
        val event = JSONObject()
            .put("id", UUID.randomUUID().toString())
            .put("type", type)
            .put("at", System.currentTimeMillis())

        appendLocked(prefs(context), event)
    }

    /**
     * Records one BOOT marker per power-on. Both LOCKED_BOOT_COMPLETED and
     * BOOT_COMPLETED fire for a single boot on a direct-boot-aware receiver,
     * which would otherwise put two markers in the log every time.
     *
     * Wall-clock minus uptime is roughly constant within a boot and jumps
     * across one, so it identifies the boot without needing extra state. The
     * tolerance absorbs clock adjustments (NTP sync during startup).
     */
    fun recordBoot(context: Context) = synchronized(lock) {
        val store = prefs(context)
        val bootMillis = System.currentTimeMillis() - SystemClock.elapsedRealtime()
        val lastBootMillis = store.getLong(KEY_LAST_BOOT, Long.MIN_VALUE)

        if (abs(bootMillis - lastBootMillis) <= BOOT_TOLERANCE_MS) {
            return@synchronized
        }

        store.edit().putLong(KEY_LAST_BOOT, bootMillis).commit()
        appendLocked(
            store,
            JSONObject()
                .put("id", UUID.randomUUID().toString())
                .put("type", TYPE_BOOT)
                .put("at", System.currentTimeMillis()),
        )
    }

    /** A successful unlock ends the current run of failed attempts. */
    fun resetAttemptCounter(context: Context) = synchronized(lock) {
        prefs(context).edit().putInt(KEY_ATTEMPT_COUNTER, 0).commit()
    }

    fun currentAttemptStreak(context: Context): Int =
        prefs(context).getInt(KEY_ATTEMPT_COUNTER, 0)

    /** Raw JSON array of every stored event, oldest first. */
    fun readAll(context: Context): String =
        prefs(context).getString(KEY_EVENTS, "[]") ?: "[]"

    fun failedCount(context: Context): Int {
        val events = JSONArray(readAll(context))
        var count = 0
        for (i in 0 until events.length()) {
            if (events.optJSONObject(i)?.optString("type") == TYPE_UNLOCK_FAILED) {
                count++
            }
        }
        return count
    }

    /**
     * Drops the named events, and only those. JS acknowledges ids *after* it
     * has durably written them to AsyncStorage, so a crash between read and
     * write costs a duplicate — deduplicated by id on the way in — never a
     * lost attempt.
     */
    fun acknowledge(context: Context, ids: Set<String>) = synchronized(lock) {
        if (ids.isEmpty()) return@synchronized
        val store = prefs(context)
        val events = JSONArray(store.getString(KEY_EVENTS, "[]") ?: "[]")
        val remaining = JSONArray()
        for (i in 0 until events.length()) {
            val event = events.optJSONObject(i) ?: continue
            if (event.optString("id") !in ids) {
                remaining.put(event)
            }
        }
        store.edit().putString(KEY_EVENTS, remaining.toString()).commit()
    }

    fun clear(context: Context) = synchronized(lock) {
        prefs(context).edit()
            .putString(KEY_EVENTS, "[]")
            .putInt(KEY_ATTEMPT_COUNTER, 0)
            .commit()
    }

    private fun appendLocked(
        store: android.content.SharedPreferences,
        event: JSONObject,
    ) {
        val events = JSONArray(store.getString(KEY_EVENTS, "[]") ?: "[]")
        events.put(event)

        val trimmed = if (events.length() > MAX_EVENTS) {
            JSONArray().also { out ->
                for (i in events.length() - MAX_EVENTS until events.length()) {
                    out.put(events.get(i))
                }
            }
        } else {
            events
        }

        // commit(), not apply(): a broadcast receiver's process can be killed
        // the moment onReceive returns, and an in-flight async write dies
        // with it.
        store.edit().putString(KEY_EVENTS, trimmed.toString()).commit()
    }
}
