package app.venus.media

import android.app.Service
import android.content.Intent
import android.content.pm.ServiceInfo
import android.os.Build
import android.os.IBinder

/**
 * Keeps Discord's process running while a voice message or audio file plays with Discord in the background (#134).
 * Without a foreground service Android freezes a backgrounded app after a few seconds, which stops the sound. It only
 * carries the media notification [BackgroundMedia] builds; all playback stays in Discord's own player.
 */
class MediaService : Service() {
    override fun onBind(intent: Intent?): IBinder? = null

    override fun onCreate() {
        super.onCreate()
        instance = this
    }

    override fun onStartCommand(intent: Intent?, flags: Int, startId: Int): Int {
        instance = this
        if (!promote()) stopSelf()
        return START_NOT_STICKY
    }

    /** Shows the current media notification as this service's own. False when there's nothing to show any more. */
    fun promote(): Boolean {
        val notification = BackgroundMedia.currentNotification() ?: return false
        return try {
            if (Build.VERSION.SDK_INT >= 29) startForeground(BackgroundMedia.NOTIFICATION_ID, notification, ServiceInfo.FOREGROUND_SERVICE_TYPE_MEDIA_PLAYBACK)
            else startForeground(BackgroundMedia.NOTIFICATION_ID, notification)
            true
        } catch (_: Throwable) { false }
    }

    /** Paused: the notification stays, but can be swiped away and no longer keeps Discord running. */
    fun demote() {
        try {
            if (Build.VERSION.SDK_INT >= 24) stopForeground(STOP_FOREGROUND_DETACH) else @Suppress("DEPRECATION") stopForeground(false)
        } catch (_: Throwable) { }
    }

    override fun onDestroy() {
        if (instance === this) instance = null
        super.onDestroy()
    }

    companion object {
        @Volatile
        @JvmStatic
        var instance: MediaService? = null
    }
}
