import { initializeApp } from 'firebase/app';
import { 
  getFirestore, collection, doc, setDoc, getDocs, getDoc, 
  onSnapshot, query, orderBy, limit, Timestamp, serverTimestamp, 
  updateDoc, arrayUnion, arrayRemove, increment, addDoc, where,
  deleteDoc 
} from 'firebase/firestore';
import { getAuth, signInAnonymously, onAuthStateChanged, User as FirebaseUser, GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import firebaseConfig from '../../firebase-applet-config.json';

import { 
  Post, 
  PostComment, 
  Profile, 
  Convoy, 
  ConvoyMessage, 
  MemberLocation, 
  MileageLeaderboardEntry,
  MileageProof,
  RoadReport,
  ConvoyBeacon,
  ConvoyChatMessage,
  DriverRoadStatus,
  Listing
} from '../types';
import { currentUserProfile } from '../data';

// 1. Initialize Firebase App
export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);
export const googleProvider = new GoogleAuthProvider();

// 2. Auth Helper: Google Sign In
export const signInWithGoogle = async () => {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    return result.user;
  } catch (error) {
    console.error('Google Sign-In Error:', error);
    throw error;
  }
};
// ----------------------------------------------------------------------
// REAL-TIME ROAD STATUS BEACONS
// ----------------------------------------------------------------------

export function subscribeLiveRoadStatuses(onUpdate: (statuses: DriverRoadStatus[]) => void) {
  const q = query(collection(db, 'roadStatuses'), orderBy('timestamp', 'desc'), limit(50));
  return onSnapshot(q, (snapshot) => {
    const list: DriverRoadStatus[] = [];
    snapshot.forEach((docSnap) => {
      const data = docSnap.data();
      list.push({
        id: docSnap.id,
        ...data,
        timestamp: data.timestamp?.toDate ? data.timestamp.toDate().toISOString() : data.timestamp || new Date().toISOString()
      } as DriverRoadStatus);
    });
    onUpdate(list);
  }, (err) => {
    console.warn('Road statuses listener notice:', err);
  });
}

export async function createLiveRoadStatus(statusData: Partial<DriverRoadStatus>) {
  const newId = `status-${Date.now()}`;
  const statusRef = doc(db, 'roadStatuses', newId);
  const payload = {
    ...statusData,
    id: newId,
    timestamp: serverTimestamp(),
    waveCount: 0,
    highBeamCount: 0,
    hornCount: 0,
    cheersCount: 0,
    userInteractions: {}
  };
  await setDoc(statusRef, payload);
  return newId;
}

export async function updateLiveRoadStatusReaction(statusId: string, reaction: string, userId: string, incrementValue: number, prevReaction?: string) {
  const statusRef = doc(db, 'roadStatuses', statusId);
  const updates: any = {};
  
  if (reaction === 'wave') updates.waveCount = increment(incrementValue);
  if (reaction === 'highBeam') updates.highBeamCount = increment(incrementValue);
  if (reaction === 'horn') updates.hornCount = increment(incrementValue);
  if (reaction === 'cheers') updates.cheersCount = increment(incrementValue);
  
  if (prevReaction && prevReaction !== reaction) {
    if (prevReaction === 'wave') updates.waveCount = increment(-1);
    if (prevReaction === 'highBeam') updates.highBeamCount = increment(-1);
    if (prevReaction === 'horn') updates.hornCount = increment(-1);
    if (prevReaction === 'cheers') updates.cheersCount = increment(-1);
  }

  updates[`userInteractions.${userId}`] = incrementValue === 1 ? reaction : null;
  
  await updateDoc(statusRef, updates);
}

export function subscribeLivePosts(onUpdate: (posts: Post[]) => void) {
  const postsQuery = query(collection(db, 'posts'), orderBy('createdAt', 'desc'), limit(50));
  return onSnapshot(postsQuery, (snapshot) => {
    const list: Post[] = [];
    snapshot.forEach((docSnap) => {
      const data = docSnap.data();
      list.push({
        id: docSnap.id,
        ...data,
        createdAt: data.createdAt?.toDate ? data.createdAt.toDate().toISOString() : data.createdAt || new Date().toISOString()
      } as unknown as Post);
    });
    onUpdate(list);
  }, (err) => {
    console.warn('Live posts listener notice:', err);
  });
}

