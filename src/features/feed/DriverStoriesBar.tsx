import React, { useState, useEffect } from 'react';
import { Profile, DriverRoadStatus } from '../../types';
import { playAirHorn, playHighBeamFlash, playCbSquelch, broadcastCbMessage } from '../../utils/cbAudio';
import { StoryViewerModal } from './components/StoryViewerModal';
import { StoryComposerModal } from './components/StoryComposerModal';
import { useRoadStatuses } from './hooks/useRoadStatuses';
import { useFirebase } from '../../contexts/FirebaseContext';
import { createLiveRoadStatus } from '../../lib/firebase';
import { 
  Plus, 
  Radio, 
  Sparkles,
} from 'lucide-react';

interface DriverStoriesBarProps {
  onOpenDirectMessage?: (profile: Profile) => void;
  onViewProfile?: (profile: Profile) => void;
}

export default function DriverStoriesBar({ onOpenDirectMessage, onViewProfile }: DriverStoriesBarProps) {
  const { profile: currentUserProfile } = useFirebase();
  const [activeStoryIndex, setActiveStoryIndex] = useState<number | null>(null);
  const [isPostingModalOpen, setIsPostingModalOpen] = useState(false);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3500);
  };

  const { statuses } = useRoadStatuses(showToast);

  if (!currentUserProfile) return null;

  // Auto-scroll progress bar timer for active story
  const [storyProgress, setStoryProgress] = useState(0);

  useEffect(() => {
    if (activeStoryIndex === null) {
      setStoryProgress(0);
      return;
    }

    setStoryProgress(0);
    const interval = setInterval(() => {
      setStoryProgress((prev) => {
        if (prev >= 100) {
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

  // New Status Form State
  const [newStatusText, setNewStatusText] = useState('');
  const [newCorridor, setNewCorridor] = useState('I-80 EB');
  const [newMileMarker, setNewMileMarker] = useState('');
  const [newEmoji, setNewEmoji] = useState('🚛');
  const [newMediaUrl, setNewMediaUrl] = useState('');

  const handleCloseStory = () => setActiveStoryIndex(null);
  const handleNextStory = () => {
    if (activeStoryIndex !== null && activeStoryIndex < statuses.length - 1) {
      setActiveStoryIndex(activeStoryIndex + 1);
    } else {
      setActiveStoryIndex(null);
    }
  };
  const handlePrevStory = () => {
    if (activeStoryIndex !== null && activeStoryIndex > 0) {
      setActiveStoryIndex(activeStoryIndex - 1);
    }
  };

  const handlePostStatus = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newStatusText.trim() || !currentUserProfile) return;

    try {
      await createLiveRoadStatus({
        driver: currentUserProfile,
        statusText: newStatusText.trim(),
        corridor: newCorridor,
        mileMarker: newMileMarker.trim() || undefined,
        emoji: newEmoji,
        mediaUrl: newMediaUrl || undefined,
        expiresInHours: 8
      });
      playCbSquelch();
      showToast('📡 Live Highway Status Broadcasted to Corridor Network!');
      setIsPostingModalOpen(false);
      setNewStatusText('');
      setNewMileMarker('');
      setNewMediaUrl('');
    } catch (err) {
      console.error('Failed to create road status:', err);
      showToast('Failed to broadcast status.');
    }
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
                  src={status.driver.avatarUrl || null}
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
      <StoryViewerModal 
        activeStoryIndex={activeStoryIndex}
        statuses={statuses}
        storyProgress={storyProgress}
        onClose={handleCloseStory}
        onPrev={handlePrevStory}
        onNext={handleNextStory}
        onViewProfile={onViewProfile}
        onOpenDirectMessage={onOpenDirectMessage}
        onPlayHorn={() => {
          playAirHorn();
          showToast('10-4! Air horn blasted to ' + statuses[activeStoryIndex!].driver.username);
        }}
        onFlashLights={() => {
          playHighBeamFlash();
          showToast('Flashed high beams at ' + statuses[activeStoryIndex!].driver.username);
        }}
      />

      {/* POST NEW ROAD STATUS MODAL */}
      {isPostingModalOpen && (
        <StoryComposerModal 
          onClose={() => setIsPostingModalOpen(false)}
          newStatusText={newStatusText}
          setNewStatusText={setNewStatusText}
          newCorridor={newCorridor}
          setNewCorridor={setNewCorridor}
          newMileMarker={newMileMarker}
          setNewMileMarker={setNewMileMarker}
          newEmoji={newEmoji}
          setNewEmoji={setNewEmoji}
          newMediaUrl={newMediaUrl}
          setNewMediaUrl={setNewMediaUrl}
          handleSubmit={handlePostStatus}
        />
      )}
    </div>
  );
}
