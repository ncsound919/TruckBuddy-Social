import { useState, useEffect } from 'react';
import { AppNotification, Profile } from '../types';
import { sampleNotifications } from '../data';

export function useNotifications(userId: string) {
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [isNotifOpen, setIsNotifOpen] = useState(false);

  useEffect(() => {
    const cachedNotifs = localStorage.getItem('trucker_notifications');
    if (cachedNotifs) {
      setNotifications(JSON.parse(cachedNotifs));
    } else {
      setNotifications(sampleNotifications);
      localStorage.setItem('trucker_notifications', JSON.stringify(sampleNotifications));
    }
  }, []);

  const saveNotifications = (updatedOrUpdater: AppNotification[] | ((prev: AppNotification[]) => AppNotification[])) => {
    setNotifications(prev => {
      const updated = typeof updatedOrUpdater === 'function' ? updatedOrUpdater(prev) : updatedOrUpdater;
      localStorage.setItem('trucker_notifications', JSON.stringify(updated));
      return updated;
    });
  };

  const addNotification = (message: string, type: 'like' | 'comment', actor?: Profile) => {
    const newNotif: AppNotification = {
      id: `notif-${Date.now()}`,
      recipientId: userId,
      actor: actor || {
        id: 'external-driver',
        username: 'GearJammer_77',
        displayName: 'Marcus "GearJammer" Cruz',
        avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=200',
        bio: 'Produce hauler',
        role: 'driver',
        cdlClass: 'A',
        yearsExperience: 6,
        currentRig: 'Cascadia',
        homeBase: 'Fresno, CA',
        lanes: [],
        carrierName: 'Prime Fresh',
        isVerified: false,
        followerCount: 0,
        followingCount: 0,
        postCount: 0
      },
      type: type === 'like' ? 'like' : 'comment',
      read: false,
      message: message,
      createdAt: new Date().toISOString()
    };

    saveNotifications(prev => [newNotif, ...prev]);
  };

  const markAllRead = () => {
    const updated = notifications.map(n => ({ ...n, read: true }));
    saveNotifications(updated);
  };

  const clearNotifs = () => {
    saveNotifications([]);
    setIsNotifOpen(false);
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  return {
    notifications,
    isNotifOpen,
    setIsNotifOpen,
    unreadCount,
    addNotification,
    markAllRead,
    clearNotifs
  };
}