export async function createLivePost(postData: Partial<Post>) {
  const newId = `post-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
  const postRef = doc(db, 'posts', newId);
  const payload = {
    id: newId,
    author: postData.author || currentUserProfile,
    caption: postData.caption || postData.content || '',
    locationName: postData.locationName || 'Highway Dispatch',
    postType: postData.postType || 'text',
    tags: postData.tags || ['Dispatch'],
    likes: 0,
    likesCount: 0,
    isLiked: false,
    commentsCount: 0,
    shares: 0,
    createdAt: Timestamp.now(),
    serverCreatedAt: serverTimestamp(),
    mediaUrl: postData.mediaUrl || '',
    poll: postData.poll || null
  };
  await setDoc(postRef, payload);
  return newId;
}

export async function toggleLivePostLike(postId: string, userId: string, currentlyLiked: boolean) {
  const postRef = doc(db, 'posts', postId);
  await updateDoc(postRef, {
    likes: increment(currentlyLiked ? -1 : 1),
    likesCount: increment(currentlyLiked ? -1 : 1),
    upvotedUserIds: currentlyLiked ? arrayRemove(userId) : arrayUnion(userId)
  });
}

export function subscribeLiveComments(postId: string, onUpdate: (comments: PostComment[]) => void) {
  const commentsQuery = query(collection(db, 'posts', postId, 'comments'), orderBy('createdAt', 'asc'), limit(100));
  return onSnapshot(commentsQuery, (snapshot) => {
    const list: PostComment[] = [];
    snapshot.forEach((docSnap) => {
      const data = docSnap.data();
      list.push({
        id: docSnap.id,
        ...data,
        createdAt: data.createdAt?.toDate ? data.createdAt.toDate().toISOString() : data.createdAt || new Date().toISOString()
      } as PostComment);
    });
    onUpdate(list);
  }, (err) => {
    console.warn('Live comments listener notice:', err);
  });
}

export async function addLiveComment(postId: string, commentData: Partial<PostComment>) {
  const commentsColl = collection(db, 'posts', postId, 'comments');
  const postRef = doc(db, 'posts', postId);
  
  const payload = {
    author: commentData.author || currentUserProfile,
    body: commentData.body || commentData.text || commentData.content || '',
    createdAt: Timestamp.now(),
    likesCount: 0
  };

  const docAdded = await addDoc(commentsColl, payload);
  await updateDoc(postRef, {
    commentsCount: increment(1)
  });
  return docAdded.id;
}

// ----------------------------------------------------------------------
// REAL-TIME SAFETY & SCALE REPORTS
// ----------------------------------------------------------------------

export function subscribeLiveSafetyReports(onUpdate: (reports: RoadReport[]) => void) {
  const reportsQuery = query(collection(db, 'safetyReports'), orderBy('createdAt', 'desc'), limit(100));
  return onSnapshot(reportsQuery, (snapshot) => {
    const list: RoadReport[] = [];
    snapshot.forEach((docSnap) => {
      const data = docSnap.data();
      list.push({
        id: docSnap.id,
        ...data,
        timestamp: data.createdAt?.toDate ? data.createdAt.toDate().toISOString() : data.timestamp || new Date().toISOString()
      } as unknown as RoadReport);
    });
    onUpdate(list);
  }, (err) => {
    console.warn('Safety reports listener notice:', err);
  });
}

export async function createLiveSafetyReport(reportData: Partial<RoadReport>) {
  const newId = `rep-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
  const repRef = doc(db, 'safetyReports', newId);
  const payload = {
    id: newId,
    author: reportData.author || currentUserProfile,
    reportType: reportData.reportType || (reportData as any).type || 'hazard',
    title: reportData.title || 'Road Advisory',
    description: reportData.description || '',
    corridor: reportData.corridor || 'I-80',
    locationName: reportData.locationName || 'Mile Marker',
    lat: reportData.lat || 41.5,
    lng: reportData.lng || -106.5,
    upvotes: 1,
    downvotes: 0,
    status: 'active',
    severity: reportData.severity || 'moderate',
    createdAt: Timestamp.now(),
    serverCreatedAt: serverTimestamp()
  };
  await setDoc(repRef, payload);
  return newId;
}

