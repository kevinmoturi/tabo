package com.tamboapp.security

import android.content.BroadcastReceiver
import android.content.Context
import android.content.Intent

/**
 * `ACTION_USER_PRESENT` fires on a **successful** unlock — the owner's own
 * usage, not an attacker's. It is kept only so a successful unlock ends the
 * current run of failed attempts on devices where device admin is off or the
 * password-succeeded callback does not arrive.
 *
 * It deliberately no longer records location. Tagging every unlock with the
 * owner's coordinates is a standing privacy cost that buys no theft evidence:
 * a thief who unlocks the phone has the PIN, and the failed attempts that
 * matter never reach this receiver at all.
 */
class UnlockReceiver : BroadcastReceiver() {
    override fun onReceive(context: Context, intent: Intent) {
        if (intent.action == Intent.ACTION_USER_PRESENT) {
            UnlockAttemptStore.resetAttemptCounter(context)
            UnlockAttemptModule.notifyJs()
        }
    }
}
