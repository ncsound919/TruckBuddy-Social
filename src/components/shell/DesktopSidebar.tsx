import React from 'react';
import { 
  ShieldCheck, ArrowRight, Settings, Radio, MapIcon, Compass, MessageSquare, 
  ShieldAlert, Tag, Users, User, Calculator, Activity, Trophy, Coffee, LogOut, 
  MapPin, Wrench, FileText, CheckCircle, BookOpen, AlertTriangle 
} from 'lucide-react';
import { Profile } from '../../types';
import { SidebarNavigation } from './SidebarNavigation';

interface Props {
  userProfile: Profile;
  activeSection: string;
  setActiveSection: (s: any) => void;
  unreadCount: number;
  dutyStatus: 'driving' | 'on_duty' | 'sleeper' | 'off_duty';
  setDutyStatus: (s: any) => void;
  handleSignOut: () => void;
}

export function DesktopSidebar({
  userProfile,
  activeSection,
  setActiveSection,
  unreadCount,
  dutyStatus,
  setDutyStatus,
  handleSignOut
}: Props) {
  return (
    <aside className="hidden lg:col-span-3 lg:flex flex-col space-y-4" id="desktop-sidebar">
      {/* HIGH-STATUS CDL PILOT CARD */}
      <div 
        onClick={() => setActiveSection('profile')}
        className="bg-gradient-to-b from-slate-900 to-slate-950 p-5 rounded-3xl border border-slate-800/90 hover:border-amber-400/50 shadow-xl space-y-4 cursor-pointer transition-all group relative overflow-hidden"
        title="Click to view My CDL Profile"
      >
        <div className="absolute -right-8 -top-8 w-32 h-32 bg-amber-500/10 rounded-full blur-2xl pointer-events-none" />
        <div className="flex items-center space-x-3 relative z-10">
          <div className="relative">
            <img 
              src={userProfile.avatarUrl || null} 
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
              Class {userProfile.cdlClass} Driver
            </span>
          </div>
          <ArrowRight className="w-4 h-4 text-zinc-600 group-hover:text-amber-400 group-hover:translate-x-1 transition-all" />
        </div>
        
        {/* LIVE DRIVER DUTY STATUS SWITCHER */}
        <div className="bg-slate-900/50 p-1.5 rounded-xl border border-slate-800/60 relative z-10 flex" onClick={(e) => e.stopPropagation()}>
          <button
            onClick={() => setDutyStatus('driving')}
            className={`flex-1 flex flex-col items-center justify-center py-2 px-1 rounded-lg transition-all ${
              dutyStatus === 'driving' 
                ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 shadow-[0_0_10px_rgba(16,185,129,0.2)]' 
                : 'text-zinc-500 hover:bg-slate-800 hover:text-zinc-300'
            }`}
          >
            <span className="text-[10px] font-black uppercase tracking-widest mt-1">Driving</span>
          </button>
          
          <button
            onClick={() => setDutyStatus('on_duty')}
            className={`flex-1 flex flex-col items-center justify-center py-2 px-1 rounded-lg transition-all ${
              dutyStatus === 'on_duty' 
                ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30 shadow-[0_0_10px_rgba(245,158,11,0.2)]' 
                : 'text-zinc-500 hover:bg-slate-800 hover:text-zinc-300'
            }`}
          >
            <span className="text-[10px] font-black uppercase tracking-widest mt-1">On Duty</span>
          </button>

          <button
            onClick={() => setDutyStatus('sleeper')}
            className={`flex-1 flex flex-col items-center justify-center py-2 px-1 rounded-lg transition-all ${
              dutyStatus === 'sleeper' 
                ? 'bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 shadow-[0_0_10px_rgba(99,102,241,0.2)]' 
                : 'text-zinc-500 hover:bg-slate-800 hover:text-zinc-300'
            }`}
          >
            <span className="text-[10px] font-black uppercase tracking-widest mt-1">Sleeper</span>
          </button>
        </div>
      </div>

      <SidebarNavigation 
        activeSection={activeSection} 
        setActiveSection={setActiveSection} 
        unreadCount={unreadCount} 
        isMobileMenuOpen={false}
        setIsMobileMenuOpen={() => {}}
      />
      
      <div className="pt-2">
        <button 
          onClick={handleSignOut}
          className="w-full flex items-center justify-between px-4 py-3 rounded-xl transition-all text-zinc-500 hover:bg-rose-500/10 hover:text-rose-400 group"
        >
          <div className="flex items-center space-x-3">
            <LogOut className="w-5 h-5" />
            <span className="font-bold tracking-wide">Sign Out</span>
          </div>
        </button>
      </div>
    </aside>
  );
}
