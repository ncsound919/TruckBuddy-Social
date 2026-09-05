import React from 'react';
import { Menu, Wifi, WifiOff } from 'lucide-react';

export function AppHeader({ 
  isMobileMenuOpen, setIsMobileMenuOpen, isDeadZone, 
  title = "Truck Buddy Network", subtitle = "National Feed"
}: any) {
  return (
    <header className="sticky top-0 z-40 bg-slate-900 border-b border-slate-800 p-4 shadow-sm flex items-center justify-between sm:hidden">
      <div className="flex items-center space-x-3">
        <button 
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} 
          className="text-white hover:bg-slate-800 p-2 rounded-xl transition-colors"
        >
          <Menu className="w-6 h-6" />
        </button>
        <div>
          <h1 className="font-black text-white text-lg leading-tight uppercase tracking-widest">{title}</h1>
          <div className="flex items-center space-x-1.5 text-xs">
            <span className="text-amber-500 font-bold tracking-widest uppercase">{subtitle}</span>
          </div>
        </div>
      </div>
      <div className="flex items-center space-x-2">
        <div className={`flex items-center space-x-1 px-2.5 py-1 rounded-full text-[10px] font-black tracking-widest uppercase border ${isDeadZone ? 'bg-red-500/10 text-red-400 border-red-500/20' : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'}`}>
          {isDeadZone ? <WifiOff className="w-3 h-3 mr-1" /> : <Wifi className="w-3 h-3 mr-1" />}
          <span>{isDeadZone ? 'Dead Zone' : 'Online'}</span>
        </div>
      </div>
    </header>
  );
}
