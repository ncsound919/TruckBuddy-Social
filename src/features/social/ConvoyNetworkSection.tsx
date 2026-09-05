import React, { useState, useEffect } from 'react';
import { 
  Profile, 
  ConvoyBeacon, 
  CorridorDriverRadar, 
  PeerEndorsement, 
  EndorsementSkill,
  ConvoyChatMessage 
} from '../../types';
import { 
  sampleProfiles, 
  currentUserProfile, 
  sampleConvoys, 
  sampleCorridorRadars, 
  samplePeerEndorsements,
  sampleConvoyMessages 
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
  Navigation, 
  PlusCircle, 
  Check, 
  Send, 
  Compass, 
  Fuel, 
  ShieldAlert, 
  AlertTriangle, 
  ThumbsUp, 
  MessageSquare, 
  MapPin, 
  Zap, 
  UserPlus, 
  CheckCircle2, 
  Volume2, 
  X,
  Share2,
  Clock,
  Flame,
  ShieldCheck
} from 'lucide-react';

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
  // Active subtab: 'convoys' | 'radar' | 'endorsements'
  const [activeTab, setActiveTab] = useState<'convoys' | 'radar' | 'endorsements'>('convoys');
  const [selectedCorridor, setSelectedCorridor] = useState<string>('all');
  
  // Convoys state
  const [convoys, setConvoys] = useState<ConvoyBeacon[]>([]);
  const [activeConvoyId, setActiveConvoyId] = useState<string | null>('convoy-1');
  const [convoyMessages, setConvoyMessages] = useState<Record<string, ConvoyChatMessage[]>>({});
  const [convoyChatInput, setConvoyChatInput] = useState('');
  
  // Corridor Radars state
  const [radars, setRadars] = useState<CorridorDriverRadar[]>([]);
  const [pingedDrivers, setPingedDrivers] = useState<Record<string, boolean>>({});

  // Endorsements state
  const [endorsements, setEndorsements] = useState<PeerEndorsement[]>([]);
  const [endorsementFilter, setEndorsementFilter] = useState<string>('all');

  // Modals state
  const [isBeaconModalOpen, setIsBeaconModalOpen] = useState(false);
  const [isVouchModalOpen, setIsVouchModalOpen] = useState(false);
  const [targetVouchDriver, setTargetVouchDriver] = useState<Profile | null>(null);

  // New Beacon Form state
  const [beaconTitle, setBeaconTitle] = useState('');
  const [beaconCorridor, setBeaconCorridor] = useState('I-80');
  const [beaconOrigin, setBeaconOrigin] = useState('Salt Lake City, UT');
  const [beaconDestination, setBeaconDestination] = useState('Cheyenne, WY');
  const [beaconMileMarker, setBeaconMileMarker] = useState('MM 142 (Evanston)');
  const [beaconSpeed, setBeaconSpeed] = useState(65);
  const [beaconChannel, setBeaconChannel] = useState(19);
  const [beaconMaxMembers, setBeaconMaxMembers] = useState(5);
  const [beaconHazmat, setBeaconHazmat] = useState(false);
  const [beaconNotes, setBeaconNotes] = useState('');

  // New Vouch Form state
  const [vouchSkill, setVouchSkill] = useState<EndorsementSkill>('mountain_driving');
  const [vouchTitle, setVouchTitle] = useState('');
  const [vouchComment, setVouchComment] = useState('');

  // Toast state
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3000);
  };

  // Load persistence
  useEffect(() => {
    const unsubscribeConvoys = subscribeLiveConvoys((liveConvoys) => {
      if (liveConvoys && liveConvoys.length > 0) {
        setConvoys(liveConvoys);
      } else {
        setConvoys(sampleConvoys);
      }
    });

    const cachedRadars = localStorage.getItem('trucker_corridor_radars');
    if (cachedRadars) {
      setRadars(JSON.parse(cachedRadars));
    } else {
      setRadars(sampleCorridorRadars);
      localStorage.setItem('trucker_corridor_radars', JSON.stringify(sampleCorridorRadars));
    }

    const cachedVouches = localStorage.getItem('trucker_peer_vouches');
    if (cachedVouches) {
      setEndorsements(JSON.parse(cachedVouches));
    } else {
      setEndorsements(samplePeerEndorsements);
      localStorage.setItem('trucker_peer_vouches', JSON.stringify(samplePeerEndorsements));
    }

    return () => {
      if (unsubscribeConvoys) unsubscribeConvoys();
    };
  }, []);

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

  const saveConvoys = (updated: ConvoyBeacon[]) => {
    setConvoys(updated);
  };

  const saveMessages = (updated: Record<string, ConvoyChatMessage[]>) => {
    setConvoyMessages(updated);
  };

  const saveVouches = (updated: PeerEndorsement[]) => {
    setEndorsements(updated);
    localStorage.setItem('trucker_peer_vouches', JSON.stringify(updated));
  };

  // Join or Leave Convoy
  const handleToggleJoinConvoy = async (convoyId: string) => {
    let joining = false;
    const updated = convoys.map(c => {
      if (c.id === convoyId) {
        const isMember = c.members.some(m => m.id === currentUserProfile.id);
        let newMembers: Profile[];
        if (isMember) {
          newMembers = c.members.filter(m => m.id !== currentUserProfile.id);
          showToast(`Left convoy "${c.title}"`);
        } else {
          if (c.members.length >= c.maxMembers) {
            showToast('This convoy drafting pack is currently full!');
            return c;
          }
          newMembers = [...c.members, currentUserProfile];
          joining = true;
          showToast(`Joined convoy "${c.title}" on CB Ch. ${c.cbChannel}!`);
        }
        return { ...c, members: newMembers };
      }
      return c;
    });

    saveConvoys(updated);
    try {
      await toggleLiveConvoyMembership(convoyId, currentUserProfile, joining);
    } catch (e) {
      console.warn('Live convoy membership note:', e);
    }
  };

  // Send message in Convoy Comms
  const handleSendConvoyMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!convoyChatInput.trim() || !activeConvoyId) return;

    const newMsg: ConvoyChatMessage = {
      id: `cmsg-${Date.now()}`,
      convoyId: activeConvoyId,
      sender: currentUserProfile,
      message: convoyChatInput.trim(),
      timestamp: new Date().toISOString()
    };

    const currentList = convoyMessages[activeConvoyId] || [];
    const updatedMessages = {
      ...convoyMessages,
      [activeConvoyId]: [...currentList, newMsg]
    };

    saveMessages(updatedMessages);
    setConvoyChatInput('');
    
    try {
      await sendLiveConvoyMessage(activeConvoyId, {
        sender: currentUserProfile,
        message: newMsg.message
      });
    } catch (e) {
      console.warn('Live convoy message send note:', e);
    }

    // Audio chirp / squelch indicator simulation
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(800, audioCtx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(1200, audioCtx.currentTime + 0.08);
      gain.gain.setValueAtTime(0.05, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.08);
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start();
      osc.stop(audioCtx.currentTime + 0.09);
    } catch {
      // Ignore audio failure
    }
  };

  // Ping driver on radar
  const handlePingDriver = (driver: Profile) => {
    setPingedDrivers(prev => ({ ...prev, [driver.id]: true }));
    showToast(`10-4 Ping sent to @${driver.username} over highway carrier repeater!`);
  };

  // Launch Convoy Beacon
  const handleLaunchBeacon = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!beaconTitle.trim() || !beaconOrigin.trim() || !beaconDestination.trim()) return;

    const newConvoy: ConvoyBeacon = {
      id: `convoy-${Date.now()}`,
      leader: currentUserProfile,
      title: beaconTitle.trim(),
      corridor: beaconCorridor,
      origin: beaconOrigin.trim(),
      destination: beaconDestination.trim(),
      currentMileMarker: beaconMileMarker.trim() || 'MM 0',
      direction: 'Eastbound',
      cruisingSpeedMph: Number(beaconSpeed) || 65,
      cbChannel: Number(beaconChannel) || 19,
      members: [currentUserProfile],
      maxMembers: Number(beaconMaxMembers) || 5,
      hazmatAllowed: beaconHazmat,
      oversizeAllowed: false,
      status: 'rolling',
      notes: beaconNotes.trim() || 'Rolling in draft pack. Call out hazards and keep safe spacing.',
      fuelSavingsPercent: 12.0,
      createdAt: new Date().toISOString()
    };

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
      showToast(`Convoy Beacon "${newConvoy.title}" is now broadcasting live!`);
    } catch (e) {
      console.warn('Live beacon creation note:', e);
      const updated = [newConvoy, ...convoys];
      saveConvoys(updated);
      showToast(`Convoy Beacon "${newConvoy.title}" is now active!`);
    }

    setActiveConvoyId(newConvoy.id);
    setIsBeaconModalOpen(false);
    showToast(`Convoy Beacon broadcasted on ${beaconCorridor} CB Ch. ${beaconChannel}!`);

    // Reset fields
    setBeaconTitle('');
    setBeaconNotes('');
  };

  // Submit Peer Vouch
  const handleSubmitVouch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!vouchTitle.trim() || !vouchComment.trim() || !targetVouchDriver) return;

    const newVouch: PeerEndorsement = {
      id: `vouch-${Date.now()}`,
      recipientId: targetVouchDriver.id,
      endorser: currentUserProfile,
      skill: vouchSkill,
      title: vouchTitle.trim(),
      comment: vouchComment.trim(),
      date: new Date().toISOString(),
      upvotes: 1
    };

    const updated = [newVouch, ...endorsements];
    saveVouches(updated);
    setIsVouchModalOpen(false);
    showToast(`Peer vouch recorded for @${targetVouchDriver.username}! Road respect score updated.`);
    setVouchTitle('');
    setVouchComment('');
  };

  // Upvote an endorsement
  const handleUpvoteVouch = (vouchId: string) => {
    const updated = endorsements.map(v => {
      if (v.id === vouchId) {
        return { ...v, upvotes: v.upvotes + 1 };
      }
      return v;
    });
    saveVouches(updated);
    showToast('Affirmative! Endorsement verified.');
  };

  // Filtered Convoys
  const filteredConvoys = convoys.filter(c => {
    if (selectedCorridor === 'all') return true;
    return c.corridor === selectedCorridor;
  });

  // Filtered Endorsements
  const filteredEndorsements = endorsements.filter(v => {
    if (endorsementFilter === 'all') return true;
    return v.skill === endorsementFilter;
  });

  // Selected Convoy object
  const activeConvoy = convoys.find(c => c.id === activeConvoyId) || convoys[0];
  const activeChatList = activeConvoy ? (convoyMessages[activeConvoy.id] || []) : [];

  return (
    <div className="space-y-6" id="convoy-network-section">
      {/* TOAST FEEDBACK */}
      {toastMsg && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 bg-slate-900 text-white text-xs font-bold px-4 py-2.5 rounded-xl shadow-2xl flex items-center space-x-2 border border-slate-700 animate-in fade-in zoom-in-95">
          <CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0" />
          <span>{toastMsg}</span>
        </div>
      )}

      {/* HEADER HERO BAR */}
      <div className="bg-slate-950 text-white rounded-2xl p-6 shadow-xl border border-slate-800 relative overflow-hidden">
        <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-gradient-to-l from-amber-500/10 to-transparent pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center space-x-2 text-amber-400">
              <Radio className="w-5 h-5 animate-pulse" />
              <span className="text-xs font-black uppercase tracking-widest">Inter-User Highway Alliance</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">
              Convoy Drafting & Alliance Network
            </h1>
            <p className="text-xs text-zinc-400 max-w-xl leading-relaxed">
              Form aerodynamic drafting packs to save 10-15% diesel fuel, radar-track allied rigs on your corridor, and build peer CDL road respect.
            </p>
          </div>

          <div className="flex items-center space-x-3 shrink-0">
            <button
              id="launch-convoy-beacon-btn"
              onClick={() => setIsBeaconModalOpen(true)}
              className="px-4 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-black rounded-xl shadow-lg transition-all flex items-center space-x-2 active:scale-95"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Launch Convoy Beacon</span>
            </button>
          </div>
        </div>

        {/* STATS STRIP */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-5 border-t border-slate-800/80 text-xs">
          <div className="bg-slate-900/60 p-3 rounded-xl border border-slate-800">
            <span className="text-[10px] text-zinc-400 uppercase font-bold block">Active Drafting Convoys</span>
            <span className="text-lg font-black text-amber-400">{convoys.length} Rolling</span>
          </div>
          <div className="bg-slate-900/60 p-3 rounded-xl border border-slate-800">
            <span className="text-[10px] text-zinc-400 uppercase font-bold block">Average Fuel Saved</span>
            <span className="text-lg font-black text-emerald-400">11.8% Diesel</span>
          </div>
          <div className="bg-slate-900/60 p-3 rounded-xl border border-slate-800">
            <span className="text-[10px] text-zinc-400 uppercase font-bold block">Radar Rigs Online</span>
            <span className="text-lg font-black text-blue-400">{radars.length} Beacons</span>
          </div>
          <div className="bg-slate-900/60 p-3 rounded-xl border border-slate-800">
            <span className="text-[10px] text-zinc-400 uppercase font-bold block">Peer CDL Vouches</span>
            <span className="text-lg font-black text-amber-400">{endorsements.length} Endorsed</span>
          </div>
        </div>
      </div>

      {/* NAVIGATION SUB-TABS */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-zinc-200 pb-2" id="convoy-network-tabs">
        <div className="flex items-center space-x-1 bg-zinc-100 p-1 rounded-xl">
          <button
            onClick={() => setActiveTab('convoys')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center space-x-1.5 ${
              activeTab === 'convoys'
                ? 'bg-white text-slate-900 shadow-sm font-extrabold'
                : 'text-zinc-500 hover:text-slate-900'
            }`}
          >
            <Truck className="w-3.5 h-3.5 text-amber-500" />
            <span>Active Convoys ({convoys.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('radar')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center space-x-1.5 ${
              activeTab === 'radar'
                ? 'bg-white text-slate-900 shadow-sm font-extrabold'
                : 'text-zinc-500 hover:text-slate-900'
            }`}
          >
            <Compass className="w-3.5 h-3.5 text-blue-500" />
            <span>Corridor Radar ({radars.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('endorsements')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center space-x-1.5 ${
              activeTab === 'endorsements'
                ? 'bg-white text-slate-900 shadow-sm font-extrabold'
                : 'text-zinc-500 hover:text-slate-900'
            }`}
          >
            <Award className="w-3.5 h-3.5 text-amber-500" />
            <span>Road Respect & Vouches ({endorsements.length})</span>
          </button>
        </div>

        {/* CORRIDOR QUICK FILTER */}
        {activeTab === 'convoys' && (
          <div className="flex items-center space-x-2 text-xs">
            <span className="text-zinc-400 font-bold uppercase text-[10px]">Corridor:</span>
            {['all', 'I-80', 'I-40', 'I-10', 'I-70', 'I-95'].map(corr => (
              <button
                key={corr}
                onClick={() => setSelectedCorridor(corr)}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                  selectedCorridor === corr
                    ? 'bg-slate-900 text-white'
                    : 'bg-white border border-zinc-200 text-zinc-600 hover:bg-zinc-50'
                }`}
              >
                {corr === 'all' ? 'All Lanes' : corr}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* TAB 1: ACTIVE CONVOYS & DRAFTING PACKS */}
      {activeTab === 'convoys' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6" id="active-convoys-grid">
          {/* CONVOY CARDS LIST (COL-7) */}
          <div className="lg:col-span-7 space-y-4">
            {filteredConvoys.length === 0 ? (
              <div className="bg-white rounded-2xl border border-zinc-100 p-8 text-center space-y-3">
                <Truck className="w-10 h-10 text-zinc-300 mx-auto" />
                <h3 className="text-sm font-bold text-slate-800">No active convoys on {selectedCorridor}</h3>
                <p className="text-xs text-zinc-400 max-w-sm mx-auto">
                  Be the lead rig! Launch a convoy beacon along this corridor to draft and coordinate with drivers rolling behind you.
                </p>
                <button
                  onClick={() => setIsBeaconModalOpen(true)}
                  className="px-4 py-2 bg-amber-500 text-slate-950 font-bold text-xs rounded-xl hover:bg-amber-400 transition"
                >
                  Launch Beacon
                </button>
              </div>
            ) : (
              filteredConvoys.map(convoy => {
                const isUserInConvoy = convoy.members.some(m => m.id === currentUserProfile.id);
                const isSelected = activeConvoy?.id === convoy.id;

                return (
                  <div
                    key={convoy.id}
                    onClick={() => setActiveConvoyId(convoy.id)}
                    className={`bg-white rounded-2xl border transition-all p-5 space-y-4 cursor-pointer shadow-sm ${
                      isSelected 
                        ? 'border-amber-400 ring-2 ring-amber-400/20' 
                        : 'border-zinc-100 hover:border-zinc-200'
                    }`}
                    id={`convoy-card-${convoy.id}`}
                  >
                    {/* TOP STATUS BAR */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <span className="bg-slate-900 text-amber-400 font-black text-xs px-2.5 py-0.5 rounded-md">
                          {convoy.corridor}
                        </span>
                        <span className="text-[11px] font-bold text-zinc-400">
                          CB Channel {convoy.cbChannel}
                        </span>
                        <span className="bg-emerald-50 text-emerald-700 border border-emerald-100 text-[10px] font-black uppercase px-2 py-0.5 rounded-full flex items-center space-x-1">
                          <Fuel className="w-3 h-3" />
                          <span>+{convoy.fuelSavingsPercent}% MPG</span>
                        </span>
                      </div>

                      <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded ${
                        convoy.status === 'rolling' 
                          ? 'bg-emerald-50 text-emerald-800' 
                          : 'bg-blue-50 text-blue-800'
                      }`}>
                        ● {convoy.status}
                      </span>
                    </div>

                    {/* CONVOY TITLE & ROUTE */}
                    <div className="space-y-1">
                      <h3 className="text-base font-black text-slate-900 tracking-tight">
                        {convoy.title}
                      </h3>
                      <div className="flex items-center space-x-2 text-xs text-zinc-500 font-semibold">
                        <span className="font-bold text-slate-800">{convoy.origin}</span>
                        <span>→</span>
                        <span className="font-bold text-slate-800">{convoy.destination}</span>
                        <span className="text-zinc-300">•</span>
                        <span className="text-amber-700 font-bold bg-amber-50 px-1.5 py-0.5 rounded">
                          {convoy.currentMileMarker}
                        </span>
                      </div>
                    </div>

                    {/* NOTES */}
                    <p className="text-xs text-zinc-600 font-normal leading-relaxed bg-zinc-50 p-3 rounded-xl border border-zinc-100/80">
                      "{convoy.notes}"
                    </p>

                    {/* PACK SPECS & MEMBERS */}
                    <div className="flex flex-wrap items-center justify-between gap-3 pt-1 border-t border-zinc-50 text-xs">
                      <div className="flex items-center space-x-2">
                        <span className="text-[10px] text-zinc-400 font-bold uppercase">Pack ({convoy.members.length}/{convoy.maxMembers}):</span>
                        <div className="flex -space-x-1.5 overflow-hidden">
                          {convoy.members.map(member => (
                            <img
                              key={member.id}
                              src={member.avatarUrl}
                              alt={member.displayName}
                              title={`${member.displayName} (@${member.username})`}
                              onClick={(e) => {
                                e.stopPropagation();
                                onViewProfile?.(member);
                              }}
                              className="w-7 h-7 rounded-full object-cover ring-2 ring-white hover:ring-amber-400 cursor-pointer transition-all"
                            />
                          ))}
                        </div>
                      </div>

                      <div className="flex items-center space-x-3">
                        <span className="text-zinc-400 text-xs font-semibold">
                          Pace: <strong className="text-slate-800">{convoy.cruisingSpeedMph} MPH</strong>
                        </span>

                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleToggleJoinConvoy(convoy.id);
                          }}
                          className={`px-3.5 py-1.5 rounded-xl text-xs font-black transition-all flex items-center space-x-1 ${
                            isUserInConvoy
                              ? 'bg-zinc-100 text-zinc-700 hover:bg-red-50 hover:text-red-700'
                              : 'bg-amber-500 text-slate-950 hover:bg-amber-400 shadow-sm'
                          }`}
                        >
                          {isUserInConvoy ? (
                            <>
                              <Check className="w-3.5 h-3.5" />
                              <span>Joined (Leave)</span>
                            </>
                          ) : (
                            <>
                              <Zap className="w-3.5 h-3.5" />
                              <span>Join Convoy</span>
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* LIVE CONVOY COMMS CHAT PANE (COL-5) */}
          <div className="lg:col-span-5 flex flex-col bg-white rounded-2xl border border-zinc-100 shadow-sm overflow-hidden h-[540px]">
            {/* CHAT HEADER */}
            <div className="p-4 border-b border-zinc-100 bg-zinc-50 flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Radio className="w-4 h-4 text-amber-500 animate-pulse" />
                <div>
                  <h4 className="text-xs font-black text-slate-900 leading-tight">
                    {activeConvoy?.title || 'Convoy Radio Comms'}
                  </h4>
                  <span className="text-[10px] text-zinc-400 font-bold">
                    Channel {activeConvoy?.cbChannel || 19} Live Stream • {activeConvoy?.members.length || 0} Drivers Connected
                  </span>
                </div>
              </div>

              {activeConvoy && (
                <button
                  onClick={() => onViewProfile?.(activeConvoy.leader)}
                  className="text-[10px] text-amber-700 bg-amber-50 hover:bg-amber-100 px-2 py-1 rounded font-bold"
                >
                  Lead: @{activeConvoy.leader.username}
                </button>
              )}
            </div>

            {/* MESSAGES SCROLL PANE */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-zinc-50/40">
              {activeChatList.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-2 text-zinc-400">
                  <Volume2 className="w-8 h-8 opacity-40" />
                  <p className="text-xs font-bold">Convoy Channel Clear</p>
                  <p className="text-[11px]">Key your mic below to call out hazards, fuel stops, or verify spacing.</p>
                </div>
              ) : (
                activeChatList.map(msg => {
                  const isMine = msg.sender.id === currentUserProfile.id;

                  return (
                    <div 
                      key={msg.id} 
                      className={`flex flex-col space-y-1 ${isMine ? 'items-end' : 'items-start'}`}
                    >
                      <div className="flex items-center space-x-1.5 text-[10px] text-zinc-400 font-medium">
                        <span 
                          onClick={() => onViewProfile?.(msg.sender)}
                          className="font-bold text-slate-700 hover:text-amber-600 cursor-pointer"
                        >
                          {msg.sender.displayName}
                        </span>
                        <span>•</span>
                        <span>{new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                      </div>

                      <div className={`p-3 rounded-2xl text-xs max-w-[85%] font-normal leading-relaxed ${
                        msg.isAlert 
                          ? 'bg-amber-100 text-amber-950 border border-amber-300 font-bold' 
                          : isMine 
                            ? 'bg-slate-900 text-white rounded-tr-none' 
                            : 'bg-white border border-zinc-200 text-slate-800 rounded-tl-none shadow-xs'
                      }`}>
                        {msg.isAlert && (
                          <span className="flex items-center space-x-1 text-[10px] font-black text-amber-800 uppercase tracking-wider mb-1">
                            <AlertTriangle className="w-3 h-3" />
                            <span>Road Hazard Callout</span>
                          </span>
                        )}
                        {msg.message}
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* CHAT INPUT BAR */}
            <form onSubmit={handleSendConvoyMessage} className="p-3 bg-white border-t border-zinc-100 flex items-center space-x-2">
              <input
                type="text"
                value={convoyChatInput}
                onChange={(e) => setConvoyChatInput(e.target.value)}
                placeholder="Call out to convoy (e.g. 10-4, scale green light ahead)..."
                className="flex-1 bg-zinc-50 border border-zinc-200 rounded-xl px-3.5 py-2 text-xs text-slate-900 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
              />
              <button
                type="submit"
                disabled={!convoyChatInput.trim()}
                className="p-2 bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-slate-950 rounded-xl transition shadow-sm"
                title="Broadcast on Convoy Frequency"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </div>
        </div>
      )}

      {/* TAB 2: CORRIDOR RADAR (LIVE NEARBY RIGS) */}
      {activeTab === 'radar' && (
        <div className="space-y-4" id="corridor-radar-tab">
          <div className="bg-white p-4 rounded-2xl border border-zinc-100 shadow-sm flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Compass className="w-5 h-5 text-blue-500 animate-spin-slow" />
              <div>
                <h3 className="text-sm font-black text-slate-900">Freight Corridor Highway Radar</h3>
                <p className="text-xs text-zinc-400">Broadcasting active commercial drivers within 50 miles on your lane</p>
              </div>
            </div>

            <span className="bg-emerald-50 text-emerald-800 text-[10px] font-black uppercase px-2.5 py-1 rounded-full border border-emerald-100">
              Live Ping Active
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {radars.map(item => {
              const hasPinged = pingedDrivers[item.driver.id];

              return (
                <div
                  key={item.id}
                  className="bg-white rounded-2xl border border-zinc-100 p-5 shadow-sm space-y-4 hover:border-blue-200 transition-all"
                  id={`radar-item-${item.id}`}
                >
                  <div className="flex items-start justify-between">
                    <div 
                      onClick={() => onViewProfile?.(item.driver)}
                      className="flex items-center space-x-3 cursor-pointer group"
                    >
                      <img 
                        src={item.driver.avatarUrl} 
                        className="w-12 h-12 rounded-full object-cover ring-2 ring-white group-hover:ring-amber-400 transition-all shadow-sm" 
                        alt={item.driver.displayName} 
                      />
                      <div>
                        <h4 className="font-bold text-slate-900 text-sm group-hover:text-amber-600 transition-colors">
                          {item.driver.displayName}
                        </h4>
                        <span className="text-xs text-zinc-400 font-medium">@{item.driver.username} • Class {item.driver.cdlClass}</span>
                        <div className="text-[11px] text-zinc-500 font-semibold mt-0.5">
                          {item.rigType}
                        </div>
                      </div>
                    </div>

                    <div className="text-right">
                      <span className="text-sm font-black text-slate-900 block">{item.distanceMilesAway} mi</span>
                      <span className="text-[10px] text-zinc-400 font-bold uppercase">{item.direction}</span>
                    </div>
                  </div>

                  {/* LOCATION & STATUS */}
                  <div className="flex items-center justify-between text-xs bg-zinc-50 p-3 rounded-xl border border-zinc-100">
                    <div className="flex items-center space-x-1.5">
                      <MapPin className="w-3.5 h-3.5 text-zinc-400 shrink-0" />
                      <span className="font-bold text-slate-800 text-[11px]">{item.currentLocation}</span>
                    </div>

                    <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded ${
                      item.status === 'rolling' 
                        ? 'bg-emerald-100 text-emerald-800' 
                        : item.status === 'truck_stop' 
                          ? 'bg-amber-100 text-amber-800' 
                          : 'bg-zinc-200 text-zinc-700'
                    }`}>
                      {item.status.replace('_', ' ')}
                    </span>
                  </div>

                  {/* INTER-USER ACTION BAR */}
                  <div className="flex items-center justify-between pt-1 border-t border-zinc-50 text-xs">
                    <button
                      onClick={() => handlePingDriver(item.driver)}
                      disabled={hasPinged}
                      className={`px-3 py-1.5 rounded-xl font-bold text-xs transition-all flex items-center space-x-1.5 ${
                        hasPinged
                          ? 'bg-emerald-50 text-emerald-700'
                          : 'bg-zinc-100 hover:bg-zinc-200 text-slate-900'
                      }`}
                    >
                      <Radio className="w-3.5 h-3.5 text-amber-500" />
                      <span>{hasPinged ? 'Pinged 10-4' : 'Ping 10-4'}</span>
                    </button>

                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => {
                          setTargetVouchDriver(item.driver);
                          setIsVouchModalOpen(true);
                        }}
                        className="px-2.5 py-1.5 bg-amber-50 hover:bg-amber-100 text-amber-900 font-bold rounded-xl text-xs flex items-center space-x-1"
                        title="Vouch for driver CDL skills"
                      >
                        <Award className="w-3.5 h-3.5 text-amber-600" />
                        <span>Vouch</span>
                      </button>

                      <button
                        onClick={() => onOpenDirectMessage?.(item.driver)}
                        className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl text-xs flex items-center space-x-1 shadow-sm"
                      >
                        <MessageSquare className="w-3.5 h-3.5 text-amber-400" />
                        <span>Message</span>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 3: ROAD RESPECT & PEER ENDORSEMENTS */}
      {activeTab === 'endorsements' && (
        <div className="space-y-6" id="peer-endorsements-tab">
          {/* HEADER & FILTER BAR */}
          <div className="bg-white p-5 rounded-2xl border border-zinc-100 shadow-sm space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="text-base font-black text-slate-900">CDL Peer Endorsements & Road Respect</h3>
                <p className="text-xs text-zinc-400">
                  Verified testimonials and safety vouches from fellow professional drivers who rolled alongside each other.
                </p>
              </div>

              <button
                onClick={() => {
                  setTargetVouchDriver(sampleProfiles[0]);
                  setIsVouchModalOpen(true);
                }}
                className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-black rounded-xl transition flex items-center space-x-2 shadow-sm shrink-0"
              >
                <Award className="w-4 h-4 text-amber-400" />
                <span>Write a Peer Vouch</span>
              </button>
            </div>

            {/* SKILL FILTER PILLS */}
            <div className="flex flex-wrap items-center gap-1.5 pt-2 border-t border-zinc-50 text-xs">
              <span className="text-[10px] text-zinc-400 font-bold uppercase mr-1">Skill:</span>
              {[
                { id: 'all', label: 'All Vouches' },
                { id: 'mountain_driving', label: '🏔️ Mountain Mastery' },
                { id: 'dock_backing', label: '🎯 Dock Backing' },
                { id: 'winter_ice', label: '❄️ Winter Ice' },
                { id: 'roadside_rescue', label: '🛠️ Roadside Aid' },
                { id: 'hazmat_safety', label: '🦺 Hazmat Safety' },
                { id: 'heavy_haul', label: '🏋️ Heavy Haul' }
              ].map(pill => (
                <button
                  key={pill.id}
                  onClick={() => setEndorsementFilter(pill.id)}
                  className={`px-3 py-1 rounded-xl text-xs font-bold transition-all ${
                    endorsementFilter === pill.id
                      ? 'bg-amber-500 text-slate-950 font-black shadow-xs'
                      : 'bg-zinc-100 text-zinc-600 hover:bg-zinc-200'
                  }`}
                >
                  {pill.label}
                </button>
              ))}
            </div>
          </div>

          {/* VOUCHES FEED */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredEndorsements.map(vouch => {
              // Find recipient
              const recipient = sampleProfiles.find(p => p.id === vouch.recipientId) || currentUserProfile;

              return (
                <div 
                  key={vouch.id} 
                  className="bg-white rounded-2xl border border-zinc-100 p-5 shadow-sm space-y-4 hover:border-amber-200 transition-all flex flex-col justify-between"
                  id={`vouch-card-${vouch.id}`}
                >
                  <div className="space-y-3">
                    {/* Header: Endorser -> Recipient */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <img 
                          src={vouch.endorser.avatarUrl} 
                          className="w-8 h-8 rounded-full object-cover cursor-pointer hover:ring-2 ring-amber-400" 
                          alt="" 
                          onClick={() => onViewProfile?.(vouch.endorser)}
                          title={`Endorser: ${vouch.endorser.displayName}`}
                        />
                        <div className="text-xs">
                          <span 
                            onClick={() => onViewProfile?.(vouch.endorser)}
                            className="font-black text-slate-900 hover:text-amber-600 cursor-pointer"
                          >
                            {vouch.endorser.displayName}
                          </span>
                          <span className="text-zinc-400 ml-1">vouched for</span>
                        </div>
                      </div>

                      <div 
                        onClick={() => onViewProfile?.(recipient)}
                        className="flex items-center space-x-1.5 cursor-pointer group bg-zinc-50 px-2 py-1 rounded-lg border border-zinc-100"
                        title={`View ${recipient.displayName}'s Profile`}
                      >
                        <img src={recipient.avatarUrl} className="w-5 h-5 rounded-full object-cover" alt="" />
                        <span className="text-xs font-bold text-slate-800 group-hover:text-amber-600">
                          {recipient.displayName}
                        </span>
                      </div>
                    </div>

                    {/* VOUCH TITLE & SKILL BADGE */}
                    <div className="space-y-1">
                      <div className="flex items-center space-x-2">
                        <span className="bg-amber-100 text-amber-900 text-[10px] font-black uppercase px-2 py-0.5 rounded">
                          {vouch.skill.replace('_', ' ')}
                        </span>
                        <span className="text-[10px] text-zinc-400">
                          {new Date(vouch.date).toLocaleDateString()}
                        </span>
                      </div>
                      <h4 className="text-sm font-bold text-slate-900 leading-snug">
                        {vouch.title}
                      </h4>
                    </div>

                    {/* VOUCH TESTIMONIAL COMMENT */}
                    <p className="text-xs text-zinc-600 font-normal leading-relaxed italic bg-zinc-50/60 p-3 rounded-xl border border-zinc-100">
                      "{vouch.comment}"
                    </p>
                  </div>

                  {/* FOOTER: UPVOTE / CONFIRM */}
                  <div className="pt-2 border-t border-zinc-50 flex items-center justify-between text-xs">
                    <span className="text-[10px] text-zinc-400 font-bold uppercase">
                      FMCSA Verified Peer Endorsement
                    </span>

                    <button
                      onClick={() => handleUpvoteVouch(vouch.id)}
                      className="px-3 py-1 bg-zinc-100 hover:bg-amber-50 hover:text-amber-900 text-zinc-700 font-bold text-xs rounded-lg transition-colors flex items-center space-x-1.5"
                      title="Affirm this driver's skill"
                    >
                      <ThumbsUp className="w-3.5 h-3.5 text-amber-500" />
                      <span>{vouch.upvotes} Affirmative</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* MODAL 1: LAUNCH CONVOY BEACON */}
      {isBeaconModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="w-full max-w-lg bg-white rounded-2xl shadow-2xl overflow-hidden border border-zinc-100 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between px-6 py-4 bg-slate-900 text-white">
              <div className="flex items-center space-x-2">
                <Radio className="w-5 h-5 text-amber-400 animate-pulse" />
                <h3 className="text-sm font-black uppercase tracking-wider">Broadcast Convoy Beacon</h3>
              </div>
              <button 
                onClick={() => setIsBeaconModalOpen(false)}
                className="text-zinc-400 hover:text-white p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleLaunchBeacon} className="p-6 space-y-4 text-xs">
              <div className="space-y-1">
                <label className="font-bold text-slate-800">Convoy Title / Identifier</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. I-80 Wyoming Blizzard Draft Pack"
                  value={beaconTitle}
                  onChange={(e) => setBeaconTitle(e.target.value)}
                  className="w-full p-2.5 bg-zinc-50 border border-zinc-200 rounded-xl font-medium focus:ring-2 focus:ring-amber-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-bold text-slate-800">Highway Corridor</label>
                  <select
                    value={beaconCorridor}
                    onChange={(e) => setBeaconCorridor(e.target.value)}
                    className="w-full p-2.5 bg-zinc-50 border border-zinc-200 rounded-xl font-bold"
                  >
                    <option value="I-80">I-80 Transcontinental</option>
                    <option value="I-40">I-40 Cross-Country</option>
                    <option value="I-10">I-10 Southern Route</option>
                    <option value="I-70">I-70 Rockies to Midwest</option>
                    <option value="I-95">I-95 East Coast Corridor</option>
                    <option value="I-5">I-5 West Coast Spine</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-800">CB Radio Channel</label>
                  <input
                    type="number"
                    min="1"
                    max="40"
                    value={beaconChannel}
                    onChange={(e) => setBeaconChannel(Number(e.target.value))}
                    className="w-full p-2.5 bg-zinc-50 border border-zinc-200 rounded-xl font-bold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-bold text-slate-800">Origin City</label>
                  <input
                    type="text"
                    required
                    value={beaconOrigin}
                    onChange={(e) => setBeaconOrigin(e.target.value)}
                    className="w-full p-2.5 bg-zinc-50 border border-zinc-200 rounded-xl font-medium"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-800">Destination City</label>
                  <input
                    type="text"
                    required
                    value={beaconDestination}
                    onChange={(e) => setBeaconDestination(e.target.value)}
                    className="w-full p-2.5 bg-zinc-50 border border-zinc-200 rounded-xl font-medium"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-bold text-slate-800">Current Mile Marker / 20</label>
                  <input
                    type="text"
                    placeholder="e.g. MM 142 (Evanston)"
                    value={beaconMileMarker}
                    onChange={(e) => setBeaconMileMarker(e.target.value)}
                    className="w-full p-2.5 bg-zinc-50 border border-zinc-200 rounded-xl font-medium"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-800">Target Speed (MPH)</label>
                  <input
                    type="number"
                    min="45"
                    max="75"
                    value={beaconSpeed}
                    onChange={(e) => setBeaconSpeed(Number(e.target.value))}
                    className="w-full p-2.5 bg-zinc-50 border border-zinc-200 rounded-xl font-bold"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-800">Drafting & Convoy Instructions</label>
                <textarea
                  rows={2}
                  placeholder="e.g. High crosswinds near Elk Mountain. Keeping 200ft spacing, lead rig blocking wind. Drafting saves ~12% fuel."
                  value={beaconNotes}
                  onChange={(e) => setBeaconNotes(e.target.value)}
                  className="w-full p-2.5 bg-zinc-50 border border-zinc-200 rounded-xl font-medium"
                />
              </div>

              <div className="pt-2 flex items-center justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setIsBeaconModalOpen(false)}
                  className="px-4 py-2 border border-zinc-200 rounded-xl font-bold text-zinc-600 hover:bg-zinc-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black rounded-xl shadow-md transition"
                >
                  Broadcast Convoy
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: WRITE PEER VOUCH */}
      {isVouchModalOpen && targetVouchDriver && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="w-full max-w-lg bg-white rounded-2xl shadow-2xl overflow-hidden border border-zinc-100 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between px-6 py-4 bg-slate-900 text-white">
              <div className="flex items-center space-x-2">
                <Award className="w-5 h-5 text-amber-400" />
                <h3 className="text-sm font-black uppercase tracking-wider">
                  Vouch for @{targetVouchDriver.username}
                </h3>
              </div>
              <button 
                onClick={() => setIsVouchModalOpen(false)}
                className="text-zinc-400 hover:text-white p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmitVouch} className="p-6 space-y-4 text-xs">
              <div className="bg-amber-50 border border-amber-100 p-3 rounded-xl flex items-center space-x-3">
                <img src={targetVouchDriver.avatarUrl} className="w-10 h-10 rounded-full object-cover" alt="" />
                <div>
                  <h4 className="font-black text-slate-900">{targetVouchDriver.displayName}</h4>
                  <p className="text-[11px] text-amber-900 font-semibold">
                    Class {targetVouchDriver.cdlClass} • {targetVouchDriver.currentRig}
                  </p>
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-800">Select Professional Skill Vouched</label>
                <select
                  value={vouchSkill}
                  onChange={(e) => setVouchSkill(e.target.value as any)}
                  className="w-full p-2.5 bg-zinc-50 border border-zinc-200 rounded-xl font-bold text-slate-900"
                >
                  <option value="mountain_driving">🏔️ Mountain & Chain-Up Mastery</option>
                  <option value="dock_backing">🎯 Precision 90° & Blind-Side Backing</option>
                  <option value="winter_ice">❄️ Winter Ice & Blizzard Composure</option>
                  <option value="roadside_rescue">🛠️ Roadside Mechanical Assistance</option>
                  <option value="hazmat_safety">🦺 FMCSA Hazmat & Placard Compliance</option>
                  <option value="heavy_haul">🏋️ Heavy Haul & Oversized Route Navigation</option>
                  <option value="fuel_efficiency">⚡ Aerodynamic Drafting & Fuel Economy</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-800">Commendation Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Masterful chain-up on Cabbage Hill pass"
                  value={vouchTitle}
                  onChange={(e) => setVouchTitle(e.target.value)}
                  className="w-full p-2.5 bg-zinc-50 border border-zinc-200 rounded-xl font-medium focus:ring-2 focus:ring-amber-500 focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-800">Your Personal Witness Story / Commendation</label>
                <textarea
                  rows={3}
                  required
                  placeholder="Describe where and when you witnessed this driver's safety or skill (e.g. helped slide tandems in -10° wind, or kept cool on black ice)..."
                  value={vouchComment}
                  onChange={(e) => setVouchComment(e.target.value)}
                  className="w-full p-2.5 bg-zinc-50 border border-zinc-200 rounded-xl font-medium focus:ring-2 focus:ring-amber-500 focus:outline-none"
                />
              </div>

              <div className="pt-2 flex items-center justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setIsVouchModalOpen(false)}
                  className="px-4 py-2 border border-zinc-200 rounded-xl font-bold text-zinc-600 hover:bg-zinc-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-slate-900 hover:bg-slate-800 text-white font-black rounded-xl shadow-md transition"
                >
                  Submit Endorsement
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
