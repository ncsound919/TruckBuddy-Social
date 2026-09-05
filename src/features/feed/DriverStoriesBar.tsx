import React, { useState, useEffect } from 'react';
import { Profile, DriverRoadStatus } from '../../types';
import { sampleDriverRoadStatuses, currentUserProfile } from '../../data';
import { playAirHorn, playHighBeamFlash, playCbSquelch, broadcastCbMessage } from '../../utils/cbAudio';
import { 
  Plus, 
  Radio, 
  MapPin, 
  Clock, 
  Volume2, 
  MessageSquare, 
  X, 
  Send, 
  Sparkles, 
  Check, 
  ChevronRight, 
  ChevronLeft,
  Share2,
  Camera,
  Compass
} from 'lucide-react';

interface DriverStoriesBarProps {
  onOpenDirectMessage?: (profile: Profile) => void;
  onViewProfile?: (profile: Profile) => void;
}

export default function DriverStoriesBar({ onOpenDirectMessage, onViewProfile }: DriverStoriesBarProps) {
  const [statuses, setStatuses] = useState<DriverRoadStatus[]>([]);
  const [activeStoryIndex, setActiveStoryIndex] = useState<number | null>(null);
  const [isPostingModalOpen, setIsPostingModalOpen] = useState(false);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  // New Status Form
  const [newStatusText, setNewStatusText] = useState('');
  const [newCorridor, setNewCorridor] = useState('I-80 EB');
  const [newMileMarker, setNewMileMarker] = useState('');
  const [newEmoji, setNewEmoji] = useState('🚛');
  const [newMediaUrl, setNewMediaUrl] = useState('');

  // Auto-scroll progress bar timer for active story
  const [storyProgress, setStoryProgress] = useState(0);

  useEffect(() => {
    const cached = localStorage.getItem('trucker_road_statuses');
    if (cached) {
      setStatuses(JSON.parse(cached));
    } else {
      setStatuses(sampleDriverRoadStatuses);
      localStorage.setItem('trucker_road_statuses', JSON.stringify(sampleDriverRoadStatuses));
    }
  }, []);

  const saveStatuses = (updated: DriverRoadStatus[]) => {
    setStatuses(updated);
    localStorage.setItem('trucker_road_statuses', JSON.stringify(updated));
  };

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3500);
  };

  // Timer progression for open story
  useEffect(() => {
    if (activeStoryIndex === null) {
      setStoryProgress(0);
      return;
    }

    setStoryProgress(0);
    const interval = setInterval(() => {
      setStoryProgress((prev) => {
        if (prev >= 100) {
          // Advance to next story or close
          if (activeStoryIndex < statuses.length - 1) {
            setActiveStoryIndex(activeStoryIndex + 1);
            return 0;
          } else {
            setActiveStoryIndex(null);
            return 0;
          }
        }
        return prev + 2;
      });
    }, 120);

    return () => clearInterval(interval);
  }, [activeStoryIndex, statuses.length]);

  const handlePostStatus = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newStatusText.trim()) return;

    const newStatus: DriverRoadStatus = {
      id: `status-${Date.now()}`,
      driver: currentUserProfile,
      statusText: newStatusText.trim(),
      corridor: newCorridor,
      mileMarker: newMileMarker.trim() || undefined,
      emoji: newEmoji,
      mediaUrl: newMediaUrl || undefined,
      timestamp: new Date().toISOString(),
      expiresInHours: 8,
      waveCount: 0,
      highBeamCount: 0,
      hornCount: 0,
      cheersCount: 0,
      userInteractions: {}
    };

    const updated = [newStatus, ...statuses];
    saveStatuses(updated);
    playCbSquelch();
    showToast('📡 Live Highway Status Broadcasted to Corridor Network!');
    setIsPostingModalOpen(false);
    setNewStatusText('');
    setNewMileMarker('');
    setNewMediaUrl('');
  };

  // Peer Reactions on Active Story
  const handleReact = (statusId: string, reaction: 'wave' | 'highBeam' | 'horn' | 'cheers') => {
    const updated = statuses.map(s => {
      if (s.id === statusId) {
        const interactions = s.userInteractions || {};
        const prev = interactions[currentUserProfile.id];
        
        let waveCount = s.waveCount;
        let highBeamCount = s.highBeamCount;
        let hornCount = s.hornCount;
        let cheersCount = s.cheersCount;

        if (prev === reaction) {
          // Toggle off
          delete interactions[currentUserProfile.id];
          if (reaction === 'wave') waveCount = Math.max(0, waveCount - 1);
          if (reaction === 'highBeam') highBeamCount = Math.max(0, highBeamCount - 1);
          if (reaction === 'horn') hornCount = Math.max(0, hornCount - 1);
          if (reaction === 'cheers') cheersCount = Math.max(0, cheersCount - 1);
        } else {
          // Remove old reaction if exists
          if (prev === 'wave') waveCount = Math.max(0, waveCount - 1);
          if (prev === 'highBeam') highBeamCount = Math.max(0, highBeamCount - 1);
          if (prev === 'horn') hornCount = Math.max(0, hornCount - 1);
          if (prev === 'cheers') cheersCount = Math.max(0, cheersCount - 1);

          // Add new reaction
          interactions[currentUserProfile.id] = reaction;
          if (reaction === 'wave') {
            waveCount += 1;
            playCbSquelch();
            showToast(`✋ Sent 10-4 Driver Wave to @${s.driver.username}!`);
          } else if (reaction === 'highBeam') {
            highBeamCount += 1;
            playHighBeamFlash();
            showToast(`💡 Flashed High Beams at @${s.driver.username}!`);
          } else if (reaction === 'horn') {
            hornCount += 1;
            playAirHorn();
            showToast(`📢 Sounded Dual Air Horn for @${s.driver.username}!`);
          } else if (reaction === 'cheers') {
            cheersCount += 1;
            showToast(`☕ Raised a Truck Stop Coffee with @${s.driver.username}!`);
          }
        }

        return {
          ...s,
          waveCount,
          highBeamCount,
          hornCount,
          cheersCount,
          userInteractions: interactions
        };
      }
      return s;
    });

    saveStatuses(updated);
  };

  const handleAudioReadout = (status: DriverRoadStatus) => {
    broadcastCbMessage(`Road bulletin from driver ${status.driver.displayName} on ${status.corridor}. ${status.statusText}`);
  };

  const activeStory = activeStoryIndex !== null ? statuses[activeStoryIndex] : null;

  return (
    <div className="bg-white rounded-2xl border border-zinc-100 shadow-sm p-4 mb-6" id="driver-stories-bar">
      {toastMsg && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white text-xs font-bold px-4 py-2.5 rounded-xl shadow-2xl border border-amber-500/30 flex items-center space-x-2 animate-bounce">
          <Sparkles className="w-4 h-4 text-amber-400 shrink-0" />
          <span>{toastMsg}</span>
        </div>
      )}

      {/* Header Label */}
      <div className="flex items-center justify-between mb-3 px-1">
        <div className="flex items-center space-x-2">
          <span className="relative flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-amber-500"></span>
          </span>
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900">
            Live Highway Status Beacons
          </h3>
          <span className="text-[10px] text-zinc-400 font-medium">({statuses.length} active)</span>
        </div>
        <button
          onClick={() => setIsPostingModalOpen(true)}
          className="text-xs font-bold text-amber-600 hover:text-amber-700 flex items-center gap-1"
        >
          <Plus className="w-3.5 h-3.5" /> Broadcast Status
        </button>
      </div>

      {/* Horizontal Reel */}
      <div className="flex items-center space-x-3 overflow-x-auto pb-2 scrollbar-none pt-1">
        {/* User Broadcast Trigger Button */}
        <button
          onClick={() => setIsPostingModalOpen(true)}
          className="flex flex-col items-center shrink-0 group focus:outline-none"
          title="Broadcast your road status"
        >
          <div className="w-14 h-14 rounded-full border-2 border-dashed border-amber-400 bg-amber-50 flex items-center justify-center group-hover:scale-105 group-hover:bg-amber-100 transition-all relative">
            <Radio className="w-6 h-6 text-amber-600" />
            <span className="absolute bottom-0 right-0 bg-slate-900 text-white rounded-full p-0.5 shadow">
              <Plus className="w-3 h-3 text-amber-400" />
            </span>
          </div>
          <span className="text-[11px] font-bold text-slate-800 mt-1.5 truncate max-w-[68px]">
            My Beacon
          </span>
          <span className="text-[9px] text-amber-600 font-bold uppercase">Broadcast</span>
        </button>

        {/* Active Driver Stories */}
        {statuses.map((status, index) => {
          const isMe = status.driver.id === currentUserProfile.id;
          return (
            <button
              key={status.id}
              onClick={() => setActiveStoryIndex(index)}
              className="flex flex-col items-center shrink-0 group focus:outline-none"
              title={`View ${status.driver.displayName}'s road status`}
            >
              <div className="w-14 h-14 rounded-full p-0.5 bg-gradient-to-tr from-amber-500 via-orange-400 to-amber-300 group-hover:scale-105 transition-all relative shadow-sm">
                <img
                  src={status.driver.avatarUrl}
                  alt={status.driver.displayName}
                  className="w-full h-full rounded-full object-cover border-2 border-white"
                  referrerPolicy="no-referrer"
                />
                <span className="absolute -bottom-1 -right-1 text-sm bg-white rounded-full shadow-sm px-1 py-0.5 leading-none">
                  {status.emoji}
                </span>
              </div>
              <span className="text-[11px] font-bold text-slate-800 mt-1.5 truncate max-w-[68px]">
                {isMe ? 'You' : status.driver.displayName.split(' ')[0]}
              </span>
              <span className="text-[9px] text-zinc-500 font-medium truncate max-w-[68px]">
                {status.corridor}
              </span>
            </button>
          );
        })}
      </div>

      {/* STORY VIEWER MODAL */}
      {activeStory && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-zinc-800 rounded-3xl w-full max-w-md overflow-hidden text-white shadow-2xl relative flex flex-col max-h-[90vh]">
            
            {/* Top Progress Bar */}
            <div className="w-full bg-zinc-800 h-1 flex">
              <div 
                className="bg-amber-400 h-full transition-all duration-100 ease-linear"
                style={{ width: `${storyProgress}%` }}
              />
            </div>

            {/* Story Header */}
            <div className="p-4 flex items-center justify-between border-b border-zinc-800 bg-slate-950/60">
              <div className="flex items-center space-x-3">
                <div 
                  className="cursor-pointer flex items-center space-x-2.5"
                  onClick={() => {
                    setActiveStoryIndex(null);
                    if (onViewProfile) onViewProfile(activeStory.driver);
                  }}
                >
                  <img
                    src={activeStory.driver.avatarUrl}
                    alt={activeStory.driver.displayName}
                    className="w-10 h-10 rounded-full object-cover border-2 border-amber-400"
                    referrerPolicy="no-referrer"
                  />
                  <div>
                    <div className="flex items-center space-x-1.5">
                      <span className="font-bold text-sm text-white hover:text-amber-400 transition-colors">
                        {activeStory.driver.displayName}
                      </span>
                      <span className="text-base">{activeStory.emoji}</span>
                    </div>
                    <div className="flex items-center space-x-2 text-[10px] text-zinc-400">
                      <span className="font-bold text-amber-400">{activeStory.corridor}</span>
                      {activeStory.mileMarker && (
                        <span>• {activeStory.mileMarker}</span>
                      )}
                      <span>• {new Date(activeStory.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <button
                  onClick={() => handleAudioReadout(activeStory)}
                  className="p-2 rounded-full bg-zinc-800 hover:bg-zinc-700 text-amber-400 transition-colors"
                  title="Play CB Voice Readout"
                >
                  <Volume2 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setActiveStoryIndex(null)}
                  className="p-2 rounded-full bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-white transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Story Body */}
            <div className="p-6 flex-1 flex flex-col justify-center space-y-4">
              {activeStory.mediaUrl && (
                <div className="rounded-2xl overflow-hidden bg-black max-h-64 flex items-center justify-center">
                  <img
                    src={activeStory.mediaUrl}
                    alt=""
                    className="w-full h-full object-contain"
                    referrerPolicy="no-referrer"
                  />
                </div>
              )}

              <div className="bg-slate-800/80 border border-zinc-700/60 p-5 rounded-2xl">
                <p className="text-base font-medium leading-relaxed text-zinc-100">
                  "{activeStory.statusText}"
                </p>
                <div className="flex items-center justify-between mt-3 pt-3 border-t border-zinc-700/40 text-xs text-zinc-400">
                  <span className="flex items-center gap-1 font-bold text-amber-400">
                    <Radio className="w-3.5 h-3.5" /> CDL Corridor Transmission
                  </span>
                  <span>Rig: {activeStory.driver.currentRig || 'Commercial Semi'}</span>
                </div>
              </div>
            </div>

            {/* Driver Reactions Panel */}
            <div className="p-4 bg-slate-950/80 border-t border-zinc-800 space-y-3">
              <div className="text-[10px] uppercase font-bold text-zinc-400 tracking-wider">
                Send Highway Social Signals
              </div>
              
              <div className="grid grid-cols-4 gap-2">
                <button
                  onClick={() => handleReact(activeStory.id, 'wave')}
                  className={`p-2.5 rounded-xl border flex flex-col items-center justify-center gap-1 text-xs font-bold transition-all ${
                    activeStory.userInteractions?.[currentUserProfile.id] === 'wave'
                      ? 'bg-amber-500/20 border-amber-500 text-amber-300'
                      : 'bg-zinc-800/80 border-zinc-700 text-zinc-300 hover:bg-zinc-700'
                  }`}
                >
                  <span className="text-lg">✋</span>
                  <span className="text-[10px]">Wave ({activeStory.waveCount})</span>
                </button>

                <button
                  onClick={() => handleReact(activeStory.id, 'highBeam')}
                  className={`p-2.5 rounded-xl border flex flex-col items-center justify-center gap-1 text-xs font-bold transition-all ${
                    activeStory.userInteractions?.[currentUserProfile.id] === 'highBeam'
                      ? 'bg-amber-500/20 border-amber-500 text-amber-300'
                      : 'bg-zinc-800/80 border-zinc-700 text-zinc-300 hover:bg-zinc-700'
                  }`}
                >
                  <span className="text-lg">💡</span>
                  <span className="text-[10px]">Beams ({activeStory.highBeamCount})</span>
                </button>

                <button
                  onClick={() => handleReact(activeStory.id, 'horn')}
                  className={`p-2.5 rounded-xl border flex flex-col items-center justify-center gap-1 text-xs font-bold transition-all ${
                    activeStory.userInteractions?.[currentUserProfile.id] === 'horn'
                      ? 'bg-amber-500/20 border-amber-500 text-amber-300'
                      : 'bg-zinc-800/80 border-zinc-700 text-zinc-300 hover:bg-zinc-700'
                  }`}
                >
                  <span className="text-lg">📢</span>
                  <span className="text-[10px]">Airhorn ({activeStory.hornCount})</span>
                </button>

                <button
                  onClick={() => handleReact(activeStory.id, 'cheers')}
                  className={`p-2.5 rounded-xl border flex flex-col items-center justify-center gap-1 text-xs font-bold transition-all ${
                    activeStory.userInteractions?.[currentUserProfile.id] === 'cheers'
                      ? 'bg-amber-500/20 border-amber-500 text-amber-300'
                      : 'bg-zinc-800/80 border-zinc-700 text-zinc-300 hover:bg-zinc-700'
                  }`}
                >
                  <span className="text-lg">☕</span>
                  <span className="text-[10px]">Coffee ({activeStory.cheersCount})</span>
                </button>
              </div>

              {/* Message Driver Button */}
              {activeStory.driver.id !== currentUserProfile.id && onOpenDirectMessage && (
                <button
                  onClick={() => {
                    const driver = activeStory.driver;
                    setActiveStoryIndex(null);
                    onOpenDirectMessage(driver);
                  }}
                  className="w-full py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl text-xs flex items-center justify-center space-x-1.5 transition-colors shadow"
                >
                  <MessageSquare className="w-4 h-4" />
                  <span>Direct CB Message @{activeStory.driver.username}</span>
                </button>
              )}
            </div>

            {/* Prev/Next arrows */}
            <div className="flex items-center justify-between p-2 bg-black/40 text-xs text-zinc-400">
              <button
                disabled={activeStoryIndex === 0}
                onClick={() => setActiveStoryIndex(Math.max(0, activeStoryIndex - 1))}
                className="px-3 py-1.5 rounded-lg hover:bg-zinc-800 disabled:opacity-30 flex items-center gap-1"
              >
                <ChevronLeft className="w-4 h-4" /> Previous
              </button>
              <span>{activeStoryIndex + 1} of {statuses.length}</span>
              <button
                disabled={activeStoryIndex === statuses.length - 1}
                onClick={() => setActiveStoryIndex(Math.min(statuses.length - 1, activeStoryIndex + 1))}
                className="px-3 py-1.5 rounded-lg hover:bg-zinc-800 disabled:opacity-30 flex items-center gap-1"
              >
                Next <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* POST NEW ROAD STATUS MODAL */}
      {isPostingModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-md overflow-hidden text-slate-900 shadow-2xl border border-zinc-100 animate-in fade-in zoom-in-95">
            <div className="p-4 border-b border-zinc-100 flex items-center justify-between bg-zinc-50">
              <div className="flex items-center space-x-2">
                <Radio className="w-5 h-5 text-amber-600" />
                <h3 className="font-bold text-sm text-slate-900">Broadcast Highway Road Status</h3>
              </div>
              <button
                onClick={() => setIsPostingModalOpen(false)}
                className="text-zinc-400 hover:text-slate-900 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handlePostStatus} className="p-5 space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-zinc-500 mb-1.5">
                  Current Highway Corridor
                </label>
                <select
                  value={newCorridor}
                  onChange={(e) => setNewCorridor(e.target.value)}
                  className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-800 focus:outline-none focus:border-amber-500"
                >
                  <option value="I-80 EB">I-80 Eastbound (Trans-America)</option>
                  <option value="I-80 WB">I-80 Westbound (Trans-America)</option>
                  <option value="I-10 EB">I-10 Eastbound (Southern Route)</option>
                  <option value="I-10 WB">I-10 Westbound (Southern Route)</option>
                  <option value="I-40 EB">I-40 Eastbound (Cross Country)</option>
                  <option value="I-40 WB">I-40 Westbound (Cross Country)</option>
                  <option value="I-70 EB">I-70 Eastbound (Heartland / Rockies)</option>
                  <option value="I-70 WB">I-70 Westbound (Heartland / Rockies)</option>
                  <option value="I-95 NB">I-95 Northbound (East Coast)</option>
                  <option value="I-95 SB">I-95 Southbound (East Coast)</option>
                  <option value="I-5 NB">I-5 Northbound (West Coast)</option>
                  <option value="I-5 SB">I-5 Southbound (West Coast)</option>
                  <option value="I-35 NB">I-35 Northbound (Central Spine)</option>
                  <option value="I-35 SB">I-35 Southbound (Central Spine)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-zinc-500 mb-1.5">
                  Mile Marker or Landmark (Optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g. MM 140 (Evanston, WY) or Exit 284"
                  value={newMileMarker}
                  onChange={(e) => setNewMileMarker(e.target.value)}
                  className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-3 py-2 text-xs text-slate-800 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-zinc-500 mb-1.5">
                  Status Emoji Beacon
                </label>
                <div className="flex space-x-2">
                  {['🚛', '🟢', '❄️', '☕', '🏔️', '⚖️', '🛑', '📦'].map(emoji => (
                    <button
                      key={emoji}
                      type="button"
                      onClick={() => setNewEmoji(emoji)}
                      className={`text-xl p-2 rounded-xl border transition-all ${
                        newEmoji === emoji ? 'bg-amber-100 border-amber-500 scale-110' : 'bg-zinc-50 border-zinc-200 hover:bg-zinc-100'
                      }`}
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-zinc-500 mb-1.5">
                  What's happening on your lane?
                </label>
                <textarea
                  rows={3}
                  placeholder="e.g. Rolling with 44k steel, scale open, clear pavement, parked at rest area..."
                  value={newStatusText}
                  onChange={(e) => setNewStatusText(e.target.value)}
                  className="w-full bg-zinc-50 border border-zinc-200 rounded-xl p-3 text-xs text-slate-800 focus:outline-none focus:border-amber-500"
                  required
                />
              </div>

              <div className="pt-2 flex items-center justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setIsPostingModalOpen(false)}
                  className="px-4 py-2 text-xs font-bold text-zinc-500 hover:text-slate-900"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold rounded-xl text-xs flex items-center gap-1.5 shadow-md transition-colors"
                >
                  <Send className="w-3.5 h-3.5" /> Broadcast to Corridor
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
