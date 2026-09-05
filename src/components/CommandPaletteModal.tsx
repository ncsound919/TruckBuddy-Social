import React, { useState, useEffect, useRef } from 'react';
import { 
  Search, 
  MapPin, 
  Radio, 
  Truck, 
  ShieldCheck, 
  Wrench, 
  Users, 
  ShoppingBag, 
  AlertTriangle, 
  Flame, 
  Scale, 
  Calculator, 
  Fuel, 
  Compass, 
  Clock, 
  X, 
  ArrowRight, 
  Volume2, 
  WifiOff, 
  Moon, 
  Sparkles,
  Command
} from 'lucide-react';
import { playAirHorn, playJakeBrake, playCbSquelch, playRogerBeep } from '../utils/cbAudio';
import { sampleProfiles } from '../data';
import { Profile } from '../types';

interface CommandPaletteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigateSection: (section: any) => void;
  onViewProfile?: (profile: Profile) => void;
  isDeadZone: boolean;
  onToggleDeadZone: () => void;
  dutyStatus?: 'driving' | 'on_duty' | 'sleeper' | 'off_duty';
  currentDutyStatus?: 'driving' | 'on_duty' | 'sleeper' | 'off_duty';
  onChangeDutyStatus?: (status: 'driving' | 'on_duty' | 'sleeper' | 'off_duty') => void;
  onUpdateDutyStatus?: (status: 'driving' | 'on_duty' | 'sleeper' | 'off_duty') => void;
}

interface CommandItem {
  id: string;
  category: 'Navigation' | 'Drivers' | 'Tools & Calculators' | 'Quick Actions' | 'Corridors';
  title: string;
  subtitle: string;
  icon: React.ReactNode;
  badge?: string;
  badgeColor?: string;
  action: () => void;
}

