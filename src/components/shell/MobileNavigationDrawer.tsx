import React from 'react';
import { X, ShieldCheck, Settings, LogOut, Coffee } from 'lucide-react';
import { SidebarNavigation } from './SidebarNavigation';

export function MobileNavigationDrawer({
  isMobileMenuOpen,
  setIsMobileMenuOpen,
  userProfile,
  activeSection,
  setActiveSection,
  unreadCount,
  toggleNightCabMode,
  isNightCabMode,
  dutyStatus,
  setDutyStatus,
  handleFlushData,
  handleSignOut
}: any) {
  if (!isMobileMenuOpen) return null;
  
  return (
    <div className="lg:hidden fixed inset-0 z-50 flex" id="mobile-nav-drawer">
      <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm" onClick={() => setIsMobileMenuOpen(false)} />
      <div className="relative w-[85%] max-w-sm bg-slate-950 h-full shadow-2xl flex flex-col border-r border-slate-900 animate-in slide-in-from-left duration-200">
        <div className="flex items-center justify-between p-4 border-b border-slate-900 bg-slate-900/50">
          <div className="flex items-center space-x-3">
            <div className="relative">
              <img src={userProfile.avatarUrl || null} className="w-10 h-10 rounded-xl object-cover ring-2 ring-amber-500" alt="" />
              <div className="absolute -bottom-1 -right-1 bg-amber-500 text-slate-950 p-0.5 rounded shadow">
                <ShieldCheck className="w-3 h-3" />
              </div>
            </div>
            <div>
              <h3 className="font-black text-white text-sm leading-tight">{userProfile.displayName}</h3>
              <span className="text-[10px] text-amber-500 font-bold tracking-widest uppercase">Class {userProfile.cdlClass} Verified</span>
            </div>
          </div>
          <button onClick={() => setIsMobileMenuOpen(false)} className="p-2 text-zinc-400 hover:text-white bg-slate-800 rounded-xl">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-6">
          <div className="bg-slate-900/50 p-1.5 rounded-xl border border-slate-800/60 relative z-10 flex">
            <button
              onClick={() => setDutyStatus('driving')}
              className={`flex-1 flex flex-col items-center justify-center py-2 px-1 rounded-lg transition-all ${
                dutyStatus === 'driving' 
                  ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' 
                  : 'text-zinc-500 hover:bg-slate-800 hover:text-zinc-300'
              }`}
            >
              <span className="text-[10px] font-black uppercase tracking-widest mt-1">Driving</span>
            </button>
            <button
              onClick={() => setDutyStatus('on_duty')}
              className={`flex-1 flex flex-col items-center justify-center py-2 px-1 rounded-lg transition-all ${
                dutyStatus === 'on_duty' 
                  ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' 
                  : 'text-zinc-500 hover:bg-slate-800 hover:text-zinc-300'
              }`}
            >
              <span className="text-[10px] font-black uppercase tracking-widest mt-1">On Duty</span>
            </button>
            <button
              onClick={() => setDutyStatus('sleeper')}
              className={`flex-1 flex flex-col items-center justify-center py-2 px-1 rounded-lg transition-all ${
                dutyStatus === 'sleeper' 
                  ? 'bg-indigo-500/20 text-indigo-400 border border-indigo-500/30' 
                  : 'text-zinc-500 hover:bg-slate-800 hover:text-zinc-300'
              }`}
            >
              <span className="text-[10px] font-black uppercase tracking-widest mt-1">Sleeper</span>
            </button>
          </div>

          <SidebarNavigation 
            activeSection={activeSection} 
            setActiveSection={setActiveSection} 
            unreadCount={unreadCount} 
            isMobileMenuOpen={isMobileMenuOpen}
            setIsMobileMenuOpen={setIsMobileMenuOpen}
          />
        </div>

        <div className="p-4 border-t border-slate-900 bg-slate-900/50 space-y-3">
          <button onClick={handleFlushData} className="w-full flex items-center justify-center space-x-2 py-3 bg-slate-800 hover:bg-rose-500/20 hover:text-rose-400 text-zinc-400 rounded-xl transition-colors font-bold text-xs uppercase tracking-wider">
            <Coffee className="w-4 h-4" />
            <span>Reset Cache</span>
          </button>
          <button onClick={handleSignOut} className="w-full flex items-center justify-center space-x-2 py-3 bg-rose-500 hover:bg-rose-600 text-white rounded-xl transition-colors font-black text-xs uppercase tracking-wider shadow-lg shadow-rose-500/20">
            <LogOut className="w-4 h-4" />
            <span>Sign Out</span>
          </button>
        </div>
      </div>
    </div>
  );
}
