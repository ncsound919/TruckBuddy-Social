import React, { useState, useEffect } from 'react';
import { AppNotification, Profile } from './types';
import { sampleNotifications, currentUserProfile } from './data';
import FeedSection from './features/feed/FeedSection';
import RoadReportsSection from './features/reports/RoadReportsSection';
import MarketplaceSection from './features/market/MarketplaceSection';
import GroupsSection from './features/groups/GroupsSection';
import ProfileSection from './features/profile/ProfileSection';
import UserProfileModal from './features/profile/UserProfileModal';
import DeveloperTestingBoard from './features/dev/DeveloperTestingBoard';
import TruckerToolsSection from './features/tools/TruckerToolsSection';
import ConvoyNetworkSection from './features/social/ConvoyNetworkSection';
import MessengerSection from './features/messenger/MessengerSection';
import MemberMapSection from './features/map/MemberMapSection';
import MileageLeaderboardSection from './features/leaderboard/MileageLeaderboardSection';
import HighwayRadioTicker from './components/HighwayRadioTicker';
import CommandPaletteModal from './components/CommandPaletteModal';
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
  WifiOff,
  Calculator,
  Radio,
  Trophy,
  Gauge,
  ShieldCheck,
  Sparkles,
  Activity,
  Map as MapIcon,
  Search,
  Moon,
  Sun,
  Volume2
} from 'lucide-react';

