import React from 'react';
import { CorridorDriverRadar, Profile } from '../../../types';
import { 
  Truck, 
  MapPin, 
  Zap, 
  Send, 
  Clock,
  Navigation,
  Compass,
  CheckCircle2,
  ShieldCheck,
  UserPlus
} from 'lucide-react';

interface DriverRadarCardProps {
  key?: React.Key;
  radar: CorridorDriverRadar;
  isPinged: boolean;
  onPing: (driver: Profile) => void;
  onVouch: (driver: Profile) => void;
  onViewProfile: (p: Profile) => void;
}

export function DriverRadarCard({ 
  radar, 
  isPinged, 
  onPing, 
  onVouch, 
  onViewProfile 
}: DriverRadarCardProps) {
  const getStatusColor = (status: CorridorDriverRadar['status']) => {
    switch (status) {
      case 'rolling': return 'text-emerald-500';
      case 'dock_waiting': return 'text-amber-500';
      case 'truck_stop': return 'text-sky-500';
      case 'mechanic_needed': return 'text-rose-500';
      default: return 'text-zinc-500';
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-zinc-100 p-5 shadow-sm hover:shadow-md transition-all flex flex-col justify-between group">
      <div className="space-y-4">
        {/* Header: Profile and Distance */}
        <div className="flex items-start justify-between">
          <div 
            className="flex items-center space-x-3 cursor-pointer group/avatar"
            onClick={() => onViewProfile(radar.driver)}
          >
            <div className="relative">
              <img src={radar.driver.avatarUrl} className="w-12 h-12 rounded-2xl object-cover border border-zinc-100 group-hover/avatar:ring-2 ring-amber-400 transition-all" alt="" />
              <div className={`absolute -right-1 -bottom-1 w-3.5 h-3.5 rounded-full bg-white flex items-center justify-center border border-zinc-100`}>
                <div className={`w-2 h-2 rounded-full ${getStatusColor(radar.status).replace('text-', 'bg-')} animate-pulse`}></div>
              </div>
            </div>
            <div>
              <h4 className="font-black text-slate-900 group-hover/avatar:text-amber-600 transition-colors">
                {radar.driver.displayName}
              </h4>
              <p className="text-[10px] text-zinc-400 font-bold uppercase tracking-tight">
                @{radar.driver.username} • {radar.rigType}
              </p>
            </div>
          </div>
          
          <div className="text-right">
            <span className="block text-[14px] font-black text-slate-900 leading-none">{radar.distanceMilesAway}</span>
            <span className="text-[9px] text-zinc-400 font-black uppercase tracking-tighter">Miles Away</span>
          </div>
        </div>

        {/* Location Info */}
        <div className="grid grid-cols-2 gap-3 py-3 border-y border-zinc-50">
          <div className="flex items-center space-x-2">
            <div className="w-7 h-7 rounded-lg bg-zinc-100 flex items-center justify-center text-zinc-500">
              <Compass className="w-4 h-4" />
            </div>
            <div className="flex flex-col">
              <span className="text-[9px] text-zinc-400 font-bold uppercase">Heading</span>
              <span className="text-[11px] font-black text-slate-800">{radar.direction} on {radar.corridor}</span>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-7 h-7 rounded-lg bg-zinc-100 flex items-center justify-center text-zinc-500">
              <Clock className="w-4 h-4" />
            </div>
            <div className="flex flex-col">
              <span className="text-[9px] text-zinc-400 font-bold uppercase">Last Active</span>
              <span className="text-[11px] font-black text-slate-800">{radar.lastPing}</span>
            </div>
          </div>
        </div>

        {/* Tags */}
        <div className="flex flex-wrap gap-1.5">
          <span className="px-2 py-0.5 bg-zinc-100 text-zinc-600 text-[9px] font-black uppercase rounded-lg">
            {radar.status.replace('_', ' ')}
          </span>
          <span className="px-2 py-0.5 bg-amber-50 text-amber-700 text-[9px] font-black uppercase rounded-lg border border-amber-100">
            {radar.driver.cdlClass} Class
          </span>
          {radar.driver.isVerified && (
            <span className="px-2 py-0.5 bg-sky-50 text-sky-700 text-[9px] font-black uppercase rounded-lg border border-sky-100 flex items-center space-x-1">
              <ShieldCheck className="w-2.5 h-2.5" />
              <span>Verified</span>
            </span>
          )}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="grid grid-cols-2 gap-2 mt-5">
        <button
          onClick={() => onPing(radar.driver)}
          disabled={isPinged}
          className={`flex items-center justify-center space-x-2 py-2 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all border ${
            isPinged 
              ? 'bg-emerald-50 border-emerald-100 text-emerald-600' 
              : 'bg-white border-zinc-200 text-zinc-600 hover:bg-zinc-50 hover:border-zinc-300'
          }`}
        >
          {isPinged ? <CheckCircle2 className="w-3.5 h-3.5" /> : <Zap className="w-3.5 h-3.5" />}
          <span>{isPinged ? 'Ping Sent' : 'Ping Driver'}</span>
        </button>
        <button
          onClick={() => onVouch(radar.driver)}
          className="flex items-center justify-center space-x-2 py-2 bg-slate-900 border border-slate-900 text-white rounded-xl text-[10px] font-black uppercase tracking-wider hover:bg-slate-800 transition-all shadow-sm"
        >
          <UserPlus className="w-3.5 h-3.5 text-amber-400" />
          <span>Vouch</span>
        </button>
      </div>
    </div>
  );
}
