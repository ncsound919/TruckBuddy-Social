import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { 
  Profile, 
  MileageLeaderboardEntry, 
  MileageProof, 
  MileageTimeframe, 
  DriverCategory 
} from '../../types';
import { 
  sampleMileageLeaderboard, 
  sampleMileageProofs, 
  currentUserProfile 
} from '../../data';
import { 
  subscribeLiveMileageLeaderboard, 
  submitLiveMileageProof 
} from '../../lib/firebase';
import { 
  Trophy, 
  Camera, 
  ShieldCheck, 
  Search, 
  FileText, 
  Sparkles, 
  Zap
} from 'lucide-react';
import { useToast } from '../../hooks/useToast';

// Sub-components
import { MileagePodium } from './components/MileagePodium';
import { MileageLeaderboardTable } from './components/MileageLeaderboardTable';
import { MileageProofCard } from './components/MileageProofCard';
import { SubmitMileageModal } from './components/SubmitMileageModal';
import { ProofInspectorModal } from './components/ProofInspectorModal';

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
  const { toastMsg, showToast } = useToast();

  // Leaderboard data state
  const [leaderboard, setLeaderboard] = useState<MileageLeaderboardEntry[]>(sampleMileageLeaderboard);
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

  // 1. Live Data Subscription
  useEffect(() => {
    const unsubscribe = subscribeLiveMileageLeaderboard((liveEntries) => {
      setLeaderboard(liveEntries?.length ? liveEntries : sampleMileageLeaderboard);
    });
    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, []);

  // 2. Helper to get active mileage
  const getMilesForTimeframe = useCallback((entry: MileageLeaderboardEntry, tf: MileageTimeframe) => {
    switch (tf) {
      case 'weekly': return entry.weeklyMiles;
      case 'monthly': return entry.monthlyMiles;
      case 'annual': return entry.annualMiles;
      case 'all_time': return entry.allTimeMiles;
      default: return entry.weeklyMiles;
    }
  }, []);

  // 3. Filtered Leaderboard
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
    list.sort((a, b) => getMilesForTimeframe(b, timeframe) - getMilesForTimeframe(a, timeframe));
    return list.map((item, idx) => ({ ...item, rank: idx + 1 }));
  }, [leaderboard, categoryFilter, timeframe, searchQuery, getMilesForTimeframe]);

  const currentUserEntry = filteredLeaderboard.find(e => e.driver.id === currentUserProfile.id);

  // 4. Handlers
  const handleSubmitMileageProof = (data: any) => {
    if (data.endOdo <= data.startOdo) {
      showToast('⚠️ Error: New odometer reading must be greater than starting odometer!');
      return;
    }

    const milesDelta = data.endOdo - data.startOdo;
    const authCode = `ODO-${Math.floor(1000 + Math.random() * 9000)}-${currentUserProfile.username.substring(0, 4).toUpperCase()}`;

    const newProof: MileageProof = {
      id: `proof-${Date.now()}`,
      userId: currentUserProfile.id,
      driverName: currentUserProfile.displayName,
      driverHandle: currentUserProfile.username,
      driverAvatar: currentUserProfile.avatarUrl,
      method: data.selectedMethod,
      proofImageUrl: data.customPhotoUrl,
      eldProvider: data.selectedMethod === 'eld_telematics' ? data.eldProvider : undefined,
      odometerStart: data.startOdo,
      odometerEnd: data.endOdo,
      milesLogged: milesDelta,
      routeCorridor: data.routeCorridor,
      originCity: data.originCity,
      destinationCity: data.destCity,
      dateLogged: new Date().toISOString(),
      verificationBadge: data.selectedMethod === 'odometer_photo' 
        ? 'Verified Odometer OCR' 
        : data.selectedMethod === 'eld_telematics' 
        ? 'ELD Telematics Direct Sync' 
        : 'Certified Scale / BOL Stamp',
      verificationCode: authCode,
      status: 'verified',
      notes: data.runNotes,
      rigUnit: data.rigUnit,
      upvotes: 1
    };

    setProofs(prev => {
      const updated = [newProof, ...prev];
      localStorage.setItem('trucker_mileage_proofs', JSON.stringify(updated));
      return updated;
    });

    submitLiveMileageProof(newProof, currentUserProfile).catch(console.warn);

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
      return updated;
    });

    setIsSubmitModalOpen(false);
    showToast(`🏆 Run Logged! +${milesDelta.toLocaleString()} verified miles synced!`);
  };

  const handleUpvoteProof = (proofId: string) => {
    setProofs(prev => {
      const updated = prev.map(p => p.id === proofId ? { ...p, upvotes: p.upvotes + 1 } : p);
      localStorage.setItem('trucker_mileage_proofs', JSON.stringify(updated));
      return updated;
    });
    showToast('👍 10-4 Verified: Road affirmation recorded!');
  };

  const top3 = filteredLeaderboard.slice(0, 3);
  const remainingList = filteredLeaderboard.slice(3);

  return (
    <div className="space-y-6">
      {/* Toast Overlay */}
      {toastMsg && (
        <div className="fixed top-24 left-1/2 -translate-x-1/2 z-50 bg-slate-900 text-white px-6 py-3 rounded-2xl shadow-2xl border border-slate-700 flex items-center space-x-3 animate-in fade-in slide-in-from-top-4 duration-300">
          <Zap className="w-5 h-5 text-amber-400 fill-amber-400" />
          <span className="text-sm font-black tracking-tight">{toastMsg}</span>
        </div>
      )}

      {/* Header Section */}
      <div className="bg-white rounded-3xl p-6 border border-zinc-100 shadow-sm space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center space-x-3.5">
            <div className="p-3 bg-amber-500 text-slate-950 rounded-2xl shadow-sm">
              <Trophy className="w-7 h-7" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="text-xl font-black text-slate-900 tracking-tight">National CDL Mileage Leaderboard</h2>
                <span className="bg-emerald-100 text-emerald-900 text-[10px] font-black uppercase px-2 py-0.5 rounded-md flex items-center space-x-1">
                  <ShieldCheck className="w-3 h-3 text-emerald-600" />
                  <span>Verified Logs</span>
                </span>
              </div>
              <p className="text-xs text-zinc-500">Track who is driving the most asphalt across America.</p>
            </div>
          </div>

          <button
            onClick={() => setIsSubmitModalOpen(true)}
            className="px-5 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs rounded-2xl shadow-md flex items-center space-x-2 transition active:scale-95"
          >
            <Camera className="w-4 h-4" />
            <span>Log Miles / Dashboard Proof</span>
          </button>
        </div>

        {/* Filters Row */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-3 border-t border-zinc-100 text-xs">
          <div className="flex items-center bg-zinc-100 p-1 rounded-2xl space-x-1 overflow-x-auto scrollbar-none">
            {['weekly', 'monthly', 'annual', 'all_time'].map(tf => (
              <button
                key={tf}
                onClick={() => setTimeframe(tf as any)}
                className={`px-3 py-1.5 rounded-xl font-black whitespace-nowrap transition ${
                  timeframe === tf ? 'bg-white text-slate-950 shadow-xs' : 'text-zinc-500 hover:text-slate-900'
                }`}
              >
                {tf.charAt(0).toUpperCase() + tf.slice(1).replace('_', ' ')}
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
              <span>Highway Proof Feed</span>
            </button>
          </div>
        </div>

        {/* Search Row */}
        <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 pt-1 text-xs">
          <div className="sm:col-span-4 relative">
            <Search className="w-4 h-4 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search driver or carrier..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 bg-zinc-50 border border-zinc-200 rounded-xl font-medium focus:ring-2 focus:ring-amber-500"
            />
          </div>
          <div className="sm:col-span-4">
            <select
              value={categoryFilter}
              onChange={e => setCategoryFilter(e.target.value as any)}
              className="w-full py-2 px-3 bg-zinc-50 border border-zinc-200 rounded-xl font-bold text-slate-800"
            >
              <option value="all">🚚 All CDL Categories</option>
              <option value="solo">Solo OTR Drivers</option>
              <option value="owner_operator">Independent Owner-Operators</option>
              <option value="heavy_haul">Heavy Haul & Specialized</option>
              <option value="team">Team Expedited Drivers</option>
            </select>
          </div>
          <div className="sm:col-span-4 flex items-center justify-end">
            {currentUserEntry && (
              <div className="bg-amber-50 border border-amber-200 px-3 py-1.5 rounded-xl flex items-center space-x-2 text-[11px] font-bold text-amber-900">
                <span>Rank:</span>
                <span className="bg-amber-500 text-slate-950 px-1.5 py-0.2 rounded font-black">#{currentUserEntry.rank}</span>
                <span>{getMilesForTimeframe(currentUserEntry, timeframe).toLocaleString()} mi</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {activeTab === 'leaderboard' ? (
        <div className="space-y-6">
          <MileagePodium
            top3={top3}
            timeframe={timeframe}
            currentUser={currentUserProfile}
            onViewProfile={onViewProfile!}
            onInspectProof={setInspectingProof}
            getMilesForTimeframe={getMilesForTimeframe}
          />
          <MileageLeaderboardTable
            entries={filteredLeaderboard}
            timeframe={timeframe}
            currentUser={currentUserProfile}
            onViewProfile={onViewProfile!}
            onInspectProof={setInspectingProof}
            getMilesForTimeframe={getMilesForTimeframe}
          />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {proofs.map(proof => (
            <MileageProofCard
              key={proof.id}
              proof={proof}
              onViewProfile={(handle) => {
                const p = leaderboard.find(l => l.driver.username === handle)?.driver;
                if (p) onViewProfile?.(p);
              }}
              onInspectProof={(p) => setInspectingProof(p)}
              onUpvote={(id) => handleUpvoteProof(id)}
            />
          ))}
        </div>
      )}

      {/* Modals */}
      <SubmitMileageModal
        isOpen={isSubmitModalOpen}
        onClose={() => setIsSubmitModalOpen(false)}
        onSubmit={handleSubmitMileageProof}
        showToast={showToast}
      />

      <ProofInspectorModal
        proof={inspectingProof}
        onClose={() => setInspectingProof(null)}
      />
    </div>
  );
}
