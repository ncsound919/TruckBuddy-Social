import React from 'react';
import { MileageLeaderboardEntry, MileageTimeframe, Profile, MileageProof } from '../../../types';
import { Trophy, ShieldCheck, CheckCircle2, Camera } from 'lucide-react';

interface MileagePodiumProps {
  top3: MileageLeaderboardEntry[];
  timeframe: MileageTimeframe;
  currentUser: Profile;
  onViewProfile: (p: Profile) => void;
  onInspectProof: (p: MileageProof) => void;
  getMilesForTimeframe: (entry: MileageLeaderboardEntry, tf: MileageTimeframe) => number;
}

export function MileagePodium({ 
  top3, 
  timeframe, 
  currentUser, 
  onViewProfile, 
  onInspectProof,
  getMilesForTimeframe
}: MileagePodiumProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
      {/* RANK 2 (Silver) */}
      {top3[1] && (
        <div className="order-2 md:order-1 bg-white rounded-3xl p-5 border-2 border-slate-200 shadow-sm flex flex-col justify-between relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-slate-100 rounded-bl-full -z-0 opacity-40" />
          <div className="space-y-3 z-10">
            <div className="flex items-center justify-between">
              <span className="w-8 h-8 rounded-xl bg-slate-200 text-slate-800 font-black text-sm flex items-center justify-center shadow-xs">
                #2
              </span>
              <span className="text-[10px] font-black uppercase tracking-wider text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                Silver Hauler
              </span>
            </div>

            <div className="flex items-center space-x-3">
              <img
                src={top3[1].driver.avatarUrl}
                alt=""
                className="w-12 h-12 rounded-2xl object-cover border border-slate-300 shadow-sm cursor-pointer hover:opacity-90"
                onClick={() => onViewProfile(top3[1].driver)}
              />
              <div>
                <h4 
                  className="font-black text-slate-900 text-sm hover:text-amber-600 cursor-pointer"
                  onClick={() => onViewProfile(top3[1].driver)}
                >
                  {top3[1].driver.displayName}
                </h4>
                <p className="text-[11px] text-zinc-500">
                  @{top3[1].driver.username} • {top3[1].driver.carrierName}
                </p>
              </div>
            </div>

            <div className="bg-zinc-50 rounded-2xl p-3 border border-zinc-100 space-y-1">
              <div className="text-[10px] font-bold text-zinc-400 uppercase">
                Verified Miles ({timeframe})
              </div>
              <div className="text-2xl font-black text-slate-900 tracking-tight">
                {getMilesForTimeframe(top3[1], timeframe).toLocaleString()}{' '}
                <span className="text-xs font-bold text-zinc-400">mi</span>
              </div>
              <div className="text-[10px] text-zinc-500 flex items-center justify-between pt-1 border-t border-zinc-200/60">
                <span>Avg {top3[1].avgMilesPerDay} mi/day</span>
                <span className="flex items-center space-x-1 text-emerald-600 font-bold">
                  <CheckCircle2 className="w-3 h-3" />
                  <span>{top3[1].verifiedProofsCount} verified runs</span>
                </span>
              </div>
            </div>
          </div>

          {top3[1].latestProof && (
            <button
              onClick={() => onInspectProof(top3[1].latestProof!)}
              className="mt-3 w-full py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-black rounded-xl transition flex items-center justify-center space-x-1"
            >
              <Camera className="w-3.5 h-3.5 text-slate-600" />
              <span>View Cluster Proof</span>
            </button>
          )}
        </div>
      )}

      {/* RANK 1 (Gold / Champion) */}
      {top3[0] && (
        <div className="order-1 md:order-2 bg-gradient-to-b from-amber-500/10 via-white to-white rounded-3xl p-6 border-2 border-amber-400 shadow-md flex flex-col justify-between relative overflow-hidden md:-mt-3">
          <div className="absolute top-0 right-0 w-28 h-28 bg-amber-400/20 rounded-bl-full -z-0" />
          <div className="space-y-3 z-10">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-1.5">
                <span className="w-10 h-10 rounded-2xl bg-amber-500 text-slate-950 font-black text-base flex items-center justify-center shadow-md ring-4 ring-amber-400/30">
                  #1
                </span>
                <Trophy className="w-6 h-6 text-amber-500 animate-bounce" />
              </div>
              <span className="text-[10px] font-black uppercase tracking-wider text-amber-950 bg-amber-400 px-2.5 py-1 rounded-lg shadow-xs">
                👑 Highway King / Top Run
              </span>
            </div>

            <div className="flex items-center space-x-3.5 pt-1">
              <img
                src={top3[0].driver.avatarUrl}
                alt=""
                className="w-14 h-14 rounded-2xl object-cover border-2 border-amber-400 shadow-md cursor-pointer hover:opacity-90"
                onClick={() => onViewProfile(top3[0].driver)}
              />
              <div>
                <h4 
                  className="font-black text-slate-900 text-base hover:text-amber-600 cursor-pointer flex items-center space-x-1"
                  onClick={() => onViewProfile(top3[0].driver)}
                >
                  <span>{top3[0].driver.displayName}</span>
                  <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                </h4>
                <p className="text-xs text-zinc-500 font-medium">
                  @{top3[0].driver.username} • {top3[0].driver.currentRig}
                </p>
              </div>
            </div>

            <div className="bg-amber-50/70 rounded-2xl p-4 border border-amber-200/80 space-y-1">
              <div className="text-[10px] font-bold text-amber-800 uppercase tracking-wide">
                Verified Miles ({timeframe})
              </div>
              <div className="text-3xl font-black text-slate-950 tracking-tight">
                {getMilesForTimeframe(top3[0], timeframe).toLocaleString()}{' '}
                <span className="text-sm font-bold text-zinc-500">mi</span>
              </div>
              <div className="text-xs text-amber-900 font-medium flex items-center justify-between pt-1.5 border-t border-amber-200/60">
                <span>Avg {top3[0].avgMilesPerDay} mi/day</span>
                <span className="flex items-center space-x-1 text-emerald-700 font-black">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>{top3[0].verifiedProofsCount} proof submissions</span>
                </span>
              </div>
            </div>
          </div>

          {top3[0].latestProof && (
            <button
              onClick={() => onInspectProof(top3[0].latestProof!)}
              className="mt-3 w-full py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-black rounded-xl transition shadow-sm flex items-center justify-center space-x-1.5"
            >
              <Camera className="w-4 h-4" />
              <span>Inspect Verified Cluster Proof</span>
            </button>
          )}
        </div>
      )}

      {/* RANK 3 (Bronze) */}
      {top3[2] && (
        <div className="order-3 bg-white rounded-3xl p-5 border-2 border-amber-700/20 shadow-sm flex flex-col justify-between relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-amber-100/50 rounded-bl-full -z-0" />
          <div className="space-y-3 z-10">
            <div className="flex items-center justify-between">
              <span className="w-8 h-8 rounded-xl bg-amber-100 text-amber-900 font-black text-sm flex items-center justify-center shadow-xs">
                #3
              </span>
              <span className="text-[10px] font-black uppercase tracking-wider text-amber-900 bg-amber-100/80 px-2 py-0.5 rounded">
                Bronze Hauler
              </span>
            </div>

            <div className="flex items-center space-x-3">
              <img
                src={top3[2].driver.avatarUrl}
                alt=""
                className="w-12 h-12 rounded-2xl object-cover border border-amber-200 shadow-sm cursor-pointer hover:opacity-90"
                onClick={() => onViewProfile(top3[2].driver)}
              />
              <div>
                <h4 
                  className="font-black text-slate-900 text-sm hover:text-amber-600 cursor-pointer flex items-center space-x-1"
                  onClick={() => onViewProfile(top3[2].driver)}
                >
                  <span>{top3[2].driver.displayName}</span>
                  {top3[2].driver.id === currentUser.id && (
                    <span className="bg-amber-500 text-slate-950 font-black text-[9px] px-1.5 rounded">
                      YOU
                    </span>
                  )}
                </h4>
                <p className="text-[11px] text-zinc-500">
                  @{top3[2].driver.username} • {top3[2].driver.carrierName}
                </p>
              </div>
            </div>

            <div className="bg-zinc-50 rounded-2xl p-3 border border-zinc-100 space-y-1">
              <div className="text-[10px] font-bold text-zinc-400 uppercase">
                Verified Miles ({timeframe})
              </div>
              <div className="text-2xl font-black text-slate-900 tracking-tight">
                {getMilesForTimeframe(top3[2], timeframe).toLocaleString()}{' '}
                <span className="text-xs font-bold text-zinc-400">mi</span>
              </div>
              <div className="text-[10px] text-zinc-500 flex items-center justify-between pt-1 border-t border-zinc-200/60">
                <span>Avg {top3[2].avgMilesPerDay} mi/day</span>
                <span className="flex items-center space-x-1 text-emerald-600 font-bold">
                  <CheckCircle2 className="w-3 h-3" />
                  <span>{top3[2].verifiedProofsCount} verified runs</span>
                </span>
              </div>
            </div>
          </div>

          {top3[2].latestProof && (
            <button
              onClick={() => onInspectProof(top3[2].latestProof!)}
              className="mt-3 w-full py-2 bg-amber-50 hover:bg-amber-100 text-amber-950 text-xs font-black rounded-xl transition flex items-center justify-center space-x-1"
            >
              <Camera className="w-3.5 h-3.5 text-amber-700" />
              <span>View Cluster Proof</span>
            </button>
          )}
        </div>
      )}
    </div>
  );
}
