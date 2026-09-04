import React, { useState, useEffect } from 'react';
import { Profile, Post } from '../types';
import { currentUserProfile } from '../data';
import { Edit2, ShieldCheck, Mail, MapPin, Truck, Compass, CheckCircle2, ChevronRight, Check, X } from 'lucide-react';

export default function ProfileSection() {
  const [profile, setProfile] = useState<Profile>(currentUserProfile);
  const [personalPosts, setPersonalPosts] = useState<Post[]>([]);
  const [isEditOpen, setIsEditOpen] = useState(false);

  // Edit fields
  const [displayName, setDisplayName] = useState(profile.displayName);
  const [bio, setBio] = useState(profile.bio);
  const [currentRig, setCurrentRig] = useState(profile.currentRig);
  const [homeBase, setHomeBase] = useState(profile.homeBase);
  const [cdlClass, setCdlClass] = useState<'A' | 'B' | 'C' | 'None'>(profile.cdlClass);
  const [yearsExperience, setYearsExperience] = useState(profile.yearsExperience);
  const [carrierName, setCarrierName] = useState(profile.carrierName);

  // Load state
  useEffect(() => {
    const cachedProfile = localStorage.getItem('trucker_current_profile');
    if (cachedProfile) {
      setProfile(JSON.parse(cachedProfile));
    }

    const cachedPosts = localStorage.getItem('trucker_posts');
    if (cachedPosts) {
      const all: Post[] = JSON.parse(cachedPosts);
      // Filter posts submitted by current user
      setPersonalPosts(all.filter(p => p.author.id === profile.id));
    }
  }, [profile.id]);

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    const updated: Profile = {
      ...profile,
      displayName: displayName.trim(),
      bio: bio.trim(),
      currentRig: currentRig.trim(),
      homeBase: homeBase.trim(),
      cdlClass,
      yearsExperience: Number(yearsExperience) || 0,
      carrierName: carrierName.trim(),
    };

    setProfile(updated);
    localStorage.setItem('trucker_current_profile', JSON.stringify(updated));
    setIsEditOpen(false);
  };

  return (
    <div className="space-y-6" id="profile-container">
      {/* PROFILE DASHBOARD HEADER */}
      <div className="bg-white rounded-2xl border border-zinc-100 shadow-sm overflow-hidden" id="profile-card">
        {/* Banner strip */}
        <div className="h-32 bg-slate-900 relative">
          <button
            id="edit-profile-trigger"
            onClick={() => {
              setDisplayName(profile.displayName);
              setBio(profile.bio);
              setCurrentRig(profile.currentRig);
              setHomeBase(profile.homeBase);
              setCdlClass(profile.cdlClass);
              setYearsExperience(profile.yearsExperience);
              setCarrierName(profile.carrierName);
              setIsEditOpen(true);
            }}
            className="absolute top-4 right-4 bg-white/20 hover:bg-white/30 backdrop-blur-sm text-white text-xs font-bold px-3 py-1.5 rounded-xl flex items-center space-x-1 transition-colors"
          >
            <Edit2 className="w-3.5 h-3.5" />
            <span>Edit Rig Profile</span>
          </button>
        </div>

        {/* Profile Card specs */}
        <div className="px-6 pb-6 relative">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between -mt-10 mb-4 gap-4">
            <img 
              src={profile.avatarUrl} 
              className="w-20 h-20 rounded-full border-4 border-white shadow-md object-cover relative z-10" 
              alt={profile.displayName} 
            />

            {/* Basic Counter Metrics */}
            <div className="flex items-center space-x-6 text-center text-xs text-zinc-500 font-bold uppercase tracking-wider" id="profile-stats">
              <div>
                <p className="text-lg font-extrabold text-slate-900">{personalPosts.length}</p>
                <p className="text-[10px]">Updates</p>
              </div>
              <div>
                <p className="text-lg font-extrabold text-slate-900">{profile.followerCount}</p>
                <p className="text-[10px]">Followers</p>
              </div>
              <div>
                <p className="text-lg font-extrabold text-slate-900">{profile.followingCount}</p>
                <p className="text-[10px]">Following</p>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            {/* Identity details */}
            <div className="space-y-1">
              <div className="flex items-center space-x-2">
                <h3 className="text-lg font-bold text-slate-900">{profile.displayName}</h3>
                {profile.isVerified && (
                  <span className="bg-amber-100 text-amber-800 text-[10px] px-1.5 py-0.5 rounded font-bold uppercase tracking-wide">Verified Adv</span>
                )}
              </div>
              <p className="text-zinc-400 text-xs font-medium">@{profile.username} · Owner-Operator</p>
            </div>

            {/* Bio statement */}
            <p className="text-zinc-600 text-xs font-normal leading-relaxed">{profile.bio}</p>

            {/* GRID OF CDL SPECIFICATIONS */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 bg-zinc-50 border border-zinc-100 p-4 rounded-xl" id="cdl-specs-grid">
              <div>
                <span className="block text-[10px] font-bold uppercase tracking-wider text-zinc-400">CDL Card</span>
                <span className="font-extrabold text-slate-800 text-xs">Class {profile.cdlClass}</span>
              </div>
              <div>
                <span className="block text-[10px] font-bold uppercase tracking-wider text-zinc-400">Road Experience</span>
                <span className="font-extrabold text-slate-800 text-xs">{profile.yearsExperience} Years</span>
              </div>
              <div>
                <span className="block text-[10px] font-bold uppercase tracking-wider text-zinc-400">Rig Specs</span>
                <span className="font-extrabold text-slate-800 text-xs truncate block" title={profile.currentRig}>{profile.currentRig}</span>
              </div>
              <div>
                <span className="block text-[10px] font-bold uppercase tracking-wider text-zinc-400">Home Terminal</span>
                <span className="font-extrabold text-slate-800 text-xs">{profile.homeBase}</span>
              </div>
            </div>

            {/* Active Lane corridors */}
            <div className="space-y-2">
              <h4 className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Active Corridors & Carrier</h4>
              <div className="flex flex-wrap gap-2">
                <span className="bg-slate-100 text-slate-800 font-bold px-2.5 py-1 rounded text-[10px]">
                  Carrier: {profile.carrierName}
                </span>
                {profile.lanes.map((lane, idx) => (
                  <span key={idx} className="bg-amber-50 border border-amber-100 text-amber-800 font-bold px-2.5 py-1 rounded text-[10px] flex items-center">
                    <Compass className="w-3 h-3 text-amber-600 mr-1" />
                    {lane}
                  </span>
                ))}
              </div>
            </div>

            {/* COMMERCIAL SAFETY MILESTONES */}
            <div className="border-t border-zinc-100 pt-5 space-y-3" id="profile-milestones-card">
              <h4 className="text-xs font-bold text-zinc-400 uppercase tracking-wider">FMCSA Safety & Highway Milestones</h4>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="bg-emerald-50/50 border border-emerald-100 p-3 rounded-xl space-y-1">
                  <span className="text-[10px] font-bold text-emerald-800 uppercase block">Total Logged Miles</span>
                  <p className="text-sm font-extrabold text-emerald-950">142,500 mi</p>
                  <div className="w-full bg-emerald-200/50 h-1.5 rounded-full overflow-hidden">
                    <div className="bg-emerald-600 h-full rounded-full" style={{ width: '85%' }}></div>
                  </div>
                  <span className="text-[9px] text-emerald-700 font-semibold block">85% to Million-Miler Chapter</span>
                </div>

                <div className="bg-slate-50 border border-zinc-100 p-3 rounded-xl space-y-1">
                  <span className="text-[10px] font-bold text-slate-500 uppercase block">FMCSA Safety Rank</span>
                  <p className="text-sm font-extrabold text-slate-900">98.6% Green</p>
                  <div className="w-full bg-zinc-200 h-1.5 rounded-full overflow-hidden">
                    <div className="bg-amber-500 h-full rounded-full" style={{ width: '98.6%' }}></div>
                  </div>
                  <span className="text-[9px] text-zinc-400 font-semibold block">Top 2% Owner-Operators</span>
                </div>

                <div className="bg-amber-50/50 border border-amber-100 p-3 rounded-xl space-y-1">
                  <span className="text-[10px] font-bold text-amber-800 uppercase block">Fuel Efficiency Rank</span>
                  <p className="text-sm font-extrabold text-amber-950">7.2 MPG Average</p>
                  <div className="w-full bg-amber-200/50 h-1.5 rounded-full overflow-hidden">
                    <div className="bg-amber-500 h-full rounded-full" style={{ width: '72%' }}></div>
                  </div>
                  <span className="text-[9px] text-amber-700 font-semibold block">Cascadia aerodynamic specs</span>
                </div>
              </div>
            </div>

            {/* TRUCKER ALLIANCES / FOLLOWING LIST */}
            <div className="border-t border-zinc-100 pt-5 space-y-3" id="profile-alliances-card">
              <h4 className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Driver Alliance Connections</h4>
              <div className="flex flex-wrap gap-3">
                {[
                  { name: 'Sarah Cruz', role: 'Diesel Duchess', activeLane: 'I-80 Midwest', img: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200', followed: true },
                  { name: 'Marcus Cruz', role: 'GearJammer_77', activeLane: 'I-5 West Coast', img: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=200', followed: true },
                  { name: 'Rick Miller', role: 'BrakeCheckRick', activeLane: 'I-95 East Corridor', img: 'https://images.unsplash.com/photo-1628157582853-a796fa650a6a?auto=format&fit=crop&q=80&w=200', followed: false }
                ].map((drv, idx) => (
                  <div key={idx} className="flex items-center space-x-2.5 bg-zinc-50 border border-zinc-100 p-2.5 rounded-xl shrink-0 min-w-[200px]">
                    <img src={drv.img} className="w-8 h-8 rounded-full object-cover shrink-0" alt="" />
                    <div className="min-w-0 flex-1">
                      <p className="text-[11px] font-bold text-slate-900 truncate leading-tight">{drv.name}</p>
                      <p className="text-[9px] text-zinc-400 truncate font-semibold leading-none">{drv.role}</p>
                      <span className="text-[8px] bg-zinc-100 text-zinc-500 font-extrabold uppercase px-1 py-0.5 rounded inline-block mt-1">{drv.activeLane}</span>
                    </div>
                    <button className="text-[10px] font-black text-amber-600 hover:text-amber-700 uppercase shrink-0">
                      {drv.followed ? 'Joined' : '+ Join'}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* MY RIG PHOTO GALLERY */}
      <div className="space-y-4" id="profile-gallery-section">
        <h4 className="text-xs font-bold text-zinc-400 uppercase tracking-wider">My Rig & Highway Photo Gallery</h4>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 bg-white p-4 rounded-2xl border border-zinc-100 shadow-sm" id="gallery-grid">
          {[
            { title: 'Peterbilt Front Chrome', url: 'https://images.unsplash.com/photo-1601584115197-04ecc0da31d7?auto=format&fit=crop&q=80&w=400' },
            { title: 'Wyoming Winter Run', url: 'https://images.unsplash.com/photo-1516594798947-e65505dbb29d?auto=format&fit=crop&q=80&w=400' },
            { title: 'Elk Mountain MM 260', url: 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&q=80&w=400' },
            { title: 'Dry Van Payload Loading', url: 'https://images.unsplash.com/photo-1601584115197-04ecc0da31d7?auto=format&fit=crop&q=80&w=400' }
          ].map((gal, idx) => (
            <div key={idx} className="group relative rounded-xl overflow-hidden h-28 bg-zinc-100 border border-zinc-100 shadow-sm">
              <img src={gal.url} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" alt="" />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-2">
                <span className="text-[9px] text-white font-bold leading-tight">{gal.title}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* RECENT PERSONAL BROADCASTS TIMELINE */}
      <div className="space-y-4" id="personal-timeline">
        <h4 className="text-xs font-bold text-zinc-400 uppercase tracking-wider">My Highway Broadcasts</h4>
        {personalPosts.length === 0 ? (
          <div className="bg-white rounded-2xl border border-zinc-100 p-8 text-center text-zinc-500">
            <Truck className="w-10 h-10 text-zinc-300 mx-auto mb-2" />
            <p className="text-xs font-semibold">You haven't broadcasted any updates yet</p>
            <p className="text-[11px] text-zinc-400 mt-1">Navigate to the Feed tab and create a road update!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {personalPosts.map(post => (
              <div key={post.id} className="bg-white p-4 rounded-xl border border-zinc-100 shadow-sm flex flex-col justify-between" id={`personal-post-${post.id}`}>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="bg-zinc-100 text-zinc-700 font-bold uppercase tracking-wider text-[9px] px-1.5 py-0.5 rounded">
                      {post.postType}
                    </span>
                    <span className="text-[10px] text-zinc-400">
                      {new Date(post.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <p className="text-slate-800 text-xs leading-relaxed line-clamp-3">{post.caption}</p>
                </div>

                <div className="flex items-center justify-between text-[11px] text-zinc-500 font-bold mt-4 border-t border-zinc-50 pt-3">
                  <span>{post.likeCount} Likes</span>
                  <span>{post.commentCount} Comments</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* EDIT PROFILE DIALOG */}
      {isEditOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4" id="edit-profile-modal">
          <div className="w-full max-w-md bg-white rounded-2xl shadow-xl overflow-hidden border border-zinc-100 max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-100 bg-zinc-50">
              <h3 className="text-base font-bold text-slate-900">Update CDL & Rig Specs</h3>
              <button 
                id="close-edit-modal"
                onClick={() => setIsEditOpen(false)} 
                className="text-zinc-400 hover:text-slate-900 p-1 rounded-full hover:bg-zinc-100 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveProfile} className="p-6 space-y-4 overflow-y-auto flex-1">
              {/* Display Name */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-zinc-500 mb-2">Display Name</label>
                <input
                  required
                  type="text"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-zinc-200 focus:outline-none focus:ring-2 focus:ring-amber-500 text-xs text-slate-800"
                />
              </div>

              {/* Bio */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-zinc-500 mb-2">Driver Bio</label>
                <textarea
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  rows={2}
                  className="w-full px-4 py-2.5 rounded-xl border border-zinc-200 focus:outline-none focus:ring-2 focus:ring-amber-500 text-xs text-slate-800"
                />
              </div>

              {/* CDL Class & Experience Row */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-zinc-500 mb-2">CDL Card Level</label>
                  <select
                    value={cdlClass}
                    onChange={(e) => setCdlClass(e.target.value as any)}
                    className="w-full px-4 py-2.5 rounded-xl border border-zinc-200 focus:outline-none focus:ring-2 focus:ring-amber-500 text-xs text-slate-800 bg-white"
                  >
                    <option value="A">Class A Commercial</option>
                    <option value="B">Class B Commercial</option>
                    <option value="C">Class C Commercial</option>
                    <option value="None">Non-commercial</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-zinc-500 mb-2">Years on Road</label>
                  <input
                    type="number"
                    value={yearsExperience}
                    onChange={(e) => setYearsExperience(Number(e.target.value))}
                    className="w-full px-4 py-2.5 rounded-xl border border-zinc-200 focus:outline-none focus:ring-2 focus:ring-amber-500 text-xs text-slate-800"
                  />
                </div>
              </div>

              {/* Rig Description */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-zinc-500 mb-2">Current Tractor / Rig Customizations</label>
                <input
                  type="text"
                  placeholder="e.g. 2022 Peterbilt 389 Chrome Custom"
                  value={currentRig}
                  onChange={(e) => setCurrentRig(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-zinc-200 focus:outline-none focus:ring-2 focus:ring-amber-500 text-xs text-slate-800"
                />
              </div>

              {/* Home Base Terminal */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-zinc-500 mb-2">Home Terminal (Base)</label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-3 w-4 h-4 text-zinc-400" />
                  <input
                    type="text"
                    placeholder="e.g. Nashville, TN"
                    value={homeBase}
                    onChange={(e) => setHomeBase(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-zinc-200 focus:outline-none focus:ring-2 focus:ring-amber-500 text-xs text-slate-800"
                  />
                </div>
              </div>

              {/* Carrier */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-zinc-500 mb-2">Active Carrier / Fleet alliance</label>
                <input
                  type="text"
                  placeholder="e.g. Independent Owner-Operator"
                  value={carrierName}
                  onChange={(e) => setCarrierName(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-zinc-200 focus:outline-none focus:ring-2 focus:ring-amber-500 text-xs text-slate-800"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-slate-900 hover:bg-slate-800 active:bg-slate-950 text-white font-bold rounded-xl transition-all text-xs shadow-md mt-2"
              >
                Save CDL specs
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