export async function voteLiveSafetyReport(reportId: string, isUpvote: boolean) {
  const repRef = doc(db, 'safetyReports', reportId);
  await updateDoc(repRef, {
    upvotes: isUpvote ? increment(1) : increment(0),
    downvotes: !isUpvote ? increment(1) : increment(0)
  });
}

// ----------------------------------------------------------------------
// REAL-TIME CONVOY CHANNELS & RADIO MESSAGES
// ----------------------------------------------------------------------

export function subscribeLiveConvoys(onUpdate: (convoys: ConvoyBeacon[]) => void) {
  const convoysQuery = query(collection(db, 'convoys'), limit(50));
  return onSnapshot(convoysQuery, (snapshot) => {
    const list: ConvoyBeacon[] = [];
    snapshot.forEach((docSnap) => {
      list.push({
        id: docSnap.id,
        ...docSnap.data()
      } as ConvoyBeacon);
    });
    onUpdate(list);
  }, (err) => {
    console.warn('Convoys listener notice:', err);
  });
}

export async function createLiveConvoy(convoyData: Partial<ConvoyBeacon>) {
  const newId = `convoy-${Date.now()}`;
  const cRef = doc(db, 'convoys', newId);
  const payload = {
    id: newId,
    title: convoyData.title || (convoyData as any).name || 'Highway Convoy',
    leader: convoyData.leader || currentUserProfile,
    corridor: convoyData.corridor || 'I-80 Wyoming',
    cbChannel: convoyData.cbChannel || (convoyData as any).channel || 19,
    destination: convoyData.destination || 'Salt Lake City, UT',
    origin: convoyData.origin || (convoyData as any).currentLocation || 'Cheyenne, WY',
    cruisingSpeedMph: convoyData.cruisingSpeedMph || (convoyData as any).speedMph || 65,
    participantCount: 1,
    isActive: true,
    cargoType: convoyData.cargoType || 'General Freight',
    createdAt: serverTimestamp()
  };
  await setDoc(cRef, payload);
  return newId;
}

export async function toggleLiveConvoyMembership(convoyId: string, profile: Profile, isJoining: boolean) {
  const cRef = doc(db, 'convoys', convoyId);
  await updateDoc(cRef, {
    members: isJoining ? arrayUnion(profile) : arrayRemove(profile)
  });
}

export function subscribeLiveConvoyMessages(convoyId: string, onUpdate: (messages: ConvoyChatMessage[]) => void) {
  const msgsQuery = query(collection(db, 'convoys', convoyId, 'messages'), orderBy('timestamp', 'asc'), limit(100));
  return onSnapshot(msgsQuery, (snapshot) => {
    const list: ConvoyChatMessage[] = [];
    snapshot.forEach((docSnap) => {
      const data = docSnap.data();
      list.push({
        id: docSnap.id,
        ...data,
        timestamp: data.timestamp?.toDate ? data.timestamp.toDate().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : data.timestamp || 'Just now'
      } as unknown as ConvoyChatMessage);
    });
    onUpdate(list);
  }, (err) => {
    console.warn('Convoy messages listener notice:', err);
  });
}

export async function sendLiveConvoyMessage(convoyId: string, msgData: Partial<ConvoyChatMessage>) {
  const msgsColl = collection(db, 'convoys', convoyId, 'messages');
  const payload = {
    sender: msgData.sender || currentUserProfile,
    message: msgData.message || (msgData as any).text || '',
    timestamp: Timestamp.now(),
    audioFx: msgData.audioFx || null
  };
  await addDoc(msgsColl, payload);
}

// ----------------------------------------------------------------------
// REAL-TIME DRIVERS & PROFILES (Leaderboard & Map)
// ----------------------------------------------------------------------

export function subscribeLiveProfiles(onUpdate: (profiles: Profile[]) => void) {
  const usersQuery = query(collection(db, 'users'), limit(100));
  return onSnapshot(usersQuery, (snapshot) => {
    const list: Profile[] = [];
    snapshot.forEach((docSnap) => {
      list.push({
        id: docSnap.id,
        ...docSnap.data()
      } as Profile);
    });
    onUpdate(list);
  }, (err) => {
    console.warn('Live profiles listener notice:', err);
  });
}

