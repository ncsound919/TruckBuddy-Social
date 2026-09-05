import React from 'react';
import { MileageProof, Profile } from '../../../types';
import { CheckCircle2, ThumbsUp } from 'lucide-react';

interface MileageProofCardProps {
  key?: React.Key;
  proof: MileageProof;
  onViewProfile: (username: string) => void;
  onInspectProof: (proof: MileageProof) => void;
  onUpvote: (id: string) => void;
}

export function MileageProofCard({ 
  proof, 
  onViewProfile, 
  onInspectProof, 
  onUpvote 
}: MileageProofCardProps) {
  return (
    <div className="bg-white rounded-3xl p-5 border border-zinc-100 shadow-sm hover:shadow-md transition space-y-4 flex flex-col justify-between">
      <div className="space-y-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-3">
            <img
              src={proof.driverAvatar}
              alt=""
              className="w-10 h-10 rounded-xl object-cover border border-zinc-200 shrink-0 cursor-pointer"
              onClick={() => onViewProfile(proof.driverHandle)}
            />
            <div>
              <h4 className="font-black text-slate-900 text-xs">
                {proof.driverName}
              </h4>
              <span className="text-[11px] text-zinc-500">
                @{proof.driverHandle} • {proof.rigUnit}
              </span>
            </div>
          </div>

          <span className="px-2 py-0.5 rounded text-[10px] font-black bg-emerald-100 text-emerald-900 border border-emerald-200 flex items-center space-x-1">
            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
            <span>{proof.verificationBadge}</span>
          </span>
        </div>

        {/* PROOF PHOTO / TELEMETRY CARD */}
        {proof.proofImageUrl ? (
          <div 
            className="relative rounded-2xl overflow-hidden border border-zinc-200 aspect-16/9 cursor-pointer group"
            onClick={() => onInspectProof(proof)}
          >
            <img
              src={proof.proofImageUrl}
              alt="Cluster proof"
              className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent flex flex-col justify-end p-3 text-white">
              <div className="flex items-center justify-between text-xs font-black">
                <span>{proof.routeCorridor}</span>
                <span className="bg-amber-500 text-slate-950 px-2 py-0.5 rounded text-[10px]">
                  +{proof.milesLogged.toLocaleString()} MILES
                </span>
              </div>
              <div className="text-[10px] text-zinc-300">
                Odo Start: {proof.odometerStart.toLocaleString()} → Odo Current: {proof.odometerEnd.toLocaleString()}
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-slate-900 text-white rounded-2xl p-4 border border-slate-800 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="text-zinc-400">Direct Gateway:</span>
              <span className="font-black text-sky-400">{proof.eldProvider}</span>
            </div>
            <div className="text-lg font-black text-white">
              +{proof.milesLogged.toLocaleString()} Verified Miles
            </div>
            <div className="text-[11px] text-zinc-400 font-mono">
              {proof.verificationCode}
            </div>
          </div>
        )}

        <p className="text-xs text-zinc-600 italic">
          "{proof.notes}"
        </p>
      </div>

      <div className="flex items-center justify-between pt-3 border-t border-zinc-100 text-xs">
        <span className="text-[10px] text-zinc-400 font-mono">
          AUTH #{proof.verificationCode}
        </span>

        <button
          onClick={() => onUpvote(proof.id)}
          className="px-3 py-1.5 bg-zinc-50 hover:bg-amber-50 text-slate-800 hover:text-amber-900 font-black rounded-xl border border-zinc-200 flex items-center space-x-1.5 transition"
        >
          <ThumbsUp className="w-3.5 h-3.5 text-amber-500" />
          <span>10-4 Verified ({proof.upvotes})</span>
        </button>
      </div>
    </div>
  );
}
