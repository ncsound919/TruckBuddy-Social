import React, { useState, useEffect, useCallback } from 'react';
import { 
  Profile, 
  ConvoyBeacon, 
  CorridorDriverRadar, 
  PeerEndorsement, 
  ConvoyChatMessage 
} from '../../types';
import { 
  sampleProfiles, 
  currentUserProfile, 
  sampleConvoys, 
  sampleCorridorRadars, 
  samplePeerEndorsements 
} from '../../data';
import { 
  subscribeLiveConvoys, 
  createLiveConvoy, 
  toggleLiveConvoyMembership, 
  subscribeLiveConvoyMessages, 
  sendLiveConvoyMessage 
} from '../../lib/firebase';
import { 
  Truck, 
  Radio, 
  Users, 
  Award, 
  PlusCircle, 
  Compass, 
  Flame, 
  ShieldCheck,
  Zap,
  CheckCircle2,
  Filter,
  Search
} from 'lucide-react';
import { useToast } from '../../hooks/useToast';
import { playMessageChirp } from '../../utils/cbAudio';

// Sub-components
import { ConvoyBeaconCard } from './components/ConvoyBeaconCard';
import { ConvoyChatRoom } from './components/ConvoyChatRoom';
import { DriverRadarCard } from './components/DriverRadarCard';
import { PeerEndorsementCard } from './components/PeerEndorsementCard';
import { BeaconModal } from './components/NewBeaconModal';
import { NewVouchModal } from './components/NewVouchModal';

interface ConvoyNetworkSectionProps {
  onViewProfile?: (profile: Profile) => void;
  onOpenDirectMessage?: (profile: Profile) => void;
  isDeadZone?: boolean;
}

