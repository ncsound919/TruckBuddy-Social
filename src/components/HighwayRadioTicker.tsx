import React, { useState, useEffect } from 'react';
import { 
  Radio, 
  AlertTriangle, 
  Wind, 
  Fuel, 
  ShieldCheck, 
  ChevronRight, 
  ChevronLeft,
  Pause, 
  Play,
  Volume2,
  VolumeX,
  Sparkles
} from 'lucide-react';
import { broadcastCbMessage, playAirHorn, playJakeBrake, playChannelClick } from '../utils/cbAudio';

interface HighwayAlert {
  id: string;
  type: 'emergency' | 'weather' | 'scale' | 'fuel' | 'cb';
  channel: number;
  badge: string;
  badgeColor: string;
  text: string;
  subtext: string;
  corridor: string;
  actionSection?: 'reports' | 'map' | 'tools' | 'feed' | 'cb_radio';
}

const HIGHWAY_ALERTS: HighwayAlert[] = [
  {
    id: 'alt-1',
    type: 'weather',
    channel: 19,
    badge: 'HIGH WIND WARNING',
    badgeColor: 'bg-rose-500 text-white',
    text: 'WY I-80 Elk Mountain (MM 250-290): Severe 58 MPH crosswind gusts.',
    subtext: 'Light / empty trailers prohibited. 2 rollover incidents recorded.',
    corridor: 'I-80 Wyoming',
    actionSection: 'map'
  },
  {
    id: 'alt-2',
    type: 'weather',
    channel: 17,
    badge: 'CHAIN CONTROL',
    badgeColor: 'bg-amber-500 text-slate-950',
    text: 'CA I-80 Donner Summit Pass (7,057 ft): Chains required on drive axles.',
    subtext: 'Snow squalls & black ice on summit grade. Caltrans checkpoint active.',
    corridor: 'I-80 California',
    actionSection: 'map'
  },
  {
    id: 'alt-3',
    type: 'scale',
    channel: 19,
    badge: 'PREPASS BYPASS',
    badgeColor: 'bg-emerald-500 text-slate-950',
    text: 'Echo POE (UT) & Perry Scale (GA): Green Light PrePass bypass active.',
    subtext: 'Static scale open with 8 min queue. PrePass carriers cleared to roll.',
    corridor: 'I-80 & I-75',
    actionSection: 'reports'
  },
  {
    id: 'alt-4',
    type: 'fuel',
    channel: 21,
    badge: 'DIESEL BENCHMARK',
    badgeColor: 'bg-sky-500 text-slate-950',
    text: 'National Diesel Avg: $3.84/gal (-3¢). Lowest: I-10 El Paso, TX ($3.49).',
    subtext: 'Check ATA fuel discounts at Love\'s #405 & Petro Laramie #311.',
    corridor: 'Transcon Corridors',
    actionSection: 'tools'
  },
  {
    id: 'alt-5',
    type: 'emergency',
    channel: 9,
    badge: 'EMERGENCY MONITOR',
    badgeColor: 'bg-red-600 text-white animate-pulse',
    text: 'Channel 9 Distress Net: Clear across Great Plains & Rockies.',
    subtext: 'Emergency highway patrols standing by for severe winter blizzard alert.',
    corridor: 'Nationwide Ch 9',
    actionSection: 'cb_radio'
  },
  {
    id: 'alt-6',
    type: 'cb',
    channel: 33,
    badge: 'HEAVY HAUL NET',
    badgeColor: 'bg-purple-500 text-white',
    text: 'Over-dimensional load moving EB on I-70 through Eisenhower Tunnel.',
    subtext: 'Pilot cars in front and rear. Maintain 500ft following distance.',
    corridor: 'I-70 Colorado',
    actionSection: 'map'
  }
];

const CHANNELS = [
  { ch: 19, label: 'CH 19 Highway' },
  { ch: 9, label: 'CH 9 Emergency' },
  { ch: 17, label: 'CH 17 West' },
  { ch: 21, label: 'CH 21 Reefer' },
  { ch: 33, label: 'CH 33 Heavy' },
];

interface HighwayRadioTickerProps {
  onNavigateSection?: (section: any) => void;
}

