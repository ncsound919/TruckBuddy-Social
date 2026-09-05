import React, { createContext, useContext, useEffect, useState } from 'react';
import { User as FirebaseUser, onAuthStateChanged } from 'firebase/auth';
import { auth, db } from '../lib/firebase';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { Profile } from '../types';

interface FirebaseContextType {
  user: FirebaseUser | null;
  profile: Profile | null;
  loading: boolean;
  refreshProfile: () => Promise<void>;
}

const FirebaseContext = createContext<FirebaseContextType | undefined>(undefined);

export function FirebaseProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchProfile = async (uid: string) => {
    try {
      const docRef = doc(db, 'users', uid);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        setProfile(docSnap.data() as Profile);
      } else {
        // If no profile, create a default one based on auth user
        const newProfile: Partial<Profile> = {
          id: uid,
          displayName: auth.currentUser?.displayName || 'New Driver',
          username: auth.currentUser?.email?.split('@')[0] || 'driver',
          avatarUrl: auth.currentUser?.photoURL || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=200',
          bio: 'CDL Driver on the Truck Buddy Network',
          isVerified: false,
          yearsExperience: 0,
          currentRig: 'Pending Setup',
          lanes: ['I-80'],
          role: 'driver',
          cdlClass: 'A',
          homeBase: 'Not set',
          carrierName: 'Independent',
          followerCount: 0,
          followingCount: 0,
          postCount: 0
        };
        await setDoc(docRef, { ...newProfile, createdAt: serverTimestamp() });
        setProfile(newProfile as Profile);
      }
    } catch (error) {
      console.error('Error fetching user profile:', error);
      // Fallback to minimal profile if fetch fails
      setProfile({
        id: uid,
        displayName: 'Guest Driver',
        username: 'guest',
        avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=200',
        bio: 'CDL Driver on the Truck Buddy Network',
        isVerified: false,
        yearsExperience: 0,
        currentRig: 'N/A',
        lanes: [],
        carrierName: 'Independent',
        followerCount: 0,
        followingCount: 0,
        postCount: 0,
        role: 'driver',
        cdlClass: 'None',
        homeBase: 'Offline'
      } as Profile);
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (fbUser) => {
      setUser(fbUser);
      if (fbUser) {
        await fetchProfile(fbUser.uid);
      } else {
        setProfile(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const refreshProfile = async () => {
    if (user) {
      await fetchProfile(user.uid);
    }
  };

  return (
    <FirebaseContext.Provider value={{ user, profile, loading, refreshProfile }}>
      {children}
    </FirebaseContext.Provider>
  );
}

export function useFirebase() {
  const context = useContext(FirebaseContext);
  if (context === undefined) {
    throw new Error('useFirebase must be used within a FirebaseProvider');
  }
  return context;
}
