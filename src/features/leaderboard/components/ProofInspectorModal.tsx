import React from 'react';
import { MileageProof } from '../../../types';
import { X, ShieldCheck, MapPin, Calendar, Truck, Clock } from 'lucide-react';

interface ProofInspectorModalProps {
  proof: MileageProof | null;
  onClose: () => void;
}

export function ProofInspectorModal({ proof, onClose }: ProofInspectorModalProps) {
  if (!proof) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/90 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-4xl w-full border border-zinc-200 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        <div className="flex flex-col md:flex-row h-full">
          {/* Left: Image Viewer */}
          <div className="md:w-3/5 bg-slate-950 flex items-center justify-center relative min-h-[400px]">
            {proof.proofImageUrl ? (
              <img 
                src={proof.proofImageUrl} 
                className="max-w-full max-h-[80vh] object-contain" 
                alt="Dashboard Cluster" 
              />
            ) : (
              <div className="text-center p-12 space-y-4">
                <div className="w-20 h-20 bg-slate-900 rounded-3xl mx-auto flex items-center justify-center border border-slate-800">
                  <ShieldCheck className="w-10 h-10 text-sky-400" />
                </div>
                <div className="text-white">
                  <h4 className="font-black text-lg">Direct ELD Telematics Proof</h4>
                  <p className="text-zinc-400 text-sm">Authenticated via {proof.eldProvider} API Gateway</p>
                </div>
              </div>
            )}
            
            <div className="absolute bottom-6 left-6 right-6 flex items-center justify-between">
              <div className="bg-black/60 backdrop-blur-md text-white px-4 py-2 rounded-2xl border border-white/10 text-xs font-black uppercase tracking-widest">
                Auth #{proof.verificationCode}
              </div>
              <div className="bg-emerald-500 text-white px-4 py-2 rounded-2xl shadow-lg text-xs font-black uppercase tracking-widest flex items-center space-x-2">
                <ShieldCheck className="w-4 h-4" />
                <span>Verified Match</span>
              </div>
            </div>
          </div>

          {/* Right: Metadata Panel */}
          <div className="md:w-2/5 p-8 space-y-6 flex flex-col">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <img src={proof.driverAvatar} className="w-12 h-12 rounded-2xl object-cover border border-zinc-100" alt="" />
                <div>
                  <h3 className="font-black text-slate-900">{proof.driverName}</h3>
                  <p className="text-xs text-zinc-500 font-bold uppercase tracking-tight">@{proof.driverHandle}</p>
                </div>
              </div>
              <button 
                onClick={onClose}
                className="p-2 hover:bg-zinc-100 rounded-xl text-zinc-400 transition"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="space-y-5">
              <div className="bg-zinc-50 rounded-2xl p-4 border border-zinc-100 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <span className="text-[10px] font-black text-zinc-400 uppercase">Miles Logged</span>
                    <p className="text-xl font-black text-slate-900">+{proof.milesLogged.toLocaleString()}</p>
                  </div>
                  <div className="space-y-1">
                    <span className="text-[10px] font-black text-zinc-400 uppercase">Method</span>
                    <p className="text-xs font-black text-slate-900 uppercase">{proof.method.replace('_', ' ')}</p>
                  </div>
                </div>
                
                <div className="h-px bg-zinc-200/60" />

                <div className="grid grid-cols-2 gap-4 text-[11px]">
                  <div className="space-y-0.5">
                    <span className="font-bold text-zinc-400">Start Odo</span>
                    <p className="font-black text-slate-800">{proof.odometerStart.toLocaleString()}</p>
                  </div>
                  <div className="space-y-0.5">
                    <span className="font-bold text-zinc-400">End Odo</span>
                    <p className="font-black text-slate-800">{proof.odometerEnd.toLocaleString()}</p>
                  </div>
                </div>
              </div>

              <div className="space-y-4 text-xs">
                <div className="flex items-start space-x-3">
                  <MapPin className="w-5 h-5 text-amber-500 shrink-0" />
                  <div className="space-y-0.5">
                    <span className="font-black text-slate-900">Route Corridor</span>
                    <p className="text-zinc-500 font-medium">{proof.routeCorridor}</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <Truck className="w-5 h-5 text-sky-500 shrink-0" />
                  <div className="space-y-0.5">
                    <span className="font-black text-slate-900">Equipment Unit</span>
                    <p className="text-zinc-500 font-medium">{proof.rigUnit}</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <Calendar className="w-5 h-5 text-emerald-500 shrink-0" />
                  <div className="space-y-0.5">
                    <span className="font-black text-slate-900">Date Logged</span>
                    <p className="text-zinc-500 font-medium">
                      {new Date(proof.dateLogged).toLocaleDateString(undefined, { 
                        weekday: 'long', 
                        year: 'numeric', 
                        month: 'long', 
                        day: 'numeric' 
                      })}
                    </p>
                  </div>
                </div>
                {proof.notes && (
                  <div className="bg-amber-50 border border-amber-100 p-4 rounded-2xl italic text-amber-900 font-medium leading-relaxed">
                    "{proof.notes}"
                  </div>
                )}
              </div>
            </div>

            <div className="mt-auto pt-6 border-t border-zinc-100">
              <button 
                onClick={onClose}
                className="w-full py-3 bg-slate-900 hover:bg-slate-800 text-white font-black rounded-2xl transition shadow-lg active:scale-95"
              >
                Close Verification Portal
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