export default function HighwayRadioTicker({ onNavigateSection }: HighwayRadioTickerProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedChannel, setSelectedChannel] = useState(19);
  const [isPaused, setIsPaused] = useState(false);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [soundEffectToast, setSoundEffectToast] = useState<string | null>(null);

  // Filter alerts by selected channel or show all
  const activeAlerts = HIGHWAY_ALERTS;

  useEffect(() => {
    if (isPaused || isPlayingAudio) return;
    const timer = setInterval(() => {
      setCurrentIndex(prev => (prev + 1) % activeAlerts.length);
    }, 6000);
    return () => clearInterval(timer);
  }, [isPaused, isPlayingAudio, activeAlerts.length]);

  const currentAlert = activeAlerts[currentIndex] || activeAlerts[0];

  const handleNext = () => {
    setCurrentIndex(prev => (prev + 1) % activeAlerts.length);
  };

  const handlePrev = () => {
    setCurrentIndex(prev => (prev - 1 + activeAlerts.length) % activeAlerts.length);
  };

  const handleSelectChannel = (ch: number) => {
    playChannelClick();
    setSelectedChannel(ch);
    // Find alert for this channel or reset index
    const foundIdx = HIGHWAY_ALERTS.findIndex(a => a.channel === ch);
    if (foundIdx !== -1) {
      setCurrentIndex(foundIdx);
    }
  };

  const handleBroadcastAlert = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isPlayingAudio) {
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
      setIsPlayingAudio(false);
      return;
    }

    const broadcastText = `Breaker one-nine. Highway bulletin on Channel ${currentAlert.channel} for ${currentAlert.corridor}. ${currentAlert.badge}: ${currentAlert.text}. ${currentAlert.subtext}`;
    broadcastCbMessage(
      broadcastText,
      () => setIsPlayingAudio(true),
      () => setIsPlayingAudio(false)
    );
  };

  const handleTriggerHorn = (e: React.MouseEvent) => {
    e.stopPropagation();
    playAirHorn();
    setSoundEffectToast('🎺 Air Horn Blasted!');
    setTimeout(() => setSoundEffectToast(null), 2000);
  };

  const handleTriggerJake = (e: React.MouseEvent) => {
    e.stopPropagation();
    playJakeBrake();
    setSoundEffectToast('💨 Jake Brake Engaged!');
    setTimeout(() => setSoundEffectToast(null), 2000);
  };

  return (
    <div 
      className="bg-slate-950 border-b border-slate-800 text-white text-xs px-3 sm:px-6 py-2 select-none relative overflow-hidden"
      id="highway-radio-ticker-tape"
    >
      {soundEffectToast && (
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-30 bg-amber-400 text-slate-950 font-black text-[10px] px-3 py-1 rounded-full shadow-lg pointer-events-none animate-in zoom-in-75">
          {soundEffectToast}
        </div>
      )}

      <div className="max-w-7xl mx-auto flex items-center justify-between gap-3">
        {/* Left Indicator & Channel Tuner */}
        <div className="flex items-center space-x-2 shrink-0">
          <div className="hidden lg:flex items-center space-x-1 bg-slate-900 border border-slate-800 rounded-lg p-0.5">
            {CHANNELS.map(c => (
              <button
                key={c.ch}
                onClick={() => handleSelectChannel(c.ch)}
                className={`px-2 py-0.5 rounded text-[10px] font-black transition-all ${
                  selectedChannel === c.ch 
                    ? 'bg-amber-500 text-slate-950 shadow-xs' 
                    : 'text-zinc-400 hover:text-white'
                }`}
              >
                {c.ch === 19 ? 'CH 19' : `CH ${c.ch}`}
              </button>
            ))}
          </div>

          <div className="lg:hidden flex items-center space-x-1.5 px-2 py-0.5 rounded-md bg-amber-500/10 border border-amber-500/30 text-amber-400 font-black text-[10px]">
            <Radio className="w-3.5 h-3.5 animate-pulse" />
            <span>CH {currentAlert.channel}</span>
          </div>

          {/* Voice CB Broadcast Toggle */}
          <button
            onClick={handleBroadcastAlert}
            className={`flex items-center space-x-1 px-2 py-0.5 rounded-lg text-[10px] font-black uppercase tracking-wider transition ${
              isPlayingAudio ? 'bg-rose-600 text-white animate-pulse' : 'bg-slate-800 hover:bg-slate-700 text-amber-400'
            }`}
            title="Listen to Live CB Broadcast"
          >
            {isPlayingAudio ? <VolumeX className="w-3 h-3" /> : <Volume2 className="w-3 h-3" />}
            <span className="hidden md:inline">{isPlayingAudio ? 'Mute' : 'CB Audio'}</span>
          </button>

          {/* Quick Rig Soundboard Blast Buttons */}
          <div className="hidden sm:flex items-center space-x-1 border-l border-slate-800 pl-2">
            <button
              onClick={handleTriggerHorn}
              className="px-2 py-0.5 bg-slate-900 hover:bg-amber-500/20 hover:text-amber-300 text-zinc-300 text-[10px] font-bold rounded border border-slate-800 transition active:scale-95 flex items-center gap-1"
              title="Blast Semi Dual Air Horn (Audio FX)"
            >
              <span>🎺 Horn</span>
            </button>
            <button
              onClick={handleTriggerJake}
              className="px-2 py-0.5 bg-slate-900 hover:bg-sky-500/20 hover:text-sky-300 text-zinc-300 text-[10px] font-bold rounded border border-slate-800 transition active:scale-95 flex items-center gap-1"
              title="Engage Compression Engine Brake (Audio FX)"
            >
              <span>💨 Jake</span>
            </button>
          </div>
        </div>

        {/* Center Alert Stream */}
        <div 
          className="flex-1 min-w-0 flex items-center space-x-2.5 overflow-hidden cursor-pointer group"
          onClick={() => {
            if (currentAlert.actionSection && onNavigateSection) {
              onNavigateSection(currentAlert.actionSection);
            }
          }}
          title="Click to jump directly to this advisory"
        >
          <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-full shrink-0 tracking-wider ${currentAlert.badgeColor}`}>
            {currentAlert.badge}
          </span>
          <p className="text-[11px] font-medium text-zinc-200 truncate group-hover:text-amber-300 transition-colors">
            <span className="font-bold text-white mr-1">{currentAlert.text}</span>
            <span className="text-zinc-400 hidden md:inline">{currentAlert.subtext}</span>
          </p>
        </div>

        {/* Right Controls */}
        <div className="flex items-center space-x-1 shrink-0 text-zinc-400">
          <button
            onClick={handlePrev}
            className="p-1 hover:text-white rounded hover:bg-slate-800 transition"
            title="Previous Alert"
          >
            <ChevronLeft className="w-3.5 h-3.5" />
          </button>
          
          <button
            onClick={() => setIsPaused(prev => !prev)}
            className="p-1 hover:text-white rounded hover:bg-slate-800 transition"
            title={isPaused ? "Resume Ticker" : "Pause Ticker"}
          >
            {isPaused ? <Play className="w-3 h-3 text-amber-400" /> : <Pause className="w-3 h-3" />}
          </button>

          <button
            onClick={handleNext}
            className="p-1 hover:text-white rounded hover:bg-slate-800 transition"
            title="Next Alert"
          >
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}
