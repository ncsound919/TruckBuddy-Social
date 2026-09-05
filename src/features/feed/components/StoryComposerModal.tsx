import React from 'react';
import { X, MapPin, Compass, Camera, Check } from 'lucide-react';
import { useFirebase } from '../../../contexts/FirebaseContext';

export function StoryComposerModal({
  onClose,
  newStatusText,
  setNewStatusText,
  newCorridor,
  setNewCorridor,
  newMileMarker,
  setNewMileMarker,
  newEmoji,
  setNewEmoji,
  newMediaUrl,
  setNewMediaUrl,
  handleSubmit
}: any) {
  const { profile: currentUserProfile } = useFirebase();
  const commonEmojis = ['🚛', '☕', '🍔', '⛽', '🛑', '🌧️', '❄️', '🚦', '🔧', '🤠', '🤘', '🚧'];

  if (!currentUserProfile) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl w-full max-w-md overflow-hidden text-slate-900 shadow-2xl border border-zinc-100 animate-in fade-in zoom-in-95">
        <div className="p-4 border-b border-zinc-100 flex items-center justify-between bg-zinc-50">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-full bg-amber-500 flex items-center justify-center text-slate-950 shadow-md">
              <Compass className="w-4 h-4" />
            </div>
            <h3 className="font-black text-sm tracking-tight">New Status Report</h3>
          </div>
          <button onClick={onClose} className="p-2 text-zinc-400 hover:text-slate-900 hover:bg-zinc-200 rounded-full transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div className="flex items-center space-x-3 mb-2">
            <img src={currentUserProfile.avatarUrl} className="w-10 h-10 rounded-full border border-zinc-200" alt="" />
            <div>
              <div className="font-bold text-xs">{currentUserProfile.displayName}</div>
              <div className="text-[10px] text-zinc-500">Broadcasting to highway...</div>
            </div>
          </div>

          <div>
            <textarea
              required
              value={newStatusText}
              onChange={(e) => setNewStatusText(e.target.value)}
              placeholder="What's your 10-20? Any bears in the air?"
              className="w-full bg-zinc-50 border border-zinc-200 rounded-2xl p-4 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 resize-none h-24 placeholder-zinc-400 font-medium"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-zinc-500 mb-1">Highway / Route</label>
              <div className="relative">
                <MapPin className="absolute left-3 top-2.5 w-4 h-4 text-zinc-400" />
                <input 
                  type="text" 
                  value={newCorridor} 
                  onChange={(e) => setNewCorridor(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 bg-white border border-zinc-200 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-amber-500" 
                  placeholder="e.g. I-80"
                />
              </div>
            </div>
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-zinc-500 mb-1">Mile Marker (Opt)</label>
              <input 
                type="text" 
                value={newMileMarker} 
                onChange={(e) => setNewMileMarker(e.target.value)}
                className="w-full px-3 py-2 bg-white border border-zinc-200 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-amber-500" 
                placeholder="e.g. 245"
              />
            </div>
          </div>

          <div>
            <label className="block text-[10px] font-bold uppercase tracking-wider text-zinc-500 mb-2">Select Vibe</label>
            <div className="flex flex-wrap gap-2">
              {commonEmojis.map(emoji => (
                <button
                  key={emoji}
                  type="button"
                  onClick={() => setNewEmoji(emoji)}
                  className={`w-9 h-9 flex items-center justify-center rounded-xl text-lg transition-all ${
                    newEmoji === emoji ? 'bg-amber-100 border-2 border-amber-500 scale-110' : 'bg-zinc-50 border border-zinc-200 hover:bg-zinc-100'
                  }`}
                >
                  {emoji}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-[10px] font-bold uppercase tracking-wider text-zinc-500 mb-1">Photo URL (Optional)</label>
            <div className="relative">
              <Camera className="absolute left-3 top-2.5 w-4 h-4 text-zinc-400" />
              <input 
                type="url" 
                value={newMediaUrl} 
                onChange={(e) => setNewMediaUrl(e.target.value)}
                className="w-full pl-9 pr-3 py-2 bg-white border border-zinc-200 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-amber-500" 
                placeholder="https://..."
              />
            </div>
          </div>

          <div className="pt-2 flex items-center justify-end space-x-3">
            <button 
              type="button" 
              onClick={onClose}
              className="px-4 py-2.5 text-xs font-bold text-zinc-500 hover:text-slate-900 transition-colors"
            >
              Cancel
            </button>
            <button 
              type="submit" 
              disabled={!newStatusText.trim() || !newCorridor.trim()}
              className="bg-amber-500 hover:bg-amber-600 disabled:bg-amber-200 text-slate-950 px-6 py-2.5 rounded-xl font-black tracking-wider uppercase text-[11px] flex items-center space-x-2 transition-all shadow-md"
            >
              <Check className="w-4 h-4" />
              <span>Broadcast 10-4</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
