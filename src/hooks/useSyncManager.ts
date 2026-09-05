import { useEffect } from 'react';
import { AppNotification, Profile } from '../types';

export function useSyncManager(
  isDeadZone: boolean,
  userProfile: Profile,
  saveNotifications: (updater: (prev: AppNotification[]) => AppNotification[]) => void
) {
  useEffect(() => {
    if (!isDeadZone && userProfile) {
      const queuedPostsCached = localStorage.getItem('trucker_offline_media_queue');
      const queuedDMsCached = localStorage.getItem('trucker_offline_messages');
      let syncPostCount = 0;
      let syncDMCount = 0;

      if (queuedPostsCached) {
        const queuedPosts = JSON.parse(queuedPostsCached);
        if (queuedPosts.length > 0) {
          syncPostCount = queuedPosts.length;
          const currentPosts = JSON.parse(localStorage.getItem('trucker_posts') || '[]');
          const syncedPosts = [...queuedPosts, ...currentPosts];
          localStorage.setItem('trucker_posts', JSON.stringify(syncedPosts));
          localStorage.removeItem('trucker_offline_media_queue');
        }
      }

      if (queuedDMsCached) {
        const queuedDMs = JSON.parse(queuedDMsCached);
        if (queuedDMs.length > 0) {
          syncDMCount = queuedDMs.length;
          const currentDMs = JSON.parse(localStorage.getItem('trucker_dms') || '[]');
          const syncedDMs = [...currentDMs, ...queuedDMs];
          localStorage.setItem('trucker_dms', JSON.stringify(syncedDMs));
          localStorage.removeItem('trucker_offline_messages');
        }
      }

      if (syncPostCount > 0 || syncDMCount > 0) {
        const syncNotif: AppNotification = {
          id: `sync-${Date.now()}`,
          recipientId: userProfile.id,
          type: 'system',
          read: false,
          message: `📡 Connection Restored: Synced ${syncPostCount} post uploads successfully with the cloud database. All media pipelines active!`,
          createdAt: new Date().toISOString()
        };
        saveNotifications(prev => [syncNotif, ...prev]);
      }
    }
  }, [isDeadZone, userProfile, saveNotifications]);
}
