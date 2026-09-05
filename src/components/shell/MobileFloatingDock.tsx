import React from 'react';
import { Menu, MapIcon, Radio, MessageSquare, Compass } from 'lucide-react';

export function MobileFloatingDock({ activeSection, setActiveSection, unreadCount, setIsMobileMenuOpen, isMobileMenuOpen }: any) {
  return (
    <div className="lg:hidden fixed bottom-0 left-0 right-0 z-40 p-4 pointer-events-none pb-safe">
      <div className="mx-auto max-w-sm bg-slate-900/95 backdrop-blur-md rounded-2xl shadow-2xl border border-slate-800/80 p-2 flex items-center justify-between pointer-events-auto">
        <button 
          onClick={() => setActiveSection('feed')} 
          className={`flex flex-col items-center justify-center w-12 h-12 rounded-xl transition-colors ${activeSection === 'feed' ? 'bg-amber-500/10 text-amber-500' : 'text-slate-400 hover:text-white'}`}
        >
          <Radio className="w-5 h-5 mb-0.5" />
          <span className="text-[9px] font-bold">Feed</span>
        </button>
        <button 
          onClick={() => setActiveSection('map')} 
          className={`flex flex-col items-center justify-center w-12 h-12 rounded-xl transition-colors ${activeSection === 'map' ? 'bg-amber-500/10 text-amber-500' : 'text-slate-400 hover:text-white'}`}
        >
          <MapIcon className="w-5 h-5 mb-0.5" />
          <span className="text-[9px] font-bold">Map</span>
        </button>
        
        <div className="relative -top-5">
          <button 
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} 
            className={`w-14 h-14 bg-amber-500 text-slate-950 rounded-2xl flex items-center justify-center shadow-lg shadow-amber-500/30 transform transition-transform ${isMobileMenuOpen ? 'rotate-90 scale-95' : 'hover:scale-105'}`}
          >
            <Menu className="w-6 h-6" />
          </button>
        </div>

        <button 
          onClick={() => setActiveSection('network')} 
          className={`flex flex-col items-center justify-center w-12 h-12 rounded-xl transition-colors ${activeSection === 'network' ? 'bg-amber-500/10 text-amber-500' : 'text-slate-400 hover:text-white'}`}
        >
          <Compass className="w-5 h-5 mb-0.5" />
          <span className="text-[9px] font-bold">Radar</span>
        </button>
        
        <button 
          onClick={() => setActiveSection('messages')} 
          className={`relative flex flex-col items-center justify-center w-12 h-12 rounded-xl transition-colors ${activeSection === 'messages' ? 'bg-amber-500/10 text-amber-500' : 'text-slate-400 hover:text-white'}`}
        >
          <MessageSquare className="w-5 h-5 mb-0.5" />
          <span className="text-[9px] font-bold">Inbox</span>
          {unreadCount > 0 && (
            <span className="absolute top-1 right-2 w-2 h-2 bg-rose-500 rounded-full border border-slate-900" />
          )}
        </button>
      </div>
    </div>
  );
}
