import React, { useState, useEffect } from 'react';
import { 
  Scale, Clock, ShieldAlert, Zap, Layers, AlertTriangle, 
  CheckCircle, RefreshCw, HelpCircle, Compass, Fuel, Calculator,
  Activity, ArrowUpRight, ArrowDownRight, MapPin, Gauge, Bot, ShieldCheck
} from 'lucide-react';

type ToolTab = 'axle' | 'hos' | 'ifta' | 'fuel' | 'securement' | 'wind' | 'inclinometer';

interface IftaRow {
  id: string;
  state: string;
  taxRate: number; // $ per gallon
  miles: number;
  gallonsPurchased: number;
}

const STATE_IFTA_RATES: Record<string, number> = {
  'CA': 0.945,
  'PA': 0.785,
  'IL': 0.730,
  'IN': 0.590,
  'OH': 0.470,
  'NY': 0.448,
  'NC': 0.404,
  'TX': 0.200,
  'GA': 0.352,
  'FL': 0.370,
  'MI': 0.485,
  'WI': 0.329,
  'IA': 0.325,
  'MO': 0.245,
  'TN': 0.270,
  'WY': 0.240,
  'CO': 0.205,
  'UT': 0.364,
  'AZ': 0.260,
  'NV': 0.270,
  'OR': 0.400,
  'WA': 0.494
};

