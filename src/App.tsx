import React, { useState, useEffect } from 'react';
import { Moon, WifiOff } from 'lucide-react';
import { AppNotification, Profile } from './types';
import { currentUserProfile, sampleNotifications } from './data';
import { useOnlineStatus } from './hooks/useOnlineStatus';
import { usePWAInstall } from './hooks/usePWAInstall';
import { useFirebase } from './contexts/FirebaseContext';
import { auth } from './lib/firebase';

// Shell Components
import { GlobalNavigationHeader } from './components/shell/GlobalNavigationHeader';
import { DesktopSidebar } from './components/shell/DesktopSidebar';
import { AppRouter } from './components/shell/AppRouter';
import { AuthOverlay } from './components/shell/AuthOverlay';
import { MobileNavigationDrawer } from './components/shell/MobileNavigationDrawer';
import { MobileFloatingDock } from './components/shell/MobileFloatingDock';

// Modal Components
import CommandPaletteModal from './components/CommandPaletteModal';
import UserProfileModal from './features/profile/UserProfileModal';

export default function App() {
  const { user, profile: firebaseProfile, loading: authLoading } = useFirebase();
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
  const [selectedProfile, setSelectedProfile] = useState<Profile | null>(null);
  const [messengerRecipient, setMessengerRecipient] = useState<Profile | null>(null);
  
  const userProfile = firebaseProfile || currentUserProfile;
  const isOnboarded = !!user;
  
  // Auth Form
  
  
  
  
  

  // CDL Onboarding inputs
  
  
  
  
  
  

  // Load user session & notifications on mount
  useEffect(() => {
    const cachedNotifs = localStorage.getItem('trucker_notifications');
    if (cachedNotifs) {
      setNotifications(JSON.parse(cachedNotifs));
    } else {
      setNotifications(sampleNotifications);
      localStorage.setItem('trucker_notifications', JSON.stringify(sampleNotifications));
    }
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

  

  const handleFlushData = () => {
    localStorage.clear();
    window.location.reload();
  };

  const handleSignOut = async () => {
    await auth.signOut();
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
      {!isOnboarded && !authLoading && <AuthOverlay />}
      
      
      {/* GLOBAL HIGHWAY NAVIGATION HEADER */}
      <GlobalNavigationHeader 
        setActiveSection={setActiveSection}
        isNotifOpen={isNotifOpen}
        setIsNotifOpen={setIsNotifOpen}
        unreadCount={unreadCount}
        notifications={notifications}
        handleMarkAllRead={handleMarkAllRead}
        handleClearNotifs={handleClearNotifs}
        isIOS={isIOS}
        isInstalled={isInstalled}
        isInstallable={isInstallable}
        setShowIOSGuide={setShowIOSGuide}
        install={install}
      />


      {/* DASHBOARD SHELL CONTAINER */}
      <main className="flex-1 w-full max-w-7xl mx-auto px-4 py-6 grid grid-cols-1 lg:grid-cols-12 gap-6" id="dashboard-layout">
        
        {/* DESKTOP SIDEBAR NAV */}
        <DesktopSidebar 
          userProfile={userProfile}
          activeSection={activeSection}
          setActiveSection={setActiveSection}
          unreadCount={unreadCount}
          dutyStatus={dutyStatus}
          setDutyStatus={setDutyStatus}
          handleSignOut={handleSignOut}
        />


                {/* PRIMARY ACTIVE SECTION COLUMN */}
        <AppRouter 
          activeSection={activeSection}
          setActiveSection={setActiveSection}
          handleAddNotification={handleAddNotification}
          isDeadZone={isDeadZone}
          setSelectedProfile={setSelectedProfile}
          setMessengerRecipient={setMessengerRecipient}
          setIsDeadZone={setIsDeadZone}
          handleFlushData={handleFlushData}
        />
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
      <MobileNavigationDrawer 
        isMobileMenuOpen={isMobileMenuOpen}
        setIsMobileMenuOpen={setIsMobileMenuOpen}
        userProfile={userProfile}
        activeSection={activeSection}
        setActiveSection={setActiveSection}
        unreadCount={unreadCount}
        toggleNightCabMode={toggleNightCabMode}
        isNightCabMode={isNightCabMode}
        dutyStatus={dutyStatus}
        setDutyStatus={setDutyStatus}
        handleFlushData={handleFlushData}
        handleSignOut={handleSignOut}
      />

{/* MOBILE-FIRST FLOATING COCKPIT DOCK */}
      <MobileFloatingDock 
        activeSection={activeSection}
        setActiveSection={setActiveSection}
        unreadCount={unreadCount}
        setIsMobileMenuOpen={setIsMobileMenuOpen}
        isMobileMenuOpen={isMobileMenuOpen}
      />


    </div>
  );
}
