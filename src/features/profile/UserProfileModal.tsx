import React, { useState, useEffect } from 'react';
import { Profile, PeerEndorsement, EndorsementSkill } from '../../types';
import { currentUserProfile, samplePeerEndorsements } from '../../data';
import DriverTimelineView from './DriverTimelineView';
import { 
  X, 
  CheckCircle2, 
  MapPin, 
  Truck, 
  Award, 
  Compass, 
  ShieldCheck, 
  MessageSquare, 
  UserPlus, 
  UserCheck, 
  Share2, 
  Check, 
  Layers,
  Wrench,
  ExternalLink,
  Shield,
  Radio,
  FileCheck,
  ThumbsUp,
  PlusCircle,
  GraduationCap,
  Video,
  Play,
  Camera,
  Youtube,
  Clock,
  DollarSign
} from 'lucide-react';

interface UserProfileModalProps {
  profile: Profile | null;
  onClose: () => void;
  onOpenDirectMessage?: (profile: Profile) => void;
}

export default function UserProfileModal({ profile, onClose, onOpenDirectMessage }: UserProfileModalProps) {
  if (!profile) return null;

  const isOwnProfile = profile.id === currentUserProfile.id;

  // Active Tab: 'timeline' | 'instructor' | 'creator' | 'rig_specs' | 'credentials' | 'alliance' | 'endorsements'
  const [activeTab, setActiveTab] = useState<string>(
    profile.role === 'instructor' ? 'instructor' : 
    profile.role === 'creator' ? 'creator' : 'timeline'
  );
  const [isFollowing, setIsFollowing] = useState(false);
  const [followerCount, setFollowerCount] = useState(profile.followerCount);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  // Peer Endorsements state
  const [endorsements, setEndorsements] = useState<PeerEndorsement[]>([]);
  const [isWritingVouch, setIsWritingVouch] = useState(false);
  const [vouchSkill, setVouchSkill] = useState<EndorsementSkill>('mountain_driving');
  const [vouchTitle, setVouchTitle] = useState('');
  const [vouchComment, setVouchComment] = useState('');

  // Load following and vouches state
  useEffect(() => {
    const cachedFollowing = localStorage.getItem('trucker_following_users');
    if (cachedFollowing) {
      const followMap = JSON.parse(cachedFollowing);
      setIsFollowing(!!followMap[profile.id]);
    }

    const cachedVouches = localStorage.getItem('trucker_peer_vouches');
    if (cachedVouches) {
      const allVouches: PeerEndorsement[] = JSON.parse(cachedVouches);
      setEndorsements(allVouches.filter(v => v.recipientId === profile.id));
    } else {
      const initial = samplePeerEndorsements.filter(v => v.recipientId === profile.id);
      setEndorsements(initial);
    }
  }, [profile.id]);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3000);
  };

  const handleVouchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!vouchTitle.trim() || !vouchComment.trim()) return;

    const newVouch: PeerEndorsement = {
      id: `vouch-${Date.now()}`,
      recipientId: profile.id,
      endorser: currentUserProfile,
      skill: vouchSkill,
      title: vouchTitle.trim(),
      comment: vouchComment.trim(),
      date: new Date().toISOString(),
      upvotes: 1
    };

    // Update local state and global storage
    const updatedForProfile = [newVouch, ...endorsements];
    setEndorsements(updatedForProfile);

    const cachedAll = localStorage.getItem('trucker_peer_vouches');
    const allVouches: PeerEndorsement[] = cachedAll ? JSON.parse(cachedAll) : samplePeerEndorsements;
    localStorage.setItem('trucker_peer_vouches', JSON.stringify([newVouch, ...allVouches]));

    setIsWritingVouch(false);
    setVouchTitle('');
    setVouchComment('');
    showToast(`Vouch registered for @${profile.username}! Road respect score updated.`);
  };

  const handleUpvoteVouch = (vouchId: string) => {
    const updated = endorsements.map(v => v.id === vouchId ? { ...v, upvotes: v.upvotes + 1 } : v);
    setEndorsements(updated);

    const cachedAll = localStorage.getItem('trucker_peer_vouches');
    if (cachedAll) {
      const allVouches: PeerEndorsement[] = JSON.parse(cachedAll);
      const updatedAll = allVouches.map(v => v.id === vouchId ? { ...v, upvotes: v.upvotes + 1 } : v);
      localStorage.setItem('trucker_peer_vouches', JSON.stringify(updatedAll));
    }
    showToast('Affirmative! Endorsement upvoted.');
  };

  useEffect(() => {
    if (toastMsg) {
      const timer = setTimeout(() => setToastMsg(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [toastMsg]);

  const handleToggleFollow = () => {
    const cachedFollowing = localStorage.getItem('trucker_following_users');
    const ids: string[] = cachedFollowing ? JSON.parse(cachedFollowing) : [];

    if (isFollowing) {
      const updated = ids.filter(id => id !== profile.id);
      localStorage.setItem('trucker_following_users', JSON.stringify(updated));
      setIsFollowing(false);
      setFollowerCount(prev => Math.max(0, prev - 1));
      setToastMsg(`Unfollowed @${profile.username}`);
    } else {
      const updated = [...ids, profile.id];
      localStorage.setItem('trucker_following_users', JSON.stringify(updated));
      setIsFollowing(true);
      setFollowerCount(prev => prev + 1);
      setToastMsg(`Connected with @${profile.username} in Driver Alliance!`);
    }
  };

  const handleShareProfile = () => {
    navigator.clipboard?.writeText(window.location.href);
    setToastMsg(`Driver profile link copied to clipboard!`);
  };

  // Mock rig specs based on profile
  const rigDetails = {
    tractor: profile.currentRig || 'Commercial Class 8 Tractor',
    engine: profile.currentRig.includes('Peterbilt') ? 'Cummins X15 Performance (565 HP)' :
            profile.currentRig.includes('Kenworth') ? 'PACCAR MX-13 / Cummins X15' :
            profile.currentRig.includes('Cascadia') ? 'Detroit DD15 TC (505 HP)' : 'Volvo D13 Turbo Compound',
    transmission: profile.currentRig.includes('Peterbilt') ? '18-Speed Eaton Fuller Manual' : 'Eaton Endurant 12-Speed AMT',
    sleeperCab: '76-inch High-Rise Double Bunk',
    fmcsaRating: '98.8% Green (Satisfactory Tier 1)',
    inspectionStatus: 'Current 2026 Annual Passed',
    mpgAverage: '7.4 MPG (Fleet Optimized)',
    eldCompliant: true,
    twicApproved: true,
  };

  const defaultEndorsements = [
    'Hazmat (H) Approved',
    'Tanker (N) Endorsement',
    'Doubles / Triples (T)',
    'TWIC Card Clearance',
    'Air Brake Certified'
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-sm p-3 sm:p-6 overflow-y-auto" id="user-profile-modal">
      <div className="w-full max-w-4xl bg-white rounded-2xl shadow-2xl overflow-hidden border border-zinc-100 max-h-[92vh] flex flex-col my-auto animate-in fade-in zoom-in-95 duration-200">
        {/* TOAST NOTIFICATION */}
        {toastMsg && (
          <div className="absolute top-4 left-1/2 -translate-x-1/2 z-50 bg-slate-900 text-white text-xs font-bold px-4 py-2 rounded-xl shadow-xl flex items-center space-x-2 border border-slate-700">
            <CheckCircle2 className="w-4 h-4 text-amber-400" />
            <span>{toastMsg}</span>
          </div>
        )}

        {/* HERO HEADER & COVER BANNER */}
        <div className="relative bg-slate-900 h-44 sm:h-52 shrink-0">
          <img 
            src="https://images.unsplash.com/photo-1516594798947-e65505dbb29d?auto=format&fit=crop&q=80&w=1200"
            className="w-full h-full object-cover opacity-80"
            alt="Trucker Cover"
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-black/75"></div>

          {/* Close modal button */}
          <button
            id="btn-close-profile-modal"
            onClick={onClose}
            className="absolute top-4 right-4 bg-black/40 hover:bg-black/60 text-white p-2 rounded-full backdrop-blur-sm transition-colors z-20"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Top Corridor badge */}
          <div className="absolute top-4 left-4 z-10 flex items-center space-x-2">
            <span className="bg-amber-500 text-slate-950 text-[10px] font-black uppercase px-2.5 py-1 rounded-lg shadow-sm">
              CDL Class {profile.cdlClass}
            </span>
            <span className="bg-slate-900/80 backdrop-blur-sm text-white text-[10px] font-bold px-2.5 py-1 rounded-lg border border-white/10">
              {profile.carrierName}
            </span>
          </div>
        </div>

        {/* PROFILE IDENTITY ROW */}
        <div className="px-6 pb-4 relative shrink-0 border-b border-zinc-100 bg-white">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between -mt-14 mb-4 gap-4">
            {/* Avatar */}
            <div className="relative inline-block">
              <img 
                src={profile.avatarUrl} 
                className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl border-4 border-white shadow-xl object-cover bg-white"
                alt={profile.displayName}
                referrerPolicy="no-referrer"
              />
              {profile.isVerified && (
                <span className="absolute -bottom-1 -right-1 bg-amber-500 text-slate-950 p-1.5 rounded-full shadow border-2 border-white" title="Verified Commercial CDL">
                  <CheckCircle2 className="w-4 h-4 fill-slate-950 text-amber-500" />
                </span>
              )}
            </div>

            {/* Quick Action buttons */}
            <div className="flex items-center space-x-2.5">
              {!isOwnProfile && (
                <>
                  <button
                    id="btn-profile-toggle-follow"
                    onClick={handleToggleFollow}
                    className={`px-4 py-2 rounded-xl text-xs font-black transition-all flex items-center space-x-1.5 shadow-sm ${
                      isFollowing
                        ? 'bg-zinc-100 hover:bg-zinc-200 text-slate-800 border border-zinc-200'
                        : 'bg-amber-500 hover:bg-amber-600 active:bg-amber-700 text-slate-950'
                    }`}
                  >
                    {isFollowing ? <UserCheck className="w-3.5 h-3.5 text-emerald-600" /> : <UserPlus className="w-3.5 h-3.5" />}
                    <span>{isFollowing ? 'Alliance Connected' : 'Connect Alliance'}</span>
                  </button>

                  {onOpenDirectMessage && (
                    <button
                      onClick={() => onOpenDirectMessage(profile)}
                      className="px-3.5 py-2 rounded-xl text-xs font-black bg-slate-900 hover:bg-slate-800 text-white flex items-center space-x-1.5 shadow-sm transition-all"
                    >
                      <Radio className="w-3.5 h-3.5 text-amber-400" />
                      <span>CB Dispatch</span>
                    </button>
                  )}

                  <button
                    onClick={() => {
                      setActiveTab('endorsements');
                      setIsWritingVouch(true);
                    }}
                    className="px-3 py-2 rounded-xl text-xs font-black bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200 flex items-center space-x-1.5 shadow-xs transition-all"
                    title="Vouch for driver CDL skills"
                  >
                    <Award className="w-3.5 h-3.5 text-amber-600" />
                    <span>Vouch</span>
                  </button>

                  <button
                    onClick={() => showToast(`Convoy invitation radioed on CB Ch. 19 to @${profile.username}!`)}
                    className="px-3 py-2 rounded-xl text-xs font-bold bg-zinc-100 hover:bg-zinc-200 text-slate-800 flex items-center space-x-1.5 transition-all"
                    title="Invite to Drafting Convoy"
                  >
                    <Truck className="w-3.5 h-3.5 text-amber-500" />
                    <span>Invite to Convoy</span>
                  </button>
                </>
              )}

              <button
                onClick={handleShareProfile}
                className="p-2 border border-zinc-200 hover:bg-zinc-50 rounded-xl text-zinc-600 transition-colors"
                title="Share Profile Link"
              >
                <Share2 className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Details header */}
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-xl font-black text-slate-900 tracking-tight">{profile.displayName}</h2>
              <span className="text-xs text-zinc-400 font-bold">@{profile.username}</span>
              {profile.isVerified && (
                <span className="bg-emerald-50 text-emerald-800 border border-emerald-100 text-[10px] font-black uppercase px-2 py-0.5 rounded">
                  FMCSA Verified
                </span>
              )}
            </div>

            <p className="text-xs text-zinc-600 font-normal leading-relaxed max-w-2xl">
              {profile.bio}
            </p>

            {/* Quick Badges specs */}
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs text-zinc-500 font-semibold pt-1">
              <span className="flex items-center space-x-1">
                <Truck className="w-3.5 h-3.5 text-amber-500" />
                <strong className="text-slate-800 font-bold">{profile.currentRig}</strong>
              </span>
              <span className="flex items-center space-x-1">
                <MapPin className="w-3.5 h-3.5 text-zinc-400" />
                <span>Base: {profile.homeBase}</span>
              </span>
              <span className="flex items-center space-x-1">
                <Award className="w-3.5 h-3.5 text-zinc-400" />
                <span>{profile.yearsExperience} Years Experience</span>
              </span>
            </div>

            {/* Metrics counter bar */}
            <div className="flex items-center space-x-6 pt-3 text-xs font-bold">
              <div>
                <span className="text-sm font-black text-slate-900">{profile.postCount}</span>
                <span className="text-zinc-400 text-[11px] ml-1 uppercase">Dispatches</span>
              </div>
              <div>
                <span className="text-sm font-black text-slate-900">{followerCount}</span>
                <span className="text-zinc-400 text-[11px] ml-1 uppercase">Followers</span>
              </div>
              <div>
                <span className="text-sm font-black text-slate-900">{profile.followingCount}</span>
                <span className="text-zinc-400 text-[11px] ml-1 uppercase">Following</span>
              </div>
              <div>
                <span className="text-sm font-black text-emerald-600">98.8%</span>
                <span className="text-zinc-400 text-[11px] ml-1 uppercase">Safety Rank</span>
              </div>
            </div>
          </div>
        </div>

        {/* NAVIGATION TABS */}
        <div className="flex border-b border-zinc-100 bg-zinc-50/50 px-6 shrink-0 overflow-x-auto scrollbar-none" id="profile-subtabs">
          {[
            ...(profile.role === 'instructor' || profile.instructorInfo ? [{ id: 'instructor', label: '🎓 CDL Academy & Courses' }] : []),
            ...(profile.role === 'creator' || profile.creatorInfo ? [{ id: 'creator', label: '🎥 Creator Studio & Vlogs' }] : []),
            { id: 'timeline', label: 'Driver Activity Timeline' },
            { id: 'endorsements', label: `Peer Vouches & Respect (${endorsements.length})` },
            { id: 'rig_specs', label: 'Tractor & Rig Specs' },
            { id: 'credentials', label: 'CDL Credentials & Safety' },
            { id: 'alliance', label: 'Freight Corridors & Alliance' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`py-3 px-4 text-xs font-bold transition-all border-b-2 -mb-px shrink-0 ${
                activeTab === tab.id
                  ? 'border-amber-500 text-slate-900 bg-white font-extrabold shadow-sm'
                  : 'border-transparent text-zinc-400 hover:text-zinc-700'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* TAB CONTENTS (SCROLLABLE) */}
        <div className="flex-1 overflow-y-auto p-6 bg-zinc-50/40">
          {activeTab === 'instructor' && (
            <div className="space-y-6" id="instructor-tab-pane">
              {/* Academy Card */}
              <div className="bg-gradient-to-br from-amber-500/10 via-white to-slate-50 border border-amber-500/30 rounded-2xl p-6 shadow-sm space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 rounded-2xl bg-amber-500 text-slate-950 flex items-center justify-center font-black shadow-md">
                      <GraduationCap className="w-6 h-6" />
                    </div>
                    <div>
                      <span className="text-[10px] font-black uppercase tracking-wider text-amber-700 bg-amber-100 px-2 py-0.5 rounded-md">
                        Certified CDL Instructor
                      </span>
                      <h3 className="text-base font-black text-slate-900 mt-1">
                        {profile.instructorInfo?.academyName || 'Elite CDL Road Academy'}
                      </h3>
                      <p className="text-xs text-zinc-500 font-medium">
                        Mentoring drivers in safe maneuvers, mountain driving, and pre-trip inspections.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2 shrink-0">
                    {profile.instructorInfo?.hourlyRate && (
                      <div className="bg-white border border-slate-200 px-3 py-1.5 rounded-xl text-right">
                        <span className="text-[9px] text-zinc-400 font-bold block uppercase">1-on-1 Mentorship</span>
                        <strong className="text-sm font-black text-slate-900">${profile.instructorInfo.hourlyRate}/hr</strong>
                      </div>
                    )}
                    {onOpenDirectMessage && (
                      <button
                        onClick={() => onOpenDirectMessage(profile)}
                        className="bg-amber-500 hover:bg-amber-600 text-slate-950 font-black text-xs px-4 py-2.5 rounded-xl shadow transition"
                      >
                        Inquire / Book
                      </button>
                    )}
                  </div>
                </div>

                {/* Specialties */}
                {profile.instructorInfo?.specialties && (
                  <div className="pt-3 border-t border-amber-500/20 space-y-1.5">
                    <span className="text-[11px] font-black text-slate-700 uppercase tracking-wider block">
                      Instructor Specialties & Mastery
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {profile.instructorInfo.specialties.map((spec, i) => (
                        <span key={i} className="bg-white border border-amber-300 text-amber-950 font-extrabold text-xs px-3 py-1 rounded-xl shadow-xs">
                          ✓ {spec}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Course Modules */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-black uppercase tracking-wider text-slate-700">
                    Active Courses & Training Modules ({profile.instructorInfo?.courses?.length || 0})
                  </h4>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {(profile.instructorInfo?.courses || [
                    {
                      id: 'crs-1',
                      title: 'Mastering the 90-Degree Blind-Side Alley Dock',
                      description: 'Step-by-step cab reference points, pivot angles, and clutch modulation for zero-incident tight terminal docks.',
                      duration: '3-Day Practical Intensive',
                      price: 250,
                      format: 'In-Cab Practical'
                    },
                    {
                      id: 'crs-2',
                      title: 'Mountain Grade Braking & Jake Brake Control',
                      description: 'Descent speed control, gear selection, heat management, and runaway ramp avoidance through Rocky Mountain passes.',
                      duration: '2-Day Mastery',
                      price: 180,
                      format: 'Tele-Study & Simulator'
                    }
                  ]).map((crs) => (
                    <div key={crs.id} className="bg-white rounded-2xl border border-slate-200/90 p-4 space-y-3 shadow-sm hover:border-amber-400 transition">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <span className="text-[9px] font-black uppercase px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                            {crs.format}
                          </span>
                          <h5 className="text-xs font-black text-slate-900 mt-1.5 leading-snug">{crs.title}</h5>
                        </div>
                        <span className="text-sm font-black text-amber-600 bg-amber-50 px-2 py-1 rounded-lg shrink-0">
                          ${crs.price}
                        </span>
                      </div>

                      <p className="text-[11px] text-zinc-600 font-medium leading-relaxed">
                        {crs.description}
                      </p>

                      <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
                        <span className="text-[11px] font-bold text-zinc-400 flex items-center space-x-1">
                          <Clock className="w-3.5 h-3.5 text-zinc-400" />
                          <span>{crs.duration}</span>
                        </span>

                        {onOpenDirectMessage && (
                          <button
                            onClick={() => onOpenDirectMessage(profile)}
                            className="text-amber-600 hover:text-amber-700 font-black text-xs"
                          >
                            Enroll / Message →
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'creator' && (
            <div className="space-y-6" id="creator-tab-pane">
              {/* Creator Niche Card */}
              <div className="bg-gradient-to-br from-rose-500/10 via-white to-purple-500/10 border border-rose-200 rounded-2xl p-6 shadow-sm space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 rounded-2xl bg-rose-500 text-white flex items-center justify-center font-black shadow-md">
                      <Video className="w-6 h-6" />
                    </div>
                    <div>
                      <span className="text-[10px] font-black uppercase tracking-wider text-rose-700 bg-rose-100 px-2 py-0.5 rounded-md">
                        Verified Road Vlogger & Creator
                      </span>
                      <h3 className="text-base font-black text-slate-900 mt-1">
                        {profile.creatorInfo?.niche || 'Over-The-Road Rig Vlogs & Highway Walkarounds'}
                      </h3>
                      <p className="text-xs text-zinc-500 font-medium">
                        Publishing high-production truck walkarounds, cab tours, and cross-country road trips.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Social Channels */}
                <div className="pt-3 border-t border-rose-100 grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {profile.creatorInfo?.youtubeHandle && (
                    <div className="p-3 bg-white rounded-xl border border-slate-200 shadow-xs space-y-0.5">
                      <div className="flex items-center space-x-1.5 text-rose-600 font-black text-xs">
                        <Youtube className="w-4 h-4" />
                        <span>YouTube</span>
                      </div>
                      <p className="text-xs font-bold text-slate-800 truncate">{profile.creatorInfo.youtubeHandle}</p>
                      {profile.creatorInfo.subscriberCount && (
                        <span className="text-[10px] text-zinc-400 font-bold block">{profile.creatorInfo.subscriberCount.toLocaleString()} Subs</span>
                      )}
                    </div>
                  )}
                  {profile.creatorInfo?.tiktokHandle && (
                    <div className="p-3 bg-white rounded-xl border border-slate-200 shadow-xs space-y-0.5">
                      <span className="text-xs font-black text-slate-900 block">TikTok</span>
                      <p className="text-xs font-bold text-slate-800 truncate">{profile.creatorInfo.tiktokHandle}</p>
                    </div>
                  )}
                  {profile.creatorInfo?.podcastName && (
                    <div className="p-3 bg-white rounded-xl border border-slate-200 shadow-xs space-y-0.5">
                      <span className="text-xs font-black text-purple-600 block">Podcast</span>
                      <p className="text-xs font-bold text-slate-800 truncate">{profile.creatorInfo.podcastName}</p>
                    </div>
                  )}
                  {profile.creatorInfo?.instagramHandle && (
                    <div className="p-3 bg-white rounded-xl border border-slate-200 shadow-xs space-y-0.5">
                      <span className="text-xs font-black text-pink-600 block">Instagram</span>
                      <p className="text-xs font-bold text-slate-800 truncate">{profile.creatorInfo.instagramHandle}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Featured Video / Cab Walkaround */}
              <div className="space-y-3">
                <h4 className="text-xs font-black uppercase tracking-wider text-slate-700 flex items-center space-x-2">
                  <Play className="w-3.5 h-3.5 text-rose-500 fill-rose-500" />
                  <span>Featured Road Vlog Tour</span>
                </h4>

                <div className="relative rounded-2xl overflow-hidden bg-slate-950 border border-slate-800 shadow-lg group">
                  <img
                    src="https://images.unsplash.com/photo-1594897030264-ab7d87efc473?auto=format&fit=crop&q=80&w=1200"
                    alt="Featured Cab Walkthrough"
                    className="w-full h-64 sm:h-80 object-cover opacity-80 group-hover:scale-102 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent" />

                  <div className="absolute inset-0 flex items-center justify-center">
                    <button 
                      onClick={() => showToast('Playing Road Cam preview in high resolution...')}
                      className="w-16 h-16 rounded-full bg-rose-600 hover:bg-rose-500 text-white flex items-center justify-center shadow-2xl transition hover:scale-110"
                    >
                      <Play className="w-8 h-8 fill-white ml-1" />
                    </button>
                  </div>

                  <div className="absolute bottom-4 left-4 right-4 text-white">
                    <span className="bg-rose-500 text-white text-[10px] font-black uppercase px-2 py-0.5 rounded">
                      Featured Rig Walkaround
                    </span>
                    <h5 className="text-base font-black text-white mt-1">
                      {profile.creatorInfo?.featuredTitle || 'Full Tour: Custom 2024 Sleeper Cab with Triple Solar Array & Off-Grid Studio'}
                    </h5>
                    <p className="text-xs text-zinc-300">
                      Filmed live across I-80 Wyoming snowstorm.
                    </p>
                  </div>
                </div>
              </div>

              {/* Filming Gear */}
              {profile.creatorInfo?.equipmentList && (
                <div className="bg-white rounded-2xl border border-slate-200 p-4 space-y-2">
                  <span className="text-xs font-black uppercase text-slate-700 flex items-center space-x-1.5">
                    <Camera className="w-3.5 h-3.5 text-sky-500" />
                    <span>Filming & Audio Equipment List</span>
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {profile.creatorInfo.equipmentList.map((eq, i) => (
                      <span key={i} className="bg-slate-100 text-slate-800 text-xs font-bold px-2.5 py-1 rounded-lg">
                        {eq}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
          {activeTab === 'timeline' && (
            <DriverTimelineView profile={profile} isOwnProfile={isOwnProfile} />
          )}

          {activeTab === 'endorsements' && (
            <div className="space-y-6" id="peer-endorsements-tab-pane">
              {/* Trust Score & Action header */}
              <div className="bg-white rounded-2xl border border-zinc-100 p-6 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center space-x-3">
                  <div className="p-3 bg-amber-50 rounded-2xl border border-amber-200">
                    <Award className="w-8 h-8 text-amber-600" />
                  </div>
                  <div>
                    <div className="flex items-center space-x-2">
                      <h3 className="text-base font-black text-slate-900">Peer Road Respect & Vouches</h3>
                      <span className="bg-emerald-50 text-emerald-800 text-[10px] font-black uppercase px-2 py-0.5 rounded">
                        Verified CDL Alliance
                      </span>
                    </div>
                    <p className="text-xs text-zinc-500">
                      {endorsements.length} fellow commercial drivers have vouched for this driver's road safety and technical mastery.
                    </p>
                  </div>
                </div>

                {!isOwnProfile && (
                  <button
                    onClick={() => setIsWritingVouch(prev => !prev)}
                    className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white font-black text-xs rounded-xl shadow-sm transition flex items-center space-x-1.5 shrink-0"
                  >
                    <PlusCircle className="w-4 h-4 text-amber-400" />
                    <span>{isWritingVouch ? 'Cancel Vouch' : 'Write Peer Vouch'}</span>
                  </button>
                )}
              </div>

              {/* INLINE VOUCH FORM */}
              {isWritingVouch && (
                <form onSubmit={handleVouchSubmit} className="bg-white rounded-2xl border-2 border-amber-400/40 p-6 shadow-md space-y-4 text-xs animate-in fade-in">
                  <h4 className="font-black text-slate-900 text-sm flex items-center space-x-2">
                    <Award className="w-4 h-4 text-amber-500" />
                    <span>Vouch for @{profile.username}'s CDL Skills</span>
                  </h4>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="font-bold text-slate-800">Skill Vouched</label>
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
                  </div>

                  <div className="space-y-1">
                    <label className="font-bold text-slate-800">Your Witness Story / Commendation</label>
                    <textarea
                      rows={3}
                      required
                      placeholder="Describe what you witnessed this driver do (e.g. helped slide tandems in -10° wind, or kept cool on black ice)..."
                      value={vouchComment}
                      onChange={(e) => setVouchComment(e.target.value)}
                      className="w-full p-2.5 bg-zinc-50 border border-zinc-200 rounded-xl font-medium focus:ring-2 focus:ring-amber-500 focus:outline-none"
                    />
                  </div>

                  <div className="flex items-center justify-end space-x-2 pt-1">
                    <button
                      type="button"
                      onClick={() => setIsWritingVouch(false)}
                      className="px-4 py-2 border border-zinc-200 rounded-xl font-bold text-zinc-600 hover:bg-zinc-50"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-5 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black rounded-xl shadow-md transition"
                    >
                      Record Road Vouch
                    </button>
                  </div>
                </form>
              )}

              {/* VOUCHES LIST */}
              {endorsements.length === 0 ? (
                <div className="bg-white rounded-2xl border border-zinc-100 p-8 text-center space-y-2">
                  <Award className="w-10 h-10 text-zinc-300 mx-auto" />
                  <p className="text-xs font-bold text-slate-800">No peer vouches yet</p>
                  <p className="text-[11px] text-zinc-400 max-w-sm mx-auto">
                    Be the first driver to commend @{profile.username}'s road safety or technical trucking skills!
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {endorsements.map(vouch => (
                    <div 
                      key={vouch.id}
                      className="bg-white rounded-2xl border border-zinc-100 p-5 shadow-sm space-y-3 flex flex-col justify-between"
                    >
                      <div className="space-y-2.5">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <img src={vouch.endorser.avatarUrl} className="w-7 h-7 rounded-full object-cover" alt="" />
                            <div className="text-xs">
                              <span className="font-bold text-slate-900">{vouch.endorser.displayName}</span>
                              <span className="text-zinc-400 text-[10px] ml-1">vouched</span>
                            </div>
                          </div>

                          <span className="bg-amber-100 text-amber-900 text-[10px] font-black uppercase px-2 py-0.5 rounded">
                            {vouch.skill.replace('_', ' ')}
                          </span>
                        </div>

                        <h4 className="text-xs font-bold text-slate-900 leading-snug">{vouch.title}</h4>
                        <p className="text-xs text-zinc-600 italic bg-zinc-50 p-3 rounded-xl border border-zinc-100/60 leading-relaxed">
                          "{vouch.comment}"
                        </p>
                      </div>

                      <div className="pt-2 border-t border-zinc-50 flex items-center justify-between text-[11px]">
                        <span className="text-zinc-400 text-[10px]">
                          {new Date(vouch.date).toLocaleDateString()}
                        </span>
                        <button
                          onClick={() => handleUpvoteVouch(vouch.id)}
                          className="px-2.5 py-1 bg-zinc-100 hover:bg-amber-50 hover:text-amber-900 text-zinc-700 font-bold rounded-lg transition flex items-center space-x-1"
                        >
                          <ThumbsUp className="w-3 h-3 text-amber-500" />
                          <span>{vouch.upvotes} Affirmative</span>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'rig_specs' && (
            <div className="space-y-6" id="rig-specs-tab-pane">
              <div className="bg-white rounded-2xl border border-zinc-100 p-6 shadow-sm space-y-4">
                <div className="flex items-center space-x-2 border-b border-zinc-50 pb-3">
                  <Truck className="w-5 h-5 text-amber-500" />
                  <div>
                    <h3 className="text-sm font-black text-slate-900">Commercial Rig Specifications</h3>
                    <p className="text-[11px] text-zinc-400">Audited powertrain, sleeper configuration, and emissions compliance</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  <div className="bg-zinc-50 p-3.5 rounded-xl border border-zinc-100 space-y-1">
                    <span className="text-[10px] font-bold text-zinc-400 uppercase">Primary Tractor</span>
                    <p className="font-black text-slate-900">{rigDetails.tractor}</p>
                  </div>
                  <div className="bg-zinc-50 p-3.5 rounded-xl border border-zinc-100 space-y-1">
                    <span className="text-[10px] font-bold text-zinc-400 uppercase">Engine Specs</span>
                    <p className="font-black text-slate-900">{rigDetails.engine}</p>
                  </div>
                  <div className="bg-zinc-50 p-3.5 rounded-xl border border-zinc-100 space-y-1">
                    <span className="text-[10px] font-bold text-zinc-400 uppercase">Transmission</span>
                    <p className="font-black text-slate-900">{rigDetails.transmission}</p>
                  </div>
                  <div className="bg-zinc-50 p-3.5 rounded-xl border border-zinc-100 space-y-1">
                    <span className="text-[10px] font-bold text-zinc-400 uppercase">Sleeper Berth</span>
                    <p className="font-black text-slate-900">{rigDetails.sleeperCab}</p>
                  </div>
                  <div className="bg-zinc-50 p-3.5 rounded-xl border border-zinc-100 space-y-1">
                    <span className="text-[10px] font-bold text-zinc-400 uppercase">Fuel Economy</span>
                    <p className="font-black text-emerald-700">{rigDetails.mpgAverage}</p>
                  </div>
                  <div className="bg-zinc-50 p-3.5 rounded-xl border border-zinc-100 space-y-1">
                    <span className="text-[10px] font-bold text-zinc-400 uppercase">Annual DOT Inspection</span>
                    <p className="font-black text-emerald-700 flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" /> {rigDetails.inspectionStatus}
                    </p>
                  </div>
                </div>
              </div>

              {/* Photo Showcase */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Rig & Highway Photos</h4>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {[
                    'https://images.unsplash.com/photo-1601584115197-04ecc0da31d7?auto=format&fit=crop&q=80&w=400',
                    'https://images.unsplash.com/photo-1516594798947-e65505dbb29d?auto=format&fit=crop&q=80&w=400',
                    'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&q=80&w=400'
                  ].map((url, idx) => (
                    <div key={idx} className="rounded-xl overflow-hidden h-32 bg-zinc-100 border border-zinc-100 shadow-sm">
                      <img src={url} className="w-full h-full object-cover hover:scale-105 transition-transform" alt="Rig" referrerPolicy="no-referrer" />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'credentials' && (
            <div className="space-y-6" id="credentials-tab-pane">
              {/* FMCSA Score Card */}
              <div className="bg-white rounded-2xl border border-zinc-100 p-6 shadow-sm space-y-4">
                <div className="flex items-center space-x-2 border-b border-zinc-50 pb-3">
                  <ShieldCheck className="w-5 h-5 text-emerald-600" />
                  <div>
                    <h3 className="text-sm font-black text-slate-900">FMCSA & Safety Compliance Record</h3>
                    <p className="text-[11px] text-zinc-400">PrePass bypass status and official federal safety audit score</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="bg-emerald-50 border border-emerald-100 p-4 rounded-xl space-y-1">
                    <span className="text-[10px] font-bold text-emerald-800 uppercase block">Safety Green Rank</span>
                    <p className="text-xl font-black text-emerald-950">98.8%</p>
                    <p className="text-[10px] text-emerald-700 font-semibold">PrePass Green Light Eligible at 95% of State POEs</p>
                  </div>

                  <div className="bg-zinc-50 border border-zinc-100 p-4 rounded-xl space-y-1">
                    <span className="text-[10px] font-bold text-zinc-500 uppercase block">Total Logged Safe Miles</span>
                    <p className="text-xl font-black text-slate-900">1,240,000 mi</p>
                    <p className="text-[10px] text-zinc-500 font-semibold">Zero Preventable Collisions Recorded</p>
                  </div>

                  <div className="bg-amber-50 border border-amber-100 p-4 rounded-xl space-y-1">
                    <span className="text-[10px] font-bold text-amber-800 uppercase block">CDL License Class</span>
                    <p className="text-xl font-black text-amber-950">Class {profile.cdlClass}</p>
                    <p className="text-[10px] text-amber-700 font-semibold">Combination Heavy Commercial Vehicles</p>
                  </div>
                </div>
              </div>

              {/* Endorsements Checklist */}
              <div className="bg-white rounded-2xl border border-zinc-100 p-6 shadow-sm space-y-3">
                <h4 className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Certified Endorsements & Security Clearances</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {defaultEndorsements.map((end, idx) => (
                    <div key={idx} className="flex items-center space-x-3 p-3 rounded-xl bg-emerald-50/50 border border-emerald-100 text-xs font-bold text-emerald-900">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span>{end}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'alliance' && (
            <div className="space-y-6" id="alliance-tab-pane">
              {/* Highway Corridors */}
              <div className="bg-white rounded-2xl border border-zinc-100 p-6 shadow-sm space-y-3">
                <h4 className="text-xs font-bold text-zinc-400 uppercase tracking-wider flex items-center gap-1.5">
                  <Compass className="w-4 h-4 text-amber-500" />
                  Primary Freight Corridors
                </h4>
                <div className="flex flex-wrap gap-2">
                  {(profile.lanes || ['I-80 Midwest', 'I-40 East-to-West', 'I-10 Southern Route']).map((lane, idx) => (
                    <span key={idx} className="bg-amber-50 border border-amber-200 text-amber-950 font-black px-3 py-1.5 rounded-xl text-xs flex items-center gap-1.5">
                      <Compass className="w-3.5 h-3.5 text-amber-600" />
                      <span>{lane}</span>
                    </span>
                  ))}
                </div>
              </div>

              {/* Mutual Alliance Drivers */}
              <div className="bg-white rounded-2xl border border-zinc-100 p-6 shadow-sm space-y-3">
                <h4 className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Alliance Network Peers</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {[
                    { name: 'Sarah Cruz (Diesel Duchess)', rig: 'Kenworth W900', lane: 'I-80 Wyoming', img: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=200' },
                    { name: 'Marcus Cruz (GearJammer)', rig: 'Freightliner Cascadia', lane: 'I-10 Fresno', img: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=200' }
                  ].map((p, idx) => (
                    <div key={idx} className="flex items-center space-x-3 p-3 rounded-xl bg-zinc-50 border border-zinc-100">
                      <img src={p.img} className="w-10 h-10 rounded-full object-cover" alt="" />
                      <div className="min-w-0 flex-1 text-xs">
                        <p className="font-extrabold text-slate-900 truncate">{p.name}</p>
                        <p className="text-[11px] text-zinc-500 truncate">{p.rig}</p>
                        <span className="text-[9px] bg-zinc-200 text-zinc-700 px-1.5 py-0.5 rounded font-bold uppercase">{p.lane}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