export default function CommandPaletteModal({
  isOpen,
  onClose,
  onNavigateSection,
  onViewProfile,
  isDeadZone,
  onToggleDeadZone,
  dutyStatus,
  currentDutyStatus,
  onChangeDutyStatus,
  onUpdateDutyStatus
}: CommandPaletteModalProps) {
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  const activeDuty = dutyStatus || currentDutyStatus || 'driving';
  const handleSetDuty = (status: 'driving' | 'on_duty' | 'sleeper' | 'off_duty') => {
    if (onChangeDutyStatus) onChangeDutyStatus(status);
    if (onUpdateDutyStatus) onUpdateDutyStatus(status);
  };

  useEffect(() => {
    if (isOpen) {
      setQuery('');
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  const allItems: CommandItem[] = [
    // Quick Actions
    {
      id: 'act-horn',
      category: 'Quick Actions',
      title: 'Sound Dual Semi Air Horn',
      subtitle: 'Play authentic 370Hz / 440Hz dual trumpet harmonic blast',
      icon: <Volume2 className="w-4 h-4 text-amber-500" />,
      badge: 'AUDIO FX',
      badgeColor: 'bg-amber-100 text-amber-800',
      action: () => {
        playAirHorn();
        onClose();
      }
    },
    {
      id: 'act-jake',
      category: 'Quick Actions',
      title: 'Engage Heavy Jake Brake Rumble',
      subtitle: 'Synthesize diesel engine compression decompression stutter',
      icon: <Volume2 className="w-4 h-4 text-sky-500" />,
      badge: 'AUDIO FX',
      badgeColor: 'bg-sky-100 text-sky-800',
      action: () => {
        playJakeBrake();
        onClose();
      }
    },
    {
      id: 'act-deadzone',
      category: 'Quick Actions',
      title: isDeadZone ? 'Disable Dead-Zone Mode (Re-connect)' : 'Simulate Cellular Dead-Zone (Offline Queue)',
      subtitle: 'Test offline storage, queue caching, and instant sync',
      icon: <WifiOff className="w-4 h-4 text-rose-500" />,
      badge: isDeadZone ? 'ONLINE SYNC' : 'OFFLINE MODE',
      badgeColor: isDeadZone ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800',
      action: () => {
        onToggleDeadZone();
        onClose();
      }
    },
    {
      id: 'act-status-drive',
      category: 'Quick Actions',
      title: 'Set Duty Status: Driving (Green Line)',
      subtitle: 'Broadcast active highway wheels rolling to corridor drivers',
      icon: <Truck className="w-4 h-4 text-emerald-500" />,
      badge: 'ELD HOS',
      badgeColor: 'bg-emerald-100 text-emerald-800',
      action: () => {
        handleSetDuty('driving');
        playRogerBeep();
        onClose();
      }
    },
    {
      id: 'act-status-duty',
      category: 'Quick Actions',
      title: 'Set Duty Status: On-Duty (Not Driving)',
      subtitle: 'Log inspection, fueling, or cargo drop/hook status',
      icon: <Clock className="w-4 h-4 text-amber-500" />,
      badge: 'ELD HOS',
      badgeColor: 'bg-amber-100 text-amber-800',
      action: () => {
        handleSetDuty('on_duty');
        playRogerBeep();
        onClose();
      }
    },
    {
      id: 'act-status-sleep',
      category: 'Quick Actions',
      title: 'Set Duty Status: Sleeper Berth (10-Hr Reset)',
      subtitle: 'Log sleeper berth rest period and mute non-emergency pings',
      icon: <Clock className="w-4 h-4 text-indigo-500" />,
      badge: 'ELD HOS',
      badgeColor: 'bg-indigo-100 text-indigo-800',
      action: () => {
        handleSetDuty('sleeper');
        playRogerBeep();
        onClose();
      }
    },
    {
      id: 'act-status-off',
      category: 'Quick Actions',
      title: 'Set Duty Status: Off-Duty (Home / Terminal)',
      subtitle: 'Log off-duty rest period',
      icon: <Moon className="w-4 h-4 text-purple-500" />,
      badge: 'ELD HOS',
      badgeColor: 'bg-purple-100 text-purple-800',
      action: () => {
        handleSetDuty('off_duty');
        playRogerBeep();
        onClose();
      }
    },

    // Navigation
    {
      id: 'nav-feed',
      category: 'Navigation',
      title: 'Road Feed & Updates',
      subtitle: 'Live highway timeline, road beacons, and verified CDL posts',
      icon: <Flame className="w-4 h-4 text-amber-500" />,
      action: () => {
        onNavigateSection('feed');
        onClose();
      }
    },
    {
      id: 'nav-map',
      category: 'Navigation',
      title: 'Live US Radar & Highway Map',
      subtitle: 'Real-time driver GPS locations, scales, weather hazards & summits',
      icon: <MapPin className="w-4 h-4 text-emerald-500" />,
      action: () => {
        onNavigateSection('map');
        onClose();
      }
    },
    {
      id: 'nav-tools',
      category: 'Navigation',
      title: 'CAT Scale & Trucker Tools Hub',
      subtitle: 'Axle sliding balance, HOS split-sleeper audit, IFTA fuel tax, CPM',
      icon: <Wrench className="w-4 h-4 text-sky-500" />,
      action: () => {
        onNavigateSection('tools');
        onClose();
      }
    },
    {
      id: 'nav-cb',
      category: 'Navigation',
      title: '40-Channel CB Radio Room',
      subtitle: 'Live simulated audio transceiver, squelch control, roger beep',
      icon: <Radio className="w-4 h-4 text-indigo-500" />,
      action: () => {
        onNavigateSection('cb_radio');
        onClose();
      }
    },
    {
      id: 'nav-convoys',
      category: 'Navigation',
      title: 'Highway Convoys & Draft Groups',
      subtitle: 'Form multi-rig fuel saving formations across interstates',
      icon: <Truck className="w-4 h-4 text-amber-600" />,
      action: () => {
        onNavigateSection('convoys');
        onClose();
      }
    },
    {
      id: 'nav-leaderboard',
      category: 'Navigation',
      title: 'Driver Leaderboard & Milestones',
      subtitle: 'Top mileage haulers, safety points, and safe driver rankings',
      icon: <ShieldCheck className="w-4 h-4 text-amber-500" />,
      action: () => {
        onNavigateSection('leaderboard');
        onClose();
      }
    },
    {
      id: 'nav-market',
      category: 'Navigation',
      title: 'Trucker Marketplace & Rig Parts',
      subtitle: 'Tires, CB transceivers, turbochargers, chains, and sleeper gear',
      icon: <ShoppingBag className="w-4 h-4 text-emerald-600" />,
      action: () => {
        onNavigateSection('marketplace');
        onClose();
      }
    },
    {
      id: 'nav-groups',
      category: 'Navigation',
      title: 'Fleets & Regional Groups',
      subtitle: 'Reefer Outlaws, Flatbed Masters, Heavy-Haul, Owner-Operators',
      icon: <Users className="w-4 h-4 text-purple-500" />,
      action: () => {
        onNavigateSection('groups');
        onClose();
      }
    },
    {
      id: 'nav-reports',
      category: 'Navigation',
      title: 'Live Road Hazards & Scale Reports',
      subtitle: 'DOT scale open/closed status, chain controls, weather warnings',
      icon: <AlertTriangle className="w-4 h-4 text-rose-500" />,
      action: () => {
        onNavigateSection('reports');
        onClose();
      }
    },

    // Tools
    {
      id: 'tool-cat',
      category: 'Tools & Calculators',
      title: 'CAT Scale Axle Weight Balancer',
      subtitle: 'Calculate pin hole hole shift distance (steer, drive, trailer)',
      icon: <Scale className="w-4 h-4 text-sky-500" />,
      badge: '80K LBS MAX',
      badgeColor: 'bg-sky-100 text-sky-800',
      action: () => {
        onNavigateSection('tools');
        onClose();
      }
    },
    {
      id: 'tool-cpm',
      category: 'Tools & Calculators',
      title: 'Owner-Operator Cost Per Mile (CPM) Calculator',
      subtitle: 'Fixed vs variable cost modeling, DEF, tires, insurance breakdown',
      icon: <Calculator className="w-4 h-4 text-emerald-500" />,
      badge: 'PROFIT ROI',
      badgeColor: 'bg-emerald-100 text-emerald-800',
      action: () => {
        onNavigateSection('tools');
        onClose();
      }
    },
    {
      id: 'tool-hos',
      category: 'Tools & Calculators',
      title: 'FMCSA Split-Sleeper HOS Audit Tool',
      subtitle: '8/2 and 7/3 split sleeper berth calculator with 14-hr pause tracking',
      icon: <Clock className="w-4 h-4 text-amber-500" />,
      badge: 'FMCSA 395',
      badgeColor: 'bg-amber-100 text-amber-800',
      action: () => {
        onNavigateSection('tools');
        onClose();
      }
    },

    // Drivers
    ...sampleProfiles.map(driver => ({
      id: `driver-${driver.id}`,
      category: 'Drivers' as const,
      title: `${driver.displayName} (@${driver.username})`,
      subtitle: `${driver.currentRig} • ${driver.homeBase} • ${driver.carrierName || 'Independent'} • ${driver.yearsExperience} yrs exp`,
      icon: <img src={driver.avatarUrl} className="w-5 h-5 rounded-full object-cover" alt="" />,
      badge: driver.isVerified ? `CDL-${driver.cdlClass} VERIFIED` : 'DRIVER',
      badgeColor: driver.isVerified ? 'bg-amber-100 text-amber-800' : 'bg-zinc-100 text-zinc-700',
      action: () => {
        if (onViewProfile) {
          onViewProfile(driver);
        }
        onClose();
      }
    }))
  ];

  const filteredItems = query.trim() === ''
    ? allItems.slice(0, 10)
    : allItems.filter(item => 
        item.title.toLowerCase().includes(query.toLowerCase()) ||
        item.subtitle.toLowerCase().includes(query.toLowerCase()) ||
        item.category.toLowerCase().includes(query.toLowerCase())
      );

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex(prev => (prev + 1) % Math.max(1, filteredItems.length));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex(prev => (prev - 1 + filteredItems.length) % Math.max(1, filteredItems.length));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (filteredItems[selectedIndex]) {
        filteredItems[selectedIndex].action();
      }
    } else if (e.key === 'Escape') {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-start justify-center pt-16 sm:pt-24 p-4 bg-slate-950/70 backdrop-blur-md animate-in fade-in duration-150"
      onClick={onClose}
      id="command-palette-modal-backdrop"
    >
      <div 
        className="w-full max-w-2xl bg-white rounded-2xl shadow-2xl overflow-hidden border border-zinc-200 flex flex-col max-h-[80vh] animate-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
        id="command-palette-container"
      >
        {/* TOP SEARCH INPUT BAR */}
        <div className="flex items-center px-4 py-3.5 border-b border-zinc-100 bg-zinc-50/70">
          <Search className="w-5 h-5 text-amber-500 shrink-0 mr-3" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setSelectedIndex(0);
            }}
            onKeyDown={handleKeyDown}
            placeholder="Search drivers, tools, radar, channels, or run quick actions (e.g. 'Air Horn', 'CAT Scale')..."
            className="flex-1 text-sm bg-transparent border-none focus:outline-none text-slate-900 placeholder:text-zinc-400 font-medium"
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="p-1 text-zinc-400 hover:text-slate-700 mr-2"
            >
              <X className="w-4 h-4" />
            </button>
          )}
          <span className="hidden sm:inline-flex items-center px-2 py-0.5 rounded bg-zinc-200 text-zinc-600 font-mono text-[10px] font-bold">
            ESC
          </span>
        </div>

        {/* RESULTS LIST */}
        <div className="flex-1 overflow-y-auto p-2 divide-y divide-zinc-50 space-y-1">
          {filteredItems.length === 0 ? (
            <div className="p-8 text-center text-zinc-400">
              <Search className="w-8 h-8 mx-auto mb-2 opacity-40 text-amber-500" />
              <p className="text-sm font-bold text-slate-700">No matching truck dispatch items found</p>
              <p className="text-xs text-zinc-400 mt-1">Try searching for "map", "scale", "horn", or a driver's handle</p>
            </div>
          ) : (
            filteredItems.map((item, index) => {
              const isSelected = index === selectedIndex;
              return (
                <div
                  key={item.id}
                  onClick={item.action}
                  onMouseEnter={() => setSelectedIndex(index)}
                  className={`px-3.5 py-2.5 rounded-xl cursor-pointer transition-all flex items-center justify-between group ${
                    isSelected ? 'bg-slate-900 text-white shadow-md' : 'hover:bg-zinc-50 text-slate-800'
                  }`}
                >
                  <div className="flex items-center space-x-3 min-w-0">
                    <div className={`p-2 rounded-lg shrink-0 ${isSelected ? 'bg-slate-800 text-white' : 'bg-zinc-100 text-slate-700'}`}>
                      {item.icon}
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center space-x-2">
                        <span className={`text-xs font-bold truncate ${isSelected ? 'text-white' : 'text-slate-900'}`}>
                          {item.title}
                        </span>
                        {item.badge && (
                          <span className={`text-[9px] font-black px-1.5 py-0.5 rounded uppercase tracking-wider ${
                            isSelected ? 'bg-amber-400 text-slate-950' : (item.badgeColor || 'bg-zinc-100 text-zinc-700')
                          }`}>
                            {item.badge}
                          </span>
                        )}
                      </div>
                      <p className={`text-[11px] truncate ${isSelected ? 'text-zinc-300' : 'text-zinc-500'}`}>
                        {item.subtitle}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2 shrink-0 ml-2">
                    <span className={`text-[10px] font-bold uppercase tracking-wider hidden sm:inline ${
                      isSelected ? 'text-amber-400' : 'text-zinc-400'
                    }`}>
                      {item.category}
                    </span>
                    <ArrowRight className={`w-3.5 h-3.5 transition-transform ${isSelected ? 'translate-x-0.5 text-amber-400' : 'text-zinc-300'}`} />
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* BOTTOM HUD STATUS HINT */}
        <div className="px-4 py-2.5 bg-zinc-100/80 border-t border-zinc-200 text-[11px] text-zinc-500 flex items-center justify-between font-medium">
          <div className="flex items-center space-x-3">
            <span className="flex items-center space-x-1">
              <kbd className="px-1.5 py-0.5 bg-white border border-zinc-300 rounded text-[10px] font-mono shadow-xs">↑↓</kbd>
              <span>Navigate</span>
            </span>
            <span className="flex items-center space-x-1">
              <kbd className="px-1.5 py-0.5 bg-white border border-zinc-300 rounded text-[10px] font-mono shadow-xs">↵</kbd>
              <span>Select</span>
            </span>
            <span className="flex items-center space-x-1">
              <kbd className="px-1.5 py-0.5 bg-white border border-zinc-300 rounded text-[10px] font-mono shadow-xs">ESC</kbd>
              <span>Close</span>
            </span>
          </div>
          <div className="hidden sm:flex items-center space-x-1 text-amber-600 font-bold">
            <Sparkles className="w-3 h-3" />
            <span>Trucker HUD Command Palette</span>
          </div>
        </div>
      </div>
    </div>
  );
}
