import React, { useState } from 'react';
import { 
  Scale, Clock, ShieldAlert, Zap, Layers, 
  Calculator, Fuel, Compass
} from 'lucide-react';

// Sub-components
import { AxleWeightCalculator } from './components/AxleWeightCalculator';
import { HosAuditTool } from './components/HosAuditTool';
import { IftaCalculator } from './components/IftaCalculator';
import { FuelTripCalculator } from './components/FuelTripCalculator';
import { SecurementCalculator } from './components/SecurementCalculator';
import { WindRiskCalculator } from './components/WindRiskCalculator';
import { LiveInclinometer } from './components/LiveInclinometer';

type ToolTab = 'axle' | 'hos' | 'ifta' | 'fuel' | 'securement' | 'wind' | 'inclinometer';

export default function TruckerToolsSection() {
  const [activeTab, setActiveTab] = useState<ToolTab>('axle');

  const renderTool = () => {
    switch (activeTab) {
      case 'axle': return <AxleWeightCalculator />;
      case 'hos': return <HosAuditTool />;
      case 'ifta': return <IftaCalculator />;
      case 'fuel': return <FuelTripCalculator />;
      case 'securement': return <SecurementCalculator />;
      case 'wind': return <WindRiskCalculator />;
      case 'inclinometer': return <LiveInclinometer />;
      default: return <AxleWeightCalculator />;
    }
  };

  return (
    <div className="space-y-6" id="trucker-tools-section">
      {/* SECTION INTRO PANEL */}
      <div className="bg-slate-900 text-white rounded-2xl p-6 border border-slate-800 shadow-md">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <h2 className="text-lg font-black tracking-tight flex items-center space-x-2">
              <Zap className="w-5 h-5 text-amber-500 fill-amber-500" />
              <span>FMCSA Compliance, IFTA & Commercial Rig Engineering Suite</span>
            </h2>
            <p className="text-xs text-zinc-300">
              Math-verified engineering tools for interstate owner-operators, fleet dispatchers, and CDL drivers.
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <span className="bg-emerald-500 text-slate-950 text-[10px] font-black px-2.5 py-1 rounded-full uppercase tracking-wider">
              Real-Time Math
            </span>
            <span className="bg-slate-800 text-amber-400 border border-slate-700 text-[10px] font-black px-2.5 py-1 rounded-full uppercase tracking-wider">
              FMCSA v395.102
            </span>
          </div>
        </div>
      </div>

      {/* CALCULATOR CATEGORY TABS */}
      <div className="flex overflow-x-auto pb-2 scrollbar-none sm:flex-wrap gap-2" id="tools-tabs">
        {[
          { id: 'axle', label: 'Axle Sliding & Scales', icon: <Scale className="w-4 h-4 shrink-0" /> },
          { id: 'hos', label: 'HOS Sleeper & AI Audit', icon: <Clock className="w-4 h-4 shrink-0" /> },
          { id: 'ifta', label: 'Quarterly IFTA Fuel Tax', icon: <Calculator className="w-4 h-4 shrink-0" /> },
          { id: 'fuel', label: 'Trip Diesel & Breakeven CPM', icon: <Fuel className="w-4 h-4 shrink-0" /> },
          { id: 'securement', label: 'Flatbed Cargo Straps & WLL', icon: <Layers className="w-4 h-4 shrink-0" /> },
          { id: 'wind', label: 'Wyoming Wind Blow-Over', icon: <ShieldAlert className="w-4 h-4 shrink-0" /> },
          { id: 'inclinometer', label: 'Live Grade & Gyro Inclinometer', icon: <Compass className="w-4 h-4 shrink-0" /> }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as ToolTab)}
            className={`flex items-center space-x-2 px-3.5 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all border shrink-0 min-h-[44px] ${
              activeTab === tab.id
                ? 'bg-amber-500 text-slate-950 border-amber-500 shadow-sm'
                : 'bg-white text-zinc-600 border-zinc-200 hover:bg-zinc-50 hover:text-slate-900'
            }`}
          >
            {tab.icon}
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* RENDER ACTIVE TOOL */}
      {renderTool()}
    </div>
  );
}
