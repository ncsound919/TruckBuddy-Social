import React, { useState } from 'react';
import { Radio, MapPin, X } from 'lucide-react';

interface BeaconModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: any) => void;
}

export function BeaconModal({ isOpen, onClose, onSubmit }: BeaconModalProps) {
  const [formData, setFormData] = useState({
    title: '',
    corridor: 'I-80',
    origin: 'Salt Lake City, UT',
    destination: 'Cheyenne, WY',
    mileMarker: 'MM 142 (Evanston)',
    speed: 65,
    channel: 19,
    maxMembers: 5,
    hazmat: false,
    notes: ''
  });

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const updateField = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="w-full max-w-lg bg-white rounded-2xl shadow-2xl overflow-hidden border border-zinc-100 animate-in fade-in zoom-in-95">
        <div className="flex items-center justify-between px-6 py-4 bg-amber-500 text-slate-950">
          <div className="flex items-center space-x-2">
            <Radio className="w-5 h-5" />
            <h3 className="text-sm font-black uppercase tracking-wider">Launch New Convoy Beacon</h3>
          </div>
          <button 
            onClick={onClose}
            className="text-slate-700 hover:text-slate-950 p-1 rounded-lg hover:bg-amber-400/50"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
          <div className="space-y-1">
            <label className="font-bold text-slate-800">Convoy Display Name</label>
            <input
              type="text"
              required
              placeholder="e.g. I-80 Wyoming Blizzard Draft Pack"
              value={formData.title}
              onChange={(e) => updateField('title', e.target.value)}
              className="w-full p-2.5 bg-zinc-50 border border-zinc-200 rounded-xl font-medium focus:ring-2 focus:ring-amber-500 focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="font-bold text-slate-800">Highway Corridor</label>
              <select
                value={formData.corridor}
                onChange={(e) => updateField('corridor', e.target.value)}
                className="w-full p-2.5 bg-zinc-50 border border-zinc-200 rounded-xl font-bold"
              >
                <option value="I-80">I-80 Transcontinental</option>
                <option value="I-40">I-40 Cross-Country</option>
                <option value="I-10">I-10 Southern Route</option>
                <option value="I-70">I-70 Rockies to Midwest</option>
                <option value="I-95">I-95 East Coast Corridor</option>
                <option value="I-5">I-5 West Coast Spine</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="font-bold text-slate-800">CB Radio Channel</label>
              <input
                type="number"
                min="1"
                max="40"
                value={formData.channel}
                onChange={(e) => updateField('channel', Number(e.target.value))}
                className="w-full p-2.5 bg-zinc-50 border border-zinc-200 rounded-xl font-bold"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="font-bold text-slate-800">Origin City</label>
              <input
                type="text"
                required
                value={formData.origin}
                onChange={(e) => updateField('origin', e.target.value)}
                className="w-full p-2.5 bg-zinc-50 border border-zinc-200 rounded-xl font-medium"
              />
            </div>

            <div className="space-y-1">
              <label className="font-bold text-slate-800">Destination City</label>
              <input
                type="text"
                required
                value={formData.destination}
                onChange={(e) => updateField('destination', e.target.value)}
                className="w-full p-2.5 bg-zinc-50 border border-zinc-200 rounded-xl font-medium"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="font-bold text-slate-800">Current Mile Marker / 20</label>
              <input
                type="text"
                placeholder="e.g. MM 142 (Evanston)"
                value={formData.mileMarker}
                onChange={(e) => updateField('mileMarker', e.target.value)}
                className="w-full p-2.5 bg-zinc-50 border border-zinc-200 rounded-xl font-medium"
              />
            </div>

            <div className="space-y-1">
              <label className="font-bold text-slate-800">Target Speed (MPH)</label>
              <input
                type="number"
                min="45"
                max="75"
                value={formData.speed}
                onChange={(e) => updateField('speed', Number(e.target.value))}
                className="w-full p-2.5 bg-zinc-50 border border-zinc-200 rounded-xl font-bold"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="font-bold text-slate-800">Drafting & Convoy Instructions</label>
            <textarea
              rows={2}
              placeholder="e.g. High crosswinds near Elk Mountain. Keeping 200ft spacing, lead rig blocking wind. Drafting saves ~12% fuel."
              value={formData.notes}
              onChange={(e) => updateField('notes', e.target.value)}
              className="w-full p-2.5 bg-zinc-50 border border-zinc-200 rounded-xl font-medium"
            />
          </div>

          <div className="pt-2 flex items-center justify-end space-x-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-zinc-200 rounded-xl font-bold text-zinc-600 hover:bg-zinc-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black rounded-xl shadow-md transition"
            >
              Broadcast Convoy
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
