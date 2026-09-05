import React, { useState } from 'react';
import { Layers } from 'lucide-react';

export function SecurementCalculator() {
  const [cargoWeight, setCargoWeight] = useState<number>(42000);
  const [cargoLength, setCargoLength] = useState<number>(35);
  const [tieDownType, setTieDownType] = useState<'strap_4inch' | 'strap_2inch' | 'chain_516' | 'chain_38' | 'chain_12'>('chain_38');
  const [numberOfTieDowns, setNumberOfTieDowns] = useState<number>(4);

  const getWllValue = () => {
    switch (tieDownType) {
      case 'strap_4inch': return 5400;
      case 'strap_2inch': return 3333;
      case 'chain_516': return 4700;
      case 'chain_38': return 6600;
      case 'chain_12': return 11300;
    }
  };

  const currentWLLUnit = getWllValue();
  const aggregateWLL = numberOfTieDowns * currentWLLUnit;
  const legalRequiredWLL = cargoWeight * 0.5;
  const isWLLCompliant = aggregateWLL >= legalRequiredWLL;

  const calculateLegalMinTieDowns = () => {
    if (cargoLength <= 5) return cargoWeight <= 1100 ? 1 : 2;
    if (cargoLength <= 10) return 2;
    return 2 + Math.ceil((cargoLength - 10) / 10);
  };
  const legalMinTieDowns = calculateLegalMinTieDowns();

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 animate-in fade-in duration-300">
      <div className="lg:col-span-5 bg-white p-6 rounded-2xl border border-zinc-100 shadow-sm space-y-4">
        <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-wider flex items-center gap-1">
          <Layers className="w-4 h-4 text-zinc-400" /> Cargo Specifications
        </h3>

        <div>
          <label className="block text-[11px] font-bold text-slate-700 mb-1">Cargo Payload Weight (lbs)</label>
          <input
            type="number" value={cargoWeight}
            onChange={(e) => setCargoWeight(parseInt(e.target.value) || 0)}
            className="w-full px-3 py-2 rounded-xl border border-zinc-200 text-xs font-bold text-slate-800"
          />
        </div>

        <div>
          <label className="block text-[11px] font-bold text-slate-700 mb-1">Cargo Total Length (Feet)</label>
          <input
            type="number" value={cargoLength}
            onChange={(e) => setCargoLength(parseInt(e.target.value) || 0)}
            className="w-full px-3 py-2 rounded-xl border border-zinc-200 text-xs font-bold text-slate-800"
          />
        </div>

        <div>
          <label className="block text-[11px] font-bold text-slate-700 mb-1">Tie-Down Hardware</label>
          <select
            value={tieDownType}
            onChange={(e) => setTieDownType(e.target.value as any)}
            className="w-full px-3 py-2 rounded-xl border border-zinc-200 text-xs font-bold bg-white"
          >
            <option value="strap_4inch">4" Synthetic Webbing Strap (WLL 5,400 lbs)</option>
            <option value="strap_2inch">2" Cargo Strap (WLL 3,333 lbs)</option>
            <option value="chain_516">5/16" Grade 70 Transport Chain (WLL 4,700 lbs)</option>
            <option value="chain_38">3/8" Grade 70 Transport Chain (WLL 6,600 lbs)</option>
            <option value="chain_12">1/2" Grade 70 Transport Chain (WLL 11,300 lbs)</option>
          </select>
        </div>

        <div>
          <label className="block text-[11px] font-bold text-slate-700 mb-1">Number of Tie-Downs Attached</label>
          <input
            type="number" min="1" max="20" value={numberOfTieDowns}
            onChange={(e) => setNumberOfTieDowns(parseInt(e.target.value) || 1)}
            className="w-full px-3 py-2 rounded-xl border border-zinc-200 text-xs font-bold text-slate-800"
          />
        </div>
      </div>

      <div className="lg:col-span-7 bg-white p-6 rounded-2xl border border-zinc-100 shadow-sm space-y-5">
        <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-wider">FMCSA 393.102 Securement Scorecard</h3>

        <div className="grid grid-cols-2 gap-4">
          <div className={`p-4 rounded-xl border ${isWLLCompliant ? 'bg-emerald-50 border-emerald-200' : 'bg-red-50 border-red-200'}`}>
            <span className="text-[10px] font-bold uppercase block opacity-70">Aggregate WLL Rating</span>
            <strong className="text-xl font-black block">{aggregateWLL.toLocaleString()} lbs</strong>
            <span className="text-xs font-semibold block mt-1">
              Required 50% WLL: {legalRequiredWLL.toLocaleString()} lbs ({isWLLCompliant ? 'PASS' : 'FAIL - ADD STRAPS'})
            </span>
          </div>

          <div className={`p-4 rounded-xl border ${numberOfTieDowns >= legalMinTieDowns ? 'bg-emerald-50 border-emerald-200' : 'bg-red-50 border-red-200'}`}>
            <span className="text-[10px] font-bold uppercase block opacity-70">Min Tie-Downs By Length</span>
            <strong className="text-xl font-black block">{numberOfTieDowns} attached</strong>
            <span className="text-xs font-semibold block mt-1">
              Legal Min: {legalMinTieDowns} for {cargoLength} ft ({numberOfTieDowns >= legalMinTieDowns ? 'PASS' : 'FAIL'})
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
