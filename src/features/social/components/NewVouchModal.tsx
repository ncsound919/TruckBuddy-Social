import React, { useState } from 'react';
import { Profile, EndorsementSkill } from '../../../types';
import { Award, X } from 'lucide-react';

interface VouchModalProps {
  isOpen: boolean;
  targetDriver: Profile | null;
  onClose: () => void;
  onSubmit: (data: any) => void;
}

export function NewVouchModal({ isOpen, targetDriver, onClose, onSubmit }: VouchModalProps) {
  const [formData, setFormData] = useState({
    skill: 'mountain_driving' as EndorsementSkill,
    title: '',
    comment: ''
  });

  if (!isOpen || !targetDriver) return null;

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
        <div className="flex items-center justify-between px-6 py-4 bg-slate-900 text-white">
          <div className="flex items-center space-x-2">
            <Award className="w-5 h-5 text-amber-400" />
            <h3 className="text-sm font-black uppercase tracking-wider">
              Vouch for @{targetDriver.username}
            </h3>
          </div>
          <button 
            onClick={onClose}
            className="text-zinc-400 hover:text-white p-1 rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
          <div className="bg-amber-50 border border-amber-100 p-3 rounded-xl flex items-center space-x-3">
            <img src={targetDriver.avatarUrl} className="w-10 h-10 rounded-full object-cover" alt="" />
            <div>
              <h4 className="font-black text-slate-900">{targetDriver.displayName}</h4>
              <p className="text-[11px] text-amber-900 font-semibold">
                Class {targetDriver.cdlClass} • {targetDriver.currentRig}
              </p>
            </div>
          </div>

          <div className="space-y-1">
            <label className="font-bold text-slate-800">Select Professional Skill Vouched</label>
            <select
              value={formData.skill}
              onChange={(e) => updateField('skill', e.target.value as any)}
              className="w-full p-2.5 bg-zinc-50 border border-zinc-200 rounded-xl font-bold text-slate-900"
            >
              <option value="mountain_driving">🏔️ Mountain & Chain-Up Mastery</option>
              <option value="dock_backing">🎯 Precision 90° & Blind-Side Backing</option>
              <option value="winter_ice">❄️ Winter Ice & Blizzard Composure</option>
              <option value="roadside_rescue">🛠️ Roadside Mechanical Assistance</option>
              <option value="hazmat_safety">🦺 FMCSA Hazmat & Placard Compliance</option>
              <option value="heavy_haul">🏋️ Heavy Haul & Oversized Route Navigation</option>
              <option value="fuel_efficiency">⚡ Aerodynamic Drafting & Fuel Economy</option>
            </select>
          </div>

          <div className="space-y-1">
            <label className="font-bold text-slate-800">Commendation Title</label>
            <input
              type="text"
              required
              placeholder="e.g. Masterful chain-up on Cabbage Hill pass"
              value={formData.title}
              onChange={(e) => updateField('title', e.target.value)}
              className="w-full p-2.5 bg-zinc-50 border border-zinc-200 rounded-xl font-medium focus:ring-2 focus:ring-amber-500 focus:outline-none"
            />
          </div>

          <div className="space-y-1">
            <label className="font-bold text-slate-800">Your Personal Witness Story / Commendation</label>
            <textarea
              rows={3}
              required
              placeholder="Describe where and when you witnessed this driver's safety or skill (e.g. helped slide tandems in -10° wind, or kept cool on black ice)..."
              value={formData.comment}
              onChange={(e) => updateField('comment', e.target.value)}
              className="w-full p-2.5 bg-zinc-50 border border-zinc-200 rounded-xl font-medium focus:ring-2 focus:ring-amber-500 focus:outline-none"
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
              className="px-5 py-2 bg-slate-900 hover:bg-slate-800 text-white font-black rounded-xl shadow-md transition"
            >
              Submit Endorsement
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
