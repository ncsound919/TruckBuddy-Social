import React from 'react';
import { Mail, Lock } from 'lucide-react';

export function AuthFormInputs({
  authEmail, setAuthEmail,
  authPassword, setAuthPassword,
  isSignUpMode,
  formName, setFormName,
  formCdl, setFormCdl,
  formRig, setFormRig,
  formLane, setFormLane
}: any) {
  return (
    <>
      <div className="space-y-3">
        <div>
          <label className="block text-[10px] font-bold uppercase tracking-wider text-zinc-500 mb-1">Email Address</label>
          <div className="relative">
            <Mail className="absolute left-3.5 top-3 w-4 h-4 text-zinc-400" />
            <input required type="email" placeholder="driver@hauler.com" value={authEmail} onChange={(e) => setAuthEmail(e.target.value)} className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-zinc-200 focus:outline-none focus:ring-2 focus:ring-amber-500 text-xs text-slate-800" />
          </div>
        </div>
        <div>
          <label className="block text-[10px] font-bold uppercase tracking-wider text-zinc-500 mb-1">Password</label>
          <div className="relative">
            <Lock className="absolute left-3.5 top-3 w-4 h-4 text-zinc-400" />
            <input required type="password" placeholder="••••••••" value={authPassword} onChange={(e) => setAuthPassword(e.target.value)} className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-zinc-200 focus:outline-none focus:ring-2 focus:ring-amber-500 text-xs text-slate-800" />
          </div>
        </div>
      </div>

      {isSignUpMode && (
        <div className="space-y-4 border-t border-zinc-100 pt-4 mt-2">
          <h3 className="text-[11px] font-extrabold text-slate-800 uppercase tracking-wider">CDL & Rig Details</h3>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-zinc-400 mb-1">Driver Handle</label>
              <input required type="text" placeholder="e.g. Willie 'Overdrive' Nelson" value={formName} onChange={(e) => setFormName(e.target.value)} className="w-full px-3.5 py-2 rounded-xl border border-zinc-200 text-xs" />
            </div>
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-zinc-400 mb-1">CDL License Class</label>
              <select value={formCdl} onChange={(e) => setFormCdl(e.target.value as any)} className="w-full px-3.5 py-2 rounded-xl border border-zinc-200 text-xs bg-white">
                <option value="A">Class A (Combo / Semi)</option>
                <option value="B">Class B (Heavy Straight)</option>
                <option value="C">Class C (Hazmat/Passenger)</option>
                <option value="None">None (Dispatcher/Broker)</option>
              </select>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-zinc-400 mb-1">Current Rig</label>
              <input required type="text" placeholder="e.g. 2021 Peterbilt 389" value={formRig} onChange={(e) => setFormRig(e.target.value)} className="w-full px-3.5 py-2 rounded-xl border border-zinc-200 text-xs" />
            </div>
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-zinc-400 mb-1">Primary Route/Lane</label>
              <input required type="text" placeholder="e.g. I-80 Midwest to West" value={formLane} onChange={(e) => setFormLane(e.target.value)} className="w-full px-3.5 py-2 rounded-xl border border-zinc-200 text-xs" />
            </div>
          </div>
        </div>
      )}
    </>
  );
}