export default function App() {
  const [activeSection, setActiveSection] = useState<'feed' | 'map' | 'leaderboard' | 'network' | 'messages' | 'reports' | 'market' | 'groups' | 'profile' | 'tools' | 'dev'>('feed');
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);
  const [isNightCabMode, setIsNightCabMode] = useState<boolean>(() => {
    return localStorage.getItem('trucker_night_cab_mode') === 'true';
  });
  const [isDeadZone, setIsDeadZone] = useState(false);
  const [dutyStatus, setDutyStatus] = useState<'driving' | 'on_duty' | 'sleeper' | 'off_duty'>('driving');
  const isOnline = useOnlineStatus();
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showIOSGuide, setShowIOSGuide] = useState(false);

  // Authentication & Onboarding state
  const [sessionUser, setSessionUser] = useState<any>(null);
  const [isOnboarded, setIsOnboarded] = useState(false);
  const [userProfile, setUserProfile] = useState<Profile>(currentUserProfile);
  const [selectedProfile, setSelectedProfile] = useState<Profile | null>(null);
  const [messengerRecipient, setMessengerRecipient] = useState<Profile | null>(null);
  
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

  // Global Keyboard Shortcuts (Cmd+K / Ctrl+K for Trucker Command Bar)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsCommandPaletteOpen(prev => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const toggleNightCabMode = () => {
    setIsNightCabMode(prev => {
      const next = !prev;
      localStorage.setItem('trucker_night_cab_mode', String(next));
      return next;
    });
  };

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
        saveNotifications(prev => [syncNotif, ...prev]);
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

  const saveNotifications = (updatedOrUpdater: AppNotification[] | ((prev: AppNotification[]) => AppNotification[])) => {
    setNotifications(prev => {
      const updated = typeof updatedOrUpdater === 'function' ? updatedOrUpdater(prev) : updatedOrUpdater;
      localStorage.setItem('trucker_notifications', JSON.stringify(updated));
      return updated;
    });
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

    saveNotifications(prev => [newNotif, ...prev]);
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
        saveNotifications(prev => [welcomeNotif, ...prev]);
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
    <div className={`min-h-screen font-sans flex flex-col antialiased selection:bg-amber-500 selection:text-slate-950 transition-colors duration-300 ${
      isNightCabMode ? 'bg-slate-950 text-slate-100' : 'bg-slate-100/90 text-slate-900'
    }`}>
      {/* NIGHT CAB LOW-GLARE BANNER */}
      {isNightCabMode && (
        <div className="bg-rose-950 border-b border-rose-900/60 text-rose-300 text-[11px] font-bold py-1 px-4 flex items-center justify-between shadow-inner">
          <div className="flex items-center space-x-2">
            <Moon className="w-3.5 h-3.5 text-rose-400 animate-pulse" />
            <span>Night Cab Vision Active: Low-glare red cockpit illumination enabled to protect highway night vision.</span>
          </div>
          <button 
            onClick={toggleNightCabMode} 
            className="text-[10px] text-rose-200 hover:text-white underline font-extrabold ml-2"
          >
            Switch to Day
          </button>
        </div>
      )}

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

      {/* HIGHWAY RADIO & EMERGENCY TICKER TAPE */}
      <HighwayRadioTicker onNavigateSection={setActiveSection} />

      {/* PRIMARY HEADER */}
      <header className="sticky top-0 z-40 bg-slate-950/95 backdrop-blur-md border-b border-slate-800 text-white shadow-xl" id="main-header">
        <div className="w-full max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-3.5 cursor-pointer group" onClick={() => setActiveSection('feed')}>
            <div className="w-9 h-9 bg-gradient-to-br from-amber-400 to-amber-600 rounded-xl flex items-center justify-center text-slate-950 shadow-md group-hover:scale-105 transition-transform">
              <Truck className="w-5 h-5 fill-slate-950" />
            </div>
            <div>
              <h1 className="text-base font-black tracking-tight flex items-center space-x-2 leading-none">
                <span className="text-white group-hover:text-amber-400 transition-colors">TRUCKERS SOCIAL</span>
                <span className="bg-amber-500 text-slate-950 text-[9px] font-black uppercase px-1.5 py-0.5 rounded leading-none tracking-wider">ATA</span>
              </h1>
              <div className="flex items-center space-x-2 mt-0.5">
                <span className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider leading-none">ALLIANCE HUB</span>
                <span className="text-zinc-600">•</span>
                <span className="text-[10px] text-emerald-400 font-bold flex items-center space-x-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping inline-block" />
                  <span>14 RIGS ON RADAR</span>
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-1.5 sm:space-x-2">
            {/* Quick Search / Command Bar Trigger Button */}
            <button
              id="btn-open-command-palette"
              onClick={() => setIsCommandPaletteOpen(true)}
              className="flex items-center space-x-2 px-2.5 sm:px-3 py-1.5 bg-slate-900/90 hover:bg-slate-800 border border-slate-700/80 rounded-xl text-zinc-300 hover:text-white transition-all text-xs font-medium active:scale-95"
              title="Open Trucker Command Palette & Quick Search (Cmd+K)"
            >
              <Search className="w-3.5 h-3.5 text-amber-400 shrink-0" />
              <span className="hidden md:inline font-semibold">Search</span>
              <kbd className="hidden lg:inline-flex items-center px-1.5 py-0.5 rounded bg-slate-800 border border-slate-700 text-[9px] font-mono text-zinc-400 font-bold">
                ⌘K
              </kbd>
            </button>

            {/* Night Cab Red Ambient Mode Toggle */}
            <button
              id="btn-toggle-night-cab"
              onClick={toggleNightCabMode}
              className={`p-2 rounded-xl transition-all border ${
                isNightCabMode 
                  ? 'bg-rose-950/80 text-rose-400 border-rose-500/50 shadow-sm' 
                  : 'bg-slate-900/90 text-zinc-400 hover:text-white border-slate-700/80'
              }`}
              title={isNightCabMode ? "Disable Night Cab Mode" : "Enable Night Cab Red Low-Glare Mode"}
            >
              {isNightCabMode ? <Moon className="w-4 h-4 text-rose-400 animate-pulse" /> : <Sun className="w-4 h-4" />}
            </button>

            {/* Mobile Duty Status Quick Pill */}
            <div className="lg:hidden flex items-center bg-slate-900 border border-slate-700/80 rounded-xl px-2 py-1 text-[10px] font-black">
              <span className={`w-2 h-2 rounded-full mr-1.5 ${
                dutyStatus === 'driving' ? 'bg-emerald-400 animate-ping' :
                dutyStatus === 'on_duty' ? 'bg-amber-400' :
                dutyStatus === 'sleeper' ? 'bg-sky-400' : 'bg-purple-400'
              }`} />
              <span className="uppercase text-zinc-300 font-extrabold text-[9px]">
                {dutyStatus === 'driving' ? 'Drive' :
                 dutyStatus === 'on_duty' ? 'Duty' :
                 dutyStatus === 'sleeper' ? 'Sleep' : 'Off'}
              </span>
            </div>

            {/* Quick Member Map button */}
            <button
              id="btn-quick-map"
              onClick={() => setActiveSection('map')}
              className={`hidden sm:flex px-2.5 sm:px-3 py-1.5 rounded-xl transition-all font-bold text-xs items-center space-x-1.5 border ${
                activeSection === 'map' 
                  ? 'bg-amber-500 text-slate-950 border-amber-400 shadow-md' 
                  : 'bg-slate-900/90 text-zinc-300 hover:text-white border-slate-700/80 hover:bg-slate-800'
              }`}
              title="National Member Map (US Radar)"
            >
              <MapPin className="w-3.5 h-3.5 text-emerald-400" />
              <span>US Radar</span>
            </button>

            {/* Quick Mileage Leaderboard button */}
            <button
              id="btn-quick-leaderboard"
              onClick={() => setActiveSection('leaderboard')}
              className={`hidden md:flex px-3 py-1.5 rounded-xl transition-all font-bold text-xs items-center space-x-1.5 border ${
                activeSection === 'leaderboard' 
                  ? 'bg-amber-500 text-slate-950 border-amber-400 shadow-md' 
                  : 'bg-slate-900/90 text-zinc-300 hover:text-white border-slate-700/80 hover:bg-slate-800'
              }`}
              title="Verified Mileage Leaderboard"
            >
              <Trophy className="w-3.5 h-3.5 text-amber-400" />
              <span>Leaderboard</span>
            </button>

            {/* Quick CB Chat button */}
            <button
              id="btn-quick-messages"
              onClick={() => setActiveSection('messages')}
              className={`p-2 rounded-xl transition-all border ${
                activeSection === 'messages' 
                  ? 'bg-amber-500 text-slate-950 border-amber-400 shadow-md' 
                  : 'bg-slate-900/90 hover:bg-slate-800 text-zinc-300 hover:text-white border-slate-700/80'
              }`}
              title="CB Direct Messages"
            >
              <MessageSquare className="w-4 h-4 text-sky-400" />
            </button>

            {/* Bulletins tray bell */}
            <div className="relative">
              <button
                id="btn-notifications-bell"
                onClick={() => setIsNotifOpen(!isNotifOpen)}
                className="p-2 bg-slate-900/90 hover:bg-slate-800 border border-slate-700/80 rounded-xl text-zinc-300 hover:text-white transition-all relative"
                title="Highway Bulletins"
              >
                <Bell className="w-4 h-4" />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 bg-amber-500 text-slate-950 font-black text-[9px] rounded-full flex items-center justify-center shadow-md animate-pulse">
                    {unreadCount}
                  </span>
                )}
              </button>

              {isNotifOpen && (
                <div className="absolute right-0 mt-2.5 w-72 sm:w-80 bg-slate-900 text-white rounded-2xl shadow-2xl border border-slate-700 overflow-hidden z-50 animate-in fade-in slide-in-from-top-3 duration-200" id="bulletins-tray">
                  <div className="px-4 py-3 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
                    <span className="text-xs font-black text-amber-400 uppercase tracking-wider">Highway Bulletins</span>
                    <div className="flex space-x-2 text-[10px]">
                      <button onClick={handleMarkAllRead} className="text-zinc-300 hover:text-white font-bold">Mark read</button>
                      <span className="text-slate-700">|</span>
                      <button onClick={handleClearNotifs} className="text-zinc-400 hover:text-rose-400 font-semibold">Clear</button>
                    </div>
                  </div>

                  <div className="max-h-64 overflow-y-auto divide-y divide-slate-800/60 p-2 space-y-1">
                    {notifications.length === 0 ? (
                      <p className="text-xs text-zinc-500 italic text-center py-8">Your dashboard log is empty.</p>
                    ) : (
                      notifications.map(notif => (
                        <div 
                          key={notif.id} 
                          className={`p-2.5 rounded-xl text-[11px] leading-relaxed transition-colors flex space-x-2.5 ${
                            notif.read ? 'bg-slate-900/60 opacity-60' : 'bg-slate-800/90 border border-amber-500/20 font-medium'
                          }`}
                        >
                          {notif.actor && (
                            <img src={notif.actor.avatarUrl} className="w-6 h-6 rounded-full object-cover shrink-0 mt-0.5" alt="" />
                          )}
                          <div className="flex-1 space-y-1">
                            <p className="text-zinc-200">{notif.message}</p>
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

            {/* Mobile Hamburger Menu Drawer Toggle */}
            <button
              id="btn-mobile-drawer-toggle"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="lg:hidden p-2 bg-slate-900/90 hover:bg-slate-800 border border-slate-700/80 rounded-xl text-amber-400 hover:text-white transition-all active:scale-95"
              title="Open Navigation Menu"
            >
              {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>

            {/* PWA Direct Installation Button */}
            {isInstallable && (
              <button
                onClick={install}
                className="hidden xl:flex items-center space-x-1.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 px-3 py-1.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all shadow-md shrink-0 active:scale-95"
              >
                <Download className="w-3.5 h-3.5" />
                <span>App</span>
              </button>
            )}
          </div>
        </div>
      </header>

      {/* DASHBOARD SHELL CONTAINER */}
      <main className="flex-1 w-full max-w-7xl mx-auto px-4 py-6 grid grid-cols-1 lg:grid-cols-12 gap-6" id="dashboard-layout">
        {/* DESKTOP SIDEBAR NAV */}
        <aside className="hidden lg:col-span-3 lg:flex flex-col space-y-4" id="desktop-sidebar">
          {/* HIGH-STATUS CDL PILOT CARD */}
          <div 
            onClick={() => setActiveSection('profile')}
            className="bg-gradient-to-b from-slate-900 to-slate-950 p-5 rounded-3xl border border-slate-800/90 hover:border-amber-400/50 shadow-xl space-y-4 cursor-pointer transition-all group relative overflow-hidden"
            title="Click to view My CDL Profile"
          >
            {/* Ambient gold glow */}
            <div className="absolute -right-8 -top-8 w-32 h-32 bg-amber-500/10 rounded-full blur-2xl pointer-events-none" />

            <div className="flex items-center space-x-3 relative z-10">
              <div className="relative">
                <img 
                  src={userProfile.avatarUrl} 
                  className="w-12 h-12 rounded-2xl object-cover ring-2 ring-amber-400/80 group-hover:ring-amber-400 transition-all shadow-md" 
                  alt="" 
                />
                <span className="absolute -bottom-1 -right-1 p-0.5 bg-amber-500 rounded-md text-slate-950 shadow">
                  <ShieldCheck className="w-3 h-3" />
                </span>
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center space-x-1.5">
                  <h4 className="font-black text-white text-xs truncate leading-tight group-hover:text-amber-400 transition-colors">
                    {userProfile.displayName}
                  </h4>
                </div>
                <span className="text-[10px] text-zinc-400 font-bold block">@{userProfile.username}</span>
                <span className="text-[9px] font-black text-amber-400 uppercase tracking-wide">
                  CDL Class {userProfile.cdlClass} • {userProfile.yearsExperience} yrs exp
                </span>
              </div>
            </div>

            {/* LIVE DRIVER DUTY STATUS SWITCHER */}
            <div className="pt-2 border-t border-slate-800/80 space-y-1.5 relative z-10">
              <div className="flex items-center justify-between text-[10px] font-bold text-zinc-400">
                <span>Duty Status:</span>
                <span className={`font-black uppercase flex items-center space-x-1 ${
                  dutyStatus === 'driving' ? 'text-emerald-400' :
                  dutyStatus === 'on_duty' ? 'text-amber-400' :
                  dutyStatus === 'sleeper' ? 'text-sky-400' : 'text-purple-400'
                }`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${
                    dutyStatus === 'driving' ? 'bg-emerald-400 animate-ping' :
                    dutyStatus === 'on_duty' ? 'bg-amber-400' :
                    dutyStatus === 'sleeper' ? 'bg-sky-400' : 'bg-purple-400'
                  }`} />
                  <span>
                    {dutyStatus === 'driving' ? 'DRIVING' :
                     dutyStatus === 'on_duty' ? 'ON DUTY' :
                     dutyStatus === 'sleeper' ? 'SLEEPER' : 'OFF DUTY'}
                  </span>
                </span>
              </div>

              <div className="grid grid-cols-4 gap-1 p-1 bg-slate-950/80 rounded-xl border border-slate-800" onClick={e => e.stopPropagation()}>
                <button
                  onClick={() => setDutyStatus('driving')}
                  className={`py-1 text-[9px] font-black rounded-lg transition-all ${
                    dutyStatus === 'driving' ? 'bg-emerald-500 text-slate-950 shadow' : 'text-zinc-400 hover:text-white'
                  }`}
                  title="Driving (Rolling on Road)"
                >
                  Drive
                </button>
                <button
                  onClick={() => setDutyStatus('on_duty')}
                  className={`py-1 text-[9px] font-black rounded-lg transition-all ${
                    dutyStatus === 'on_duty' ? 'bg-amber-500 text-slate-950 shadow' : 'text-zinc-400 hover:text-white'
                  }`}
                  title="On Duty (Not Driving / Inspection)"
                >
                  Duty
                </button>
                <button
                  onClick={() => setDutyStatus('sleeper')}
                  className={`py-1 text-[9px] font-black rounded-lg transition-all ${
                    dutyStatus === 'sleeper' ? 'bg-sky-500 text-slate-950 shadow' : 'text-zinc-400 hover:text-white'
                  }`}
                  title="Sleeper Berth Reset"
                >
                  Sleep
                </button>
                <button
                  onClick={() => setDutyStatus('off_duty')}
                  className={`py-1 text-[9px] font-black rounded-lg transition-all ${
                    dutyStatus === 'off_duty' ? 'bg-purple-500 text-white shadow' : 'text-zinc-400 hover:text-white'
                  }`}
                  title="10-Hr Reset / Off Duty"
                >
                  Off
                </button>
              </div>
            </div>

            {/* TRACTOR & RIG METRICS */}
            <div className="text-[11px] text-zinc-400 font-semibold space-y-1 pt-1 border-t border-slate-800/80">
              <div className="flex justify-between">
                <span className="text-zinc-500">Tractor:</span>
                <span className="text-white font-bold truncate max-w-[130px]">{userProfile.currentRig}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-500">Home Base:</span>
                <span className="text-white font-bold">{userProfile.homeBase}</span>
              </div>
            </div>

            <button
              onClick={(e) => {
                e.stopPropagation();
                handleSignOut();
              }}
              className="w-full text-center py-1.5 border border-slate-800 text-zinc-400 hover:text-rose-400 hover:border-rose-500/30 hover:bg-rose-950/20 text-[10px] font-bold uppercase rounded-xl transition-colors"
            >
              Sign Out
            </button>
          </div>

          {/* GROUPED NAVIGATION MENU */}
          <nav className="bg-slate-900/90 backdrop-blur-md p-3 rounded-3xl border border-slate-800/90 shadow-xl space-y-3" id="desktop-navigation">
            {/* GROUP 1: COMMERCIAL FREIGHT OPERATIONS */}
            <div className="space-y-1">
              <span className="px-3 text-[10px] font-black uppercase tracking-wider text-zinc-500 block">
                Highway Dispatch
              </span>
              {[
                { id: 'feed', label: 'Highway Feed', icon: <BookOpen className="w-4 h-4" /> },
                { id: 'map', label: 'National Member Map', icon: <MapPin className="w-4 h-4 text-emerald-400" />, badge: 'RADAR' },
                { id: 'leaderboard', label: 'Mileage Leaderboard', icon: <Trophy className="w-4 h-4 text-amber-400" />, badge: 'MILES' },
                { id: 'network', label: 'Convoy Radar & Network', icon: <Compass className="w-4 h-4 text-amber-400" /> },
                { id: 'messages', label: 'CB Direct Messages', icon: <MessageSquare className="w-4 h-4 text-sky-400" /> },
              ].map(item => (
                <button
                  key={item.id}
                  onClick={() => setActiveSection(item.id as any)}
                  className={`w-full text-left px-3.5 py-2.5 rounded-2xl text-xs font-bold transition-all flex items-center justify-between ${
                    activeSection === item.id
                      ? 'bg-amber-500 text-slate-950 shadow-md font-black'
                      : 'text-zinc-300 hover:bg-slate-800 hover:text-white'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    {item.icon}
                    <span>{item.label}</span>
                  </div>
                  {item.badge && (
                    <span className={`text-[9px] font-black px-1.5 py-0.5 rounded ${
                      activeSection === item.id ? 'bg-slate-950 text-amber-400' : 'bg-slate-800 text-zinc-400'
                    }`}>
                      {item.badge}
                    </span>
                  )}
                </button>
              ))}
            </div>

            {/* GROUP 2: SAFETY & FLEET UTILITIES */}
            <div className="space-y-1 pt-2 border-t border-slate-800/80">
              <span className="px-3 text-[10px] font-black uppercase tracking-wider text-zinc-500 block">
                Safety & Compliance
              </span>
              {[
                { id: 'reports', label: 'Road Safety Alerts', icon: <ShieldAlert className="w-4 h-4 text-rose-400" /> },
                { id: 'market', label: 'Trucker Market', icon: <Tag className="w-4 h-4" /> },
                { id: 'groups', label: 'Chapter Discussions', icon: <Users className="w-4 h-4" /> },
                { id: 'tools', label: 'Compliance Calculators', icon: <Calculator className="w-4 h-4 text-amber-400" /> },
              ].map(item => (
                <button
                  key={item.id}
                  onClick={() => setActiveSection(item.id as any)}
                  className={`w-full text-left px-3.5 py-2 rounded-2xl text-xs font-bold transition-all flex items-center space-x-3 ${
                    activeSection === item.id
                      ? 'bg-amber-500 text-slate-950 shadow-md font-black'
                      : 'text-zinc-300 hover:bg-slate-800 hover:text-white'
                  }`}
                >
                  {item.icon}
                  <span>{item.label}</span>
                </button>
              ))}
            </div>

            {/* GROUP 3: CREDENTIALS & AUDIT */}
            <div className="space-y-1 pt-2 border-t border-slate-800/80">
              <span className="px-3 text-[10px] font-black uppercase tracking-wider text-zinc-500 block">
                Account & Systems
              </span>
              {[
                { id: 'profile', label: 'My CDL Profile', icon: <User className="w-4 h-4" /> },
                { id: 'dev', label: 'Verification Board', icon: <Database className="w-4 h-4 text-emerald-400" /> }
              ].map(item => (
                <button
                  key={item.id}
                  onClick={() => setActiveSection(item.id as any)}
                  className={`w-full text-left px-3.5 py-2 rounded-2xl text-xs font-bold transition-all flex items-center space-x-3 ${
                    activeSection === item.id
                      ? 'bg-amber-500 text-slate-950 shadow-md font-black'
                      : 'text-zinc-300 hover:bg-slate-800 hover:text-white'
                  }`}
                >
                  {item.icon}
                  <span>{item.label}</span>
                </button>
              ))}
            </div>
          </nav>
        </aside>

        {/* PRIMARY ACTIVE SECTION COLUMN */}
        <section className="col-span-1 lg:col-span-9" id="active-content-pane">
          {activeSection === 'feed' && (
            <FeedSection 
              onNotificationAdd={handleAddNotification} 
              isDeadZone={isDeadZone} 
              onViewProfile={setSelectedProfile}
            />
          )}
          {activeSection === 'map' && (
            <MemberMapSection 
              onViewProfile={setSelectedProfile} 
              onOpenDirectMessage={(driver) => {
                setMessengerRecipient(driver);
                setActiveSection('messages');
              }}
              isDeadZone={isDeadZone}
            />
          )}
          {activeSection === 'leaderboard' && (
            <MileageLeaderboardSection 
              onViewProfile={setSelectedProfile} 
              onOpenDirectMessage={(driver) => {
                setMessengerRecipient(driver);
                setActiveSection('messages');
              }}
              isDeadZone={isDeadZone}
            />
          )}
          {activeSection === 'network' && (
            <ConvoyNetworkSection 
              onViewProfile={setSelectedProfile} 
              onOpenDirectMessage={(driver) => {
                setMessengerRecipient(driver);
                setActiveSection('messages');
              }}
              isDeadZone={isDeadZone}
            />
          )}
          {activeSection === 'messages' && (
            <MessengerSection 
              initialRecipient={messengerRecipient}
              onViewProfile={setSelectedProfile}
              isDeadZone={isDeadZone}
            />
          )}
          {activeSection === 'reports' && (
            <RoadReportsSection onViewProfile={setSelectedProfile} />
          )}
          {activeSection === 'market' && (
            <MarketplaceSection onViewProfile={setSelectedProfile} />
          )}
          {activeSection === 'groups' && (
            <GroupsSection 
              onViewProfile={setSelectedProfile}
              onOpenDirectMessage={(p) => {
                setMessengerRecipient(p);
                setActiveSection('messages');
              }}
            />
          )}
          {activeSection === 'profile' && (
            <ProfileSection onViewProfile={setSelectedProfile} />
          )}
          {activeSection === 'tools' && <TruckerToolsSection />}
          {activeSection === 'dev' && (
            <DeveloperTestingBoard 
              onFlushData={handleFlushData} 
              isDeadZone={isDeadZone} 
              setIsDeadZone={setIsDeadZone} 
            />
          )}
        </section>
      </main>

      {/* COMMAND PALETTE & QUICK ACTION OVERLAY */}
      <CommandPaletteModal
        isOpen={isCommandPaletteOpen}
        onClose={() => setIsCommandPaletteOpen(false)}
        onNavigateSection={(section) => {
          setActiveSection(section);
          setIsCommandPaletteOpen(false);
          setIsMobileMenuOpen(false);
        }}
        dutyStatus={dutyStatus}
        onChangeDutyStatus={setDutyStatus}
        isDeadZone={isDeadZone}
        onToggleDeadZone={() => setIsDeadZone(prev => !prev)}
      />

      {/* USER PROFILE MODAL & TIMELINE INSPECTOR */}
      {selectedProfile && (
        <UserProfileModal 
          profile={selectedProfile} 
          onClose={() => setSelectedProfile(null)} 
          onOpenDirectMessage={(p) => {
            setSelectedProfile(null);
            setMessengerRecipient(p);
            setActiveSection('messages');
          }}
        />
      )}

      {/* MOBILE FULL NAVIGATION DRAWER & COCKPIT ACTION SHEET */}
      {isMobileMenuOpen && (
        <div className="lg:hidden fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex flex-col justify-end animate-in fade-in duration-200" id="mobile-nav-drawer">
          <div 
            className="w-full bg-slate-900 border-t border-slate-700 rounded-t-3xl max-h-[85vh] overflow-y-auto flex flex-col shadow-2xl p-5 space-y-5 animate-in slide-in-from-bottom-5 duration-300"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Drawer Header */}
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center space-x-3">
                <div className="relative">
                  <img 
                    src={userProfile.avatarUrl} 
                    className="w-11 h-11 rounded-xl object-cover ring-2 ring-amber-400" 
                    alt="" 
                  />
                  <span className="absolute -bottom-1 -right-1 p-0.5 bg-amber-500 rounded-md text-slate-950">
                    <ShieldCheck className="w-3 h-3" />
                  </span>
                </div>
                <div>
                  <h3 className="font-black text-white text-sm leading-tight">{userProfile.displayName}</h3>
                  <span className="text-[10px] text-zinc-400 font-bold">@{userProfile.username} • Class {userProfile.cdlClass}</span>
                </div>
              </div>

              <button
                onClick={() => setIsMobileMenuOpen(false)}
                className="p-2 rounded-full bg-slate-800 text-zinc-300 hover:text-white"
                title="Close Menu"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Quick Mobile Action Bar: Search & Night Cab */}
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => {
                  setIsMobileMenuOpen(false);
                  setIsCommandPaletteOpen(true);
                }}
                className="p-2.5 bg-slate-950 border border-slate-800 hover:border-amber-500/50 rounded-xl text-xs font-bold text-amber-400 flex items-center justify-center space-x-2"
              >
                <Search className="w-4 h-4" />
                <span>Search & Commands</span>
              </button>
              <button
                onClick={toggleNightCabMode}
                className={`p-2.5 rounded-xl text-xs font-bold flex items-center justify-center space-x-2 border transition ${
                  isNightCabMode
                    ? 'bg-rose-950/80 border-rose-500/50 text-rose-300'
                    : 'bg-slate-950 border-slate-800 text-zinc-300'
                }`}
              >
                {isNightCabMode ? <Moon className="w-4 h-4 text-rose-400" /> : <Sun className="w-4 h-4 text-amber-400" />}
                <span>{isNightCabMode ? 'Night Mode: ON' : 'Night Mode: OFF'}</span>
              </button>
            </div>

            {/* Mobile Duty Status Switcher */}
            <div className="bg-slate-950 p-3.5 rounded-2xl border border-slate-800 space-y-2">
              <div className="flex items-center justify-between text-xs font-bold text-zinc-400">
                <span>Duty Status:</span>
                <span className={`font-black uppercase flex items-center space-x-1.5 ${
                  dutyStatus === 'driving' ? 'text-emerald-400' :
                  dutyStatus === 'on_duty' ? 'text-amber-400' :
                  dutyStatus === 'sleeper' ? 'text-sky-400' : 'text-purple-400'
                }`}>
                  <span className={`w-2 h-2 rounded-full ${
                    dutyStatus === 'driving' ? 'bg-emerald-400 animate-ping' :
                    dutyStatus === 'on_duty' ? 'bg-amber-400' :
                    dutyStatus === 'sleeper' ? 'bg-sky-400' : 'bg-purple-400'
                  }`} />
                  <span>
                    {dutyStatus === 'driving' ? 'DRIVING' :
                     dutyStatus === 'on_duty' ? 'ON DUTY' :
                     dutyStatus === 'sleeper' ? 'SLEEPER' : 'OFF DUTY'}
                  </span>
                </span>
              </div>

              <div className="grid grid-cols-4 gap-1.5 pt-1">
                <button
                  onClick={() => setDutyStatus('driving')}
                  className={`py-2 text-xs font-black rounded-xl transition-all min-h-[44px] flex items-center justify-center ${
                    dutyStatus === 'driving' ? 'bg-emerald-500 text-slate-950 shadow-md' : 'bg-slate-900 text-zinc-400 hover:text-white'
                  }`}
                >
                  Drive
                </button>
                <button
                  onClick={() => setDutyStatus('on_duty')}
                  className={`py-2 text-xs font-black rounded-xl transition-all min-h-[44px] flex items-center justify-center ${
                    dutyStatus === 'on_duty' ? 'bg-amber-500 text-slate-950 shadow-md' : 'bg-slate-900 text-zinc-400 hover:text-white'
                  }`}
                >
                  Duty
                </button>
                <button
                  onClick={() => setDutyStatus('sleeper')}
                  className={`py-2 text-xs font-black rounded-xl transition-all min-h-[44px] flex items-center justify-center ${
                    dutyStatus === 'sleeper' ? 'bg-sky-500 text-slate-950 shadow-md' : 'bg-slate-900 text-zinc-400 hover:text-white'
                  }`}
                >
                  Sleep
                </button>
                <button
                  onClick={() => setDutyStatus('off_duty')}
                  className={`py-2 text-xs font-black rounded-xl transition-all min-h-[44px] flex items-center justify-center ${
                    dutyStatus === 'off_duty' ? 'bg-purple-500 text-white shadow-md' : 'bg-slate-900 text-zinc-400 hover:text-white'
                  }`}
                >
                  Off
                </button>
              </div>
            </div>

            {/* Navigation Grid */}
            <div className="space-y-3">
              <span className="text-[10px] font-black uppercase tracking-wider text-zinc-500 px-1 block">
                Highway Dispatch & Radar
              </span>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { id: 'feed', label: 'Highway Feed', icon: <BookOpen className="w-4 h-4 text-amber-400" />, desc: 'Dispatches & updates' },
                  { id: 'map', label: 'US Member Map', icon: <MapPin className="w-4 h-4 text-emerald-400" />, desc: '14 Rigs Live Radar' },
                  { id: 'leaderboard', label: 'Mileage Board', icon: <Trophy className="w-4 h-4 text-amber-400" />, desc: 'Verified distance' },
                  { id: 'network', label: 'Convoy Radar', icon: <Compass className="w-4 h-4 text-amber-400" />, desc: 'Drafting & meetups' },
                  { id: 'messages', label: 'CB Chat & DMs', icon: <MessageSquare className="w-4 h-4 text-sky-400" />, desc: 'Private driver voice' },
                  { id: 'reports', label: 'Safety Alerts', icon: <ShieldAlert className="w-4 h-4 text-rose-400" />, desc: 'DOT scales & hazards' },
                  { id: 'market', label: 'Trucker Market', icon: <Tag className="w-4 h-4 text-amber-400" />, desc: 'Rigs, parts & gear' },
                  { id: 'groups', label: 'Corridor Chapters', icon: <Users className="w-4 h-4 text-indigo-400" />, desc: 'Safety & discussions' },
                  { id: 'tools', label: 'CAT Scale & Tools', icon: <Calculator className="w-4 h-4 text-emerald-400" />, desc: 'Axle, HOS & IFTA' },
                  { id: 'profile', label: 'My CDL Profile', icon: <User className="w-4 h-4 text-amber-400" />, desc: 'Specs, bio & vouches' },
                  { id: 'dev', label: 'Verification Board', icon: <Database className="w-4 h-4 text-zinc-400" />, desc: 'Dead-Zone test' },
                ].map(item => (
                  <button
                    key={item.id}
                    onClick={() => {
                      setActiveSection(item.id as any);
                      setIsMobileMenuOpen(false);
                    }}
                    className={`p-3 rounded-2xl text-left transition-all border flex flex-col justify-between min-h-[64px] ${
                      activeSection === item.id
                        ? 'bg-amber-500 text-slate-950 border-amber-400 shadow-lg font-black'
                        : 'bg-slate-950/70 border-slate-800 text-zinc-200 hover:bg-slate-800'
                    }`}
                  >
                    <div className="flex items-center space-x-2">
                      {item.icon}
                      <span className="text-xs font-bold">{item.label}</span>
                    </div>
                    <span className={`text-[10px] mt-1 ${activeSection === item.id ? 'text-slate-900 font-bold' : 'text-zinc-500'}`}>
                      {item.desc}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Offline Simulation & Quick Actions */}
            <div className="pt-2 border-t border-slate-800 flex items-center justify-between gap-2">
              <button
                onClick={() => {
                  setIsDeadZone(!isDeadZone);
                  setIsMobileMenuOpen(false);
                }}
                className={`flex-1 py-2.5 px-3 rounded-xl text-xs font-bold border transition flex items-center justify-center space-x-1.5 min-h-[44px] ${
                  isDeadZone 
                    ? 'bg-rose-500/20 text-rose-300 border-rose-500/40' 
                    : 'bg-slate-950 text-zinc-400 border-slate-800 hover:text-white'
                }`}
              >
                {isDeadZone ? <WifiOff className="w-4 h-4 text-rose-400" /> : <Wifi className="w-4 h-4 text-emerald-400" />}
                <span>{isDeadZone ? 'Dead-Zone: Active' : 'Dead-Zone Mode'}</span>
              </button>

              {isInstallable && (
                <button
                  onClick={() => {
                    install();
                    setIsMobileMenuOpen(false);
                  }}
                  className="py-2.5 px-4 bg-amber-500 text-slate-950 font-black rounded-xl text-xs flex items-center justify-center space-x-1.5 min-h-[44px]"
                >
                  <Download className="w-4 h-4" />
                  <span>Install App</span>
                </button>
              )}

              <button
                onClick={() => {
                  setIsMobileMenuOpen(false);
                  handleSignOut();
                }}
                className="py-2.5 px-3 rounded-xl text-xs font-bold bg-slate-950 text-rose-400 border border-slate-800 hover:bg-rose-950/20 min-h-[44px]"
              >
                Sign Out
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MOBILE-FIRST FLOATING COCKPIT DOCK */}
      <div className="lg:hidden fixed bottom-2 left-0 right-0 z-40 px-3 pointer-events-none">
        <nav className="pointer-events-auto bg-slate-950/95 backdrop-blur-xl border border-slate-800/90 px-2 py-1.5 flex items-center justify-around rounded-2xl shadow-2xl" id="mobile-bottom-nav">
          {[
            { id: 'feed', label: 'Feed', icon: <BookOpen className="w-4 h-4" /> },
            { id: 'map', label: 'Radar', icon: <MapPin className="w-4 h-4" /> },
            { id: 'network', label: 'Convoys', icon: <Compass className="w-4 h-4" /> },
            { id: 'messages', label: 'CB Chat', icon: <MessageSquare className="w-4 h-4" /> },
            { id: 'tools', label: 'Tools', icon: <Calculator className="w-4 h-4" /> },
            { id: 'more', label: 'Menu', icon: <Menu className="w-4 h-4" /> }
          ].map(item => {
            const isActive = item.id === 'more' ? isMobileMenuOpen : activeSection === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  if (item.id === 'more') {
                    setIsMobileMenuOpen(!isMobileMenuOpen);
                  } else {
                    setActiveSection(item.id as any);
                    setIsMobileMenuOpen(false);
                  }
                }}
                className={`flex flex-col items-center justify-center py-1.5 px-2 rounded-xl transition-all min-h-[44px] min-w-[48px] ${
                  isActive
                    ? 'text-slate-950 bg-amber-500 font-black shadow-md'
                    : 'text-zinc-400 font-bold hover:text-white'
                }`}
                id={`mobile-nav-item-${item.id}`}
              >
                {item.icon}
                <span className="text-[9px] mt-0.5 tracking-tight font-extrabold">{item.label}</span>
              </button>
            );
          })}
        </nav>
      </div>

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
      <div className="h-24 lg:hidden"></div>
    </div>
  );
}
