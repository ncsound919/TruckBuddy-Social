import React from 'react';
import { PeerEndorsement, Profile } from '../../../types';
import { 
  Award, 
  ThumbsUp, 
  ShieldCheck, 
  Calendar,
  Sparkles
} from 'lucide-react';

interface PeerEndorsementCardProps {
  key?: React.Key;
  endorsement: PeerEndorsement;
  onViewProfile: (p: Profile) => void;
  onUpvote: (id: string) => void;
}

export function PeerEndorsementCard({ 
  endorsement, 
  onViewProfile, 
  onUpvote 
}: PeerEndorsementCardProps) {
  const getSkillBadge = (skill: string) => {
    switch (skill) {
      case 'mountain_driving': return { label: 'Mountain Master', icon: '🏔️', color: 'bg-blue-50 text-blue-700 border-blue-100' };
      case 'dock_backing': return { label: 'Precision Backing', icon: '🎯', color: 'bg-emerald-50 text-emerald-700 border-emerald-100' };
      case 'winter_ice': return { label: 'Ice Expert', icon: '❄️', color: 'bg-sky-50 text-sky-700 border-sky-100' };
      case 'roadside_rescue': return { label: 'Mechanic-Minded', icon: '🛠️', color: 'bg-amber-50 text-amber-700 border-amber-100' };
      case 'hazmat_safety': return { label: 'Safety First', icon: '🦺', color: 'bg-rose-50 text-rose-700 border-rose-100' };
      case 'heavy_haul': return { label: 'Heavy Haulage', icon: '🏋️', color: 'bg-purple-50 text-purple-700 border-purple-100' };
      case 'fuel_efficiency': return { label: 'Eco-Driver', icon: '⚡', color: 'bg-cyan-50 text-cyan-700 border-cyan-100' };
      default: return { label: 'Pro Skill', icon: '🚚', color: 'bg-zinc-50 text-zinc-700 border-zinc-100' };
    }
  };

  const badge = getSkillBadge(endorsement.skill);

  return (
    <div className="bg-white rounded-2xl border border-zinc-100 p-5 shadow-sm hover:shadow-md transition-all space-y-4">
      {/* Badge Header */}
      <div className={`inline-flex items-center space-x-2 px-3 py-1 rounded-full border text-[10px] font-black uppercase tracking-wider ${badge.color}`}>
        <span>{badge.icon}</span>
        <span>{badge.label}</span>
      </div>

      <div className="space-y-2">
        <h4 className="font-black text-slate-900 text-sm leading-snug">
          {endorsement.title}
        </h4>
        <p className="text-zinc-600 text-xs leading-relaxed italic font-medium bg-zinc-50/50 p-3 rounded-xl border border-zinc-100/50">
          "{endorsement.comment}"
        </p>
      </div>

      {/* Endorser Info */}
      <div className="flex items-center justify-between pt-2">
        <div 
          className="flex items-center space-x-2 cursor-pointer group"
          onClick={() => onViewProfile(endorsement.endorser)}
        >
          <div className="relative">
            <img src={endorsement.endorser.avatarUrl} className="w-8 h-8 rounded-full border border-zinc-200 object-cover group-hover:ring-2 ring-amber-400 transition-all" alt="" />
            {endorsement.endorser.isVerified && (
              <div className="absolute -right-0.5 -bottom-0.5 bg-white rounded-full">
                <ShieldCheck className="w-3.5 h-3.5 text-sky-500 fill-sky-500 stroke-white" />
              </div>
            )}
          </div>
          <div className="flex flex-col">
            <span className="text-[10px] font-black text-slate-900 group-hover:text-amber-600">@{endorsement.endorser.username}</span>
            <span className="text-[9px] text-zinc-400 font-bold uppercase tracking-tighter">Vouched {endorsement.date}</span>
          </div>
        </div>

        <button
          onClick={() => onUpvote(endorsement.id)}
          className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-zinc-100 hover:bg-amber-100 text-zinc-500 hover:text-amber-700 transition-all border border-transparent hover:border-amber-200"
        >
          <ThumbsUp className="w-3.5 h-3.5" />
          <span className="text-[11px] font-black">{endorsement.upvotes}</span>
        </button>
      </div>
    </div>
  );
}
