import React, { useState, useEffect } from 'react';
import { Profile, Post, UserRole, InstructorInfo, CreatorInfo, CourseOffering } from '../../types';
import { currentUserProfile, sampleProfiles } from '../../data';
import DriverTimelineView from './DriverTimelineView';
import { 
  Edit2, ShieldCheck, Mail, MapPin, Truck, Compass, CheckCircle2, 
  ChevronRight, Check, X, Plus, Trash2, Award, Image, Upload, Shield,
  GraduationCap, Video, Play, Camera, Youtube, Clock, DollarSign, Sparkles
} from 'lucide-react';

interface ProfileSectionProps {
  onViewProfile?: (profile: Profile) => void;
}

export default function ProfileSection({ onViewProfile }: ProfileSectionProps = {}) {
  const [profile, setProfile] = useState<Profile>(currentUserProfile);
  const [personalPosts, setPersonalPosts] = useState<Post[]>([]);
  const [isEditOpen, setIsEditOpen] = useState(false);

  // Edit fields
  const [displayName, setDisplayName] = useState(profile.displayName);
  const [bio, setBio] = useState(profile.bio);
  const [role, setRole] = useState<UserRole>(profile.role || 'driver');
  const [currentRig, setCurrentRig] = useState(profile.currentRig);
  const [homeBase, setHomeBase] = useState(profile.homeBase);
  const [cdlClass, setCdlClass] = useState<'A' | 'B' | 'C' | 'None'>(profile.cdlClass);
  const [yearsExperience, setYearsExperience] = useState(profile.yearsExperience);
  const [carrierName, setCarrierName] = useState(profile.carrierName);

  // Instructor Info state
  const [academyName, setAcademyName] = useState(profile.instructorInfo?.academyName || 'Elite CDL Road Academy');
  const [specialties, setSpecialties] = useState<string[]>(profile.instructorInfo?.specialties || ['90° Alley-Dock', 'Pre-Trip Inspection', 'Mountain Driving']);
  const [newSpecialtyInput, setNewSpecialtyInput] = useState('');
  const [hourlyRate, setHourlyRate] = useState(profile.instructorInfo?.hourlyRate || 85);
  const [courses, setCourses] = useState<CourseOffering[]>(profile.instructorInfo?.courseOfferings || [
    {
      id: 'crs-1',
      title: 'Mastering the 90-Degree Blind-Side Alley Dock',
      description: 'Step-by-step cab reference points, pivot angles, and clutch modulation for zero-incident tight terminal docks.',
      duration: '3-Day Practical Intensive',
      price: 250,
      format: 'In-Cab Practical'
    }
  ]);

  // Creator Info state
  const [niche, setNiche] = useState(profile.creatorInfo?.niche || 'Over-The-Road Rig Vlogs & Highway Walkarounds');
  const [youtubeHandle, setYoutubeHandle] = useState(profile.creatorInfo?.youtubeHandle || '@RoadJammerOfficial');
  const [tiktokHandle, setTiktokHandle] = useState(profile.creatorInfo?.tiktokHandle || '@roadjammer');
  const [podcastName, setPodcastName] = useState(profile.creatorInfo?.podcastName || 'The Highway Dispatch Podcast');
  const [instagramHandle, setInstagramHandle] = useState(profile.creatorInfo?.instagramHandle || '@roadjammer_cdl');
  const [featuredVideoTitle, setFeaturedVideoTitle] = useState(profile.creatorInfo?.featuredVideoTitle || 'Full Tour: Custom 2024 Sleeper Cab with Triple Solar Array');
  const [subscriberCount, setSubscriberCount] = useState(profile.creatorInfo?.subscriberCount || 24500);

  // New Profile Customization state
  const [avatarUrl, setAvatarUrl] = useState(profile.avatarUrl);
  const [coverUrl, setCoverUrl] = useState(() => {
    return localStorage.getItem('trucker_profile_cover') || 'https://images.unsplash.com/photo-1516594798947-e65505dbb29d?auto=format&fit=crop&q=80&w=1200';
  });
  const [lanes, setLanes] = useState<string[]>(profile.lanes || []);
  const [newLanesInput, setNewLanesInput] = useState('');
  const [endorsements, setEndorsements] = useState<string[]>(() => {
    const cached = localStorage.getItem('trucker_profile_endorsements');
    return cached ? JSON.parse(cached) : ['Hazmat (H)', 'Tanker (N)', 'TWIC Card'];
  });

  // Modal active tab inside Edit Modal: 'specs' | 'role_type' | 'lanes' | 'media'
  const [editTab, setEditTab] = useState<'specs' | 'role_type' | 'lanes' | 'media'>('specs');

  // Custom photo gallery state
  const [isAddGalleryOpen, setIsAddGalleryOpen] = useState(false);
  const [newGalleryTitle, setNewGalleryTitle] = useState('');
  const [newGalleryUrl, setNewGalleryUrl] = useState('');
  const [gallery, setGallery] = useState<{ title: string; url: string }[]>(() => {
    const cached = localStorage.getItem('trucker_profile_gallery');
    return cached ? JSON.parse(cached) : [
      { title: 'Peterbilt Front Chrome', url: 'https://images.unsplash.com/photo-1601584115197-04ecc0da31d7?auto=format&fit=crop&q=80&w=400' },
      { title: 'Wyoming Winter Run', url: 'https://images.unsplash.com/photo-1516594798947-e65505dbb29d?auto=format&fit=crop&q=80&w=400' },
      { title: 'Elk Mountain MM 260', url: 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&q=80&w=400' },
      { title: 'Dry Van Payload Loading', url: 'https://images.unsplash.com/photo-1601584115197-04ecc0da31d7?auto=format&fit=crop&q=80&w=400' }
    ];
  });

  // Load state
  useEffect(() => {
    const cachedProfile = localStorage.getItem('trucker_current_profile');
    if (cachedProfile) {
      const parsed = JSON.parse(cachedProfile);
      setProfile(parsed);
      setDisplayName(parsed.displayName);
      setBio(parsed.bio);
      setRole(parsed.role || 'driver');
      setCurrentRig(parsed.currentRig);
      setHomeBase(parsed.homeBase);
      setCdlClass(parsed.cdlClass);
      setYearsExperience(parsed.yearsExperience);
      setCarrierName(parsed.carrierName);
      setAvatarUrl(parsed.avatarUrl || parsed.avatarUrl);
      if (parsed.lanes) {
        setLanes(parsed.lanes);
      }
      if (parsed.instructorInfo) {
        setAcademyName(parsed.instructorInfo.academyName || '');
        setSpecialties(parsed.instructorInfo.specialties || []);
        setHourlyRate(parsed.instructorInfo.hourlyRate || 85);
        if (parsed.instructorInfo.courseOfferings) setCourses(parsed.instructorInfo.courseOfferings);
      }
      if (parsed.creatorInfo) {
        setNiche(parsed.creatorInfo.niche || '');
        setYoutubeHandle(parsed.creatorInfo.youtubeHandle || '');
        setTiktokHandle(parsed.creatorInfo.tiktokHandle || '');
        setPodcastName(parsed.creatorInfo.podcastName || '');
        setInstagramHandle(parsed.creatorInfo.instagramHandle || '');
        setFeaturedVideoTitle(parsed.creatorInfo.featuredVideoTitle || '');
        setSubscriberCount(parsed.creatorInfo.subscriberCount || 24500);
      }
    }

    const cachedPosts = localStorage.getItem('trucker_posts');
    if (cachedPosts) {
      const all: Post[] = JSON.parse(cachedPosts);
      setPersonalPosts(all.filter(p => p.author.id === profile.id));
    }
  }, [profile.id]);

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    const updated: Profile = {
      ...profile,
      displayName: displayName.trim(),
      bio: bio.trim(),
      role: role,
      currentRig: currentRig.trim(),
      homeBase: homeBase.trim(),
      cdlClass,
      yearsExperience: Number(yearsExperience) || 0,
      carrierName: carrierName.trim(),
      avatarUrl: avatarUrl,
      lanes: lanes,
      instructorInfo: role === 'instructor' ? {
        academyName: academyName.trim() || 'Independent CDL Instructor',
        specialties: specialties,
        certifications: ['State Master CDL Trainer', 'Third-Party Examiner'],
        hourlyRate: Number(hourlyRate) || 85,
        courseOfferings: courses
      } : profile.instructorInfo,
      creatorInfo: role === 'creator' ? {
        niche: niche.trim() || 'Highway Life & Rig Vlogs',
        youtubeHandle: youtubeHandle.trim(),
        tiktokHandle: tiktokHandle.trim(),
        podcastName: podcastName.trim(),
        instagramHandle: instagramHandle.trim(),
        featuredVideoTitle: featuredVideoTitle.trim(),
        subscriberCount: Number(subscriberCount) || 25000,
        equipmentList: ['Sony FX3', 'DJI Wireless Mic 2', 'Garmin Dashcam Live']
      } : profile.creatorInfo
    };

    setProfile(updated);
    localStorage.setItem('trucker_current_profile', JSON.stringify(updated));
    localStorage.setItem('trucker_profile_cover', coverUrl);
    localStorage.setItem('trucker_profile_endorsements', JSON.stringify(endorsements));
    setIsEditOpen(false);

    const cachedPosts = localStorage.getItem('trucker_posts');
    if (cachedPosts) {
      const all: Post[] = JSON.parse(cachedPosts);
      const updatedPosts = all.map(p => {
        if (p.author.id === profile.id) {
          return { ...p, author: updated };
        }
        return p;
      });
      localStorage.setItem('trucker_posts', JSON.stringify(updatedPosts));
    }
  };

  // Preset Visual Options
  const presetCovers = [
    { name: 'Mountain Ridge', url: 'https://images.unsplash.com/photo-1516594798947-e65505dbb29d?auto=format&fit=crop&q=80&w=1200' },
    { name: 'Golden Highway', url: 'https://images.unsplash.com/photo-1501785888041-af3ef285b470?auto=format&fit=crop&q=80&w=1200' },
    { name: 'Sunset Terminal', url: 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&q=80&w=1200' }
  ];

  const presetAvatars = [
    { name: 'Classic Cap', url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200' },
    { name: 'Iron Beard', url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=200' },
    { name: 'Safety Lead', url: 'https://images.unsplash.com/photo-1628157582853-a796fa650a6a?auto=format&fit=crop&q=80&w=200' },
    { name: 'Route Runner', url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=200' }
  ];

  // File uploading methods converting to Base64 to save locally
  const handleAvatarFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      setAvatarUrl(event.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleCoverFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      setCoverUrl(event.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleGalleryFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      setNewGalleryUrl(event.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  // Add lane
  const handleAddLane = () => {
    if (!newLanesInput.trim()) return;
    if (lanes.includes(newLanesInput.trim())) return;
    setLanes(prev => [...prev, newLanesInput.trim()]);
    setNewLanesInput('');
  };

  // Remove lane
  const handleRemoveLane = (target: string) => {
    setLanes(prev => prev.filter(l => l !== target));
  };

  // Toggle endorsements
  const handleToggleEndorsement = (item: string) => {
    if (endorsements.includes(item)) {
      setEndorsements(prev => prev.filter(e => e !== item));
    } else {
      setEndorsements(prev => [...prev, item]);
    }
  };

  // Add custom gallery post
  const handleSaveGalleryItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newGalleryUrl) return;
    const item = {
      title: newGalleryTitle.trim() || 'My Rig Update',
      url: newGalleryUrl
    };
    const updated = [item, ...gallery];
    setGallery(updated);
    localStorage.setItem('trucker_profile_gallery', JSON.stringify(updated));
    setIsAddGalleryOpen(false);
    setNewGalleryTitle('');
    setNewGalleryUrl('');
  };

  return (
    <div className="space-y-6" id="profile-container">
      {/* PROFILE DASHBOARD HEADER */}
      <div className="bg-white rounded-2xl border border-zinc-100 shadow-sm overflow-hidden" id="profile-card">
        {/* Banner strip */}
        <div className="h-44 bg-slate-900 relative">
          <img 
            src={coverUrl} 
            className="w-full h-full object-cover opacity-80" 
            alt="Trucker Cover Banner" 
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-transparent to-black/60"></div>
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
              setAvatarUrl(profile.avatarUrl);
              setLanes(profile.lanes || []);
              setEditTab('specs');
              setIsEditOpen(true);
            }}
            className="absolute top-4 right-4 bg-white/20 hover:bg-white/30 backdrop-blur-sm text-white text-xs font-bold px-3 py-1.5 rounded-xl flex items-center space-x-1 transition-colors z-20"
          >
            <Edit2 className="w-3.5 h-3.5" />
            <span>Edit Profile & Rig Setup</span>
          </button>
        </div>

        {/* Profile Card specs */}
        <div className="px-6 pb-6 relative">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between -mt-12 mb-4 gap-4">
            <img 
              src={avatarUrl} 
              className="w-24 h-24 rounded-full border-4 border-white shadow-md object-cover relative z-10" 
              alt={profile.displayName} 
              referrerPolicy="no-referrer"
            />

            {/* Basic Counter Metrics */}
            <div className="flex items-center space-x-6 text-center text-xs text-zinc-500 font-bold uppercase tracking-wider" id="profile-stats">
              <div>
                <p className="text-xl font-extrabold text-slate-900">{personalPosts.length}</p>
                <p className="text-[10px]">Updates</p>
              </div>
              <div>
                <p className="text-xl font-extrabold text-slate-900">{profile.followerCount}</p>
                <p className="text-[10px]">Followers</p>
              </div>
              <div>
                <p className="text-xl font-extrabold text-slate-900">{profile.followingCount}</p>
                <p className="text-[10px]">Following</p>
              </div>
            </div>
          </div>

          <div className="space-y-5">
            {/* Identity details */}
            <div className="space-y-1">
              <div className="flex items-center space-x-2">
                <h3 className="text-xl font-extrabold text-slate-900">{profile.displayName}</h3>
                {profile.isVerified && (
                  <span className="bg-amber-100 text-amber-900 text-[10px] px-2 py-0.5 rounded-md font-extrabold uppercase tracking-wide flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3 text-amber-700" /> Verified Driver
                  </span>
                )}
              </div>
              <p className="text-zinc-500 text-xs font-semibold">@{profile.username} · Owner-Operator</p>
            </div>

            {/* Bio statement */}
            <p className="text-zinc-700 text-xs font-normal leading-relaxed">{profile.bio}</p>

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

            {/* Credentials / Endorsements Column */}
            <div className="space-y-2">
              <h4 className="text-xs font-bold text-zinc-400 uppercase tracking-wider flex items-center gap-1">
                <Award className="w-3.5 h-3.5 text-zinc-400" /> CDL Endorsements & Credentials
              </h4>
              <div className="flex flex-wrap gap-1.5">
                {endorsements.length === 0 ? (
                  <span className="text-[11px] text-zinc-400 italic">No credentials loaded yet. Edit your profile to add endorsements.</span>
                ) : (
                  endorsements.map((end, idx) => (
                    <span key={idx} className="bg-emerald-50 border border-emerald-100 text-emerald-800 font-extrabold px-2.5 py-1 rounded-lg text-[10px] flex items-center">
                      <ShieldCheck className="w-3 h-3 text-emerald-600 mr-1 shrink-0" />
                      {end}
                    </span>
                  ))
                )}
              </div>
            </div>

            {/* Active Lane corridors */}
            <div className="space-y-2">
              <h4 className="text-xs font-bold text-zinc-400 uppercase tracking-wider flex items-center gap-1">
                <Compass className="w-3.5 h-3.5 text-zinc-400" /> Active Corridors & Carrier
              </h4>
              <div className="flex flex-wrap gap-1.5">
                <span className="bg-slate-100 text-slate-800 font-extrabold px-2.5 py-1 rounded-lg text-[10px]">
                  Carrier: {profile.carrierName}
                </span>
                {lanes.map((lane, idx) => (
                  <span key={idx} className="bg-amber-50 border border-amber-100 text-amber-800 font-extrabold px-2.5 py-1 rounded-lg text-[10px] flex items-center">
                    <Compass className="w-3 h-3 text-amber-600 mr-1" />
                    {lane}
                  </span>
                ))}
              </div>
            </div>

            {/* ROLE-SPECIFIC CARDS (INSTRUCTOR OR CREATOR) */}
            {(profile.role === 'instructor' || profile.instructorInfo) && (
              <div className="border-t border-zinc-100 pt-5 space-y-4" id="profile-instructor-card">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-gradient-to-r from-amber-500/10 via-amber-50 to-transparent p-4 rounded-2xl border border-amber-200">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 rounded-xl bg-amber-500 text-slate-950 flex items-center justify-center font-black">
                      <GraduationCap className="w-5 h-5" />
                    </div>
                    <div>
                      <span className="text-[10px] font-black uppercase text-amber-800 bg-amber-200/70 px-2 py-0.5 rounded">
                        CDL Academy Instructor
                      </span>
                      <h4 className="text-sm font-black text-slate-900 mt-0.5">
                        {profile.instructorInfo?.academyName || 'Elite CDL Road Academy'}
                      </h4>
                    </div>
                  </div>
                  {profile.instructorInfo?.hourlyRate && (
                    <div className="text-right">
                      <span className="text-[10px] text-zinc-500 font-bold block uppercase">Mentorship Rate</span>
                      <strong className="text-sm font-black text-slate-900">${profile.instructorInfo.hourlyRate}/hr</strong>
                    </div>
                  )}
                </div>

                {profile.instructorInfo?.courseOfferings && profile.instructorInfo.courseOfferings.length > 0 && (
                  <div className="space-y-2">
                    <h5 className="text-xs font-black uppercase tracking-wider text-slate-600">
                      My Training Courses & Mentorship Modules ({profile.instructorInfo.courseOfferings.length})
                    </h5>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {profile.instructorInfo.courseOfferings.map((crs) => (
                        <div key={crs.id} className="bg-white border border-slate-200 p-3.5 rounded-xl shadow-xs space-y-2">
                          <div className="flex items-start justify-between">
                            <h6 className="text-xs font-black text-slate-900 leading-snug">{crs.title}</h6>
                            <span className="text-xs font-black text-amber-600 bg-amber-50 px-2 py-0.5 rounded shrink-0">
                              ${crs.price}
                            </span>
                          </div>
                          <p className="text-[11px] text-zinc-600 leading-relaxed line-clamp-2">{crs.description}</p>
                          <div className="flex items-center justify-between text-[10px] text-zinc-400 font-bold pt-1 border-t border-zinc-100">
                            <span>{crs.format}</span>
                            <span>{crs.duration}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {(profile.role === 'creator' || profile.creatorInfo) && (
              <div className="border-t border-zinc-100 pt-5 space-y-4" id="profile-creator-card">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-gradient-to-r from-rose-500/10 via-purple-50 to-transparent p-4 rounded-2xl border border-rose-200">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 rounded-xl bg-rose-500 text-white flex items-center justify-center font-black">
                      <Video className="w-5 h-5" />
                    </div>
                    <div>
                      <span className="text-[10px] font-black uppercase text-rose-800 bg-rose-200/70 px-2 py-0.5 rounded">
                        Highway Content Creator
                      </span>
                      <h4 className="text-sm font-black text-slate-900 mt-0.5">
                        {profile.creatorInfo?.niche || 'Over-The-Road Rig Vlogs & Highway Walkarounds'}
                      </h4>
                    </div>
                  </div>
                  {profile.creatorInfo?.subscriberCount && (
                    <div className="text-right">
                      <span className="text-[10px] text-zinc-500 font-bold block uppercase">Audience</span>
                      <strong className="text-sm font-black text-rose-600">{profile.creatorInfo.subscriberCount.toLocaleString()} Subs</strong>
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {profile.creatorInfo?.youtubeHandle && (
                    <div className="p-2.5 bg-zinc-50 border border-zinc-200 rounded-xl">
                      <span className="text-[10px] font-black text-rose-600 block flex items-center gap-1">
                        <Youtube className="w-3 h-3" /> YouTube
                      </span>
                      <span className="text-xs font-bold text-slate-800 truncate block">{profile.creatorInfo.youtubeHandle}</span>
                    </div>
                  )}
                  {profile.creatorInfo?.tiktokHandle && (
                    <div className="p-2.5 bg-zinc-50 border border-zinc-200 rounded-xl">
                      <span className="text-[10px] font-black text-slate-700 block">TikTok</span>
                      <span className="text-xs font-bold text-slate-800 truncate block">{profile.creatorInfo.tiktokHandle}</span>
                    </div>
                  )}
                  {profile.creatorInfo?.podcastName && (
                    <div className="p-2.5 bg-zinc-50 border border-zinc-200 rounded-xl">
                      <span className="text-[10px] font-black text-purple-600 block">Podcast</span>
                      <span className="text-xs font-bold text-slate-800 truncate block">{profile.creatorInfo.podcastName}</span>
                    </div>
                  )}
                  {profile.creatorInfo?.instagramHandle && (
                    <div className="p-2.5 bg-zinc-50 border border-zinc-200 rounded-xl">
                      <span className="text-[10px] font-black text-pink-600 block">Instagram</span>
                      <span className="text-xs font-bold text-slate-800 truncate block">{profile.creatorInfo.instagramHandle}</span>
                    </div>
                  )}
                </div>
              </div>
            )}

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
                  { name: 'Sarah Cruz', role: 'Diesel Duchess', profileId: 'user-2', activeLane: 'I-80 Midwest', img: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=200', followed: true },
                  { name: 'Marcus Cruz', role: 'GearJammer_77', profileId: 'user-3', activeLane: 'I-5 West Coast', img: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=200', followed: true },
                  { name: 'Rick Callahan', role: 'BrakeCheckRick', profileId: 'user-5', activeLane: 'I-95 East Corridor', img: 'https://images.unsplash.com/photo-1628157582853-a796fa650a6a?auto=format&fit=crop&q=80&w=200', followed: false }
                ].map((drv, idx) => {
                  const targetProfile = sampleProfiles.find(p => p.id === drv.profileId);
                  return (
                    <div 
                      key={idx} 
                      onClick={() => targetProfile && onViewProfile?.(targetProfile)}
                      className="flex items-center space-x-2.5 bg-zinc-50 hover:bg-zinc-100 border border-zinc-100 p-2.5 rounded-xl shrink-0 min-w-[200px] cursor-pointer transition-all hover:shadow-sm"
                    >
                      <img src={drv.img} className="w-8 h-8 rounded-full object-cover shrink-0" alt="" />
                      <div className="min-w-0 flex-1">
                        <p className="text-[11px] font-bold text-slate-900 truncate leading-tight hover:text-amber-600 transition-colors">{drv.name}</p>
                        <p className="text-[9px] text-zinc-400 truncate font-semibold leading-none">{drv.role}</p>
                        <span className="text-[8px] bg-zinc-100 text-zinc-500 font-extrabold uppercase px-1 py-0.5 rounded inline-block mt-1">{drv.activeLane}</span>
                      </div>
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          if (targetProfile) onViewProfile?.(targetProfile);
                        }}
                        className="text-[10px] font-black text-amber-600 hover:text-amber-700 uppercase shrink-0"
                      >
                        {drv.followed ? 'View' : '+ Join'}
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* MY RIG PHOTO GALLERY */}
      <div className="space-y-4" id="profile-gallery-section">
        <div className="flex items-center justify-between">
          <h4 className="text-xs font-bold text-zinc-400 uppercase tracking-wider">My Rig & Highway Photo Gallery</h4>
          <button
            onClick={() => setIsAddGalleryOpen(true)}
            className="flex items-center space-x-1.5 text-xs font-bold bg-amber-500 hover:bg-amber-600 active:bg-amber-700 text-slate-950 px-3 py-1.5 rounded-xl transition-all shadow-sm"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Photo</span>
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 bg-white p-4 rounded-2xl border border-zinc-100 shadow-sm" id="gallery-grid">
          {gallery.map((gal, idx) => (
            <div key={idx} className="group relative rounded-xl overflow-hidden h-28 bg-zinc-100 border border-zinc-100 shadow-sm">
              <img src={gal.url} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" alt={gal.title} referrerPolicy="no-referrer" />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-2 justify-between">
                <span className="text-[9px] text-white font-bold leading-tight truncate mr-2">{gal.title}</span>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    const updated = gallery.filter((_, i) => i !== idx);
                    setGallery(updated);
                    localStorage.setItem('trucker_profile_gallery', JSON.stringify(updated));
                  }}
                  className="p-1 bg-red-600 hover:bg-red-700 rounded text-white shadow"
                >
                  <Trash2 className="w-3 h-3" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* COMMERCIAL DRIVER TIMELINE */}
      <div className="space-y-4" id="personal-timeline">
        <DriverTimelineView profile={profile} isOwnProfile={true} />
      </div>

      {/* ADD PHOTO TO GALLERY DIALOG */}
      {isAddGalleryOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-sm bg-white rounded-2xl shadow-xl overflow-hidden border border-zinc-100 flex flex-col">
            <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-100 bg-zinc-50">
              <h3 className="text-sm font-bold text-slate-900">Add Photo to Gallery</h3>
              <button 
                onClick={() => setIsAddGalleryOpen(false)} 
                className="text-zinc-400 hover:text-slate-900 p-1 rounded-full hover:bg-zinc-100 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveGalleryItem} className="p-6 space-y-4">
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-zinc-500 mb-1">Photo Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. My Peterbilt 389 Steers"
                  value={newGalleryTitle}
                  onChange={(e) => setNewGalleryTitle(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-zinc-200 focus:outline-none focus:ring-2 focus:ring-amber-500 text-xs text-slate-800"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-zinc-500 mb-1">Photo Source</label>
                <input
                  type="file"
                  accept="image/*"
                  id="gallery-file-uploader"
                  className="hidden"
                  onChange={handleGalleryFile}
                />
                <label
                  htmlFor="gallery-file-uploader"
                  className="block text-center py-2 px-4 rounded-xl border border-dashed border-amber-500 bg-amber-50 text-amber-900 font-bold text-xs cursor-pointer hover:bg-amber-100 transition-all mb-3"
                >
                  📷 Upload custom photo...
                </label>

                <p className="text-center text-[10px] text-zinc-400 font-bold uppercase my-1">Or paste photo URL:</p>
                <input
                  type="text"
                  placeholder="e.g. https://images.unsplash.com/..."
                  value={newGalleryUrl}
                  onChange={(e) => setNewGalleryUrl(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-zinc-200 focus:outline-none focus:ring-2 focus:ring-amber-500 text-xs text-slate-800"
                />
              </div>

              {newGalleryUrl && (
                <div className="relative rounded-xl overflow-hidden h-28 bg-zinc-100 border border-zinc-100">
                  <img src={newGalleryUrl} className="w-full h-full object-cover" alt="Gallery Preview" referrerPolicy="no-referrer" />
                  <button
                    type="button"
                    onClick={() => setNewGalleryUrl('')}
                    className="absolute top-1.5 right-1.5 p-1 bg-slate-900/80 hover:bg-slate-900 text-white rounded-full transition"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              )}

              <button
                type="submit"
                disabled={!newGalleryUrl}
                className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl transition text-xs shadow-md disabled:opacity-50"
              >
                Add Photo to Rig Page
              </button>
            </form>
          </div>
        </div>
      )}

      {/* EDIT PROFILE DIALOG */}
      {isEditOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4" id="edit-profile-modal">
          <div className="w-full max-w-lg bg-white rounded-2xl shadow-xl overflow-hidden border border-zinc-100 max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-100 bg-zinc-50">
              <h3 className="text-base font-bold text-slate-900">Configure Profile Customization</h3>
              <button 
                id="close-edit-modal"
                onClick={() => setIsEditOpen(false)} 
                className="text-zinc-400 hover:text-slate-900 p-1 rounded-full hover:bg-zinc-100 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Sub Tabs inside Edit modal */}
            <div className="flex border-b border-zinc-100 bg-zinc-50/50 px-4">
              {[
                { id: 'specs', label: 'CDL & Rig' },
                { id: 'role_type', label: 'Role & Persona' },
                { id: 'lanes', label: 'Lanes & Endorsements' },
                { id: 'media', label: 'Avatar & Banner' }
              ].map(tab => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setEditTab(tab.id as any)}
                  className={`px-4 py-3 text-xs font-bold transition-all border-b-2 -mb-px ${
                    editTab === tab.id
                      ? 'border-amber-500 text-slate-900 font-extrabold'
                      : 'border-transparent text-zinc-400 hover:text-zinc-600'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            <form onSubmit={handleSaveProfile} className="p-6 space-y-4 overflow-y-auto flex-1">
              {editTab === 'specs' && (
                <div className="space-y-4">
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
                </div>
              )}

              {editTab === 'role_type' && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-zinc-500 mb-2">Primary Profile Type</label>
                    <div className="grid grid-cols-3 gap-2">
                      <button
                        type="button"
                        onClick={() => setRole('driver')}
                        className={`p-3 rounded-xl border text-left flex flex-col justify-between transition-all ${
                          role === 'driver' ? 'border-amber-500 bg-amber-50/50 shadow-sm' : 'border-zinc-200 bg-white hover:bg-zinc-50'
                        }`}
                      >
                        <Truck className={`w-5 h-5 mb-1.5 ${role === 'driver' ? 'text-amber-600' : 'text-zinc-400'}`} />
                        <div>
                          <p className="text-xs font-bold text-slate-900">Commercial Driver</p>
                          <p className="text-[10px] text-zinc-400">Owner-op or fleet driver</p>
                        </div>
                      </button>

                      <button
                        type="button"
                        onClick={() => setRole('instructor')}
                        className={`p-3 rounded-xl border text-left flex flex-col justify-between transition-all ${
                          role === 'instructor' ? 'border-amber-500 bg-amber-50/50 shadow-sm' : 'border-zinc-200 bg-white hover:bg-zinc-50'
                        }`}
                      >
                        <GraduationCap className={`w-5 h-5 mb-1.5 ${role === 'instructor' ? 'text-amber-600' : 'text-zinc-400'}`} />
                        <div>
                          <p className="text-xs font-bold text-slate-900">CDL Instructor</p>
                          <p className="text-[10px] text-zinc-400">Teach courses & mentor</p>
                        </div>
                      </button>

                      <button
                        type="button"
                        onClick={() => setRole('creator')}
                        className={`p-3 rounded-xl border text-left flex flex-col justify-between transition-all ${
                          role === 'creator' ? 'border-amber-500 bg-amber-50/50 shadow-sm' : 'border-zinc-200 bg-white hover:bg-zinc-50'
                        }`}
                      >
                        <Video className={`w-5 h-5 mb-1.5 ${role === 'creator' ? 'text-rose-600' : 'text-zinc-400'}`} />
                        <div>
                          <p className="text-xs font-bold text-slate-900">Road Creator</p>
                          <p className="text-[10px] text-zinc-400">Vlogs & rig content</p>
                        </div>
                      </button>
                    </div>
                  </div>

                  {role === 'instructor' && (
                    <div className="bg-amber-50/50 border border-amber-200 p-4 rounded-2xl space-y-3">
                      <div className="flex items-center space-x-2 text-amber-900 font-bold text-xs">
                        <GraduationCap className="w-4 h-4 text-amber-600" />
                        <span>CDL Academy & Mentorship Settings</span>
                      </div>

                      <div>
                        <label className="block text-[10px] font-bold uppercase text-zinc-600 mb-1">Academy or Brand Name</label>
                        <input
                          type="text"
                          value={academyName}
                          onChange={(e) => setAcademyName(e.target.value)}
                          placeholder="e.g. Apex Master CDL Academy"
                          className="w-full px-3 py-2 bg-white rounded-xl border border-zinc-200 text-xs"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-[10px] font-bold uppercase text-zinc-600 mb-1">Mentorship Hourly Rate ($)</label>
                          <input
                            type="number"
                            value={hourlyRate}
                            onChange={(e) => setHourlyRate(Number(e.target.value))}
                            className="w-full px-3 py-2 bg-white rounded-xl border border-zinc-200 text-xs"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-[10px] font-bold uppercase text-zinc-600 mb-1">Instructor Specialties</label>
                        <div className="flex gap-2 mb-2">
                          <input
                            type="text"
                            placeholder="e.g. Winter Chain-Up"
                            value={newSpecialtyInput}
                            onChange={(e) => setNewSpecialtyInput(e.target.value)}
                            className="flex-1 px-3 py-1.5 bg-white rounded-xl border border-zinc-200 text-xs"
                          />
                          <button
                            type="button"
                            onClick={() => {
                              if (newSpecialtyInput.trim() && !specialties.includes(newSpecialtyInput.trim())) {
                                setSpecialties([...specialties, newSpecialtyInput.trim()]);
                                setNewSpecialtyInput('');
                              }
                            }}
                            className="px-3 py-1.5 bg-amber-500 text-slate-950 rounded-xl text-xs font-bold"
                          >
                            + Add
                          </button>
                        </div>
                        <div className="flex flex-wrap gap-1.5">
                          {specialties.map((spec, i) => (
                            <span key={i} className="bg-white border border-amber-300 text-amber-950 px-2 py-0.5 rounded-lg text-xs font-bold flex items-center gap-1">
                              {spec}
                              <button
                                type="button"
                                onClick={() => setSpecialties(specialties.filter((_, idx) => idx !== i))}
                                className="text-amber-700 hover:text-red-600"
                              >
                                ×
                              </button>
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}

                  {role === 'creator' && (
                    <div className="bg-rose-50/50 border border-rose-200 p-4 rounded-2xl space-y-3">
                      <div className="flex items-center space-x-2 text-rose-900 font-bold text-xs">
                        <Video className="w-4 h-4 text-rose-600" />
                        <span>Road Vlogger & Content Channels</span>
                      </div>

                      <div>
                        <label className="block text-[10px] font-bold uppercase text-zinc-600 mb-1">Content Niche</label>
                        <input
                          type="text"
                          value={niche}
                          onChange={(e) => setNiche(e.target.value)}
                          placeholder="e.g. Over-The-Road Rig Vlogs & Highway Walkarounds"
                          className="w-full px-3 py-2 bg-white rounded-xl border border-zinc-200 text-xs"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-[10px] font-bold uppercase text-zinc-600 mb-1">YouTube Channel</label>
                          <input
                            type="text"
                            value={youtubeHandle}
                            onChange={(e) => setYoutubeHandle(e.target.value)}
                            placeholder="@RoadJammerOfficial"
                            className="w-full px-3 py-2 bg-white rounded-xl border border-zinc-200 text-xs"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] font-bold uppercase text-zinc-600 mb-1">TikTok Handle</label>
                          <input
                            type="text"
                            value={tiktokHandle}
                            onChange={(e) => setTiktokHandle(e.target.value)}
                            placeholder="@roadjammer"
                            className="w-full px-3 py-2 bg-white rounded-xl border border-zinc-200 text-xs"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-[10px] font-bold uppercase text-zinc-600 mb-1">Podcast Title</label>
                          <input
                            type="text"
                            value={podcastName}
                            onChange={(e) => setPodcastName(e.target.value)}
                            placeholder="The Highway Dispatch"
                            className="w-full px-3 py-2 bg-white rounded-xl border border-zinc-200 text-xs"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] font-bold uppercase text-zinc-600 mb-1">Estimated Subscribers</label>
                          <input
                            type="number"
                            value={subscriberCount}
                            onChange={(e) => setSubscriberCount(Number(e.target.value))}
                            className="w-full px-3 py-2 bg-white rounded-xl border border-zinc-200 text-xs"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-[10px] font-bold uppercase text-zinc-600 mb-1">Featured Video / Walkaround Title</label>
                        <input
                          type="text"
                          value={featuredVideoTitle}
                          onChange={(e) => setFeaturedVideoTitle(e.target.value)}
                          placeholder="e.g. 2024 Custom Peterbilt 389 Full Cab Tour"
                          className="w-full px-3 py-2 bg-white rounded-xl border border-zinc-200 text-xs"
                        />
                      </div>
                    </div>
                  )}
                </div>
              )}

              {editTab === 'lanes' && (
                <div className="space-y-4">
                  {/* Dynamic Active Lanes Manager */}
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-zinc-500 mb-2">Manage Active Corridors</label>
                    <div className="flex gap-2 mb-3">
                      <input
                        type="text"
                        placeholder="e.g. I-95 East Coast"
                        value={newLanesInput}
                        onChange={(e) => setNewLanesInput(e.target.value)}
                        className="flex-1 px-4 py-2 rounded-xl border border-zinc-200 focus:outline-none focus:ring-2 focus:ring-amber-500 text-xs text-slate-800"
                      />
                      <button
                        type="button"
                        onClick={handleAddLane}
                        className="px-3 py-2 bg-amber-500 hover:bg-amber-600 rounded-xl text-slate-950 font-bold text-xs shrink-0 flex items-center gap-1"
                      >
                        <Plus className="w-3.5 h-3.5" /> Add
                      </button>
                    </div>

                    <div className="flex flex-wrap gap-2 max-h-32 overflow-y-auto p-2 bg-zinc-50 rounded-xl border border-zinc-200">
                      {lanes.length === 0 ? (
                        <span className="text-[10px] text-zinc-400 italic">No corridors logged yet. Enter one above!</span>
                      ) : (
                        lanes.map((lane, idx) => (
                          <span key={idx} className="bg-amber-50 border border-amber-200 text-amber-950 px-2.5 py-1 rounded-lg text-[10px] font-bold flex items-center gap-1">
                            {lane}
                            <button
                              type="button"
                              onClick={() => handleRemoveLane(lane)}
                              className="p-0.5 hover:bg-amber-100 rounded text-amber-800"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </span>
                        ))
                      )}
                    </div>
                  </div>

                  {/* CDL Endorsement Checklist */}
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-zinc-500 mb-2">CDL Endorsements & Credentials</label>
                    <div className="grid grid-cols-2 gap-2 bg-zinc-50 p-4 rounded-xl border border-zinc-200">
                      {[
                        'Hazmat (H)',
                        'Tanker (N)',
                        'Hazmat + Tanker (X)',
                        'Doubles/Triples (T)',
                        'TWIC Card Approved',
                        'Air Brake Endorsement',
                        'Military waiver (CDL)',
                        'Passenger (P)'
                      ].map((item, idx) => {
                        const isChecked = endorsements.includes(item);
                        return (
                          <label key={idx} className="flex items-center space-x-2 text-xs font-semibold text-slate-700 cursor-pointer select-none">
                            <input
                              type="checkbox"
                              checked={isChecked}
                              onChange={() => handleToggleEndorsement(item)}
                              className="rounded border-zinc-300 text-amber-500 focus:ring-amber-500 w-4 h-4"
                            />
                            <span>{item}</span>
                          </label>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}

              {editTab === 'media' && (
                <div className="space-y-4">
                  {/* Avatar Customize */}
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-zinc-500 mb-2">Select Profile Avatar</label>
                    
                    {/* Device Upload */}
                    <input
                      type="file"
                      accept="image/*"
                      id="avatar-file-upload"
                      className="hidden"
                      onChange={handleAvatarFile}
                    />
                    <label
                      htmlFor="avatar-file-upload"
                      className="block text-center py-2 px-4 rounded-xl border border-dashed border-amber-500 bg-amber-50 text-amber-900 font-bold text-xs cursor-pointer hover:bg-amber-100 transition-all mb-3"
                    >
                      📷 Upload Custom Device Avatar Image...
                    </label>

                    {/* Presets */}
                    <div className="grid grid-cols-4 gap-2 mb-4">
                      {presetAvatars.map((pre, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => setAvatarUrl(pre.url)}
                          className={`relative rounded-xl overflow-hidden h-14 border-2 transition-all ${
                            avatarUrl === pre.url ? 'border-amber-500 ring-2 ring-amber-500/20' : 'border-transparent opacity-80'
                          }`}
                        >
                          <img src={pre.url} className="w-full h-full object-cover" alt={pre.name} referrerPolicy="no-referrer" />
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Banner/Cover Customize */}
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-zinc-500 mb-2">Select Road Cover Banner</label>
                    
                    {/* Device Upload */}
                    <input
                      type="file"
                      accept="image/*"
                      id="cover-file-upload"
                      className="hidden"
                      onChange={handleCoverFile}
                    />
                    <label
                      htmlFor="cover-file-upload"
                      className="block text-center py-2 px-4 rounded-xl border border-dashed border-amber-500 bg-amber-50 text-amber-900 font-bold text-xs cursor-pointer hover:bg-amber-100 transition-all mb-3"
                    >
                      🏞️ Upload Custom Device Banner Image...
                    </label>

                    {/* Presets */}
                    <div className="grid grid-cols-3 gap-2">
                      {presetCovers.map((pre, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => setCoverUrl(pre.url)}
                          className={`relative rounded-xl overflow-hidden h-16 border-2 transition-all ${
                            coverUrl === pre.url ? 'border-amber-500 ring-2 ring-amber-500/20' : 'border-transparent opacity-80'
                          }`}
                        >
                          <img src={pre.url} className="w-full h-full object-cover" alt={pre.name} referrerPolicy="no-referrer" />
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              <button
                type="submit"
                className="w-full py-3 bg-slate-900 hover:bg-slate-800 active:bg-slate-950 text-white font-bold rounded-xl transition-all text-xs shadow-md mt-4 flex items-center justify-center gap-1"
              >
                <Check className="w-4 h-4" /> Save Customized Specs
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
