import React from 'react';
import { Radio, MapIcon, Compass, MessageSquare, ShieldAlert, Tag, Users, User, Calculator, Activity, Trophy } from 'lucide-react';

export function SidebarNavigation({ activeSection, setActiveSection, unreadCount, isMobileMenuOpen, setIsMobileMenuOpen }: any) {
  const navItems = [
    { id: 'feed', icon: <Radio className="w-5 h-5" />, label: 'CB Radio Feed', badge: null },
    { id: 'map', icon: <MapIcon className="w-5 h-5" />, label: 'Highway Map', badge: null },
    { id: 'leaderboard', icon: <Trophy className="w-5 h-5" />, label: 'Mileage Leaderboard', badge: null },
    { id: 'network', icon: <Compass className="w-5 h-5" />, label: 'Convoy Network', badge: null },
    { id: 'messages', icon: <MessageSquare className="w-5 h-5" />, label: 'Direct Messages', badge: unreadCount > 0 ? unreadCount : null },
    { id: 'reports', icon: <ShieldAlert className="w-5 h-5" />, label: 'Road Reports', badge: '3' },
    { id: 'market', icon: <Tag className="w-5 h-5" />, label: 'Marketplace', badge: null },
    { id: 'groups', icon: <Users className="w-5 h-5" />, label: 'Company Groups', badge: null },
    { id: 'tools', icon: <Calculator className="w-5 h-5" />, label: 'Trucker Tools', badge: null },
    { id: 'profile', icon: <User className="w-5 h-5" />, label: 'My Logbook', badge: null },
    { id: 'dev', icon: <Activity className="w-5 h-5 text-amber-500" />, label: 'System Diagnostics', badge: null }
  ];

  return (
    <div className="space-y-1">
      {navItems.map((item) => (
        <button
          key={item.id}
          onClick={() => {
            setActiveSection(item.id as any);
            setIsMobileMenuOpen(false);
          }}
          className={`w-full flex items-center justify-between px-4 py-3 rounded-xl transition-all group ${
            activeSection === item.id 
              ? 'bg-amber-500 text-slate-950 font-black shadow-md shadow-amber-500/20' 
              : 'text-zinc-400 hover:bg-slate-800 hover:text-white font-bold'
          }`}
        >
          <div className="flex items-center space-x-3">
            <span className={activeSection === item.id ? 'text-slate-950' : 'text-zinc-500 group-hover:text-amber-400 transition-colors'}>
              {item.icon}
            </span>
            <span className="tracking-wide">{item.label}</span>
          </div>
          {item.badge && (
            <span className={`px-2 py-0.5 rounded-full text-[10px] font-black ${
              activeSection === item.id ? 'bg-slate-950 text-amber-500' : 'bg-amber-500 text-slate-950'
            }`}>
              {item.badge}
            </span>
          )}
        </button>
      ))}
    </div>
  );
}