export async function saveLiveProfile(profile: Profile) {
  const userRef = doc(db, 'users', profile.id);
  await setDoc(userRef, {
    ...profile,
    updatedAt: serverTimestamp()
  }, { merge: true });
}

export function subscribeLiveMemberLocations(onUpdate: (locs: MemberLocation[]) => void) {
  const locsQuery = query(collection(db, 'memberLocations'), limit(100));
  return onSnapshot(locsQuery, (snapshot) => {
    const list: MemberLocation[] = [];
    snapshot.forEach((docSnap) => {
      list.push({
        id: docSnap.id,
        ...docSnap.data()
      } as MemberLocation);
    });
    onUpdate(list);
  }, (err) => {
    console.warn('Member locations listener notice:', err);
  });
}

export async function updateLiveMemberLocation(loc: MemberLocation) {
  const locRef = doc(db, 'memberLocations', loc.id);
  await setDoc(locRef, {
    ...loc,
    updatedAt: serverTimestamp()
  }, { merge: true });
}

export function subscribeLiveMileageLeaderboard(onUpdate: (entries: MileageLeaderboardEntry[]) => void) {
  const lbQuery = query(collection(db, 'mileageLeaderboard'), orderBy('totalMiles', 'desc'), limit(50));
  return onSnapshot(lbQuery, (snapshot) => {
    const list: MileageLeaderboardEntry[] = [];
    let rank = 1;
    snapshot.forEach((docSnap) => {
      list.push({
        id: docSnap.id,
        rank: rank++,
        ...docSnap.data()
      } as MileageLeaderboardEntry);
    });
    onUpdate(list);
  }, (err) => {
    console.warn('Leaderboard listener notice:', err);
  });
}

export async function submitLiveMileageProof(entry: MileageProof, driver: Profile) {
  // 1. Add proof record
  const proofRef = doc(db, 'mileageProofs', entry.id);
  await setDoc(proofRef, {
    ...entry,
    submittedAt: serverTimestamp()
  });

  // 2. Update driver's safe miles on Leaderboard
  const lbRef = doc(db, 'mileageLeaderboard', `lb-${driver.id}`);
  await setDoc(lbRef, {
    id: `lb-${driver.id}`,
    driver,
    category: driver.yearsExperience > 15 ? 'veteran' : 'long_haul',
    monthlyMiles: entry.miles,
    annualMiles: entry.miles,
    totalMiles: increment(entry.miles),
    consecutiveSafeDays: increment(30),
    isVerified: true,
    verificationTier: entry.method === 'eld_telematics' ? 'platinum' : 'gold',
    badges: ['DOT Compliant', 'ELD Verified', 'Verified Safe Hauler'],
    lastOdometerReading: entry.currentOdometer,
    lastUpdated: new Date().toLocaleDateString()
  }, { merge: true });

  // 3. Update driver profile safe miles
  const userRef = doc(db, 'users', driver.id);
  await setDoc(userRef, {
    safeMiles: increment(entry.miles),
    updatedAt: serverTimestamp()
  }, { merge: true });
}

// ----------------------------------------------------------------------
// REAL-TIME MARKETPLACE LISTINGS
// ----------------------------------------------------------------------

export function subscribeLiveListings(onUpdate: (listings: Listing[]) => void) {
  const listingsQuery = query(collection(db, 'listings'), orderBy('createdAt', 'desc'), limit(100));
  return onSnapshot(listingsQuery, (snapshot) => {
    const list: Listing[] = [];
    snapshot.forEach((docSnap) => {
      const data = docSnap.data();
      list.push({
        id: docSnap.id,
        ...data,
        createdAt: data.createdAt?.toDate ? data.createdAt.toDate().toISOString() : data.createdAt || new Date().toISOString()
      } as unknown as Listing);
    });
    onUpdate(list);
  }, (err) => {
    console.warn('Listings listener notice:', err);
  });
}

export async function createLiveListing(listingData: Partial<Listing>) {
  const newId = `list-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
  const listRef = doc(db, 'listings', newId);
  const payload = {
    id: newId,
    ...listingData,
    createdAt: Timestamp.now(),
    serverCreatedAt: serverTimestamp()
  };
  await setDoc(listRef, payload);
  return newId;
}

export async function deleteLiveListing(listingId: string) {
  await deleteDoc(doc(db, 'listings', listingId));
}
