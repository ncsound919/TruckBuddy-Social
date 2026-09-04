import React, { useState, useEffect } from 'react';
import { AppNotification, Profile } from './types';
import { sampleNotifications, currentUserProfile } from './data';
import FeedSection from './components/FeedSection';
import RoadReportsSection from './components/RoadReportsSection';
import MarketplaceSection from './components/MarketplaceSection';
import GroupsSection from './components/GroupsSection';
import ProfileSection from './components/ProfileSection';
import AIDispatcherSection from './components/AIDispatcherSection';
import MessengerSection from './components/MessengerSection';
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
  BookOpen
} from 'lucide-react';

export default function App() {
  const [activeSection, setActiveSection] = useState<'feed' | 'reports' | 'market' | 'groups' | 'dispatch' | 'profile' | 'messenger'>('feed');
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  
  // Onboarding state
  const [isOnboarded, setIsOnboarded] = useState(false);
  const [userProfile, setUserProfile] = useState<Profile>(currentUserProfile);
  
  // Onboarding form state
  const [formName, setFormName] = useState(currentUserProfile.displayName);
  const [formCdl, setFormCdl] = useState<'A' | 'B' | 'C' | 'None'>('A');
  const [formExp, setFormExp] = useState('5');
  const [formRig, setFormRig] = useState('Freightliner Cascadia');
  const [formLane, setFormLane] = useState('I-80 Corridor');
  const [formHome, setFormHome] = useState('Chicago, IL');

  // Load notifications and onboarding status
  useEffect(() => {
    const cachedNotifs = localStorage.getItem('trucker_notifications');
    if (cachedNotifs) {
      setNotifications(JSON.parse(cachedNotifs));
    } else {
      setNotifications(sampleNotifications);
      localStorage.setItem('trucker_notifications', JSON.stringify(sampleNotifications));
    }

    const cachedProfile = localStorage.getItem('trucker_current_profile');
    const hasOnboardedFlag = localStorage.getItem('trucker_has_onboarded');

    if (cachedProfile && hasOnboardedFlag === 'true') {
      setUserProfile(JSON.parse(cachedProfile));
      setIsOnboarded(true);
    } else {
      setIsOnboarded(false);
    }
  }, []);

  const saveNotifications = (updated: AppNotification[]) => {
    setNotifications(updated);
    localStorage.setItem('trucker_notifications', JSON.stringify(updated));
  };

  // Add notification simulator
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

  // Onboarding submit
  const handleOnboardingSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const onboardedProfile: Profile = {
      ...userProfile,
      displayName: formName.trim() || 'Willie "Overdrive" Nelson',
      cdlClass: formCdl,
      yearsExperience: Number(formExp) || 0,
      currentRig: formRig.trim() || 'Peterbilt 389 Custom',
      lanes: [formLane.trim() || 'I-80 Corridor'],
      homeBase: formHome.trim() || 'Chicago, IL',
      isVerified: true
    };

    setUserProfile(onboardedProfile);
    localStorage.setItem('trucker_current_profile', JSON.stringify(onboardedProfile));
    localStorage.setItem('trucker_has_onboarded', 'true');
    setIsOnboarded(true);

    // Seed welcome system notification
    const welcomeNotif: AppNotification = {
      id: `welcome-${Date.now()}`,
      recipientId: onboardedProfile.id,
      type: 'system',
      read: false,
      message: `Welcome Cap! Your CDL-Class ${onboardedProfile.cdlClass} credentials have been verified and synced with the American Truckers Association chapter database. Welcome aboard!`,
      createdAt: new Date().toISOString()
    };
    saveNotifications([welcomeNotif, ...notifications]);
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
      {/* ONBOARDING OVERLAY */}
      {!isOnboarded && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950 p-4 overflow-y-auto" id="onboarding-container">
          <div className="w-full max-w-xl bg-white rounded-2xl shadow-2xl overflow-hidden border border-zinc-100 my-8">
            {/* Header branding banner */}
            <div className="bg-slate-900 text-white p-8 text-center space-y-3 relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-r from-amber-500/10 to-transparent opacity-50"></div>
              <div className="w-16 h-16 bg-amber-500 rounded-2xl flex items-center justify-center text-slate-950 mx-auto shadow-md relative z-10">
                <Truck className="w-9 h-9 fill-slate-950" />
              </div>
              <h2 className="text-xl font-black tracking-tight relative z-10">Truckers Association Board</h2>
              <p className="text-zinc-400 text-xs font-medium max-w-xs mx-auto relative z-10">
                Verify your commercial CDL credentials and custom rig details to join the professional driver hub.
              </p>
            </div>

            {/* Onboarding form card */}
            <form onSubmit={handleOnboardingSubmit} className="p-8 space-y-5">
              <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider border-b border-zinc-100 pb-2">CDL & Hauler Registry</h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Driver Handle */}
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-zinc-500 mb-1.5">Driver Handle / Call Sign</label>
                  <input
                    required
                    type="text"
                    placeholder="e.g. Willie 'Overdrive' Nelson"
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-zinc-200 focus:outline-none focus:ring-2 focus:ring-amber-500 text-xs text-slate-800"
                  />
                </div>

                {/* CDL card tier */}
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-zinc-500 mb-1.5">CDL Card Class</label>
                  <select
                    value={formCdl}
                    onChange={(e) => setFormCdl(e.target.value as any)}
                    className="w-full px-4 py-2.5 rounded-xl border border-zinc-200 focus:outline-none focus:ring-2 focus:ring-amber-500 text-xs text-slate-800 bg-white"
                  >
                    <option value="A">Class A (Combo / Semi-Trucks)</option>
                    <option value="B">Class B (Heavy Straight / Dump Trucks)</option>
                    <option value="C">Class C (Hazmat / Specialized)</option>
                    <option value="None">Non-Commercial / Fleet Logistics</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Experience */}
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-zinc-500 mb-1.5">Years Hauling Experience</label>
                  <input
                    required
                    type="number"
                    min="0"
                    max="50"
                    placeholder="e.g. 8"
                    value={formExp}
                    onChange={(e) => setFormExp(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-zinc-200 focus:outline-none focus:ring-2 focus:ring-amber-500 text-xs text-slate-800"
                  />
                </div>

                {/* Home Terminal Base */}
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-zinc-500 mb-1.5">Home Terminal (Base City)</label>
                  <input
                    required
                    type="text"
                    placeholder="e.g. Chicago, IL"
                    value={formHome}
                    onChange={(e) => setFormHome(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-zinc-200 focus:outline-none focus:ring-2 focus:ring-amber-500 text-xs text-slate-800"
                  />
                </div>
              </div>

              {/* Rig Description */}
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-zinc-500 mb-1.5">Tractor Model & Rig description</label>
                <input
                  required
                  type="text"
                  placeholder="e.g. 2022 Peterbilt 389 (Chrome Custom)"
                  value={formRig}
                  onChange={(e) => setFormRig(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-zinc-200 focus:outline-none focus:ring-2 focus:ring-amber-500 text-xs text-slate-800"
                />
              </div>

              {/* Primary haul lane */}
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-zinc-500 mb-1.5">Primary Hauling Corridor (Lane)</label>
                <input
                  required
                  type="text"
                  placeholder="e.g. I-80 Corridor / Pacific Highway / I-40 East Coast"
                  value={formLane}
                  onChange={(e) => setFormLane(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-zinc-200 focus:outline-none focus:ring-2 focus:ring-amber-500 text-xs text-slate-800"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3.5 bg-slate-900 hover:bg-slate-800 active:bg-slate-950 text-white font-extrabold rounded-xl transition-all text-xs uppercase tracking-wider shadow-md flex items-center justify-center space-x-2 mt-4"
              >
                <span>Verify & Activate CDL Access</span>
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

          {/* RIGHT ACTION ICONS */}
          <div className="flex items-center space-x-4">
            {/* Real-time-like notifications bell */}
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

              {/* NOTIFICATION DROP TRAY */}
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

            {/* AI Dispatch Quick Indicator */}
            <button
              onClick={() => setActiveSection('dispatch')}
              className={`hidden sm:flex items-center space-x-1.5 px-3 py-1.5 rounded-xl border text-xs font-bold transition-all ${
                activeSection === 'dispatch'
                  ? 'bg-amber-500 border-amber-500 text-slate-950'
                  : 'bg-slate-800 border-slate-700 text-zinc-300 hover:text-white'
              }`}
            >
              <Users className="w-3.5 h-3.5" />
              <span>AI Copilot</span>
            </button>
          </div>
        </div>
      </header>

      {/* DASHBOARD SHELL CONTAINER */}
      <main className="flex-1 w-full max-w-7xl mx-auto px-4 py-6 grid grid-cols-1 lg:grid-cols-12 gap-6" id="dashboard-layout">
        {/* DESKTOP STRUCTURAL SIDEBAR NAV (Left Column) */}
        <aside className="hidden lg:col-span-3 lg:flex flex-col space-y-4" id="desktop-sidebar">
          {/* Driver Quick Snapshot Profile Widget */}
          <div className="bg-white p-5 rounded-2xl border border-zinc-100 shadow-sm space-y-4">
            <div className="flex items-center space-x-3">
              <img src={userProfile.avatarUrl} className="w-11 h-11 rounded-full object-cover" alt="" />
              <div className="min-w-0">
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
          </div>

          {/* Nav list group */}
          <nav className="bg-white p-3 rounded-2xl border border-zinc-100 shadow-sm space-y-1" id="desktop-navigation">
            {[
              { id: 'feed', label: 'Highway Feed', icon: <BookOpen className="w-4 h-4" /> },
              { id: 'reports', label: 'Road Safety Alerts', icon: <ShieldAlert className="w-4 h-4" /> },
              { id: 'market', label: 'Trucker Market', icon: <Tag className="w-4 h-4" /> },
              { id: 'messenger', label: 'Driver Messenger', icon: <MessageSquare className="w-4 h-4" /> },
              { id: 'groups', label: 'Chapter Discussions', icon: <Users className="w-4 h-4" /> },
              { id: 'dispatch', label: 'AI Dispatch Copilot', icon: <Truck className="w-4 h-4 animate-bounce" /> },
              { id: 'profile', label: 'My CDL Profile', icon: <User className="w-4 h-4" /> }
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

        {/* PRIMARY ACTIVE SECTION COLUMN (Middle Column) */}
        <section className="col-span-1 lg:col-span-9" id="active-content-pane">
          {activeSection === 'feed' && <FeedSection onNotificationAdd={handleAddNotification} />}
          {activeSection === 'reports' && <RoadReportsSection />}
          {activeSection === 'market' && <MarketplaceSection />}
          {activeSection === 'groups' && <GroupsSection />}
          {activeSection === 'profile' && <ProfileSection />}
          {activeSection === 'dispatch' && <AIDispatcherSection />}
          {activeSection === 'messenger' && <MessengerSection />}
        </section>
      </main>

      {/* MOBILE-FIRST FLOATING BOTTOM NAVIGATION BAR */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-zinc-100 px-2 py-1.5 flex items-center justify-around shadow-lg" id="mobile-bottom-nav">
        {[
          { id: 'feed', label: 'Feed', icon: <BookOpen className="w-5 h-5" /> },
          { id: 'reports', label: 'Alerts', icon: <ShieldAlert className="w-5 h-5" /> },
          { id: 'messenger', label: 'Chat', icon: <MessageSquare className="w-5 h-5" /> },
          { id: 'market', label: 'Market', icon: <Tag className="w-5 h-5" /> },
          { id: 'groups', label: 'Chapters', icon: <Users className="w-5 h-5" /> },
          { id: 'profile', label: 'Profile', icon: <User className="w-5 h-5" /> }
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

      {/* FOOTER SPACING padding for mobile bottom bar */}
      <div className="h-20 lg:hidden"></div>
    </div>
  );
}
