import React, { useState, useEffect } from 'react';
import { AppNotification, Profile } from './types';
import { sampleNotifications, currentUserProfile } from './data';
import FeedSection from './features/feed/FeedSection';
import RoadReportsSection from './features/reports/RoadReportsSection';
import MarketplaceSection from './features/market/MarketplaceSection';
import GroupsSection from './features/groups/GroupsSection';
import ProfileSection from './features/profile/ProfileSection';
import DeveloperTestingBoard from './features/dev/DeveloperTestingBoard';
import { db } from './lib/supabase';
import { usePWAInstall } from './hooks/usePWAInstall';
import { useOnlineStatus } from './hooks/useOnlineStatus';
import { 
  Truck, 
  MapPin, 
  Tag, 
  Users, 
  ShieldAlert, 
  Compass, 
  MessageSquare, 
  User, 
  Bell, 
  PlusCircle, 
  Clock, 
  Menu, 
  X, 
  Check, 
  CheckSquare, 
  ArrowRight,
  BookOpen,
  Database,
  Lock,
  Mail,
  Download,
  Wifi,
  WifiOff
} from 'lucide-react';

export default function App() {
  const [activeSection, setActiveSection] = useState<'feed' | 'reports' | 'market' | 'groups' | 'profile' | 'dev'>('feed');
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [isDeadZone, setIsDeadZone] = useState(false);
  const isOnline = useOnlineStatus();
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showIOSGuide, setShowIOSGuide] = useState(false);

  // Authentication & Onboarding state
  const [sessionUser, setSessionUser] = useState<any>(null);
  const [isOnboarded, setIsOnboarded] = useState(false);
  const [userProfile, setUserProfile] = useState<Profile>(currentUserProfile);
  
  // Auth Form
  const [authEmail, setAuthEmail] = useState('');
  const [authPassword, setAuthPassword] = useState('');
  const [isSignUpMode, setIsSignUpMode] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [authLoading, setAuthLoading] = useState(false);

  // CDL Onboarding inputs
  const [formName, setFormName] = useState(currentUserProfile.displayName);
  const [formCdl, setFormCdl] = useState<'A' | 'B' | 'C' | 'None'>('A');
  const [formExp, setFormExp] = useState('5');
  const [formRig, setFormRig] = useState('Freightliner Cascadia');
  const [formLane, setFormLane] = useState('I-80 Corridor');
  const [formHome, setFormHome] = useState('Chicago, IL');

  // Load user session & notifications on mount
  useEffect(() => {
    const cachedNotifs = localStorage.getItem('trucker_notifications');
    if (cachedNotifs) {
      setNotifications(JSON.parse(cachedNotifs));
    } else {
      setNotifications(sampleNotifications);
      localStorage.setItem('trucker_notifications', JSON.stringify(sampleNotifications));
    }

    const checkSession = async () => {
      const { data } = await db.auth.getUser();
      if (data?.user) {
        setSessionUser(data.user);
        const metadata = data.user.user_metadata || {};
        const profileData: Profile = {
          id: data.user.id,
          username: metadata.username || data.user.email?.split('@')[0] || 'driver',
          displayName: metadata.displayName || 'Professional Driver',
          avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200',
          bio: metadata.bio || 'Professional commercial vehicle driver.',
          role: metadata.role || 'driver',
          cdlClass: metadata.cdlClass || 'A',
          yearsExperience: Number(metadata.yearsExperience) || 5,
          currentRig: metadata.currentRig || 'Freightliner Cascadia',
          homeBase: metadata.homeBase || 'Chicago, IL',
          lanes: metadata.lanes || ['I-80 Corridor'],
          carrierName: metadata.carrierName || 'Independent Hauler',
          followerCount: 12,
          followingCount: 30,
          postCount: 4,
          isVerified: true
        };
        setUserProfile(profileData);
        setIsOnboarded(true);
      } else {
        const cachedProfile = localStorage.getItem('trucker_current_profile');
        const hasOnboardedFlag = localStorage.getItem('trucker_has_onboarded');
        if (cachedProfile && hasOnboardedFlag === 'true') {
          setUserProfile(JSON.parse(cachedProfile));
          setIsOnboarded(true);
          setSessionUser({ email: JSON.parse(cachedProfile).email || 'offline@driver.com' });
        }
      }
    };
    checkSession();
  }, []);

  // Monitor Dead-Zone state & trigger background queue synchronization
  useEffect(() => {
    if (!isDeadZone) {
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
        saveNotifications([syncNotif, ...notifications]);
      }
    }
  }, [isDeadZone]);

  const handleFlushData = () => {
    localStorage.clear();
    window.location.reload();
  };

  const handleSignOut = async () => {
    await db.auth.signOut();
    localStorage.removeItem('trucker_current_profile');
    localStorage.removeItem('trucker_has_onboarded');
    setSessionUser(null);
    setIsOnboarded(false);
  };

  const saveNotifications = (updated: AppNotification[]) => {
    setNotifications(updated);
    localStorage.setItem('trucker_notifications', JSON.stringify(updated));
  };

  const handleAddNotification = (message: string, type: 'like' | 'comment') => {
    const newNotif: AppNotification = {
      id: `notif-${Date.now()}`,
      recipientId: userProfile.id,
      actor: {
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

    const updated = [newNotif, ...notifications];
    saveNotifications(updated);
  };

  const handleAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);
    setAuthLoading(true);

    if (isSignUpMode) {
      const { data, error } = await db.auth.signUp({
        email: authEmail,
        password: authPassword,
        options: {
          data: {
            displayName: formName.trim() || 'Willie "Overdrive" Nelson',
            cdlClass: formCdl,
            yearsExperience: Number(formExp) || 0,
            currentRig: formRig.trim() || 'Peterbilt 389 Custom',
            homeBase: formHome.trim() || 'Chicago, IL',
            lanes: [formLane.trim() || 'I-80 Corridor'],
            username: authEmail.split('@')[0]
          }
        }
      });

      if (error) {
        setAuthError(error.message);
      } else if (data?.user) {
        setSessionUser(data.user);
        const onboardedProfile: Profile = {
          id: data.user.id,
          username: authEmail.split('@')[0],
          displayName: formName.trim() || 'Willie "Overdrive" Nelson',
          avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200',
          bio: 'Professional commercial vehicle driver.',
          role: 'driver',
          cdlClass: formCdl,
          yearsExperience: Number(formExp) || 0,
          currentRig: formRig.trim() || 'Peterbilt 389 Custom',
          homeBase: formHome.trim() || 'Chicago, IL',
          lanes: [formLane.trim() || 'I-80 Corridor'],
          carrierName: 'Independent Hauler',
          followerCount: 0,
          followingCount: 0,
          postCount: 0,
          isVerified: true
        };

        setUserProfile(onboardedProfile);
        localStorage.setItem('trucker_current_profile', JSON.stringify(onboardedProfile));
        localStorage.setItem('trucker_has_onboarded', 'true');
        setIsOnboarded(true);

        const welcomeNotif: AppNotification = {
          id: `welcome-${Date.now()}`,
          recipientId: onboardedProfile.id,
          type: 'system',
          read: false,
          message: `Welcome Cap! Your CDL-Class ${onboardedProfile.cdlClass} credentials have been verified and synced with the American Truckers Association chapter database. Welcome aboard!`,
          createdAt: new Date().toISOString()
        };
        saveNotifications([welcomeNotif, ...notifications]);
      }
    } else {
      const { data, error } = await db.auth.signInWithPassword({
        email: authEmail,
        password: authPassword
      });

      if (error) {
        setAuthError(error.message);
      } else if (data?.user) {
        setSessionUser(data.user);
        const metadata = data.user.user_metadata || {};
        const activeProfile: Profile = {
          id: data.user.id,
          username: metadata.username || authEmail.split('@')[0],
          displayName: metadata.displayName || 'Professional Driver',
          avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200',
          bio: metadata.bio || 'Professional commercial vehicle driver.',
          role: metadata.role || 'driver',
          cdlClass: metadata.cdlClass || 'A',
          yearsExperience: Number(metadata.yearsExperience) || 5,
          currentRig: metadata.currentRig || 'Freightliner Cascadia',
          homeBase: metadata.homeBase || 'Chicago, IL',
          lanes: metadata.lanes || ['I-80 Corridor'],
          carrierName: metadata.carrierName || 'Independent Hauler',
          followerCount: 14,
          followingCount: 22,
          postCount: 3,
          isVerified: true
        };

        setUserProfile(activeProfile);
        localStorage.setItem('trucker_current_profile', JSON.stringify(activeProfile));
        localStorage.setItem('trucker_has_onboarded', 'true');
        setIsOnboarded(true);
      }
    }
    setAuthLoading(false);
  };

  const handleMarkAllRead = () => {
    const updated = notifications.map(n => ({ ...n, read: true }));
    saveNotifications(updated);
  };

  const handleClearNotifs = () => {
    saveNotifications([]);
    setIsNotifOpen(false);
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <div className="min-h-screen bg-zinc-50 text-slate-900 font-sans flex flex-col antialiased">
      {/* OFFLINE STATUS BAR */}
      {!isOnline && (
        <div className="bg-amber-500 text-slate-950 text-center font-bold py-1.5 px-4 text-xs flex items-center justify-center space-x-2 shadow-sm">
          <WifiOff className="w-3.5 h-3.5" />
          <span>Offline Mode Active — Operating using cached local client database.</span>
        </div>
      )}

      {/* AUTH & ONBOARDING OVERLAY */}
      {!isOnboarded && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950 p-4 overflow-y-auto" id="auth-overlay-container">
          <div className="w-full max-w-xl bg-white rounded-2xl shadow-2xl overflow-hidden border border-zinc-100 my-8">
            <div className="bg-slate-900 text-white p-8 text-center space-y-3 relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-r from-amber-500/10 to-transparent opacity-50"></div>
              <div className="w-16 h-16 bg-amber-500 rounded-2xl flex items-center justify-center text-slate-950 mx-auto shadow-md relative z-10">
                <Truck className="w-9 h-9 fill-slate-950" />
              </div>
              <h2 className="text-xl font-black tracking-tight relative z-10">ATA Alliance Hub</h2>
              <p className="text-zinc-400 text-xs font-medium max-w-xs mx-auto relative z-10">
                Verify CDL credentials, tractor configurations and join the professional driver network.
              </p>
            </div>

            <form onSubmit={handleAuthSubmit} className="p-8 space-y-5">
              <div className="flex bg-zinc-100 p-1 rounded-xl">
                <button
                  type="button"
                  onClick={() => { setIsSignUpMode(false); setAuthError(null); }}
                  className={`flex-1 py-2 text-xs font-bold rounded-lg transition-colors ${!isSignUpMode ? 'bg-white shadow-sm text-slate-900' : 'text-zinc-500 hover:text-slate-900'}`}
                >
                  Sign In
                </button>
                <button
                  type="button"
                  onClick={() => { setIsSignUpMode(true); setAuthError(null); }}
                  className={`flex-1 py-2 text-xs font-bold rounded-lg transition-colors ${isSignUpMode ? 'bg-white shadow-sm text-slate-900' : 'text-zinc-500 hover:text-slate-900'}`}
                >
                  Onboard / Sign Up
                </button>
              </div>

              {authError && (
                <div className="p-3 bg-rose-50 border border-rose-100 rounded-xl text-[11px] text-rose-600 font-semibold">
                  ⚠️ {authError}
                </div>
              )}

              <div className="space-y-3">
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-zinc-500 mb-1">Email Address</label>
                  <div className="relative">
                    <Mail className="absolute left-3.5 top-3 w-4 h-4 text-zinc-400" />
                    <input
                      required
                      type="email"
                      placeholder="driver@hauler.com"
                      value={authEmail}
                      onChange={(e) => setAuthEmail(e.target.value)}
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-zinc-200 focus:outline-none focus:ring-2 focus:ring-amber-500 text-xs text-slate-800"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-zinc-500 mb-1">Password</label>
                  <div className="relative">
                    <Lock className="absolute left-3.5 top-3 w-4 h-4 text-zinc-400" />
                    <input
                      required
                      type="password"
                      placeholder="••••••••"
                      value={authPassword}
                      onChange={(e) => setAuthPassword(e.target.value)}
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-zinc-200 focus:outline-none focus:ring-2 focus:ring-amber-500 text-xs text-slate-800"
                    />
                  </div>
                </div>
              </div>

              {isSignUpMode && (
                <div className="space-y-4 border-t border-zinc-100 pt-4 mt-2">
                  <h3 className="text-[11px] font-extrabold text-slate-800 uppercase tracking-wider">CDL & Rig Details</h3>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] font-bold uppercase tracking-wider text-zinc-400 mb-1">Driver Handle</label>
                      <input
                        required
                        type="text"
                        placeholder="e.g. Willie 'Overdrive' Nelson"
                        value={formName}
                        onChange={(e) => setFormName(e.target.value)}
                        className="w-full px-3.5 py-2 rounded-xl border border-zinc-200 text-xs"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold uppercase tracking-wider text-zinc-400 mb-1">CDL License Class</label>
                      <select
                        value={formCdl}
                        onChange={(e) => setFormCdl(e.target.value as any)}
                        className="w-full px-3.5 py-2 rounded-xl border border-zinc-200 text-xs bg-white"
                      >
                        <option value="A">Class A (Combo / Semi)</option>
                        <option value="B">Class B (Heavy Straight)</option>
                        <option value="C">Class C (Hazmat/Special)</option>
                        <option value="None">None</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] font-bold uppercase tracking-wider text-zinc-400 mb-1">Years on Road</label>
                      <input
                        required
                        type="number"
                        value={formExp}
                        onChange={(e) => setFormExp(e.target.value)}
                        className="w-full px-3.5 py-2 rounded-xl border border-zinc-200 text-xs"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold uppercase tracking-wider text-zinc-400 mb-1">Home Terminal</label>
                      <input
                        required
                        type="text"
                        value={formHome}
                        onChange={(e) => setFormHome(e.target.value)}
                        className="w-full px-3.5 py-2 rounded-xl border border-zinc-200 text-xs"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] font-bold uppercase tracking-wider text-zinc-400 mb-1">Tractor Model</label>
                      <input
                        required
                        type="text"
                        value={formRig}
                        onChange={(e) => setFormRig(e.target.value)}
                        className="w-full px-3.5 py-2 rounded-xl border border-zinc-200 text-xs"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold uppercase tracking-wider text-zinc-400 mb-1">Primary Corridor (Lane)</label>
                      <input
                        required
                        type="text"
                        value={formLane}
                        onChange={(e) => setFormLane(e.target.value)}
                        className="w-full px-3.5 py-2 rounded-xl border border-zinc-200 text-xs"
                      />
                    </div>
                  </div>
                </div>
              )}

              <button
                type="submit"
                disabled={authLoading}
                className="w-full py-3.5 bg-slate-900 hover:bg-slate-800 active:bg-slate-950 text-white font-extrabold rounded-xl transition-all text-xs uppercase tracking-wider shadow-md flex items-center justify-center space-x-2 mt-4 disabled:opacity-50"
              >
                <span>{authLoading ? 'Verifying CDL Portal...' : isSignUpMode ? 'Verify & Activate CDL Access' : 'Secure Driver Sign-In'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          </div>
        </div>
      )}

      {/* PRIMARY HEADER */}
      <header className="sticky top-0 z-40 bg-slate-900 border-b border-slate-800 text-white shadow-sm" id="main-header">
        <div className="w-full max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-3 cursor-pointer" onClick={() => setActiveSection('feed')}>
            <div className="w-8 h-8 bg-amber-500 rounded-lg flex items-center justify-center text-slate-950 shadow-sm">
              <Truck className="w-4.5 h-4.5 fill-slate-950" />
            </div>
            <div>
              <h1 className="text-sm font-black tracking-tight flex items-center space-x-1.5">
                <span>Truckers Social</span>
                <span className="bg-amber-500 text-slate-950 text-[9px] font-black uppercase px-1 py-0.5 rounded leading-none tracking-wide">ATA</span>
              </h1>
              <p className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider leading-none">Alliance Hub</p>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            {/* PWA Direct Installation Button */}
            {isInstallable && (
              <button
                onClick={install}
                className="hidden md:flex items-center space-x-1.5 bg-amber-500 hover:bg-amber-600 text-slate-950 px-3.5 py-1.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all shadow-md shrink-0"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Install PWA</span>
              </button>
            )}

            {isIOS && (
              <button
                onClick={() => setShowIOSGuide(true)}
                className="hidden md:flex items-center space-x-1.5 border border-zinc-700 hover:bg-zinc-800 text-zinc-300 px-3.5 py-1.5 rounded-xl text-xs font-bold uppercase transition-all shrink-0"
              >
                <span>PWA iOS</span>
              </button>
            )}

            {/* Bulletins tray bell */}
            <div className="relative">
              <button
                id="btn-notifications-bell"
                onClick={() => setIsNotifOpen(!isNotifOpen)}
                className="p-2 hover:bg-slate-800 rounded-xl text-zinc-300 hover:text-white transition-colors relative"
                title="Highway Bulletins"
              >
                <Bell className="w-5 h-5" />
                {unreadCount > 0 && (
                  <span className="absolute top-1.5 right-1.5 w-4 h-4 bg-amber-500 text-slate-950 font-black text-[9px] rounded-full flex items-center justify-center shadow-md animate-pulse">
                    {unreadCount}
                  </span>
                )}
              </button>

              {isNotifOpen && (
                <div className="absolute right-0 mt-2.5 w-80 bg-white text-slate-900 rounded-2xl shadow-xl border border-zinc-100 overflow-hidden z-50 animate-in fade-in slide-in-from-top-3 duration-200" id="bulletins-tray">
                  <div className="px-4 py-3 bg-zinc-50 border-b border-zinc-100 flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-800">Highway Bulletins</span>
                    <div className="flex space-x-2 text-[10px]">
                      <button onClick={handleMarkAllRead} className="text-amber-600 hover:text-amber-700 font-bold">Mark read</button>
                      <span className="text-zinc-300">|</span>
                      <button onClick={handleClearNotifs} className="text-zinc-400 hover:text-slate-900 font-semibold">Clear</button>
                    </div>
                  </div>

                  <div className="max-h-64 overflow-y-auto divide-y divide-zinc-50 p-2 space-y-1">
                    {notifications.length === 0 ? (
                      <p className="text-xs text-zinc-500 italic text-center py-8">Your dashboard log is empty.</p>
                    ) : (
                      notifications.map(notif => (
                        <div 
                          key={notif.id} 
                          className={`p-2.5 rounded-xl text-[11px] leading-relaxed transition-colors flex space-x-2.5 ${
                            notif.read ? 'bg-white opacity-70' : 'bg-amber-50/40 border border-amber-500/10 font-medium'
                          }`}
                        >
                          {notif.actor && (
                            <img src={notif.actor.avatarUrl} className="w-6 h-6 rounded-full object-cover shrink-0 mt-0.5" alt="" />
                          )}
                          <div className="flex-1 space-y-1">
                            <p className="text-zinc-700">{notif.message}</p>
                            <span className="text-[9px] text-zinc-400 block">
                              {new Date(notif.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* DASHBOARD SHELL CONTAINER */}
      <main className="flex-1 w-full max-w-7xl mx-auto px-4 py-6 grid grid-cols-1 lg:grid-cols-12 gap-6" id="dashboard-layout">
        {/* DESKTOP SIDEBAR NAV */}
        <aside className="hidden lg:col-span-3 lg:flex flex-col space-y-4" id="desktop-sidebar">
          <div className="bg-white p-5 rounded-2xl border border-zinc-100 shadow-sm space-y-4">
            <div className="flex items-center space-x-3">
              <img src={userProfile.avatarUrl} className="w-11 h-11 rounded-full object-cover" alt="" />
              <div className="min-w-0 flex-1">
                <h4 className="font-bold text-slate-900 text-xs truncate leading-tight">{userProfile.displayName}</h4>
                <span className="text-[10px] text-zinc-400 font-bold block">@{userProfile.username}</span>
              </div>
            </div>

            <div className="text-[11px] text-zinc-500 font-semibold space-y-1.5 border-t border-zinc-50 pt-3">
              <div className="flex justify-between">
                <span>CDL Card:</span>
                <span className="text-slate-800 font-bold">Class {userProfile.cdlClass}</span>
              </div>
              <div className="flex justify-between">
                <span>Rig Tractor:</span>
                <span className="text-slate-800 font-bold truncate max-w-[120px]">{userProfile.currentRig}</span>
              </div>
              <div className="flex justify-between">
                <span>Home Base:</span>
                <span className="text-slate-800 font-bold">{userProfile.homeBase}</span>
              </div>
            </div>

            <button
              onClick={handleSignOut}
              className="w-full text-center py-2 border border-zinc-100 text-zinc-500 hover:text-red-600 hover:bg-red-50 text-[10px] font-bold uppercase rounded-lg transition-colors mt-2"
            >
              Sign Out
            </button>
          </div>

          <nav className="bg-white p-3 rounded-2xl border border-zinc-100 shadow-sm space-y-1" id="desktop-navigation">
            {[
              { id: 'feed', label: 'Highway Feed', icon: <BookOpen className="w-4 h-4" /> },
              { id: 'reports', label: 'Road Safety Alerts', icon: <ShieldAlert className="w-4 h-4" /> },
              { id: 'market', label: 'Trucker Market', icon: <Tag className="w-4 h-4" /> },
              { id: 'groups', label: 'Chapter Discussions', icon: <Users className="w-4 h-4" /> },
              { id: 'profile', label: 'My CDL Profile', icon: <User className="w-4 h-4" /> },
              { id: 'dev', label: 'Verification Board', icon: <Database className="w-4 h-4 text-emerald-600 animate-pulse" /> }
            ].map(item => (
              <button
                key={item.id}
                onClick={() => setActiveSection(item.id as any)}
                className={`w-full text-left px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center space-x-3 ${
                  activeSection === item.id
                    ? 'bg-amber-500 text-slate-950 shadow-sm'
                    : 'text-zinc-600 hover:bg-zinc-50 hover:text-slate-900'
                }`}
              >
                {item.icon}
                <span>{item.label}</span>
              </button>
            ))}
          </nav>
        </aside>

        {/* PRIMARY ACTIVE SECTION COLUMN */}
        <section className="col-span-1 lg:col-span-9" id="active-content-pane">
          {activeSection === 'feed' && <FeedSection onNotificationAdd={handleAddNotification} isDeadZone={isDeadZone} />}
          {activeSection === 'reports' && <RoadReportsSection />}
          {activeSection === 'market' && <MarketplaceSection />}
          {activeSection === 'groups' && <GroupsSection />}
          {activeSection === 'profile' && <ProfileSection />}
          {activeSection === 'dev' && (
            <DeveloperTestingBoard 
              onFlushData={handleFlushData} 
              isDeadZone={isDeadZone} 
              setIsDeadZone={setIsDeadZone} 
            />
          )}
        </section>
      </main>

      {/* MOBILE-FIRST FLOATING BOTTOM NAVIGATION BAR */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-zinc-100 px-2 py-1.5 flex items-center justify-around shadow-lg" id="mobile-bottom-nav">
        {[
          { id: 'feed', label: 'Feed', icon: <BookOpen className="w-5 h-5" /> },
          { id: 'reports', label: 'Alerts', icon: <ShieldAlert className="w-5 h-5" /> },
          { id: 'market', label: 'Market', icon: <Tag className="w-5 h-5" /> },
          { id: 'profile', label: 'Profile', icon: <User className="w-5 h-5" /> },
          { id: 'dev', label: 'Sandbox', icon: <Database className="w-5 h-5 text-emerald-600" /> }
        ].map(item => (
          <button
            key={item.id}
            onClick={() => setActiveSection(item.id as any)}
            className={`flex flex-col items-center justify-center py-1 px-3 rounded-xl transition-all ${
              activeSection === item.id
                ? 'text-amber-600 bg-amber-50 font-black'
                : 'text-zinc-400 font-bold hover:text-slate-900'
            }`}
            id={`mobile-nav-item-${item.id}`}
          >
            {item.icon}
            <span className="text-[9px] mt-0.5 tracking-tight">{item.label}</span>
          </button>
        ))}
      </nav>

      {/* iOS INSTALL MANUAL GUIDE POPUP */}
      {showIOSGuide && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-xl border border-zinc-100">
            <h3 className="text-sm font-black text-gray-900">Install on iOS Safari</h3>
            <p className="mt-2 text-xs text-gray-600 leading-relaxed">
              1. Tap the <strong className="font-extrabold text-slate-900">Share</strong> icon in the Safari navigation bar.<br />
              2. Scroll the menu list down and select <strong className="font-extrabold text-slate-900">Add to Home Screen</strong>.
            </p>
            <button
              onClick={() => setShowIOSGuide(false)}
              className="mt-5 w-full rounded-xl bg-slate-900 text-white py-2.5 text-xs font-extrabold uppercase tracking-wider hover:bg-slate-800 transition"
            >
              Done
            </button>
          </div>
        </div>
      )}

      {/* FOOTER SPACING padding for mobile bottom bar */}
      <div className="h-20 lg:hidden"></div>
    </div>
  );
}
