import React, { useState } from 'react';
import { ShieldAlert } from 'lucide-react';

export function WindRiskCalculator() {
  const [windSpeed, setWindSpeed] = useState<number>(35);
  const [windAngle, setWindAngle] = useState<'head' | 'quarter' | 'cross'>('cross');
  const [trailerWeightCategory, setTrailerWeightCategory] = useState<'empty' | 'light' | 'medium' | 'heavy'>('empty');
  const [cabType] = useState<'high_roof' | 'mid_roof' | 'flat_top'>('high_roof');

  const calculateBlowOverRisk = () => {
    let score = windSpeed * 1.5;
    if (windAngle === 'cross') score *= 1.4;
    else if (windAngle === 'quarter') score *= 1.1;
    else score *= 0.4;

    if (trailerWeightCategory === 'empty') score *= 1.5;
    else if (trailerWeightCategory === 'light') score *= 1.2;
    else if (trailerWeightCategory === 'medium') score *= 0.8;
    else score *= 0.4;

    if (cabType === 'high_roof') score *= 1.2;
    else if (cabType === 'flat_top') score *= 0.9;

    return Math.min(100, Math.max(0, Math.round(score)));
  };

  const blowOverRiskScore = calculateBlowOverRisk();

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 animate-in fade-in duration-300">
      <div className="lg:col-span-5 bg-white p-6 rounded-2xl border border-zinc-100 shadow-sm space-y-4">
        <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-wider flex items-center gap-1">
          <ShieldAlert className="w-4 h-4 text-zinc-400" /> Wind & Rig Profile
        </h3>

        <div>
          <label className="block text-[11px] font-bold text-slate-700 mb-1">Wind Gust Speed: {windSpeed} MPH</label>
          <input
            type="range" min="10" max="80" value={windSpeed}
            onChange={(e) => setWindSpeed(parseInt(e.target.value))}
            className="w-full h-2 bg-zinc-200 rounded-lg appearance-none cursor-pointer accent-amber-500"
          />
        </div>

        <div>
          <label className="block text-[11px] font-bold text-slate-700 mb-1">Wind Angle</label>
          <select
            value={windAngle}
            onChange={(e) => setWindAngle(e.target.value as any)}
            className="w-full px-3 py-2 rounded-xl border border-zinc-200 text-xs font-bold bg-white"
          >
            <option value="cross">Direct 90° Crosswind (Max Hazard)</option>
            <option value="quarter">45° Quartering Wind</option>
            <option value="head">Direct Headwind / Tailwind</option>
          </select>
        </div>

        <div>
          <label className="block text-[11px] font-bold text-slate-700 mb-1">Trailer Weight Category</label>
          <select
            value={trailerWeightCategory}
            onChange={(e) => setTrailerWeightCategory(e.target.value as any)}
            className="w-full px-3 py-2 rounded-xl border border-zinc-200 text-xs font-bold bg-white"
          >
            <option value="empty">Empty / Bobtail (Severe Threat)</option>
            <option value="light">Light Freight (&lt; 15,000 lbs)</option>
            <option value="medium">Medium Freight (15k - 30k lbs)</option>
            <option value="heavy">Heavy Loaded (&gt; 35,000 lbs)</option>
          </select>
        </div>
      </div>

      <div className="lg:col-span-7 bg-white p-6 rounded-2xl border border-zinc-100 shadow-sm space-y-5">
        <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Blow-Over Threat Scorecard</h3>
        <div className="bg-zinc-50 p-6 rounded-2xl text-center space-y-2 border border-zinc-100">
          <span className="text-[10px] font-bold uppercase text-zinc-400">Overturn Threat Index</span>
          <div className="text-4xl font-black text-slate-900">{blowOverRiskScore} / 100</div>
          <span className={`inline-block px-3 py-1 rounded-full text-xs font-black uppercase ${
            blowOverRiskScore > 70 ? 'bg-red-500 text-white' : blowOverRiskScore > 40 ? 'bg-amber-500 text-slate-950' : 'bg-emerald-500 text-slate-950'
          }`}>
            {blowOverRiskScore > 70 ? 'CRITICAL - PULL OVER' : blowOverRiskScore > 40 ? 'HIGH CAUTION' : 'SAFE TO ROLL'}
          </span>
        </div>
      </div>
    </div>
  );
}
