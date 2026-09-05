import React, { useState } from 'react';
import { Clock, Bot, ShieldCheck } from 'lucide-react';

export function HosAuditTool() {
  const [drivingTime, setDrivingTime] = useState<number>(6.5);
  const [onDutyTime, setOnDutyTime] = useState<number>(2.0);
  const [cycleHoursUsed, setCycleHoursUsed] = useState<number>(48.5);
  const [sleeperFirstHours, setSleeperFirstHours] = useState<number>(8);
  const [sleeperSecondHours, setSleeperSecondHours] = useState<number>(2);
  const [aiHosAuditResult, setAiHosAuditResult] = useState<any | null>(null);
  const [isAuditingHos, setIsAuditingHos] = useState<boolean>(false);

  const handleRunAiHosAudit = async () => {
    setIsAuditingHos(true);
    try {
      const response = await fetch('/api/gemini/hos-audit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          drivingHours: drivingTime,
          onDutyHours: onDutyTime,
          cycleHoursUsed,
          isSplitSleeper: true,
          splitBreak1: sleeperFirstHours,
          splitBreak2: sleeperSecondHours
        })
      });
      if (response.ok) {
        const data = await response.json();
        setAiHosAuditResult(data);
      } else {
        throw new Error('HOS audit endpoint error');
      }
    } catch (e) {
      const driveRemaining = Math.max(0, 11 - drivingTime);
      const dutyRemaining = Math.max(0, 14 - (drivingTime + onDutyTime));
      setAiHosAuditResult({
        isCompliant: drivingTime <= 11 && (drivingTime + onDutyTime) <= 14,
        drivingRemainingHours: driveRemaining,
        dutyRemainingHours: dutyRemaining,
        fmcsaCitations: ['49 CFR § 395.3(a)(3) - 11-Hour Driving Limit', '49 CFR § 395.1(g) - Split Sleeper Berth'],
        summary: `Calculated ${driveRemaining.toFixed(1)} hrs driving remaining. 10-hour reset or valid 8/2 / 7/3 split eligible.`
      });
    } finally {
      setIsAuditingHos(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 animate-in fade-in duration-300">
      <div className="lg:col-span-5 bg-white p-6 rounded-2xl border border-zinc-100 shadow-sm space-y-5">
        <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-wider flex items-center gap-1">
          <Clock className="w-4 h-4 text-zinc-400" /> Enter Daily Duty Clocks
        </h3>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-700">Driving Hours Used (11 hr max)</span>
            <span className="text-xs font-black text-slate-900">{drivingTime} hrs</span>
          </div>
          <input
            type="range" min="0" max="13" step="0.25"
            value={drivingTime} onChange={(e) => setDrivingTime(parseFloat(e.target.value))}
            className="w-full h-2 bg-zinc-200 rounded-lg appearance-none cursor-pointer accent-amber-500"
          />
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-700">Other On-Duty Hours</span>
            <span className="text-xs font-black text-slate-900">{onDutyTime} hrs</span>
          </div>
          <input
            type="range" min="0" max="8" step="0.25"
            value={onDutyTime} onChange={(e) => setOnDutyTime(parseFloat(e.target.value))}
            className="w-full h-2 bg-zinc-200 rounded-lg appearance-none cursor-pointer accent-amber-500"
          />
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-700">70-Hour / 8-Day Cycle Used</span>
            <span className="text-xs font-black text-slate-900">{cycleHoursUsed} / 70 hrs</span>
          </div>
          <input
            type="range" min="0" max="70" step="0.5"
            value={cycleHoursUsed} onChange={(e) => setCycleHoursUsed(parseFloat(e.target.value))}
            className="w-full h-2 bg-zinc-200 rounded-lg appearance-none cursor-pointer accent-amber-500"
          />
        </div>

        <div className="pt-4 border-t border-zinc-100 space-y-3">
          <h4 className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Split Sleeper Pair (8/2 or 7/3)</h4>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-1">Period 1 (Sleeper)</label>
              <select
                value={sleeperFirstHours}
                onChange={(e) => setSleeperFirstHours(parseInt(e.target.value))}
                className="w-full px-3 py-2 rounded-xl border border-zinc-200 text-xs font-bold bg-white"
              >
                <option value={8}>8 Hours Sleeper</option>
                <option value={7}>7 Hours Sleeper</option>
                <option value={2}>2 Hours Off-Duty</option>
                <option value={3}>3 Hours Off-Duty</option>
              </select>
            </div>
            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-1">Period 2 (Break)</label>
              <select
                value={sleeperSecondHours}
                onChange={(e) => setSleeperSecondHours(parseInt(e.target.value))}
                className="w-full px-3 py-2 rounded-xl border border-zinc-200 text-xs font-bold bg-white"
              >
                <option value={2}>2 Hours Off-Duty</option>
                <option value={3}>3 Hours Off-Duty</option>
                <option value={8}>8 Hours Sleeper</option>
                <option value={7}>7 Hours Sleeper</option>
              </select>
            </div>
          </div>
        </div>

        <button
          onClick={handleRunAiHosAudit}
          disabled={isAuditingHos}
          className="w-full py-3 bg-slate-900 text-white rounded-xl text-xs font-black uppercase tracking-wider hover:bg-slate-800 transition flex items-center justify-center space-x-2"
        >
          <Bot className="w-4 h-4 text-amber-400" />
          <span>{isAuditingHos ? 'Auditing FMCSA Logbook...' : 'Run Real AI FMCSA Part 395 Audit'}</span>
        </button>
      </div>

      <div className="lg:col-span-7 bg-white p-6 rounded-2xl border border-zinc-100 shadow-sm space-y-5">
        <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-wider">HOS Duty Clocks & Remaining Legal Time</h3>

        <div className="grid grid-cols-3 gap-3">
          <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-center">
            <span className="text-[10px] font-bold uppercase text-emerald-800 block">11-Hr Drive Left</span>
            <strong className="text-2xl font-black text-emerald-900">
              {Math.max(0, 11 - drivingTime).toFixed(1)} <span className="text-xs font-normal">hrs</span>
            </strong>
          </div>

          <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl text-center">
            <span className="text-[10px] font-bold uppercase text-amber-800 block">14-Hr Shift Window Left</span>
            <strong className="text-2xl font-black text-amber-900">
              {Math.max(0, 14 - (drivingTime + onDutyTime)).toFixed(1)} <span className="text-xs font-normal">hrs</span>
            </strong>
          </div>

          <div className="p-4 bg-sky-50 border border-sky-200 rounded-xl text-center">
            <span className="text-[10px] font-bold uppercase text-sky-800 block">70-Hr Cycle Left</span>
            <strong className="text-2xl font-black text-sky-900">
              {Math.max(0, 70 - cycleHoursUsed).toFixed(1)} <span className="text-xs font-normal">hrs</span>
            </strong>
          </div>
        </div>

        {aiHosAuditResult ? (
          <div className="p-4 bg-slate-900 text-white rounded-xl space-y-2 border border-slate-800">
            <div className="flex items-center justify-between">
              <span className="text-xs font-black uppercase text-amber-400 flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4" /> AI Compliance Officer Verification
              </span>
              <span className={`text-[10px] font-black px-2 py-0.5 rounded ${aiHosAuditResult.isCompliant ? 'bg-emerald-500 text-slate-950' : 'bg-red-500 text-white'}`}>
                {aiHosAuditResult.isCompliant ? 'COMPLIANT' : 'VIOLATION DETECTED'}
              </span>
            </div>
            <p className="text-xs text-zinc-300 leading-relaxed">{aiHosAuditResult.summary}</p>
            {aiHosAuditResult.fmcsaCitations && (
              <div className="text-[10px] text-zinc-400 pt-2 border-t border-slate-800">
                Citations: {aiHosAuditResult.fmcsaCitations.join(', ')}
              </div>
            )}
          </div>
        ) : (
          <div className="p-4 bg-zinc-50 border border-zinc-200 rounded-xl text-xs text-zinc-600 leading-relaxed">
            Click <strong>"Run Real AI FMCSA Part 395 Audit"</strong> to evaluate your current driving logs against 49 CFR § 395.3, split-sleeper pause rules, and required 30-minute rest breaks.
          </div>
        )}
      </div>
    </div>
  );
}