export default function ConvoyNetworkSection({ 
  onViewProfile, 
  onOpenDirectMessage,
  isDeadZone = false 
}: ConvoyNetworkSectionProps) {
  const { toastMsg, showToast } = useToast();
  
  // Tabs & Filters
  const [activeTab, setActiveTab] = useState<'convoys' | 'radar' | 'endorsements'>('convoys');
  const [selectedCorridor, setSelectedCorridor] = useState<string>('all');
  const [endorsementFilter, setEndorsementFilter] = useState<string>('all');

  // Data State
  const [convoys, setConvoys] = useState<ConvoyBeacon[]>([]);
  const [activeConvoyId, setActiveConvoyId] = useState<string | null>('convoy-1');
  const [convoyMessages, setConvoyMessages] = useState<Record<string, ConvoyChatMessage[]>>({});
  const [radars, setRadars] = useState<CorridorDriverRadar[]>([]);
  const [endorsements, setEndorsements] = useState<PeerEndorsement[]>([]);
  
  // UI State
  const [convoyChatInput, setConvoyChatInput] = useState('');
  const [pingedDrivers, setPingedDrivers] = useState<Record<string, boolean>>({});
  const [isBeaconModalOpen, setIsBeaconModalOpen] = useState(false);
  const [isVouchModalOpen, setIsVouchModalOpen] = useState(false);
  const [targetVouchDriver, setTargetVouchDriver] = useState<Profile | null>(null);

  // 1. Initial Data Loading & Real-time Subscriptions
  useEffect(() => {
    const unsubscribeConvoys = subscribeLiveConvoys((liveConvoys) => {
      setConvoys(liveConvoys?.length ? liveConvoys : sampleConvoys);
    });

    const cachedRadars = localStorage.getItem('trucker_corridor_radars');
    setRadars(cachedRadars ? JSON.parse(cachedRadars) : sampleCorridorRadars);

    const cachedVouches = localStorage.getItem('trucker_peer_vouches');
    setEndorsements(cachedVouches ? JSON.parse(cachedVouches) : samplePeerEndorsements);

    return () => {
      if (unsubscribeConvoys) unsubscribeConvoys();
    };
  }, []);

  // 2. Chat Message Subscription
  useEffect(() => {
    if (!activeConvoyId) return;
    const unsubscribeMessages = subscribeLiveConvoyMessages(activeConvoyId, (liveMessages) => {
      setConvoyMessages(prev => ({
        ...prev,
        [activeConvoyId]: liveMessages
      }));
    });
    return () => {
      if (unsubscribeMessages) unsubscribeMessages();
    };
  }, [activeConvoyId]);

  // 3. Handlers
  const handleToggleJoinConvoy = async (convoyId: string) => {
    const convoy = convoys.find(c => c.id === convoyId);
    if (!convoy) return;

    const isMember = convoy.members.some(m => m.id === currentUserProfile.id);
    let joining = !isMember;

    if (joining && convoy.members.length >= convoy.maxMembers) {
      showToast('This convoy drafting pack is currently full!');
      return;
    }

    // Pessimistic update for consistency with Firebase but functional for local race prevention
    setConvoys(prev => prev.map(c => {
      if (c.id === convoyId) {
        const newMembers = joining 
          ? [...c.members, currentUserProfile]
          : c.members.filter(m => m.id !== currentUserProfile.id);
        return { ...c, members: newMembers };
      }
      return c;
    }));

    showToast(joining 
      ? `Joined convoy "${convoy.title}" on CB Ch. ${convoy.cbChannel}!` 
      : `Left convoy "${convoy.title}"`
    );

    try {
      await toggleLiveConvoyMembership(convoyId, currentUserProfile, joining);
    } catch (e) {
      console.warn('Live convoy membership note:', e);
    }
  };

  const handleSendConvoyMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    const msgText = convoyChatInput.trim();
    if (!msgText || !activeConvoyId) return;

    const newMsg: ConvoyChatMessage = {
      id: `cmsg-${Date.now()}`,
      convoyId: activeConvoyId,
      sender: currentUserProfile,
      message: msgText,
      timestamp: new Date().toISOString()
    };

    setConvoyMessages(prev => ({
      ...prev,
      [activeConvoyId]: [...(prev[activeConvoyId] || []), newMsg]
    }));
    setConvoyChatInput('');
    playMessageChirp();
    
    try {
      await sendLiveConvoyMessage(activeConvoyId, {
        sender: currentUserProfile,
        message: msgText
      });
    } catch (e) {
      console.warn('Live convoy message send note:', e);
    }
  };

  const handleLaunchBeacon = async (data: any) => {
    const newConvoy: ConvoyBeacon = {
      id: `convoy-${Date.now()}`,
      leader: currentUserProfile,
      title: data.title,
      corridor: data.corridor,
      origin: data.origin,
      destination: data.destination,
      currentMileMarker: data.mileMarker,
      direction: 'Eastbound',
      cruisingSpeedMph: data.speed,
      cbChannel: data.channel,
      members: [currentUserProfile],
      maxMembers: data.maxMembers,
      hazmatAllowed: data.hazmat,
      oversizeAllowed: false,
      status: 'rolling',
      notes: data.notes,
      fuelSavingsPercent: 12.0,
      createdAt: new Date().toISOString()
    };

    setIsBeaconModalOpen(false);
    showToast(`Convoy Beacon "${newConvoy.title}" is now broadcasting live!`);

    try {
      await createLiveConvoy({
        title: newConvoy.title,
        leader: currentUserProfile,
        corridor: newConvoy.corridor,
        cbChannel: newConvoy.cbChannel,
        destination: newConvoy.destination,
        origin: newConvoy.currentMileMarker,
        cruisingSpeedMph: newConvoy.cruisingSpeedMph
      });
    } catch (e) {
      console.warn('Live beacon creation note:', e);
      setConvoys(prev => [newConvoy, ...prev]);
    }
  };

  const handleSubmitVouch = (data: any) => {
    if (!targetVouchDriver) return;

    const newEndorsement: PeerEndorsement = {
      id: `vouch-${Date.now()}`,
      recipientId: targetVouchDriver.id,
      endorser: currentUserProfile,
      skill: data.skill,
      title: data.title,
      comment: data.comment,
      date: 'Just now',
      upvotes: 1
    };

    setEndorsements(prev => {
      const updated = [newEndorsement, ...prev];
      localStorage.setItem('trucker_peer_vouches', JSON.stringify(updated));
      return updated;
    });

    setIsVouchModalOpen(false);
    setTargetVouchDriver(null);
    showToast(`Professional Endorsement submitted for @${targetVouchDriver.username}!`);
  };

  const handleUpvoteVouch = (vouchId: string) => {
    setEndorsements(prev => {
      const updated = prev.map(v => v.id === vouchId ? { ...v, upvotes: v.upvotes + 1 } : v);
      localStorage.setItem('trucker_peer_vouches', JSON.stringify(updated));
      return updated;
    });
  };

  // Filtered Logic
  const filteredConvoys = convoys.filter(c => selectedCorridor === 'all' || c.corridor === selectedCorridor);
  const filteredRadars = radars.filter(r => selectedCorridor === 'all' || r.corridor === selectedCorridor);
  const filteredEndorsements = endorsements.filter(e => endorsementFilter === 'all' || e.skill === endorsementFilter);

  return (
    <div className="space-y-6">
      {/* Toast Overlay */}
      {toastMsg && (
        <div className="fixed top-24 left-1/2 -translate-x-1/2 z-50 bg-slate-900 text-white px-6 py-3 rounded-2xl shadow-2xl border border-slate-700 flex items-center space-x-3 animate-in fade-in slide-in-from-top-4 duration-300">
          <Zap className="w-5 h-5 text-amber-400 fill-amber-400" />
          <span className="text-sm font-black tracking-tight">{toastMsg}</span>
        </div>
      )}

      {/* Hero Stats & Actions */}
      <div className="bg-white rounded-2xl border border-zinc-100 p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center space-x-4">
          <div className="w-14 h-14 bg-amber-500 rounded-2xl flex items-center justify-center text-slate-950 shadow-lg shadow-amber-500/20">
            <Radio className="w-8 h-8" />
          </div>
          <div>
            <h2 className="text-xl font-black tracking-tight text-slate-900">Convoy Network</h2>
            <p className="text-sm text-zinc-500 font-medium">Drafting, Comms & Peer Endorsements</p>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <div className="hidden sm:flex items-center space-x-1 bg-zinc-100 p-1 rounded-xl border border-zinc-200">
            <button
              onClick={() => setActiveTab('convoys')}
              className={`px-4 py-2 rounded-lg text-xs font-black uppercase tracking-wider transition-all ${
                activeTab === 'convoys' ? 'bg-white text-slate-900 shadow-sm' : 'text-zinc-500 hover:text-slate-700'
              }`}
            >
              Convoys
            </button>
            <button
              onClick={() => setActiveTab('radar')}
              className={`px-4 py-2 rounded-lg text-xs font-black uppercase tracking-wider transition-all ${
                activeTab === 'radar' ? 'bg-white text-slate-900 shadow-sm' : 'text-zinc-500 hover:text-slate-700'
              }`}
            >
              Radar
            </button>
            <button
              onClick={() => setActiveTab('endorsements')}
              className={`px-4 py-2 rounded-lg text-xs font-black uppercase tracking-wider transition-all ${
                activeTab === 'endorsements' ? 'bg-white text-slate-900 shadow-sm' : 'text-zinc-500 hover:text-slate-700'
              }`}
            >
              Vouches
            </button>
          </div>

          <button
            onClick={() => setIsBeaconModalOpen(true)}
            className="flex items-center space-x-2 bg-slate-900 hover:bg-slate-800 text-white px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all shadow-md active:scale-95"
          >
            <PlusCircle className="w-4 h-4 text-amber-400" />
            <span>Launch Beacon</span>
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: List Views */}
        <div className="lg:col-span-7 space-y-6">
          {/* Corridor Filter */}
          {(activeTab === 'convoys' || activeTab === 'radar') && (
            <div className="flex items-center space-x-2 overflow-x-auto pb-1 scrollbar-none">
              <div className="flex items-center space-x-1.5 px-3 py-1.5 bg-zinc-100 rounded-xl text-zinc-500 mr-2 shrink-0">
                <Filter className="w-3.5 h-3.5" />
                <span className="text-[10px] font-black uppercase">Corridor:</span>
              </div>
              {['all', 'I-80', 'I-40', 'I-10', 'I-70', 'I-95', 'I-5'].map(cor => (
                <button
                  key={cor}
                  onClick={() => setSelectedCorridor(cor)}
                  className={`px-4 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all border ${
                    selectedCorridor === cor 
                      ? 'bg-amber-500 border-amber-500 text-slate-950 shadow-sm' 
                      : 'bg-white border-zinc-200 text-zinc-500 hover:bg-zinc-50'
                  }`}
                >
                  {cor === 'all' ? 'All Interstates' : cor}
                </button>
              ))}
            </div>
          )}

          {/* Tab Content */}
          <div className="space-y-4">
            {activeTab === 'convoys' && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {filteredConvoys.map(convoy => (
                  <ConvoyBeaconCard
                    key={convoy.id}
                    convoy={convoy}
                    currentUser={currentUserProfile}
                    isActive={activeConvoyId === convoy.id}
                    onJoin={(id) => handleToggleJoinConvoy(id)}
                    onSelect={(id) => setActiveConvoyId(id)}
                    onViewProfile={onViewProfile!}
                  />
                ))}
              </div>
            )}

            {activeTab === 'radar' && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {filteredRadars.map(radar => (
                  <DriverRadarCard
                    key={radar.id}
                    radar={radar}
                    isPinged={pingedDrivers[radar.driver.id]}
                    onPing={(d) => {
                      setPingedDrivers(prev => ({ ...prev, [d.id]: true }));
                      showToast(`10-4 Ping sent to @${d.username}!`);
                    }}
                    onVouch={(d) => {
                      setTargetVouchDriver(d);
                      setIsVouchModalOpen(true);
                    }}
                    onViewProfile={(p) => onViewProfile!(p)}
                  />
                ))}
              </div>
            )}

            {activeTab === 'endorsements' && (
              <div className="space-y-4">
                {/* Endorsement Filter */}
                <div className="flex items-center space-x-2 overflow-x-auto pb-1 scrollbar-none">
                  {['all', 'mountain_driving', 'dock_backing', 'winter_ice', 'roadside_rescue', 'hazmat_safety', 'heavy_haul', 'fuel_efficiency'].map(sk => (
                    <button
                      key={sk}
                      onClick={() => setEndorsementFilter(sk)}
                      className={`px-4 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all border ${
                        endorsementFilter === sk 
                          ? 'bg-slate-900 border-slate-900 text-white shadow-sm' 
                          : 'bg-white border-zinc-200 text-zinc-500 hover:bg-zinc-50'
                      }`}
                    >
                      {sk === 'all' ? 'All Skills' : sk.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}
                    </button>
                  ))}
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {filteredEndorsements.map(endors => (
                    <PeerEndorsementCard
                      key={endors.id}
                      endorsement={endors}
                      onViewProfile={(p) => onViewProfile!(p)}
                      onUpvote={(id) => handleUpvoteVouch(id)}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Active Chat & Side Context */}
        <div className="lg:col-span-5">
          {activeConvoyId && (
            <div className="sticky top-24">
              <ConvoyChatRoom
                convoy={convoys.find(c => c.id === activeConvoyId) || convoys[0]}
                messages={convoyMessages[activeConvoyId] || []}
                currentUser={currentUserProfile}
                input={convoyChatInput}
                onInputChange={setConvoyChatInput}
                onSend={handleSendConvoyMessage}
                onClose={() => setActiveConvoyId(null)}
              />
            </div>
          )}
        </div>
      </div>

      {/* Modals */}
      <BeaconModal
        isOpen={isBeaconModalOpen}
        onClose={() => setIsBeaconModalOpen(false)}
        onSubmit={handleLaunchBeacon}
      />

      <NewVouchModal
        isOpen={isVouchModalOpen}
        targetDriver={targetVouchDriver}
        onClose={() => setIsVouchModalOpen(false)}
        onSubmit={handleSubmitVouch}
      />
    </div>
  );
}
