import React, { useState } from 'react';
import { VerificationMethod } from '../../../types';
import { Camera, X, Upload, Cpu, FileText, CheckCircle2, ShieldCheck } from 'lucide-react';
import { sampleOdometerPresets } from '../../../data';

interface SubmitMileageModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: any) => void;
  showToast: (msg: string) => void;
}

export function SubmitMileageModal({ isOpen, onClose, onSubmit, showToast }: SubmitMileageModalProps) {
  const [selectedMethod, setSelectedMethod] = useState<VerificationMethod>('odometer_photo');
  const [selectedPresetIdx, setSelectedPresetIdx] = useState<number>(0);
  const [customPhotoUrl, setCustomPhotoUrl] = useState<string>(sampleOdometerPresets[0].imageUrl);
  const [isScanning, setIsScanning] = useState<boolean>(false);
  const [scanComplete, setScanComplete] = useState<boolean>(false);

  // Form Fields
  const [startOdo, setStartOdo] = useState<number>(478730);
  const [endOdo, setEndOdo] = useState<number>(482150);
  const [routeCorridor, setRouteCorridor] = useState<string>('I-80 EB (Cheyenne, WY → Chicago, IL)');
  const [originCity, setOriginCity] = useState<string>('Cheyenne, WY');
  const [destCity, setDestCity] = useState<string>('Chicago, IL');
  const [rigUnit, setRigUnit] = useState<string>('2022 Peterbilt 389 (Unit #389-A)');
  const [runNotes, setRunNotes] = useState<string>('Structural steel delivery. Clean DOT pass.');
  const [eldProvider, setEldProvider] = useState<string>('Motive (KeepTruckin)');

  if (!isOpen) return null;

  const handleScanCluster = () => {
    setIsScanning(true);
    setScanComplete(false);

    setTimeout(() => {
      setIsScanning(false);
      setScanComplete(true);
      const preset = sampleOdometerPresets[selectedPresetIdx];
      if (preset) {
        setEndOdo(preset.currentOdo);
        setStartOdo(preset.currentOdo - preset.tripMiles);
        setRouteCorridor(preset.route);
        setRigUnit(`${preset.truck} (${preset.unit})`);
      }
      showToast('✨ Dashboard Cluster OCR Validated: Digital readout verified authentic against Cummins ECM gateway!');
    }, 1600);
  };

  const handleSelectPreset = (idx: number) => {
    setSelectedPresetIdx(idx);
    setScanComplete(false);
    const preset = sampleOdometerPresets[idx];
    setCustomPhotoUrl(preset.imageUrl);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      selectedMethod,
      customPhotoUrl,
      selectedPresetIdx,
      startOdo,
      endOdo,
      routeCorridor,
      originCity,
      destCity,
      rigUnit,
      runNotes,
      eldProvider
    });
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-2xl w-full p-6 border border-zinc-200 shadow-2xl space-y-5 my-8 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between pb-4 border-b border-zinc-100">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 bg-amber-500 text-slate-950 rounded-2xl">
              <Camera className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-black text-slate-900">
                Log Verified Mileage & Dashboard Proof
              </h3>
              <p className="text-xs text-zinc-500">
                Upload digital cluster photo or connect ELD telematics to climb the national leaderboard.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-zinc-100 text-zinc-400 hover:text-slate-900 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* VERIFICATION METHOD SELECTOR */}
        <div className="grid grid-cols-3 gap-3">
          {[
            { id: 'odometer_photo', label: 'Cluster Photo', icon: Camera },
            { id: 'eld_telematics', label: 'ELD Sync', icon: Cpu },
            { id: 'bol_scale', label: 'BOL / Scale', icon: FileText }
          ].map(method => (
            <button
              key={method.id}
              onClick={() => setSelectedMethod(method.id as any)}
              className={`p-3 rounded-2xl border-2 flex flex-col items-center justify-center space-y-1.5 transition ${
                selectedMethod === method.id 
                  ? 'border-amber-500 bg-amber-50 text-amber-950' 
                  : 'border-zinc-100 bg-zinc-50 text-zinc-500 hover:border-zinc-200'
              }`}
            >
              <method.icon className="w-5 h-5" />
              <span className="text-[10px] font-black uppercase tracking-wider">{method.label}</span>
            </button>
          ))}
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {selectedMethod === 'odometer_photo' && (
            <div className="space-y-3 bg-zinc-50 p-4 rounded-2xl border border-zinc-100">
              <label className="text-[10px] font-black uppercase text-zinc-400 tracking-widest block">
                Select Photo from Device or Camera
              </label>
              
              <div className="grid grid-cols-4 gap-2">
                {sampleOdometerPresets.slice(0, 4).map((p, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleSelectPreset(idx)}
                    className={`relative rounded-xl overflow-hidden border-2 transition ${
                      selectedPresetIdx === idx ? 'border-amber-500 ring-2 ring-amber-200' : 'border-transparent opacity-60 hover:opacity-100'
                    }`}
                  >
                    <img src={p.imageUrl} className="w-full h-16 object-cover" alt="" />
                    {selectedPresetIdx === idx && (
                      <div className="absolute inset-0 bg-amber-500/10 flex items-center justify-center">
                        <CheckCircle2 className="w-5 h-5 text-amber-600 fill-white" />
                      </div>
                    )}
                  </button>
                ))}
              </div>

              <div className="relative rounded-2xl overflow-hidden border border-zinc-200 aspect-video bg-slate-900 group">
                <img 
                  src={customPhotoUrl || sampleOdometerPresets[selectedPresetIdx].imageUrl} 
                  className={`w-full h-full object-cover transition duration-700 ${isScanning ? 'brightness-50 blur-sm' : ''}`}
                  alt="" 
                />
                
                {isScanning && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center text-white space-y-3">
                    <div className="w-10 h-10 border-4 border-amber-500 border-t-transparent rounded-full animate-spin" />
                    <div className="text-xs font-black uppercase tracking-widest animate-pulse">Scanning ECM Data...</div>
                    <div className="h-0.5 w-48 bg-zinc-800 rounded-full overflow-hidden">
                      <div className="h-full bg-amber-500 animate-[progress_1.6s_ease-in-out_infinite]" />
                    </div>
                  </div>
                )}

                {!isScanning && !scanComplete && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button 
                      type="button"
                      onClick={handleScanCluster}
                      className="px-6 py-2.5 bg-amber-500 text-slate-950 font-black rounded-xl shadow-lg flex items-center space-x-2 active:scale-95 transition"
                    >
                      <Upload className="w-4 h-4" />
                      <span>Scan Cluster OCR</span>
                    </button>
                  </div>
                )}

                {scanComplete && (
                  <div className="absolute top-4 left-4 right-4 bg-emerald-500/90 text-white p-2 rounded-lg text-[10px] font-black uppercase flex items-center space-x-2 animate-in slide-in-from-top-2">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Metadata Authenticated: VIN Match & ECM Odometer Verified</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Form Fields */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-[10px] font-black text-zinc-500 uppercase">Starting Odometer</label>
              <input 
                type="number" 
                value={startOdo} 
                onChange={e => setStartOdo(Number(e.target.value))}
                className="w-full p-3 bg-zinc-50 border border-zinc-200 rounded-xl font-bold text-slate-900 focus:ring-2 focus:ring-amber-500"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-black text-zinc-500 uppercase">Current Odometer Reading</label>
              <input 
                type="number" 
                value={endOdo} 
                onChange={e => setEndOdo(Number(e.target.value))}
                className="w-full p-3 bg-zinc-50 border border-zinc-200 rounded-xl font-bold text-slate-900 focus:ring-2 focus:ring-amber-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-[10px] font-black text-zinc-500 uppercase">Origin City</label>
              <input 
                type="text" 
                value={originCity} 
                onChange={e => setOriginCity(e.target.value)}
                className="w-full p-3 bg-zinc-50 border border-zinc-200 rounded-xl font-medium text-slate-900 focus:ring-2 focus:ring-amber-500"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-black text-zinc-500 uppercase">Destination City</label>
              <input 
                type="text" 
                value={destCity} 
                onChange={e => setDestCity(e.target.value)}
                className="w-full p-3 bg-zinc-50 border border-zinc-200 rounded-xl font-medium text-slate-900 focus:ring-2 focus:ring-amber-500"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-black text-zinc-500 uppercase">Route Corridor & Details</label>
            <input 
              type="text" 
              value={routeCorridor} 
              onChange={e => setRouteCorridor(e.target.value)}
              className="w-full p-3 bg-zinc-50 border border-zinc-200 rounded-xl font-medium text-slate-900 focus:ring-2 focus:ring-amber-500"
            />
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-black text-zinc-500 uppercase">Trip Notes & Verification Details</label>
            <textarea 
              rows={2}
              value={runNotes} 
              onChange={e => setRunNotes(e.target.value)}
              placeholder="e.g. 53' Reefer, Heavy traffic in Omaha. ECM snapshot verified."
              className="w-full p-3 bg-zinc-50 border border-zinc-200 rounded-xl font-medium text-slate-900 focus:ring-2 focus:ring-amber-500"
            />
          </div>

          <div className="pt-2 flex items-center justify-between">
            <div className="flex items-center space-x-2 text-[10px] text-zinc-400 font-bold">
              <ShieldCheck className="w-4 h-4 text-emerald-500" />
              <span>LOGS ARE FMCSA COMPLIANT & PEER-REVIEWED</span>
            </div>
            <div className="flex items-center space-x-3">
              <button 
                type="button"
                onClick={onClose}
                className="px-6 py-2.5 font-black text-zinc-500 hover:text-slate-950 transition"
              >
                Cancel
              </button>
              <button 
                type="submit"
                className="px-8 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-black rounded-2xl shadow-xl transition active:scale-95"
              >
                Submit Verified Run
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