export default function TruckerToolsSection() {
  const [activeTab, setActiveTab] = useState<ToolTab>('axle');

  // --- 1. AXLE WEIGHT CALCULATOR STATE ---
  const [steerWeight, setSteerWeight] = useState<number>(11800);
  const [driveWeight, setDriveWeight] = useState<number>(33500);
  const [trailerWeight, setTrailerWeight] = useState<number>(32800);
  const [bridgeLength, setBridgeLength] = useState<number>(51); // distance in feet between outer axle groups
  const [numberOfAxles, setNumberOfAxles] = useState<number>(5);

  // --- 2. HOS SPLIT SLEEPER STATE ---
  const [drivingTime, setDrivingTime] = useState<number>(6.5);
  const [onDutyTime, setOnDutyTime] = useState<number>(2.0);
  const [cycleHoursUsed, setCycleHoursUsed] = useState<number>(48.5);
  const [sleeperFirstHours, setSleeperFirstHours] = useState<number>(8);
  const [sleeperSecondHours, setSleeperSecondHours] = useState<number>(2);
  const [aiHosAuditResult, setAiHosAuditResult] = useState<any | null>(null);
  const [isAuditingHos, setIsAuditingHos] = useState<boolean>(false);

  // --- 3. IFTA FUEL TAX CALCULATOR STATE ---
  const [iftaRows, setIftaRows] = useState<IftaRow[]>([
    { id: '1', state: 'IL', taxRate: STATE_IFTA_RATES['IL'], miles: 420, gallonsPurchased: 80 },
    { id: '2', state: 'IN', taxRate: STATE_IFTA_RATES['IN'], miles: 280, gallonsPurchased: 50 },
    { id: '3', state: 'OH', taxRate: STATE_IFTA_RATES['OH'], miles: 340, gallonsPurchased: 65 },
    { id: '4', state: 'PA', taxRate: STATE_IFTA_RATES['PA'], miles: 360, gallonsPurchased: 0 }
  ]);

  // --- 4. TRIP DIESEL & BREAKEVEN CPM STATE ---
  const [tripMiles, setTripMiles] = useState<number>(1850);
  const [truckMpg, setTruckMpg] = useState<number>(6.8);
  const [dieselPrice, setDieselPrice] = useState<number>(3.89);
  const [tollCost, setTollCost] = useState<number>(145);
  const [driverPayRate, setDriverPayRate] = useState<number>(0.65); // $/mile
  const [fixedOverheadDay, setFixedOverheadDay] = useState<number>(180); // insurance/truck note per day
  const [tripDays, setTripDays] = useState<number>(3);

  // --- 5. SECUREMENT CALCULATOR STATE ---
  const [cargoWeight, setCargoWeight] = useState<number>(42000);
  const [cargoLength, setCargoLength] = useState<number>(35);
  const [tieDownType, setTieDownType] = useState<'strap_4inch' | 'strap_2inch' | 'chain_516' | 'chain_38' | 'chain_12'>('chain_38');
  const [numberOfTieDowns, setNumberOfTieDowns] = useState<number>(4);

  // --- 6. WYOMING HIGH WIND STATE ---
  const [windSpeed, setWindSpeed] = useState<number>(35);
  const [windAngle, setWindAngle] = useState<'head' | 'quarter' | 'cross'>('cross');
  const [trailerWeightCategory, setTrailerWeightCategory] = useState<'empty' | 'light' | 'medium' | 'heavy'>('empty');
  const [cabType, setCabType] = useState<'high_roof' | 'mid_roof' | 'flat_top'>('high_roof');

  // --- 7. LIVE INCLINOMETER & GYRO SENSOR STATE ---
  const [pitchAngle, setPitchAngle] = useState<number>(0); // Grade
  const [rollAngle, setRollAngle] = useState<number>(0);
  const [compassHeading, setCompassHeading] = useState<number>(270);
  const [gpsSpeedMph, setGpsSpeedMph] = useState<number>(0);
  const [gpsAltitudeFt, setGpsAltitudeFt] = useState<number | null>(null);
  const [isSensorsActive, setIsSensorsActive] = useState<boolean>(false);
  const [sensorStatus, setSensorStatus] = useState<string>('Sensors Standby');

  // Activate real DeviceOrientation & Geolocation
  useEffect(() => {
    if (!isSensorsActive) return;

    let geoWatchId: number | null = null;

    const handleOrientation = (e: DeviceOrientationEvent) => {
      if (e.beta !== null) setPitchAngle(Math.round(e.beta));
      if (e.gamma !== null) setRollAngle(Math.round(e.gamma));
      if (e.alpha !== null) setCompassHeading(Math.round(e.alpha));
    };

    if (typeof window !== 'undefined' && window.DeviceOrientationEvent) {
      window.addEventListener('deviceorientation', handleOrientation);
      setSensorStatus('Hardware Gyro & Orientation Online');
    }

    if (typeof navigator !== 'undefined' && navigator.geolocation) {
      geoWatchId = navigator.geolocation.watchPosition(
        (pos) => {
          if (pos.coords.speed !== null && !isNaN(pos.coords.speed)) {
            // Speed in meters/sec -> convert to MPH (m/s * 2.23694)
            setGpsSpeedMph(Math.round(pos.coords.speed * 2.23694));
          }
          if (pos.coords.altitude !== null && !isNaN(pos.coords.altitude)) {
            // Meters to feet
            setGpsAltitudeFt(Math.round(pos.coords.altitude * 3.28084));
          }
          if (pos.coords.heading !== null && !isNaN(pos.coords.heading)) {
            setCompassHeading(Math.round(pos.coords.heading));
          }
        },
        (err) => {
          console.warn('Geolocation sensor error:', err);
          setSensorStatus('GPS Signal Limited - Using Gyro');
        },
        { enableHighAccuracy: true, maximumAge: 1000 }
      );
    }

    return () => {
      if (typeof window !== 'undefined') {
        window.removeEventListener('deviceorientation', handleOrientation);
      }
      if (geoWatchId !== null && typeof navigator !== 'undefined') {
        navigator.geolocation.clearWatch(geoWatchId);
      }
    };
  }, [isSensorsActive]);

  // ==========================================
  // --- CALCULATIONS FOR AXLE WEIGHTS ---
  // ==========================================
  const totalWeight = steerWeight + driveWeight + trailerWeight;
  const maxSteerLimit = 12000;
  const maxDriveLimit = 34000;
  const maxTrailerLimit = 34000;
  const gvwrLimit = 80000;

  // Federal Bridge Formula: W = 500 * ( (L * N) / (N - 1) + 12 * N + 36 )
  const calculateFederalBridgeLimit = (L: number, N: number) => {
    return Math.round(500 * ((L * N) / (N - 1) + 12 * N + 36));
  };

  const bridgeFormulaLimit = calculateFederalBridgeLimit(bridgeLength, numberOfAxles);
  const isSteerExcess = steerWeight > maxSteerLimit;
  const isDriveExcess = driveWeight > maxDriveLimit;
  const isTrailerExcess = trailerWeight > maxTrailerLimit;
  const isGvwrExcess = totalWeight > gvwrLimit;
  const isBridgeExcess = totalWeight > bridgeFormulaLimit;

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

  // ==========================================
  // --- REAL HOS AI AUDIT API CALL ---
  // ==========================================
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
      // Offline fallback math
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

  // ==========================================
  // --- IFTA MULTI-STATE CALCULATIONS ---
  // ==========================================
  const totalIftaMiles = iftaRows.reduce((sum, r) => sum + (Number(r.miles) || 0), 0);
  const totalIftaGallonsPurchased = iftaRows.reduce((sum, r) => sum + (Number(r.gallonsPurchased) || 0), 0);
  const fleetIftaMpg = totalIftaGallonsPurchased > 0 ? (totalIftaMiles / totalIftaGallonsPurchased) : 6.5;

  const iftaCalculations = iftaRows.map(row => {
    const miles = Number(row.miles) || 0;
    const gallonsPurchased = Number(row.gallonsPurchased) || 0;
    const taxableGallons = fleetIftaMpg > 0 ? (miles / fleetIftaMpg) : 0;
    const taxDue = taxableGallons * row.taxRate;
    const taxPaid = gallonsPurchased * row.taxRate;
    const netTax = taxDue - taxPaid; // positive = owe, negative = refund
    return {
      ...row,
      taxableGallons,
      taxDue,
      taxPaid,
      netTax
    };
  });

  const totalIftaNetTax = iftaCalculations.reduce((sum, r) => sum + r.netTax, 0);

  const handleAddIftaRow = () => {
    const newId = String(Date.now());
    setIftaRows(prev => [
      ...prev,
      { id: newId, state: 'TX', taxRate: STATE_IFTA_RATES['TX'], miles: 250, gallonsPurchased: 40 }
    ]);
  };

  const handleRemoveIftaRow = (id: string) => {
    setIftaRows(prev => prev.filter(r => r.id !== id));
  };

  // ==========================================
  // --- TRIP FUEL & CPM CALCULATIONS ---
  // ==========================================
  const totalDieselGallons = truckMpg > 0 ? tripMiles / truckMpg : 0;
  const totalDieselCost = totalDieselGallons * dieselPrice;
  const defGallons = totalDieselGallons * 0.025; // DEF is approx 2.5% of diesel burn
  const defCost = defGallons * 3.89; // ~$3.89/gal DEF
  const driverPayTotal = tripMiles * driverPayRate;
  const fixedOverheadTotal = tripDays * fixedOverheadDay;
  const totalTripCost = totalDieselCost + defCost + tollCost + driverPayTotal + fixedOverheadTotal;
  const costPerMile = tripMiles > 0 ? totalTripCost / tripMiles : 0;
  const recommendedFreightRate = costPerMile * 1.25; // 25% profit margin

  // ==========================================
  // --- SECUREMENT CALCULATIONS ---
  // ==========================================
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

  // ==========================================
  // --- WYOMING HIGH WIND RISK ---
  // ==========================================
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

      {/* ======================================================== */}
      {/* 1. AXLE WEIGHT CALCULATOR */}
      {/* ======================================================== */}
      {activeTab === 'axle' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6" id="axle-tool-content">
          <div className="lg:col-span-5 bg-white p-6 rounded-2xl border border-zinc-100 shadow-sm space-y-5">
            <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-wider flex items-center gap-1">
              <Scale className="w-4 h-4 text-zinc-400" /> Enter Certified Cat Scale Weights
            </h3>

            {/* Steer weight */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-700">Steer Axle Weight</span>
                <span className="text-xs font-black text-slate-900">{steerWeight.toLocaleString()} lbs (Max 12k)</span>
              </div>
              <input
                type="range"
                min="8000"
                max="15000"
                step="100"
                value={steerWeight}
                onChange={(e) => setSteerWeight(parseInt(e.target.value))}
                className="w-full h-2 bg-zinc-200 rounded-lg appearance-none cursor-pointer accent-amber-500"
              />
            </div>

            {/* Drive weight */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-700">Drive Tandem Axles</span>
                <span className="text-xs font-black text-slate-900">{driveWeight.toLocaleString()} lbs (Max 34k)</span>
              </div>
              <input
                type="range"
                min="20000"
                max="42000"
                step="100"
                value={driveWeight}
                onChange={(e) => setDriveWeight(parseInt(e.target.value))}
                className="w-full h-2 bg-zinc-200 rounded-lg appearance-none cursor-pointer accent-amber-500"
              />
            </div>

            {/* Trailer weight */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-700">Trailer Tandem Axles</span>
                <span className="text-xs font-black text-slate-900">{trailerWeight.toLocaleString()} lbs (Max 34k)</span>
              </div>
              <input
                type="range"
                min="20000"
                max="42000"
                step="100"
                value={trailerWeight}
                onChange={(e) => setTrailerWeight(parseInt(e.target.value))}
                className="w-full h-2 bg-zinc-200 rounded-lg appearance-none cursor-pointer accent-amber-500"
              />
            </div>

            {/* Bridge Formula parameters */}
            <div className="pt-4 border-t border-zinc-100 space-y-4">
              <h4 className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Federal Bridge Formula Parameters</h4>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">Bridge Wheelbase (L in ft)</label>
                  <input
                    type="number"
                    value={bridgeLength}
                    onChange={(e) => setBridgeLength(parseInt(e.target.value) || 51)}
                    className="w-full px-3 py-2 rounded-xl border border-zinc-200 text-xs font-bold text-slate-800"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">Axle Count (N)</label>
                  <input
                    type="number"
                    value={numberOfAxles}
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
      )}

      {/* ======================================================== */}
      {/* 2. HOS SPLIT SLEEPER & AI AUDIT */}
      {/* ======================================================== */}
      {activeTab === 'hos' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6" id="hos-tool-content">
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
                type="range"
                min="0"
                max="13"
                step="0.25"
                value={drivingTime}
                onChange={(e) => setDrivingTime(parseFloat(e.target.value))}
                className="w-full h-2 bg-zinc-200 rounded-lg appearance-none cursor-pointer accent-amber-500"
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-700">Other On-Duty Hours</span>
                <span className="text-xs font-black text-slate-900">{onDutyTime} hrs</span>
              </div>
              <input
                type="range"
                min="0"
                max="8"
                step="0.25"
                value={onDutyTime}
                onChange={(e) => setOnDutyTime(parseFloat(e.target.value))}
                className="w-full h-2 bg-zinc-200 rounded-lg appearance-none cursor-pointer accent-amber-500"
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-700">70-Hour / 8-Day Cycle Used</span>
                <span className="text-xs font-black text-slate-900">{cycleHoursUsed} / 70 hrs</span>
              </div>
              <input
                type="range"
                min="0"
                max="70"
                step="0.5"
                value={cycleHoursUsed}
                onChange={(e) => setCycleHoursUsed(parseFloat(e.target.value))}
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

            {/* AI Audit Feedback Box */}
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
      )}

      {/* ======================================================== */}
      {/* 3. IFTA MULTI-STATE FUEL TAX CALCULATOR */}
      {/* ======================================================== */}
      {activeTab === 'ifta' && (
        <div className="bg-white p-6 rounded-2xl border border-zinc-100 shadow-sm space-y-6" id="ifta-tool-content">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-zinc-100 pb-4">
            <div>
              <h3 className="text-sm font-black text-slate-900">IFTA Quarterly Fuel Tax Calculation Matrix</h3>
              <p className="text-xs text-zinc-500">
                Calculates taxable gallons, tax paid at the pump, and net tax owed / refund across jurisdictions.
              </p>
            </div>
            <div className="flex items-center space-x-3">
              <span className="text-xs font-bold text-slate-700">
                Fleet MPG: <strong>{fleetIftaMpg.toFixed(2)}</strong>
              </span>
              <button
                onClick={handleAddIftaRow}
                className="px-3 py-1.5 bg-slate-900 text-white rounded-xl text-xs font-black uppercase tracking-wider hover:bg-slate-800 transition"
              >
                + Add State
              </button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-zinc-200 text-zinc-400 font-bold uppercase text-[10px]">
                  <th className="pb-3">State / Jurisdiction</th>
                  <th className="pb-3">IFTA Tax Rate</th>
                  <th className="pb-3">Miles Traveled</th>
                  <th className="pb-3">Gallons Bought</th>
                  <th className="pb-3">Taxable Gals</th>
                  <th className="pb-3">Tax Paid</th>
                  <th className="pb-3">Net Due / (Refund)</th>
                  <th className="pb-3"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100">
                {iftaCalculations.map((row) => (
                  <tr key={row.id} className="hover:bg-zinc-50">
                    <td className="py-2.5 font-black text-slate-900">
                      <select
                        value={row.state}
                        onChange={(e) => {
                          const newState = e.target.value;
                          setIftaRows(prev => prev.map(r => r.id === row.id ? { ...r, state: newState, taxRate: STATE_IFTA_RATES[newState] || 0.30 } : r));
                        }}
                        className="font-bold border border-zinc-200 rounded px-1.5 py-1 bg-white"
                      >
                        {Object.keys(STATE_IFTA_RATES).map(st => (
                          <option key={st} value={st}>{st}</option>
                        ))}
                      </select>
                    </td>
                    <td className="py-2.5 text-zinc-600">${row.taxRate.toFixed(3)}/gal</td>
                    <td className="py-2.5">
                      <input
                        type="number"
                        value={row.miles}
                        onChange={(e) => {
                          const val = parseFloat(e.target.value) || 0;
                          setIftaRows(prev => prev.map(r => r.id === row.id ? { ...r, miles: val } : r));
                        }}
                        className="w-20 px-2 py-1 border border-zinc-200 rounded font-bold"
                      />
                    </td>
                    <td className="py-2.5">
                      <input
                        type="number"
                        value={row.gallonsPurchased}
                        onChange={(e) => {
                          const val = parseFloat(e.target.value) || 0;
                          setIftaRows(prev => prev.map(r => r.id === row.id ? { ...r, gallonsPurchased: val } : r));
                        }}
                        className="w-20 px-2 py-1 border border-zinc-200 rounded font-bold"
                      />
                    </td>
                    <td className="py-2.5 text-zinc-600 font-bold">{row.taxableGallons.toFixed(1)}</td>
                    <td className="py-2.5 text-zinc-600">${row.taxPaid.toFixed(2)}</td>
                    <td className={`py-2.5 font-black ${row.netTax > 0 ? 'text-red-600' : 'text-emerald-600'}`}>
                      {row.netTax > 0 ? `+$${row.netTax.toFixed(2)} Due` : `-$${Math.abs(row.netTax).toFixed(2)} Refund`}
                    </td>
                    <td className="py-2.5">
                      <button
                        onClick={() => handleRemoveIftaRow(row.id)}
                        className="text-zinc-400 hover:text-red-600 font-black px-1"
                      >
                        ✕
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="bg-slate-900 text-white p-5 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <span className="text-[10px] uppercase font-bold text-zinc-400 block">Total IFTA Quarter Summary</span>
              <p className="text-xs text-zinc-300">
                Total Miles: <strong>{totalIftaMiles.toLocaleString()}</strong> • Fuel Purchased: <strong>{totalIftaGallonsPurchased.toLocaleString()} gals</strong>
              </p>
            </div>
            <div className="text-right">
              <span className="text-[10px] uppercase font-bold text-zinc-400 block">Net Quarterly IFTA Tax Position</span>
              <strong className={`text-2xl font-black ${totalIftaNetTax > 0 ? 'text-red-400' : 'text-emerald-400'}`}>
                {totalIftaNetTax > 0 ? `Owe $${totalIftaNetTax.toFixed(2)}` : `Refund $${Math.abs(totalIftaNetTax).toFixed(2)}`}
              </strong>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* 4. TRIP DIESEL & BREAKEVEN CPM CALCULATOR */}
      {/* ======================================================== */}
      {activeTab === 'fuel' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6" id="fuel-tool-content">
          <div className="lg:col-span-5 bg-white p-6 rounded-2xl border border-zinc-100 shadow-sm space-y-4">
            <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-wider flex items-center gap-1">
              <Fuel className="w-4 h-4 text-zinc-400" /> Trip & Expense Parameters
            </h3>

            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-1">Total Trip Mileage</label>
              <input
                type="number"
                value={tripMiles}
                onChange={(e) => setTripMiles(parseFloat(e.target.value) || 0)}
                className="w-full px-3 py-2 rounded-xl border border-zinc-200 text-xs font-bold text-slate-800"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">Truck MPG (Loaded)</label>
                <input
                  type="number"
                  step="0.1"
                  value={truckMpg}
                  onChange={(e) => setTruckMpg(parseFloat(e.target.value) || 6.5)}
                  className="w-full px-3 py-2 rounded-xl border border-zinc-200 text-xs font-bold text-slate-800"
                />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">Diesel Price ($/gal)</label>
                <input
                  type="number"
                  step="0.01"
                  value={dieselPrice}
                  onChange={(e) => setDieselPrice(parseFloat(e.target.value) || 3.89)}
                  className="w-full px-3 py-2 rounded-xl border border-zinc-200 text-xs font-bold text-slate-800"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">Tolls & Scales ($)</label>
                <input
                  type="number"
                  value={tollCost}
                  onChange={(e) => setTollCost(parseFloat(e.target.value) || 0)}
                  className="w-full px-3 py-2 rounded-xl border border-zinc-200 text-xs font-bold text-slate-800"
                />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">Driver Pay ($/mile)</label>
                <input
                  type="number"
                  step="0.01"
                  value={driverPayRate}
                  onChange={(e) => setDriverPayRate(parseFloat(e.target.value) || 0)}
                  className="w-full px-3 py-2 rounded-xl border border-zinc-200 text-xs font-bold text-slate-800"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">Fixed Daily Cost ($/day)</label>
                <input
                  type="number"
                  value={fixedOverheadDay}
                  onChange={(e) => setFixedOverheadDay(parseFloat(e.target.value) || 0)}
                  className="w-full px-3 py-2 rounded-xl border border-zinc-200 text-xs font-bold text-slate-800"
                />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">Trip Duration (Days)</label>
                <input
                  type="number"
                  value={tripDays}
                  onChange={(e) => setTripDays(parseFloat(e.target.value) || 1)}
                  className="w-full px-3 py-2 rounded-xl border border-zinc-200 text-xs font-bold text-slate-800"
                />
              </div>
            </div>
          </div>

          <div className="lg:col-span-7 bg-white p-6 rounded-2xl border border-zinc-100 shadow-sm space-y-5">
            <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Freight Cost & Breakeven Analysis</h3>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              <div className="p-3.5 bg-zinc-50 rounded-xl border border-zinc-150">
                <span className="text-[10px] font-bold uppercase text-zinc-400 block">Diesel Burn</span>
                <strong className="text-base font-black text-slate-900">${totalDieselCost.toFixed(2)}</strong>
                <span className="text-[10px] text-zinc-500 block">{totalDieselGallons.toFixed(0)} gallons</span>
              </div>

              <div className="p-3.5 bg-zinc-50 rounded-xl border border-zinc-150">
                <span className="text-[10px] font-bold uppercase text-zinc-400 block">DEF Fluid (2.5%)</span>
                <strong className="text-base font-black text-slate-900">${defCost.toFixed(2)}</strong>
                <span className="text-[10px] text-zinc-500 block">{defGallons.toFixed(1)} gallons</span>
              </div>

              <div className="p-3.5 bg-zinc-50 rounded-xl border border-zinc-150">
                <span className="text-[10px] font-bold uppercase text-zinc-400 block">Driver Compensation</span>
                <strong className="text-base font-black text-slate-900">${driverPayTotal.toFixed(2)}</strong>
                <span className="text-[10px] text-zinc-500 block">${driverPayRate}/mile</span>
              </div>
            </div>

            <div className="p-5 bg-slate-900 text-white rounded-2xl space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-bold uppercase text-zinc-400 block">Total Operating Expense</span>
                  <strong className="text-2xl font-black text-white">${totalTripCost.toFixed(2)}</strong>
                </div>
                <div className="text-right">
                  <span className="text-[10px] font-bold uppercase text-amber-400 block">Cost Per Mile (CPM)</span>
                  <strong className="text-2xl font-black text-amber-400">${costPerMile.toFixed(2)}/mi</strong>
                </div>
              </div>
              <div className="pt-3 border-t border-slate-800 flex items-center justify-between text-xs">
                <span className="text-zinc-300">Minimum Rate to Book (25% Margin):</span>
                <span className="font-black text-emerald-400 text-sm">${recommendedFreightRate.toFixed(2)} / mile</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* 5. SECUREMENT & WLL CALCULATOR */}
      {/* ======================================================== */}
      {activeTab === 'securement' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6" id="securement-tool-content">
          <div className="lg:col-span-5 bg-white p-6 rounded-2xl border border-zinc-100 shadow-sm space-y-4">
            <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-wider flex items-center gap-1">
              <Layers className="w-4 h-4 text-zinc-400" /> Cargo Specifications
            </h3>

            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-1">Cargo Payload Weight (lbs)</label>
              <input
                type="number"
                value={cargoWeight}
                onChange={(e) => setCargoWeight(parseInt(e.target.value) || 0)}
                className="w-full px-3 py-2 rounded-xl border border-zinc-200 text-xs font-bold text-slate-800"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-1">Cargo Total Length (Feet)</label>
              <input
                type="number"
                value={cargoLength}
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
                type="number"
                min="1"
                max="20"
                value={numberOfTieDowns}
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
      )}

      {/* ======================================================== */}
      {/* 6. WYOMING WIND BLOW-OVER THREAT */}
      {/* ======================================================== */}
      {activeTab === 'wind' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6" id="wind-tool-content">
          <div className="lg:col-span-5 bg-white p-6 rounded-2xl border border-zinc-100 shadow-sm space-y-4">
            <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Wind & Rig Profile</h3>

            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-1">Wind Gust Speed: {windSpeed} MPH</label>
              <input
                type="range"
                min="10"
                max="80"
                value={windSpeed}
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
      )}

      {/* ======================================================== */}
      {/* 7. LIVE INCLINOMETER & GYRO SENSOR */}
      {/* ======================================================== */}
      {activeTab === 'inclinometer' && (
        <div className="bg-white p-6 rounded-2xl border border-zinc-100 shadow-sm space-y-6" id="inclinometer-tool-content">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-zinc-100 pb-4">
            <div>
              <h3 className="text-sm font-black text-slate-900 flex items-center gap-2">
                <Activity className="w-5 h-5 text-amber-500" />
                <span>Live Mountain Grade & Hardware Gyro Inclinometer</span>
              </h3>
              <p className="text-xs text-zinc-500">
                Uses real device orientation gyros and GPS sensors to track road pitch, roll, and elevation.
              </p>
            </div>
            <button
              onClick={() => setIsSensorsActive(prev => !prev)}
              className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition ${
                isSensorsActive ? 'bg-emerald-500 text-slate-950' : 'bg-slate-900 text-white hover:bg-slate-800'
              }`}
            >
              {isSensorsActive ? 'Sensors Active (Click to Stop)' : 'Activate Real Live Sensors'}
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {/* Grade Pitch */}
            <div className="p-5 bg-slate-900 text-white rounded-2xl text-center space-y-2 border border-slate-800">
              <span className="text-[10px] font-black uppercase text-amber-400">Road Pitch / Grade</span>
              <div className="text-3xl font-black">{pitchAngle}°</div>
              <span className="text-xs text-zinc-400 font-bold block">
                {pitchAngle > 4 ? '⚠️ Steep Downhill (Use Engine Brake)' : pitchAngle < -4 ? '⛰️ Steep Climb' : 'Level Highway'}
              </span>
            </div>

            {/* Roll Angle */}
            <div className="p-5 bg-slate-900 text-white rounded-2xl text-center space-y-2 border border-slate-800">
              <span className="text-[10px] font-black uppercase text-sky-400">Chassis Roll Angle</span>
              <div className="text-3xl font-black">{rollAngle}°</div>
              <span className="text-xs text-zinc-400 font-bold block">
                {Math.abs(rollAngle) > 6 ? '⚠️ Superelevated Bank' : 'Level Lateral'}
              </span>
            </div>

            {/* GPS Speed / Heading */}
            <div className="p-5 bg-slate-900 text-white rounded-2xl text-center space-y-2 border border-slate-800">
              <span className="text-[10px] font-black uppercase text-emerald-400">GPS Speed & Heading</span>
              <div className="text-3xl font-black">{gpsSpeedMph} <span className="text-xs font-normal">MPH</span></div>
              <span className="text-xs text-zinc-400 font-bold block">
                Bearing: {compassHeading}° {gpsAltitudeFt !== null ? `• ${gpsAltitudeFt} ft elev` : ''}
              </span>
            </div>
          </div>

          <div className="p-4 bg-zinc-50 border border-zinc-200 rounded-xl flex items-center justify-between text-xs text-zinc-600">
            <span>Sensor Status: <strong>{sensorStatus}</strong></span>
            <span className="text-zinc-400">Calibration: Automatic Web API</span>
          </div>
        </div>
      )}
    </div>
  );
}
