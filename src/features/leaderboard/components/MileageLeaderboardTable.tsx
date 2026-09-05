import React from 'react';
import { MileageLeaderboardEntry, MileageTimeframe, Profile } from '../../../types';
import { ShieldCheck, Eye, CheckCircle2, Flame } from 'lucide-react';

interface MileageLeaderboardTableProps {
  entries: MileageLeaderboardEntry[];
  timeframe: MileageTimeframe;
  currentUser: Profile;
  onViewProfile: (p: Profile) => void;
  onInspectProof: (p: any) => void;
  getMilesForTimeframe: (entry: MileageLeaderboardEntry, tf: MileageTimeframe) => number;
}

export function MileageLeaderboardTable({
  entries,
  timeframe,
  currentUser,
  onViewProfile,
  onInspectProof,
  getMilesForTimeframe
}: MileageLeaderboardTableProps) {
  return (
    <div className="bg-white rounded-3xl border border-zinc-100 shadow-sm overflow-hidden">
      <div className="p-4 px-6 bg-zinc-50/70 border-b border-zinc-100 flex items-center justify-between text-xs">
        <span className="font-black text-slate-900">
          National Driver Rankings ({entries.length})
        </span>
        <span className="text-zinc-500 font-medium">
          Verified against FMCSA HOS feasibility
        </span>
      </div>

      <div className="divide-y divide-zinc-100 overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="text-[10px] font-black uppercase text-zinc-400 tracking-wider bg-zinc-50/40">
              <th className="py-3 px-6">Rank</th>
              <th className="py-3 px-4">Driver & Rig</th>
              <th className="py-3 px-4">Division</th>
              <th className="py-3 px-4 text-right">Verified Miles</th>
              <th className="py-3 px-4 text-right">Avg Pace</th>
              <th className="py-3 px-4 text-center">Telemetry Proof</th>
              <th className="py-3 px-6 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-100">
            {entries.map(item => {
              const isCurrentUser = item.driver.id === currentUser.id;
              const miles = getMilesForTimeframe(item, timeframe);

              return (
                <tr
                  key={item.id}
                  className={`hover:bg-zinc-50/80 transition ${
                    isCurrentUser ? 'bg-amber-50/40 font-semibold' : ''
                  }`}
                >
                  {/* Rank */}
                  <td className="py-4 px-6 font-black text-slate-900">
                    <div className="flex items-center space-x-1.5">
                      <span
                        className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs ${
                          item.rank === 1
                            ? 'bg-amber-500 text-slate-950 font-black'
                            : item.rank === 2
                            ? 'bg-slate-300 text-slate-900 font-black'
                            : item.rank === 3
                            ? 'bg-amber-200 text-amber-950 font-black'
                            : 'bg-zinc-100 text-zinc-600 font-bold'
                        }`}
                      >
                        {item.rank}
                      </span>
                      {item.rank < item.previousRank && (
                        <span className="text-emerald-600 font-bold text-[10px]">▲</span>
                      )}
                      {item.rank > item.previousRank && (
                        <span className="text-rose-500 font-bold text-[10px]">▼</span>
                      )}
                    </div>
                  </td>

                  {/* Driver */}
                  <td className="py-4 px-4">
                    <div className="flex items-center space-x-3">
                      <img
                        src={item.driver.avatarUrl}
                        alt=""
                        className="w-10 h-10 rounded-xl object-cover border border-zinc-200 shrink-0 cursor-pointer"
                        onClick={() => onViewProfile(item.driver)}
                      />
                      <div>
                        <div className="flex items-center space-x-1.5">
                          <span 
                            className="font-black text-slate-900 hover:text-amber-600 cursor-pointer"
                            onClick={() => onViewProfile(item.driver)}
                          >
                            {item.driver.displayName}
                          </span>
                          {item.driver.isVerified && (
                            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                          )}
                          {isCurrentUser && (
                            <span className="bg-amber-500 text-slate-950 text-[9px] font-black px-1.5 py-0.2 rounded">
                              YOU
                            </span>
                          )}
                        </div>
                        <span className="text-[11px] text-zinc-500 block">
                          @{item.driver.username} • {item.driver.currentRig}
                        </span>
                      </div>
                    </div>
                  </td>

                  {/* Category */}
                  <td className="py-4 px-4">
                    <span className="px-2.5 py-1 rounded-lg font-bold text-[11px] bg-zinc-100 text-zinc-700 uppercase tracking-wider">
                      {item.driverCategory.replace('_', ' ')}
                    </span>
                  </td>

                  {/* Verified Miles */}
                  <td className="py-4 px-4 text-right">
                    <div className="font-black text-slate-900 text-sm">
                      {miles.toLocaleString()}{' '}
                      <span className="text-[11px] text-zinc-400 font-normal">mi</span>
                    </div>
                    <span className="text-[10px] text-zinc-400">
                      {item.verifiedProofsCount} authenticated logs
                    </span>
                  </td>

                  {/* Avg Pace */}
                  <td className="py-4 px-4 text-right font-bold text-zinc-700">
                    <div>{item.avgMilesPerDay} mi/day</div>
                    <span className="text-[10px] text-amber-600 font-semibold flex items-center justify-end space-x-0.5">
                      <Flame className="w-2.5 h-2.5" />
                      <span>{item.streakDays}d streak</span>
                    </span>
                  </td>

                  {/* Telemetry Proof */}
                  <td className="py-4 px-4 text-center">
                    {item.latestProof ? (
                      <button
                        onClick={() => onInspectProof(item.latestProof!)}
                        className="px-2.5 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-900 border border-emerald-200 rounded-lg text-[10px] font-black inline-flex items-center space-x-1 transition"
                      >
                        <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                        <span>{item.latestProof.verificationBadge}</span>
                      </button>
                    ) : (
                      <span className="text-[10px] text-zinc-400">Pending Telemetry</span>
                    )}
                  </td>

                  {/* Actions */}
                  <td className="py-4 px-6 text-right">
                    <div className="flex items-center justify-end space-x-2">
                      {item.latestProof && (
                        <button
                          onClick={() => onInspectProof(item.latestProof!)}
                          className="p-1.5 rounded-lg hover:bg-zinc-100 text-zinc-600"
                          title="View Cluster Snapshot"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                      )}
                      <button
                        onClick={() => onViewProfile(item.driver)}
                        className="px-2.5 py-1 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-lg text-[11px] transition"
                      >
                        Profile
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
