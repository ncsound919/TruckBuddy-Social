import React, { useState, useMemo } from 'react';
import { 
  Profile, 
  MileageLeaderboardEntry, 
  MileageProof, 
  MileageTimeframe, 
  DriverCategory, 
  VerificationMethod 
} from '../../types';
import { 
  sampleMileageLeaderboard, 
  sampleMileageProofs, 
  sampleOdometerPresets, 
  currentUserProfile 
} from '../../data';
import { 
  Trophy, 
  Medal, 
  Camera, 
  Upload, 
  CheckCircle2, 
  ShieldCheck, 
  Gauge, 
  Calendar, 
  TrendingUp, 
  Flame, 
  Radio, 
  FileText, 
  Cpu, 
  Search, 
  Filter, 
  User, 
  Eye, 
  Clock, 
  Sparkles, 
  AlertTriangle,
  Award,
  ChevronRight,
  ExternalLink,
  ThumbsUp,
  Truck
} from 'lucide-react';

interface MileageLeaderboardSectionProps {
  onViewProfile?: (profile: Profile) => void;
  onOpenDirectMessage?: (profile: Profile) => void;
  isDeadZone?: boolean;
}

export default function MileageLeaderboardSection({
  onViewProfile,
  onOpenDirectMessage,
  isDeadZone = false
}: MileageLeaderboardSectionProps) {
  // Leaderboard data state
  const [leaderboard, setLeaderboard] = useState<MileageLeaderboardEntry[]>(() => {
    const cached = localStorage.getItem('trucker_mileage_leaderboard');
    return cached ? JSON.parse(cached) : sampleMileageLeaderboard;
  });

  const [proofs, setProofs] = useState<MileageProof[]>(() => {
    const cached = localStorage.getItem('trucker_mileage_proofs');
    return cached ? JSON.parse(cached) : sampleMileageProofs;
  });

  // Filters
  const [timeframe, setTimeframe] = useState<MileageTimeframe>('weekly');
  const [categoryFilter, setCategoryFilter] = useState<DriverCategory>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [activeTab, setActiveTab] = useState<'leaderboard' | 'proof_feed'>('leaderboard');

  // Modal States
  const [isSubmitModalOpen, setIsSubmitModalOpen] = useState(false);
  const [inspectingProof, setInspectingProof] = useState<MileageProof | null>(null);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  // Form states for submission
  const [selectedMethod, setSelectedMethod] = useState<VerificationMethod>('odometer_photo');
  const [selectedPresetIdx, setSelectedPresetIdx] = useState<number>(0);
  const [customPhotoUrl, setCustomPhotoUrl] = useState<string>('');
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

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 4000);
  };

  // Helper to get active mileage based on timeframe
  const getMilesForTimeframe = (entry: MileageLeaderboardEntry, tf: MileageTimeframe) => {
    switch (tf) {
      case 'weekly':
        return entry.weeklyMiles;
      case 'monthly':
        return entry.monthlyMiles;
      case 'annual':
        return entry.annualMiles;
      case 'all_time':
        return entry.allTimeMiles;
    }
  };

  // Sorted and filtered leaderboard
  const filteredLeaderboard = useMemo(() => {
    let list = [...leaderboard];

    if (categoryFilter !== 'all') {
      list = list.filter(item => item.driverCategory === categoryFilter);
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(
        item =>
          item.driver.displayName.toLowerCase().includes(q) ||
          item.driver.username.toLowerCase().includes(q) ||
          item.driver.carrierName.toLowerCase().includes(q)
      );
    }

    // Sort descending by selected timeframe miles
    list.sort((a, b) => getMilesForTimeframe(b, timeframe) - getMilesForTimeframe(a, timeframe));

    // Re-assign ranks dynamically
    return list.map((item, idx) => ({
      ...item,
      rank: idx + 1
    }));
  }, [leaderboard, categoryFilter, timeframe, searchQuery]);

  // Current user's entry
  const currentUserEntry = filteredLeaderboard.find(e => e.driver.id === currentUserProfile.id);

  // Trigger OCR Cluster Scanner simulation
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

  // Handle Photo Preset Click
  const handleSelectPreset = (idx: number) => {
    setSelectedPresetIdx(idx);
    setScanComplete(false);
    const preset = sampleOdometerPresets[idx];
    setCustomPhotoUrl(preset.imageUrl);
  };

  // Submit Mileage Form
  const handleSubmitMileageProof = (e: React.FormEvent) => {
    e.preventDefault();

    if (endOdo <= startOdo) {
      showToast('⚠️ Error: New odometer reading must be greater than starting odometer!');
      return;
    }

    const milesDelta = endOdo - startOdo;
    const authCode = `ODO-${Math.floor(1000 + Math.random() * 9000)}-${currentUserProfile.username.substring(0, 4).toUpperCase()}`;

    const newProof: MileageProof = {
      id: `proof-${Date.now()}`,
      userId: currentUserProfile.id,
      driverName: currentUserProfile.displayName,
      driverHandle: currentUserProfile.username,
      driverAvatar: currentUserProfile.avatarUrl,
      method: selectedMethod,
      proofImageUrl: customPhotoUrl || sampleOdometerPresets[selectedPresetIdx].imageUrl,
      eldProvider: selectedMethod === 'eld_telematics' ? eldProvider : undefined,
      odometerStart: startOdo,
      odometerEnd: endOdo,
      milesLogged: milesDelta,
      routeCorridor,
      originCity,
      destinationCity: destCity,
      dateLogged: new Date().toISOString(),
      verificationBadge:
        selectedMethod === 'odometer_photo'
          ? 'Verified Odometer OCR'
          : selectedMethod === 'eld_telematics'
          ? 'ELD Telematics Direct Sync'
          : 'Certified Scale / BOL Stamp',
      verificationCode: authCode,
      status: 'verified',
      notes: runNotes,
      rigUnit,
      upvotes: 1
    };

    // Update proofs state & storage
    const updatedProofs = [newProof, ...proofs];
    setProofs(updatedProofs);
    localStorage.setItem('trucker_mileage_proofs', JSON.stringify(updatedProofs));

    // Update or insert into leaderboard
    setLeaderboard(prev => {
      let found = false;
      const updated = prev.map(entry => {
        if (entry.driver.id === currentUserProfile.id) {
          found = true;
          return {
            ...entry,
            weeklyMiles: entry.weeklyMiles + milesDelta,
            monthlyMiles: entry.monthlyMiles + milesDelta,
            annualMiles: entry.annualMiles + milesDelta,
            allTimeMiles: entry.allTimeMiles + milesDelta,
            verifiedProofsCount: entry.verifiedProofsCount + 1,
            latestProof: newProof,
            streakDays: entry.streakDays + 1
          };
        }
        return entry;
      });

      if (!found) {
        updated.push({
          id: `lead-${Date.now()}`,
          driver: currentUserProfile,
          rank: prev.length + 1,
          previousRank: prev.length + 1,
          weeklyMiles: milesDelta,
          monthlyMiles: milesDelta,
          annualMiles: milesDelta,
          allTimeMiles: milesDelta,
          driverCategory: 'owner_operator',
          verifiedProofsCount: 1,
          latestProof: newProof,
          avgMilesPerDay: 510,
          streakDays: 1
        });
      }

      localStorage.setItem('trucker_mileage_leaderboard', JSON.stringify(updated));
      return updated;
    });

    setIsSubmitModalOpen(false);
    showToast(`🏆 Run Logged! +${milesDelta.toLocaleString()} verified miles added to your national standing!`);
  };

  // Upvote proof
  const handleUpvoteProof = (proofId: string) => {
    setProofs(prev => {
      const updated = prev.map(p => {
        if (p.id === proofId) {
          return { ...p, upvotes: p.upvotes + 1 };
        }
        return p;
      });
      localStorage.setItem('trucker_mileage_proofs', JSON.stringify(updated));
      return updated;
    });
    showToast('👍 10-4 Verified: Road affirmation recorded for this driver!');
  };

  // Top 3 Podium
  const top3 = filteredLeaderboard.slice(0, 3);
  const remainingList = filteredLeaderboard.slice(3);

  return (
    <div className="space-y-6" id="mileage-leaderboard-root">
      {/* HEADER SECTION */}
      <div className="bg-white rounded-3xl p-6 border border-zinc-100 shadow-sm space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center space-x-3.5">
            <div className="p-3 bg-amber-500 text-slate-950 rounded-2xl shadow-sm">
              <Trophy className="w-7 h-7" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="text-xl font-black text-slate-900 tracking-tight">
                  National CDL Mileage Leaderboard
                </h2>
                <span className="bg-emerald-100 text-emerald-900 text-[10px] font-black uppercase px-2 py-0.5 rounded-md flex items-center space-x-1">
                  <ShieldCheck className="w-3 h-3 text-emerald-600" />
                  <span>Odometer Proof Verified</span>
                </span>
              </div>
              <p className="text-xs text-zinc-500">
                Track who is driving the most asphalt across America. All logs are authenticated via dashboard cluster photos, ELD telematics, and CAT scale stamps.
              </p>
            </div>
          </div>

          {/* ACTION BUTTON: LOG MILES */}
          <div className="flex items-center space-x-3">
            <button
              id="btn-log-mileage-proof"
              onClick={() => {
                setIsSubmitModalOpen(true);
                handleSelectPreset(0);
              }}
              className="px-5 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs rounded-2xl shadow-md flex items-center space-x-2 transition"
            >
              <Camera className="w-4 h-4" />
              <span>Log Miles / Submit Dashboard Proof</span>
            </button>
          </div>
        </div>

        {/* TIMEFRAME PILLS & TABS */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-3 border-t border-zinc-100 text-xs">
          <div className="flex items-center bg-zinc-100 p-1 rounded-2xl space-x-1">
            {[
              { id: 'weekly', label: 'Weekly Sprint' },
              { id: 'monthly', label: 'Monthly Grind' },
              { id: 'annual', label: 'Annual Iron Run (2026)' },
              { id: 'all_time', label: 'Million Milers Club' }
            ].map(tf => (
              <button
                key={tf.id}
                onClick={() => setTimeframe(tf.id as any)}
                className={`px-3 py-1.5 rounded-xl font-black transition ${
                  timeframe === tf.id ? 'bg-white text-slate-950 shadow-xs' : 'text-zinc-500 hover:text-slate-900'
                }`}
              >
                {tf.label}
              </button>
            ))}
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={() => setActiveTab('leaderboard')}
              className={`px-3 py-1.5 rounded-xl font-bold transition flex items-center space-x-1 ${
                activeTab === 'leaderboard' ? 'bg-slate-900 text-white' : 'bg-zinc-100 text-zinc-600 hover:bg-zinc-200'
              }`}
            >
              <Trophy className="w-3.5 h-3.5 text-amber-400" />
              <span>Rankings</span>
            </button>
            <button
              onClick={() => setActiveTab('proof_feed')}
              className={`px-3 py-1.5 rounded-xl font-bold transition flex items-center space-x-1 ${
                activeTab === 'proof_feed' ? 'bg-slate-900 text-white' : 'bg-zinc-100 text-zinc-600 hover:bg-zinc-200'
              }`}
            >
              <FileText className="w-3.5 h-3.5 text-sky-400" />
              <span>Highway Proof Feed ({proofs.length})</span>
            </button>
          </div>
        </div>

        {/* CATEGORY & SEARCH ROW */}
        <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 pt-1 text-xs">
          <div className="sm:col-span-4 relative">
            <Search className="w-4 h-4 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search driver name, handle, or carrier..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 bg-zinc-50 border border-zinc-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 font-medium"
            />
          </div>

          <div className="sm:col-span-4">
            <select
              value={categoryFilter}
              onChange={e => setCategoryFilter(e.target.value as any)}
              className="w-full py-2 px-3 bg-zinc-50 border border-zinc-200 rounded-xl font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-amber-500"
            >
              <option value="all">🚚 All CDL Categories</option>
              <option value="solo">Solo OTR Drivers</option>
              <option value="owner_operator">Independent Owner-Operators</option>
              <option value="heavy_haul">Heavy Haul & Specialized</option>
              <option value="team">Team Expedited Drivers</option>
            </select>
          </div>

          {/* User quick status banner */}
          <div className="sm:col-span-4 flex items-center justify-end">
            {currentUserEntry && (
              <div className="bg-amber-50 border border-amber-200 px-3 py-1.5 rounded-xl flex items-center space-x-2 text-[11px] font-bold text-amber-900">
                <span>Your Standing:</span>
                <span className="bg-amber-500 text-slate-950 px-1.5 py-0.2 rounded font-black">
                  #{currentUserEntry.rank}
                </span>
                <span>
                  {getMilesForTimeframe(currentUserEntry, timeframe).toLocaleString()} mi
                </span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* TOAST ALERT */}
      {toastMsg && (
        <div className="bg-slate-900 text-white text-xs font-bold px-4 py-3 rounded-2xl shadow-xl flex items-center space-x-2 border border-slate-700 animate-in fade-in">
          <Sparkles className="w-4 h-4 text-amber-400 shrink-0" />
          <span>{toastMsg}</span>
        </div>
      )}

      {/* ACTIVE TAB CONTENT */}
      {activeTab === 'leaderboard' ? (
        <div className="space-y-6">
          {/* PODIUM DISPLAY (TOP 3) */}
          {top3.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
              {/* RANK 2 (Silver) */}
              {top3[1] && (
                <div className="order-2 md:order-1 bg-white rounded-3xl p-5 border-2 border-slate-200 shadow-sm flex flex-col justify-between relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-24 h-24 bg-slate-100 rounded-bl-full -z-0 opacity-40" />
                  <div className="space-y-3 z-10">
                    <div className="flex items-center justify-between">
                      <span className="w-8 h-8 rounded-xl bg-slate-200 text-slate-800 font-black text-sm flex items-center justify-center shadow-xs">
                        #2
                      </span>
                      <span className="text-[10px] font-black uppercase tracking-wider text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                        Silver Hauler
                      </span>
                    </div>

                    <div className="flex items-center space-x-3">
                      <img
                        src={top3[1].driver.avatarUrl}
                        alt=""
                        className="w-12 h-12 rounded-2xl object-cover border border-slate-300 shadow-sm cursor-pointer hover:opacity-90"
                        onClick={() => onViewProfile?.(top3[1].driver)}
                      />
                      <div>
                        <h4 
                          className="font-black text-slate-900 text-sm hover:text-amber-600 cursor-pointer"
                          onClick={() => onViewProfile?.(top3[1].driver)}
                        >
                          {top3[1].driver.displayName}
                        </h4>
                        <p className="text-[11px] text-zinc-500">
                          @{top3[1].driver.username} • {top3[1].driver.carrierName}
                        </p>
                      </div>
                    </div>

                    <div className="bg-zinc-50 rounded-2xl p-3 border border-zinc-100 space-y-1">
                      <div className="text-[10px] font-bold text-zinc-400 uppercase">
                        Verified Miles ({timeframe})
                      </div>
                      <div className="text-2xl font-black text-slate-900 tracking-tight">
                        {getMilesForTimeframe(top3[1], timeframe).toLocaleString()}{' '}
                        <span className="text-xs font-bold text-zinc-400">mi</span>
                      </div>
                      <div className="text-[10px] text-zinc-500 flex items-center justify-between pt-1 border-t border-zinc-200/60">
                        <span>Avg {top3[1].avgMilesPerDay} mi/day</span>
                        <span className="flex items-center space-x-1 text-emerald-600 font-bold">
                          <CheckCircle2 className="w-3 h-3" />
                          <span>{top3[1].verifiedProofsCount} verified runs</span>
                        </span>
                      </div>
                    </div>
                  </div>

                  {top3[1].latestProof && (
                    <button
                      onClick={() => setInspectingProof(top3[1].latestProof!)}
                      className="mt-3 w-full py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-black rounded-xl transition flex items-center justify-center space-x-1"
                    >
                      <Camera className="w-3.5 h-3.5 text-slate-600" />
                      <span>View Cluster Proof</span>
                    </button>
                  )}
                </div>
              )}

              {/* RANK 1 (Gold / Champion) */}
              {top3[0] && (
                <div className="order-1 md:order-2 bg-gradient-to-b from-amber-500/10 via-white to-white rounded-3xl p-6 border-2 border-amber-400 shadow-md flex flex-col justify-between relative overflow-hidden md:-mt-3">
                  <div className="absolute top-0 right-0 w-28 h-28 bg-amber-400/20 rounded-bl-full -z-0" />
                  <div className="space-y-3 z-10">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-1.5">
                        <span className="w-10 h-10 rounded-2xl bg-amber-500 text-slate-950 font-black text-base flex items-center justify-center shadow-md ring-4 ring-amber-400/30">
                          #1
                        </span>
                        <Trophy className="w-6 h-6 text-amber-500 animate-bounce" />
                      </div>
                      <span className="text-[10px] font-black uppercase tracking-wider text-amber-950 bg-amber-400 px-2.5 py-1 rounded-lg shadow-xs">
                        👑 Highway King / Top Run
                      </span>
                    </div>

                    <div className="flex items-center space-x-3.5 pt-1">
                      <img
                        src={top3[0].driver.avatarUrl}
                        alt=""
                        className="w-14 h-14 rounded-2xl object-cover border-2 border-amber-400 shadow-md cursor-pointer hover:opacity-90"
                        onClick={() => onViewProfile?.(top3[0].driver)}
                      />
                      <div>
                        <h4 
                          className="font-black text-slate-900 text-base hover:text-amber-600 cursor-pointer flex items-center space-x-1"
                          onClick={() => onViewProfile?.(top3[0].driver)}
                        >
                          <span>{top3[0].driver.displayName}</span>
                          <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                        </h4>
                        <p className="text-xs text-zinc-500 font-medium">
                          @{top3[0].driver.username} • {top3[0].driver.currentRig}
                        </p>
                      </div>
                    </div>

                    <div className="bg-amber-50/70 rounded-2xl p-4 border border-amber-200/80 space-y-1">
                      <div className="text-[10px] font-bold text-amber-800 uppercase tracking-wide">
                        Verified Miles ({timeframe})
                      </div>
                      <div className="text-3xl font-black text-slate-950 tracking-tight">
                        {getMilesForTimeframe(top3[0], timeframe).toLocaleString()}{' '}
                        <span className="text-sm font-bold text-zinc-500">mi</span>
                      </div>
                      <div className="text-xs text-amber-900 font-medium flex items-center justify-between pt-1.5 border-t border-amber-200/60">
                        <span>Avg {top3[0].avgMilesPerDay} mi/day</span>
                        <span className="flex items-center space-x-1 text-emerald-700 font-black">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>{top3[0].verifiedProofsCount} proof submissions</span>
                        </span>
                      </div>
                    </div>
                  </div>

                  {top3[0].latestProof && (
                    <button
                      onClick={() => setInspectingProof(top3[0].latestProof!)}
                      className="mt-3 w-full py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-black rounded-xl transition shadow-sm flex items-center justify-center space-x-1.5"
                    >
                      <Camera className="w-4 h-4" />
                      <span>Inspect Verified Cluster Proof</span>
                    </button>
                  )}
                </div>
              )}

              {/* RANK 3 (Bronze) */}
              {top3[2] && (
                <div className="order-3 bg-white rounded-3xl p-5 border-2 border-amber-700/20 shadow-sm flex flex-col justify-between relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-24 h-24 bg-amber-100/50 rounded-bl-full -z-0" />
                  <div className="space-y-3 z-10">
                    <div className="flex items-center justify-between">
                      <span className="w-8 h-8 rounded-xl bg-amber-100 text-amber-900 font-black text-sm flex items-center justify-center shadow-xs">
                        #3
                      </span>
                      <span className="text-[10px] font-black uppercase tracking-wider text-amber-900 bg-amber-100/80 px-2 py-0.5 rounded">
                        Bronze Hauler
                      </span>
                    </div>

                    <div className="flex items-center space-x-3">
                      <img
                        src={top3[2].driver.avatarUrl}
                        alt=""
                        className="w-12 h-12 rounded-2xl object-cover border border-amber-200 shadow-sm cursor-pointer hover:opacity-90"
                        onClick={() => onViewProfile?.(top3[2].driver)}
                      />
                      <div>
                        <h4 
                          className="font-black text-slate-900 text-sm hover:text-amber-600 cursor-pointer flex items-center space-x-1"
                          onClick={() => onViewProfile?.(top3[2].driver)}
                        >
                          <span>{top3[2].driver.displayName}</span>
                          {top3[2].driver.id === currentUserProfile.id && (
                            <span className="bg-amber-500 text-slate-950 font-black text-[9px] px-1.5 rounded">
                              YOU
                            </span>
                          )}
                        </h4>
                        <p className="text-[11px] text-zinc-500">
                          @{top3[2].driver.username} • {top3[2].driver.carrierName}
                        </p>
                      </div>
                    </div>

                    <div className="bg-zinc-50 rounded-2xl p-3 border border-zinc-100 space-y-1">
                      <div className="text-[10px] font-bold text-zinc-400 uppercase">
                        Verified Miles ({timeframe})
                      </div>
                      <div className="text-2xl font-black text-slate-900 tracking-tight">
                        {getMilesForTimeframe(top3[2], timeframe).toLocaleString()}{' '}
                        <span className="text-xs font-bold text-zinc-400">mi</span>
                      </div>
                      <div className="text-[10px] text-zinc-500 flex items-center justify-between pt-1 border-t border-zinc-200/60">
                        <span>Avg {top3[2].avgMilesPerDay} mi/day</span>
                        <span className="flex items-center space-x-1 text-emerald-600 font-bold">
                          <CheckCircle2 className="w-3 h-3" />
                          <span>{top3[2].verifiedProofsCount} verified runs</span>
                        </span>
                      </div>
                    </div>
                  </div>

                  {top3[2].latestProof && (
                    <button
                      onClick={() => setInspectingProof(top3[2].latestProof!)}
                      className="mt-3 w-full py-2 bg-amber-50 hover:bg-amber-100 text-amber-950 text-xs font-black rounded-xl transition flex items-center justify-center space-x-1"
                    >
                      <Camera className="w-3.5 h-3.5 text-amber-700" />
                      <span>View Cluster Proof</span>
                    </button>
                  )}
                </div>
              )}
            </div>
          )}

          {/* MAIN RANKING TABLE */}
          <div className="bg-white rounded-3xl border border-zinc-100 shadow-sm overflow-hidden">
            <div className="p-4 px-6 bg-zinc-50/70 border-b border-zinc-100 flex items-center justify-between text-xs">
              <span className="font-black text-slate-900">
                National Driver Rankings ({filteredLeaderboard.length})
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
                  {filteredLeaderboard.map(item => {
                    const isCurrentUser = item.driver.id === currentUserProfile.id;
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
                              onClick={() => onViewProfile?.(item.driver)}
                            />
                            <div>
                              <div className="flex items-center space-x-1.5">
                                <span 
                                  className="font-black text-slate-900 hover:text-amber-600 cursor-pointer"
                                  onClick={() => onViewProfile?.(item.driver)}
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
                              onClick={() => setInspectingProof(item.latestProof!)}
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
                                onClick={() => setInspectingProof(item.latestProof!)}
                                className="p-1.5 rounded-lg hover:bg-zinc-100 text-zinc-600"
                                title="View Cluster Snapshot"
                              >
                                <Eye className="w-4 h-4" />
                              </button>
                            )}
                            <button
                              onClick={() => onViewProfile?.(item.driver)}
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
        </div>
      ) : (
        /* HIGHWAY PROOF FEED TAB */
        <div className="space-y-4">
          <div className="bg-white rounded-3xl p-5 border border-zinc-100 shadow-sm flex items-center justify-between">
            <div>
              <h3 className="text-sm font-black text-slate-900">
                Highway Proof Feed: Real-Time Verified Odometer Ledger
              </h3>
              <p className="text-xs text-zinc-500">
                Peer-verifiable dashboard cluster photos and ELD logs submitted by drivers on active routes.
              </p>
            </div>
            <button
              onClick={() => {
                setIsSubmitModalOpen(true);
                handleSelectPreset(0);
              }}
              className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs rounded-xl shadow-xs transition flex items-center space-x-1.5"
            >
              <Camera className="w-4 h-4" />
              <span>Submit Proof</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {proofs.map(proof => (
              <div
                key={proof.id}
                className="bg-white rounded-3xl p-5 border border-zinc-100 shadow-sm hover:shadow-md transition space-y-4 flex flex-col justify-between"
              >
                <div className="space-y-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-3">
                      <img
                        src={proof.driverAvatar}
                        alt=""
                        className="w-10 h-10 rounded-xl object-cover border border-zinc-200 shrink-0 cursor-pointer"
                        onClick={() => {
                          const prof = leaderboard.find(l => l.driver.username === proof.driverHandle)?.driver;
                          if (prof) onViewProfile?.(prof);
                        }}
                      />
                      <div>
                        <h4 className="font-black text-slate-900 text-xs">
                          {proof.driverName}
                        </h4>
                        <span className="text-[11px] text-zinc-500">
                          @{proof.driverHandle} • {proof.rigUnit}
                        </span>
                      </div>
                    </div>

                    <span className="px-2 py-0.5 rounded text-[10px] font-black bg-emerald-100 text-emerald-900 border border-emerald-200 flex items-center space-x-1">
                      <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                      <span>{proof.verificationBadge}</span>
                    </span>
                  </div>

                  {/* PROOF PHOTO / TELEMETRY CARD */}
                  {proof.proofImageUrl ? (
                    <div 
                      className="relative rounded-2xl overflow-hidden border border-zinc-200 aspect-16/9 cursor-pointer group"
                      onClick={() => setInspectingProof(proof)}
                    >
                      <img
                        src={proof.proofImageUrl}
                        alt="Cluster proof"
                        className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent flex flex-col justify-end p-3 text-white">
                        <div className="flex items-center justify-between text-xs font-black">
                          <span>{proof.routeCorridor}</span>
                          <span className="bg-amber-500 text-slate-950 px-2 py-0.5 rounded text-[10px]">
                            +{proof.milesLogged.toLocaleString()} MILES
                          </span>
                        </div>
                        <div className="text-[10px] text-zinc-300">
                          Odo Start: {proof.odometerStart.toLocaleString()} → Odo Current: {proof.odometerEnd.toLocaleString()}
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="bg-slate-900 text-white rounded-2xl p-4 border border-slate-800 space-y-2">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-zinc-400">Direct Gateway:</span>
                        <span className="font-black text-sky-400">{proof.eldProvider}</span>
                      </div>
                      <div className="text-lg font-black text-white">
                        +{proof.milesLogged.toLocaleString()} Verified Miles
                      </div>
                      <div className="text-[11px] text-zinc-400 font-mono">
                        {proof.verificationCode}
                      </div>
                    </div>
                  )}

                  <p className="text-xs text-zinc-600 italic">
                    "{proof.notes}"
                  </p>
                </div>

                <div className="flex items-center justify-between pt-3 border-t border-zinc-100 text-xs">
                  <span className="text-[10px] text-zinc-400 font-mono">
                    AUTH #{proof.verificationCode}
                  </span>

                  <button
                    onClick={() => handleUpvoteProof(proof.id)}
                    className="px-3 py-1.5 bg-zinc-50 hover:bg-amber-50 text-slate-800 hover:text-amber-900 font-black rounded-xl border border-zinc-200 flex items-center space-x-1.5 transition"
                  >
                    <ThumbsUp className="w-3.5 h-3.5 text-amber-500" />
                    <span>10-4 Verified ({proof.upvotes})</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* MODAL: SUBMIT DASHBOARD / ODOMETER PROOF */}
      {isSubmitModalOpen && (
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
                onClick={() => setIsSubmitModalOpen(false)}
                className="p-1.5 rounded-full hover:bg-zinc-100 text-zinc-400"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmitMileageProof} className="space-y-4 text-xs">
              {/* METHOD SELECTION TABS */}
              <div>
                <label className="font-black text-slate-800 block mb-1.5">
                  1. Choose Verification Method
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setSelectedMethod('odometer_photo')}
                    className={`p-3 rounded-2xl border text-left transition ${
                      selectedMethod === 'odometer_photo'
                        ? 'bg-amber-50 border-amber-400 font-bold text-amber-950 ring-2 ring-amber-400/20'
                        : 'bg-zinc-50 border-zinc-200 text-zinc-700 hover:bg-zinc-100'
                    }`}
                  >
                    <Camera className="w-4 h-4 mb-1 text-amber-600" />
                    <div className="font-black">Dashboard Photo</div>
                    <div className="text-[10px] text-zinc-500 font-normal">Gauge cluster OCR</div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setSelectedMethod('eld_telematics')}
                    className={`p-3 rounded-2xl border text-left transition ${
                      selectedMethod === 'eld_telematics'
                        ? 'bg-sky-50 border-sky-400 font-bold text-sky-950 ring-2 ring-sky-400/20'
                        : 'bg-zinc-50 border-zinc-200 text-zinc-700 hover:bg-zinc-100'
                    }`}
                  >
                    <Cpu className="w-4 h-4 mb-1 text-sky-600" />
                    <div className="font-black">ELD Telematics</div>
                    <div className="text-[10px] text-zinc-500 font-normal">Motive / Samsara API</div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setSelectedMethod('bol_scale')}
                    className={`p-3 rounded-2xl border text-left transition ${
                      selectedMethod === 'bol_scale'
                        ? 'bg-purple-50 border-purple-400 font-bold text-purple-950 ring-2 ring-purple-400/20'
                        : 'bg-zinc-50 border-zinc-200 text-zinc-700 hover:bg-zinc-100'
                    }`}
                  >
                    <FileText className="w-4 h-4 mb-1 text-purple-600" />
                    <div className="font-black">Scale Slip / BOL</div>
                    <div className="text-[10px] text-zinc-500 font-normal">CAT Scale stamped</div>
                  </button>
                </div>
              </div>

              {/* CLUSTER PHOTO UPLOAD OR PRESET SELECTOR */}
              {selectedMethod === 'odometer_photo' && (
                <div className="space-y-3 bg-zinc-50 p-4 rounded-2xl border border-zinc-200">
                  <div className="flex items-center justify-between">
                    <label className="font-black text-slate-800">
                      2. Dashboard Cluster Photo (Presets or Upload)
                    </label>
                    <span className="text-[10px] text-amber-800 font-bold">
                      Digital display must be legible
                    </span>
                  </div>

                  {/* PRESET CHIPS */}
                  <div className="grid grid-cols-2 gap-2">
                    {sampleOdometerPresets.map((preset, idx) => (
                      <button
                        key={preset.name}
                        type="button"
                        onClick={() => handleSelectPreset(idx)}
                        className={`p-2.5 rounded-xl border text-left transition flex items-center space-x-2.5 ${
                          selectedPresetIdx === idx
                            ? 'bg-white border-amber-500 ring-2 ring-amber-400/30 font-bold text-slate-900'
                            : 'bg-white/60 border-zinc-200 text-zinc-700 hover:bg-white'
                        }`}
                      >
                        <img
                          src={preset.imageUrl}
                          alt=""
                          className="w-10 h-10 rounded-lg object-cover border border-zinc-200 shrink-0"
                        />
                        <div className="overflow-hidden">
                          <div className="font-black truncate text-[11px]">{preset.truck}</div>
                          <div className="text-[10px] text-zinc-500 font-mono">
                            {preset.currentOdo.toLocaleString()} mi
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>

                  {/* PHOTO PREVIEW WITH OCR SCAN BUTTON */}
                  <div className="relative rounded-2xl overflow-hidden border border-zinc-300 aspect-16/9 bg-black">
                    <img
                      src={customPhotoUrl || sampleOdometerPresets[selectedPresetIdx].imageUrl}
                      alt="Cluster preview"
                      className="w-full h-full object-cover"
                    />

                    {/* OCR SCAN LINE ANIMATION */}
                    {isScanning && (
                      <div className="absolute inset-0 bg-amber-500/10 pointer-events-none flex flex-col justify-between">
                        <div className="w-full h-1 bg-amber-400 shadow-lg shadow-amber-400 animate-pulse transition-all duration-700 translate-y-24" />
                        <div className="p-3 text-center bg-black/60 text-amber-400 font-black text-xs">
                          Scanning digital LCD digits & Cummins ECM telemetry...
                        </div>
                      </div>
                    )}

                    {!isScanning && (
                      <div className="absolute bottom-3 right-3">
                        <button
                          type="button"
                          onClick={handleScanCluster}
                          className="px-3.5 py-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs rounded-xl shadow-md flex items-center space-x-1.5 transition"
                        >
                          <Cpu className="w-4 h-4" />
                          <span>Run OCR Telemetry Scan</span>
                        </button>
                      </div>
                    )}

                    {scanComplete && (
                      <div className="absolute top-3 left-3 bg-emerald-600 text-white px-3 py-1 rounded-xl text-[10px] font-black flex items-center space-x-1 shadow-md">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>OCR Verified: {endOdo.toLocaleString()} mi</span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {selectedMethod === 'eld_telematics' && (
                <div className="bg-sky-50/70 p-4 rounded-2xl border border-sky-200 space-y-3">
                  <label className="font-black text-sky-950 block">
                    Connect Certified ELD Gateway
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {['Motive (KeepTruckin)', 'Samsara Telematics', 'Omnitracs Fleet', 'Garmin eLog'].map(
                      prov => (
                        <button
                          key={prov}
                          type="button"
                          onClick={() => setEldProvider(prov)}
                          className={`p-2.5 rounded-xl border text-left font-bold transition ${
                            eldProvider === prov
                              ? 'bg-sky-500 text-white border-sky-600 shadow-xs'
                              : 'bg-white text-slate-800 border-zinc-200 hover:bg-zinc-50'
                          }`}
                        >
                          {prov}
                        </button>
                      )
                    )}
                  </div>
                  <div className="text-[11px] text-sky-900 flex items-center space-x-2">
                    <CheckCircle2 className="w-4 h-4 text-sky-600 shrink-0" />
                    <span>Direct API link verified. Odometer pull active.</span>
                  </div>
                </div>
              )}

              {/* ODOMETER INPUTS */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">
                    Start Odometer (Miles)
                  </label>
                  <input
                    type="number"
                    value={startOdo}
                    onChange={e => setStartOdo(parseInt(e.target.value) || 0)}
                    className="w-full p-2.5 bg-zinc-50 border border-zinc-200 rounded-xl font-bold font-mono text-slate-900"
                    required
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">
                    New Odometer (Cluster)
                  </label>
                  <input
                    type="number"
                    value={endOdo}
                    onChange={e => setEndOdo(parseInt(e.target.value) || 0)}
                    className="w-full p-2.5 bg-zinc-50 border border-zinc-200 rounded-xl font-bold font-mono text-slate-900"
                    required
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">
                    Trip Delta (Logged)
                  </label>
                  <div className="w-full p-2.5 bg-emerald-50 border border-emerald-200 rounded-xl font-black font-mono text-emerald-800 text-sm flex items-center justify-between">
                    <span>+{Math.max(0, endOdo - startOdo).toLocaleString()}</span>
                    <span className="text-xs font-normal">MILES</span>
                  </div>
                </div>
              </div>

              {/* CORRIDOR & RIG DETAILS */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">
                    Route & Freight Corridor
                  </label>
                  <input
                    type="text"
                    value={routeCorridor}
                    onChange={e => setRouteCorridor(e.target.value)}
                    placeholder="e.g. I-80 EB (Cheyenne, WY → Reno, NV)"
                    className="w-full p-2.5 bg-zinc-50 border border-zinc-200 rounded-xl font-bold text-slate-800"
                    required
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">
                    Tractor Unit & Rig
                  </label>
                  <input
                    type="text"
                    value={rigUnit}
                    onChange={e => setRigUnit(e.target.value)}
                    className="w-full p-2.5 bg-zinc-50 border border-zinc-200 rounded-xl font-bold text-slate-800"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  Run Notes / Load Description
                </label>
                <textarea
                  rows={2}
                  value={runNotes}
                  onChange={e => setRunNotes(e.target.value)}
                  placeholder="Structural steel delivery, zero DOT infractions, fuel card verified..."
                  className="w-full p-2.5 bg-zinc-50 border border-zinc-200 rounded-xl font-medium text-slate-800"
                />
              </div>

              {/* CONFIRMATION BANNER */}
              <div className="p-3 bg-zinc-50 rounded-2xl border border-zinc-200 flex items-center justify-between text-[11px] text-zinc-600">
                <span className="flex items-center space-x-1.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Submissions are audited against FMCSA 11-hr drive rules.</span>
                </span>
                <span className="font-mono text-zinc-400">#CDL-VERIFY-2026</span>
              </div>

              <div className="flex items-center justify-end space-x-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsSubmitModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl font-bold text-zinc-600 hover:bg-zinc-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black rounded-xl shadow-md transition"
                >
                  Submit & Authenticate Miles
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* INSPECT PROOF MODAL */}
      {inspectingProof && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 border border-zinc-200 shadow-2xl space-y-4 animate-in fade-in">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-100">
              <div className="flex items-center space-x-3">
                <img
                  src={inspectingProof.driverAvatar}
                  alt=""
                  className="w-11 h-11 rounded-xl object-cover border border-zinc-200 shadow-xs"
                />
                <div>
                  <h3 className="font-black text-slate-900 text-sm flex items-center space-x-1.5">
                    <span>{inspectingProof.driverName}</span>
                    <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  </h3>
                  <span className="text-xs text-zinc-500">
                    @{inspectingProof.driverHandle} • {inspectingProof.rigUnit}
                  </span>
                </div>
              </div>

              <button
                onClick={() => setInspectingProof(null)}
                className="p-1.5 rounded-full hover:bg-zinc-100 text-zinc-400"
              >
                ✕
              </button>
            </div>

            {inspectingProof.proofImageUrl && (
              <div className="relative rounded-2xl overflow-hidden border border-zinc-300 aspect-16/9">
                <img
                  src={inspectingProof.proofImageUrl}
                  alt="Verified cluster"
                  className="w-full h-full object-cover"
                />
                <div className="absolute top-3 right-3 bg-slate-900/90 text-white px-2.5 py-1 rounded-xl font-mono text-[10px]">
                  {inspectingProof.verificationCode}
                </div>
              </div>
            )}

            <div className="grid grid-cols-3 gap-2 bg-zinc-50 p-3 rounded-2xl border border-zinc-100 text-center text-xs">
              <div>
                <span className="text-[10px] text-zinc-400 uppercase font-bold block">Start</span>
                <span className="font-black font-mono text-slate-900">
                  {inspectingProof.odometerStart.toLocaleString()}
                </span>
              </div>
              <div>
                <span className="text-[10px] text-zinc-400 uppercase font-bold block">End</span>
                <span className="font-black font-mono text-slate-900">
                  {inspectingProof.odometerEnd.toLocaleString()}
                </span>
              </div>
              <div>
                <span className="text-[10px] text-emerald-700 uppercase font-bold block">Miles</span>
                <span className="font-black font-mono text-emerald-700">
                  +{inspectingProof.milesLogged.toLocaleString()} mi
                </span>
              </div>
            </div>

            <div className="space-y-1 text-xs text-zinc-600">
              <p>
                <strong>Route:</strong> {inspectingProof.routeCorridor}
              </p>
              <p>
                <strong>Verification Tier:</strong> {inspectingProof.verificationBadge}
              </p>
              <p className="italic">"{inspectingProof.notes}"</p>
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-zinc-100">
              <button
                onClick={() => {
                  handleUpvoteProof(inspectingProof.id);
                  setInspectingProof(null);
                }}
                className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs rounded-xl shadow-xs flex items-center space-x-1.5 transition"
              >
                <ThumbsUp className="w-4 h-4" />
                <span>10-4 Verified Run ({inspectingProof.upvotes})</span>
              </button>

              <button
                onClick={() => setInspectingProof(null)}
                className="px-4 py-2 bg-zinc-100 hover:bg-zinc-200 text-slate-800 font-bold text-xs rounded-xl transition"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
