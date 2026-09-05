import React from 'react';
import { ConvoyBeacon, Profile } from '../../../types';
import { 
  Truck, 
  Radio, 
  Users, 
  MapPin, 
  Flame, 
  ShieldCheck, 
  Clock,
  ArrowUpRight
} from 'lucide-react';

interface ConvoyBeaconCardProps {
  key?: React.Key;
  convoy: ConvoyBeacon;
  currentUser: Profile;
  isActive: boolean;
  onJoin: (id: string) => void;
  onSelect: (id: string) => void;
  onViewProfile: (p: Profile) => void;
}

export function ConvoyBeaconCard({ 
  convoy, 
  currentUser, 
  isActive, 
  onJoin, 
  onSelect,
  onViewProfile
}: ConvoyBeaconCardProps) {
  const isMember = convoy.members.some(m => m.id === currentUser.id);
  const isLeader = convoy.leader.id === currentUser.id;

  return (
    <div 
      className={`group relative bg-white rounded-2xl border transition-all overflow-hidden ${
        isActive 
          ? 'ring-2 ring-amber-500 border-amber-500 shadow-md' 
          : 'border-zinc-100 hover:border-zinc-200 shadow-sm'
      }`}
    >
      {/* Header with status and savings */}
      <div className="px-5 py-3 border-b border-zinc-50 flex items-center justify-between bg-zinc-50/50">
        <div className="flex items-center space-x-2">
          <span className={`w-2 h-2 rounded-full ${convoy.status === 'rolling' ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'}`}></span>
          <span className="text-[10px] font-black uppercase tracking-widest text-zinc-500">
            {convoy.status === 'rolling' ? 'Live & Rolling' : 'Forming Pack'}
          </span>
        </div>
        <div className="flex items-center space-x-1.5 px-2 py-0.5 bg-emerald-100 text-emerald-700 rounded-full">
          <Flame className="w-3 h-3" />
          <span className="text-[10px] font-extrabold uppercase">~{convoy.fuelSavingsPercent}% Fuel Saved</span>
        </div>
      </div>

      <div className="p-5 space-y-4">
        {/* Title and Route */}
        <div className="cursor-pointer" onClick={() => onSelect(convoy.id)}>
          <div className="flex items-start justify-between">
            <h4 className="font-black text-slate-900 leading-tight group-hover:text-amber-600 transition-colors">
              {convoy.title}
            </h4>
            <div className="bg-slate-900 text-amber-400 text-[10px] font-black px-2 py-0.5 rounded flex items-center space-x-1">
              <Radio className="w-3 h-3" />
              <span>CH {convoy.cbChannel}</span>
            </div>
          </div>
          
          <div className="mt-2 flex items-center text-[11px] text-zinc-500 font-bold space-x-2">
            <MapPin className="w-3.5 h-3.5 text-amber-500" />
            <span className="truncate">{convoy.origin} ➔ {convoy.destination}</span>
          </div>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-3 gap-2 py-3 border-y border-zinc-50">
          <div className="flex flex-col">
            <span className="text-[9px] text-zinc-400 font-bold uppercase">Corridor</span>
            <span className="text-xs font-black text-slate-800">{convoy.corridor}</span>
          </div>
          <div className="flex flex-col">
            <span className="text-[9px] text-zinc-400 font-bold uppercase">Speed</span>
            <span className="text-xs font-black text-slate-800">{convoy.cruisingSpeedMph} MPH</span>
          </div>
          <div className="flex flex-col">
            <span className="text-[9px] text-zinc-400 font-bold uppercase">Members</span>
            <span className="text-xs font-black text-slate-800 flex items-center space-x-1">
              <Users className="w-3 h-3 text-zinc-400" />
              <span>{convoy.members.length}/{convoy.maxMembers}</span>
            </span>
          </div>
        </div>

        {/* Leader Info */}
        <div className="flex items-center justify-between">
          <div 
            className="flex items-center space-x-2 cursor-pointer hover:opacity-80 transition"
            onClick={() => onViewProfile(convoy.leader)}
          >
            <div className="relative">
              <img src={convoy.leader.avatarUrl} className="w-8 h-8 rounded-full border border-zinc-200 object-cover" alt="" />
              {convoy.leader.isVerified && (
                <div className="absolute -right-1 -bottom-1 bg-white rounded-full">
                  <ShieldCheck className="w-3.5 h-3.5 text-sky-500 fill-sky-500 stroke-white" />
                </div>
              )}
            </div>
            <div className="flex flex-col">
              <span className="text-[10px] font-black text-slate-900">@{convoy.leader.username}</span>
              <span className="text-[9px] text-zinc-400 font-bold">{convoy.leader.currentRig}</span>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={() => onSelect(convoy.id)}
              className={`p-2 rounded-xl transition-all border ${
                isActive ? 'bg-amber-100 border-amber-200 text-amber-700' : 'bg-zinc-50 border-zinc-100 text-zinc-400 hover:text-slate-900 hover:border-zinc-200'
              }`}
              title="Open Convoy Comms"
            >
              <Users className="w-4 h-4" />
            </button>
            
            {isLeader ? (
              <span className="px-3 py-1.5 bg-slate-100 text-slate-500 text-[10px] font-black uppercase rounded-xl border border-slate-200">
                You are Leader
              </span>
            ) : (
              <button
                onClick={() => onJoin(convoy.id)}
                disabled={!isMember && convoy.members.length >= convoy.maxMembers}
                className={`px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all border ${
                  isMember
                    ? 'bg-rose-50 border-rose-100 text-rose-600 hover:bg-rose-100'
                    : 'bg-slate-900 border-slate-900 text-white hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed'
                }`}
              >
                {isMember ? 'Leave Pack' : 'Join Draft'}
              </button>
            )}
          </div>
        </div>

        {/* Current Location / Notes */}
        {convoy.notes && (
          <div className="bg-amber-50/50 border border-amber-100 p-2.5 rounded-xl">
            <p className="text-[10px] text-amber-900 font-medium leading-relaxed italic">
              "{convoy.notes}"
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
