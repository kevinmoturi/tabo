package com.tamboapp.security

import android.content.BroadcastReceiver
import android.content.Context
import android.content.Intent

/**
 * Marks each power-on in the event log.
 *
 * Worth being clear about what this does and does not buy: failed-unlock
 * detection does **not** depend on it. The device-admin broadcast starts the
 * app process on its own, so attempts are captured after a reboot whether or
 * not this receiver ever runs. What a boot marker gives you is the ability to
 * read the log and see that the phone was restarted between two runs of
 * attempts — a reboot is a common first move after a theft — and, once the
 * evidence uploader lands, a natural moment to flush anything still queued.
 *
 * `LOCKED_BOOT_COMPLETED` arrives during direct boot, before the first unlock;
 * `BOOT_COMPLETED` arrives after it. Both are handled because the interesting
 * case is the phone that is switched on and never unlocked.
 */
class BootReceiver : BroadcastReceiver() {
    override fun onReceive(context: Context, intent: Intent) {
        when (intent.action) {
            Intent.ACTION_BOOT_COMPLETED,
            Intent.ACTION_LOCKED_BOOT_COMPLETED,
            QUICKBOOT_POWERON,
            HTC_QUICKBOOT_POWERON -> {
                UnlockAttemptStore.recordBoot(context)
            }
        }
    }

    private companion object {
        // Non-standard fast-boot broadcasts still used by some OEM ROMs.
        const val QUICKBOOT_POWERON = "android.intent.action.QUICKBOOT_POWERON"
        const val HTC_QUICKBOOT_POWERON = "com.htc.intent.action.QUICKBOOT_POWERON"
    }
}
