import fs from 'fs';
const code = fs.readFileSync('src/lib/firebase.ts', 'utf8');
const corrected = `import { initializeApp } from 'firebase/app';
import { 
  getFirestore, collection, doc, setDoc, getDocs, getDoc, 
  onSnapshot, query, orderBy, limit, Timestamp, serverTimestamp, 
  updateDoc, arrayUnion, arrayRemove, increment, addDoc, where 
} from 'firebase/firestore';
import { getAuth, signInAnonymously, onAuthStateChanged, User as FirebaseUser } from 'firebase/auth';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "demo-key",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "demo.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "demo-project",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "demo.appspot.com",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "12345",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:123:web:123",
  firestoreDatabaseId: import.meta.env.VITE_FIREBASE_DATABASE_ID || "(default)"
};

import { 
  Post, 
  PostComment, 
  Profile, 
  Convoy, 
  ConvoyMessage, 
  MemberLocation, 
  MileageLeaderboardEntry,
  MileageProof 
} from '../types';
import { currentUserProfile } from '../data';

// 1. Initialize Firebase App
export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);

// 2. Auth Helper: Auto-sign in anonymously if no user is present
export const initAuth = (): Promise<FirebaseUser | null> => {
  return new Promise((resolve) => {
    onAuthStateChanged(auth, async (user) => {
      if (user) {
        resolve(user);
      } else {
        try {
          const cred = await signInAnonymously(auth);
          resolve(cred.user);
        } catch (err) {
          console.warn('Anonymous auth note:', err);
          resolve(null);
        }
      }
    });
  });
};
` + code.substring(code.indexOf('// ----------------------------------------------------------------------'));
fs.writeFileSync('src/lib/firebase.ts', corrected);
