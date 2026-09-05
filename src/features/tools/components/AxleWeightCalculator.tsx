import React, { useState } from 'react';
import { Scale, Zap } from 'lucide-react';

export function AxleWeightCalculator() {
  const [steerWeight, setSteerWeight] = useState<number>(11800);
  const [driveWeight, setDriveWeight] = useState<number>(33500);
  const [trailerWeight, setTrailerWeight] = useState<number>(32800);
  const [bridgeLength, setBridgeLength] = useState<number>(51);
  const [numberOfAxles, setNumberOfAxles] = useState<number>(5);

  const totalWeight = steerWeight + driveWeight + trailerWeight;
  const maxSteerLimit = 12000;
  const maxDriveLimit = 34000;
  const maxTrailerLimit = 34000;
  const gvwrLimit = 80000;

  const calculateFederalBridgeLimit = (L: number, N: number) => {
    return Math.round(500 * ((L * N) / (N - 1) + 12 * N + 36));
  };

  const bridgeFormulaLimit = calculateFederalBridgeLimit(bridgeLength, numberOfAxles);
  const isSteerExcess = steerWeight > maxSteerLimit;
  const isDriveExcess = driveWeight > maxDriveLimit;
  const isTrailerExcess = trailerWeight > maxTrailerLimit;
  const isGvwrExcess = totalWeight > gvwrLimit;

  const getTandemSlidingAdvice = () => {
    if (!isDriveExcess && !isTrailerExcess) {
      return "All axle groups are legally balanced. No sliding required. Ensure your kingpin-to-tandem distance is legal for your state (e.g., 40 feet in California).";
    }
    if (isDriveExcess && isTrailerExcess) {
      return "⚠️ RED ALERT: Both drive and trailer axles are overloaded. You are carrying too much payload or it is poorly distributed. You must scale down or reload cargo.";
    }
    if (isDriveExcess) {
      const pinHolesToSlide = Math.ceil((driveWeight - 34000) / 400);
      return `⚙️ Slide Tandems FORWARD: You have too much weight on your drives. Sliding your trailer tandems FORWARD by approximately ${pinHolesToSlide} hole(s) (approx. 400 lbs shifted per hole) will shift weight off your drives and onto your trailer axles.`;
    }
    if (isTrailerExcess) {
      const pinHolesToSlide = Math.ceil((trailerWeight - 34000) / 400);
      return `⚙️ Slide Tandems BACKWARD: You have too much weight on your trailer tandems. Sliding your trailer tandems BACKWARD by approximately ${pinHolesToSlide} hole(s) (approx. 400 lbs shifted per hole) will shift weight off your trailer axles and onto your drive axles.`;
    }
    return "";
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 animate-in fade-in duration-300">
      <div className="lg:col-span-5 bg-white p-6 rounded-2xl border border-zinc-100 shadow-sm space-y-5">
        <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-wider flex items-center gap-1">
          <Scale className="w-4 h-4 text-zinc-400" /> Enter Certified Cat Scale Weights
        </h3>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-700">Steer Axle Weight</span>
            <span className="text-xs font-black text-slate-900">{steerWeight.toLocaleString()} lbs (Max 12k)</span>
          </div>
          <input
            type="range" min="8000" max="15000" step="100"
            value={steerWeight} onChange={(e) => setSteerWeight(parseInt(e.target.value))}
            className="w-full h-2 bg-zinc-200 rounded-lg appearance-none cursor-pointer accent-amber-500"
          />
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-700">Drive Tandem Axles</span>
            <span className="text-xs font-black text-slate-900">{driveWeight.toLocaleString()} lbs (Max 34k)</span>
          </div>
          <input
            type="range" min="20000" max="42000" step="100"
            value={driveWeight} onChange={(e) => setDriveWeight(parseInt(e.target.value))}
            className="w-full h-2 bg-zinc-200 rounded-lg appearance-none cursor-pointer accent-amber-500"
          />
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-700">Trailer Tandem Axles</span>
            <span className="text-xs font-black text-slate-900">{trailerWeight.toLocaleString()} lbs (Max 34k)</span>
          </div>
          <input
            type="range" min="20000" max="42000" step="100"
            value={trailerWeight} onChange={(e) => setTrailerWeight(parseInt(e.target.value))}
            className="w-full h-2 bg-zinc-200 rounded-lg appearance-none cursor-pointer accent-amber-500"
          />
        </div>

        <div className="pt-4 border-t border-zinc-100 space-y-4">
          <h4 className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Federal Bridge Formula Parameters</h4>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-1">Bridge Wheelbase (L in ft)</label>
              <input
                type="number" value={bridgeLength}
                onChange={(e) => setBridgeLength(parseInt(e.target.value) || 51)}
                className="w-full px-3 py-2 rounded-xl border border-zinc-200 text-xs font-bold text-slate-800"
              />
            </div>
            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-1">Axle Count (N)</label>
              <input
                type="number" value={numberOfAxles}
                onChange={(e) => setNumberOfAxles(parseInt(e.target.value) || 5)}
                className="w-full px-3 py-2 rounded-xl border border-zinc-200 text-xs font-bold text-slate-800"
              />
            </div>
          </div>
        </div>
      </div>

      <div className="lg:col-span-7 bg-white p-6 rounded-2xl border border-zinc-100 shadow-sm space-y-5">
        <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Scale Compliance Scorecard</h3>
        
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className={`p-3 rounded-xl border ${isSteerExcess ? 'bg-red-50 border-red-200 text-red-700' : 'bg-zinc-50 border-zinc-150 text-slate-800'}`}>
            <span className="text-[10px] font-bold uppercase tracking-wider block opacity-70">Steers (12k)</span>
            <strong className="text-sm font-black">{steerWeight.toLocaleString()}</strong>
            <span className="text-[10px] block mt-1">{isSteerExcess ? `+${(steerWeight - 12000).toLocaleString()} lbs OVER` : 'LEGAL'}</span>
          </div>

          <div className={`p-3 rounded-xl border ${isDriveExcess ? 'bg-red-50 border-red-200 text-red-700' : 'bg-zinc-50 border-zinc-150 text-slate-800'}`}>
            <span className="text-[10px] font-bold uppercase tracking-wider block opacity-70">Drives (34k)</span>
            <strong className="text-sm font-black">{driveWeight.toLocaleString()}</strong>
            <span className="text-[10px] block mt-1">{isDriveExcess ? `+${(driveWeight - 34000).toLocaleString()} lbs OVER` : 'LEGAL'}</span>
          </div>

          <div className={`p-3 rounded-xl border ${isTrailerExcess ? 'bg-red-50 border-red-200 text-red-700' : 'bg-zinc-50 border-zinc-150 text-slate-800'}`}>
            <span className="text-[10px] font-bold uppercase tracking-wider block opacity-70">Trailer (34k)</span>
            <strong className="text-sm font-black">{trailerWeight.toLocaleString()}</strong>
            <span className="text-[10px] block mt-1">{isTrailerExcess ? `+${(trailerWeight - 34000).toLocaleString()} lbs OVER` : 'LEGAL'}</span>
          </div>

          <div className={`p-3 rounded-xl border ${isGvwrExcess ? 'bg-red-50 border-red-200 text-red-700' : 'bg-zinc-50 border-zinc-150 text-slate-800'}`}>
            <span className="text-[10px] font-bold uppercase tracking-wider block opacity-70">Gross (80k)</span>
            <strong className="text-sm font-black">{totalWeight.toLocaleString()}</strong>
            <span className="text-[10px] block mt-1">{isGvwrExcess ? `+${(totalWeight - 80000).toLocaleString()} lbs OVER` : 'LEGAL'}</span>
          </div>
        </div>

        <div className="bg-amber-500/10 border border-amber-500/30 p-4 rounded-xl space-y-2">
          <span className="text-xs font-black uppercase text-amber-800 flex items-center gap-1.5">
            <Zap className="w-4 h-4 text-amber-600" /> Tandem Sliding Pin Advice
          </span>
          <p className="text-xs font-semibold text-slate-800 leading-relaxed">
            {getTandemSlidingAdvice()}
          </p>
        </div>

        <div className="bg-slate-900 text-white p-4 rounded-xl space-y-1">
          <div className="flex items-center justify-between text-xs font-black">
            <span>Federal Bridge Formula Limit (W)</span>
            <span className="text-amber-400">{bridgeFormulaLimit.toLocaleString()} lbs</span>
          </div>
          <p className="text-[11px] text-zinc-400">
            Calculated under 23 CFR 658 for {numberOfAxles} axles over {bridgeLength} ft span.
          </p>
        </div>
      </div>
    </div>
  );
}
