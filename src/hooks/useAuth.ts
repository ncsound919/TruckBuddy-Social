import { useState, useEffect } from 'react';
import { Profile } from '../types';
import { currentUserProfile } from '../data';

export function useAuth() {
  const [profile, setProfile] = useState<Profile>(currentUserProfile);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const cached = localStorage.getItem('trucker_current_profile');
    if (cached) {
      const p = JSON.parse(cached);
      setProfile(p);
      setIsAdmin(p.role === 'admin' || p.role === 'moderator');
    } else {
      setProfile(currentUserProfile);
      setIsAdmin(currentUserProfile.role === 'admin' || currentUserProfile.role === 'moderator');
    }
  }, []);

  const updateProfile = (updated: Profile) => {
    setProfile(updated);
    setIsAdmin(updated.role === 'admin' || updated.role === 'moderator');
    localStorage.setItem('trucker_current_profile', JSON.stringify(updated));
  };

  const toggleAdminMode = () => {
    const newRole = profile.role === 'admin' ? 'driver' : 'admin';
    const updated = { ...profile, role: newRole as any };
    updateProfile(updated);
  };

  return {
    profile,
    isAdmin,
    updateProfile,
    toggleAdminMode
  };
}
