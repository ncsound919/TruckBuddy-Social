import React from 'react';
import { Radio, X, Compass, ChevronLeft, ChevronRight, MessageSquare, Volume2, ShieldCheck, MapPin, Clock, Share2, Sparkles } from 'lucide-react';
import { DriverRoadStatus } from '../../../types';

export function StoryViewerModal({
  activeStoryIndex,
  statuses,
  storyProgress,
  onClose,
  onPrev,
  onNext,
  onViewProfile,
  onOpenDirectMessage,
  onPlayHorn,
  onPlayHighBeam,
  onFlashLights
}: any) {
  if (activeStoryIndex === null) return null;
  const activeStatus = statuses[activeStoryIndex];
  
  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-zinc-800 rounded-3xl w-full max-w-md overflow-hidden text-white shadow-2xl relative flex flex-col max-h-[90vh]">
        {/* Progress Bar */}
        <div className="w-full bg-zinc-800 h-1 flex">
          {statuses.map((_, i) => (
            <div key={i} className="flex-1 h-full mx-0.5 rounded-full overflow-hidden bg-black/50">
              <div 
                className={`h-full bg-amber-500 transition-all duration-100 ease-linear ${i < activeStoryIndex ? 'w-full' : i === activeStoryIndex ? 'w-full' : 'w-0'}`}
                style={{ width: i === activeStoryIndex ? `${storyProgress}%` : i < activeStoryIndex ? '100%' : '0%' }}
              />
            </div>
          ))}
        </div>

        {/* Header */}
        <div className="p-4 flex items-center justify-between border-b border-zinc-800 bg-slate-950/60">
          <div className="flex items-center space-x-3">
            <img 
              src={activeStatus.driver.avatarUrl || null} 
              className="w-10 h-10 rounded-full border border-zinc-700 cursor-pointer object-cover"
              alt=""
              onClick={() => {
                if (onViewProfile) onViewProfile(activeStatus.driver);
                onClose();
              }}
            />
            <div className="leading-tight">
              <div className="flex items-center space-x-1.5">
                <span className="font-bold text-sm text-white cursor-pointer hover:underline" onClick={() => {
                  if (onViewProfile) onViewProfile(activeStatus.driver);
                  onClose();
                }}>
                  {activeStatus.driver.displayName}
                </span>
                {activeStatus.driver.isVerified && <ShieldCheck className="w-3.5 h-3.5 text-amber-500" />}
              </div>
              <div className="flex items-center space-x-2 text-[10px] text-zinc-400">
                <span>@{activeStatus.driver.username}</span>
                <span>•</span>
                <span className="flex items-center">
                  <Clock className="w-3 h-3 mr-0.5" />
                  {new Date(activeStatus.createdAt).toLocaleTimeString([], { hour: '2-digit', minute:'2-digit' })}
                </span>
              </div>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <button onClick={onClose} className="p-2 bg-slate-800/80 hover:bg-slate-700 rounded-full transition-colors text-zinc-300">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-6 flex-1 flex flex-col justify-center space-y-4">
          {activeStatus.mediaUrl && (
            <div className="rounded-2xl overflow-hidden bg-black max-h-64 flex items-center justify-center">
              <img src={activeStatus.mediaUrl || null} className="max-w-full max-h-full object-contain" alt="" />
            </div>
          )}
          
          <div className="bg-slate-800/80 border border-zinc-700/60 p-5 rounded-2xl">
            <p className="text-xl font-bold text-white leading-snug">
              <span className="mr-2 text-2xl">{activeStatus.emoji}</span>
              {activeStatus.statusText}
            </p>
            <div className="flex items-center justify-between mt-3 pt-3 border-t border-zinc-700/40 text-xs text-zinc-400">
              <span className="flex items-center">
                <Compass className="w-3.5 h-3.5 mr-1 text-sky-400" />
                {activeStatus.location.corridor} {activeStatus.location.mileMarker ? `• MM ${activeStatus.location.mileMarker}` : ''}
              </span>
            </div>
          </div>
        </div>

        {/* Quick Reactions */}
        <div className="p-4 bg-slate-950/80 border-t border-zinc-800 space-y-3">
          <div className="text-[10px] uppercase font-bold text-zinc-400 tracking-wider">
            Quick CB Actions
          </div>
          <div className="grid grid-cols-4 gap-2">
            <button onClick={onPlayHorn} className="bg-slate-800 hover:bg-amber-500 hover:text-slate-950 text-white rounded-xl py-2 flex flex-col items-center transition-colors group">
              <Volume2 className="w-5 h-5 mb-1 group-hover:scale-110 transition-transform" />
              <span className="text-[9px] font-bold uppercase">Air Horn</span>
            </button>
            <button onClick={onFlashLights} className="bg-slate-800 hover:bg-amber-500 hover:text-slate-950 text-white rounded-xl py-2 flex flex-col items-center transition-colors group">
              <Sparkles className="w-5 h-5 mb-1 group-hover:scale-110 transition-transform" />
              <span className="text-[9px] font-bold uppercase">Flash</span>
            </button>
            <button 
              onClick={() => {
                if (onOpenDirectMessage) onOpenDirectMessage(activeStatus.driver);
                onClose();
              }} 
              className="bg-slate-800 hover:bg-amber-500 hover:text-slate-950 text-white rounded-xl py-2 flex flex-col items-center transition-colors group"
            >
              <MessageSquare className="w-5 h-5 mb-1 group-hover:scale-110 transition-transform" />
              <span className="text-[9px] font-bold uppercase">10-21 (DM)</span>
            </button>
            <button className="bg-slate-800 hover:bg-amber-500 hover:text-slate-950 text-white rounded-xl py-2 flex flex-col items-center transition-colors group">
              <Share2 className="w-5 h-5 mb-1 group-hover:scale-110 transition-transform" />
              <span className="text-[9px] font-bold uppercase">Share</span>
            </button>
          </div>
        </div>

        {/* Navigation Arrows */}
        <button onClick={onPrev} className="absolute left-2 top-1/2 -translate-y-1/2 p-2 bg-black/50 text-white hover:bg-amber-500 hover:text-slate-950 rounded-full backdrop-blur-sm transition-all border border-zinc-700 hover:border-amber-500 disabled:opacity-0 disabled:pointer-events-none" disabled={activeStoryIndex === 0}>
          <ChevronLeft className="w-6 h-6" />
        </button>
        <button onClick={onNext} className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-black/50 text-white hover:bg-amber-500 hover:text-slate-950 rounded-full backdrop-blur-sm transition-all border border-zinc-700 hover:border-amber-500 disabled:opacity-0 disabled:pointer-events-none" disabled={activeStoryIndex === statuses.length - 1}>
          <ChevronRight className="w-6 h-6" />
        </button>

        {/* Controls Hint */}
        <div className="flex items-center justify-between p-2 bg-black/40 text-xs text-zinc-400">
          <span className="opacity-50">Tap right/left to navigate</span>
        </div>
      </div>
    </div>
  );
}
