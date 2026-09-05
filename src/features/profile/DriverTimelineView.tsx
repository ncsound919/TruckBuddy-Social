import React, { useState, useEffect } from 'react';
import { Profile, Post, RoadReport, Listing, DriverMilestone, DriverTimelineItem, TimelineFilter } from '../../types';
import { sampleRoadReports, sampleListings, sampleMilestones, currentUserProfile } from '../../data';
import { 
  Award, 
  Truck, 
  ShieldAlert, 
  Tag, 
  CheckCircle2, 
  MapPin, 
  Calendar, 
  Clock, 
  Compass, 
  Radio, 
  Heart, 
  MessageSquare, 
  Plus, 
  X, 
  Check, 
  Filter, 
  Shield, 
  Flame, 
  Sparkles,
  ExternalLink,
  ChevronRight
} from 'lucide-react';

interface DriverTimelineViewProps {
  profile: Profile;
  isOwnProfile?: boolean;
}

export default function DriverTimelineView({ profile, isOwnProfile = false }: DriverTimelineViewProps) {
  const [activeFilter, setActiveFilter] = useState<TimelineFilter>('all');
  const [timelineItems, setTimelineItems] = useState<DriverTimelineItem[]>([]);
  const [milestones, setMilestones] = useState<DriverMilestone[]>([]);
  
  // New Milestone Modal
  const [isAddMilestoneOpen, setIsAddMilestoneOpen] = useState(false);
  const [milestoneTitle, setMilestoneTitle] = useState('');
  const [milestoneCategory, setMilestoneCategory] = useState<'safety' | 'inspection' | 'endorsement' | 'equipment' | 'career'>('inspection');
  const [milestoneDesc, setMilestoneDesc] = useState('');
  const [milestoneDate, setMilestoneDate] = useState(new Date().toISOString().split('T')[0]);

  // Load and assemble all activities into a unified chronological stream
  useEffect(() => {
    // 1. Posts
    let allPosts: Post[] = [];
    const cachedPosts = localStorage.getItem('trucker_posts');
    if (cachedPosts) {
      allPosts = JSON.parse(cachedPosts);
    } else {
      allPosts = [];
    }
    const userPosts = allPosts.filter(p => p.author.id === profile.id || p.author.username === profile.username);

    // 2. Road Reports
    let allReports: RoadReport[] = [];
    const cachedReports = localStorage.getItem('trucker_road_reports');
    if (cachedReports) {
      allReports = JSON.parse(cachedReports);
    } else {
      allReports = sampleRoadReports;
    }
    const userReports = allReports.filter(r => r.author.id === profile.id || r.author.username === profile.username);

    // 3. Listings
    let allListings: Listing[] = [];
    const cachedListings = localStorage.getItem('trucker_listings');
    if (cachedListings) {
      allListings = JSON.parse(cachedListings);
    } else {
      allListings = sampleListings;
    }
    const userListings = allListings.filter(l => l.seller.id === profile.id || l.seller.username === profile.username);

    // 4. Milestones
    let allMilestones: DriverMilestone[] = [];
    const cachedMilestones = localStorage.getItem('trucker_milestones');
    if (cachedMilestones) {
      allMilestones = JSON.parse(cachedMilestones);
    } else {
      allMilestones = sampleMilestones;
      localStorage.setItem('trucker_milestones', JSON.stringify(sampleMilestones));
    }
    const userMilestones = allMilestones.filter(m => m.userId === profile.id);
    setMilestones(userMilestones);

    // Transform into unified items
    const items: DriverTimelineItem[] = [];

    userPosts.forEach(post => {
      items.push({
        id: `timeline-post-${post.id}`,
        type: 'post',
        timestamp: post.createdAt,
        title: post.caption.slice(0, 75) + (post.caption.length > 75 ? '...' : ''),
        description: post.caption,
        location: post.locationName,
        mediaUrl: post.mediaUrl,
        categoryBadge: post.postType === 'road_report' ? 'Road Dispatch' : (post.postType === 'photo' ? 'Rig Photo' : 'Update'),
        postData: post,
      });
    });

    userReports.forEach(report => {
      items.push({
        id: `timeline-report-${report.id}`,
        type: 'report',
        timestamp: report.createdAt,
        title: report.title,
        description: report.description,
        location: report.locationName,
        corridor: report.corridor,
        categoryBadge: `Alert: ${report.reportType.toUpperCase()}`,
        reportData: report,
      });
    });

    userListings.forEach(listing => {
      items.push({
        id: `timeline-listing-${listing.id}`,
        type: 'listing',
        timestamp: listing.createdAt,
        title: `Listed: ${listing.title}`,
        description: listing.description,
        location: listing.location,
        corridor: listing.corridor,
        mediaUrl: listing.mediaUrl,
        categoryBadge: `Market: $${listing.price.toLocaleString()}`,
        listingData: listing,
      });
    });

    userMilestones.forEach(m => {
      items.push({
        id: `timeline-milestone-${m.id}`,
        type: 'milestone',
        timestamp: m.date,
        title: m.title,
        description: m.description,
        categoryBadge: m.category.toUpperCase(),
        milestoneData: m,
      });
    });

    // Sort descending by timestamp
    items.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    setTimelineItems(items);
  }, [profile.id, profile.username]);

  const handleCreateMilestone = (e: React.FormEvent) => {
    e.preventDefault();
    if (!milestoneTitle.trim() || !milestoneDesc.trim()) return;

    const newM: DriverMilestone = {
      id: `mile-${Date.now()}`,
      userId: profile.id,
      title: milestoneTitle.trim(),
      category: milestoneCategory,
      date: new Date(milestoneDate).toISOString(),
      description: milestoneDesc.trim(),
      verified: true
    };

    const cached = localStorage.getItem('trucker_milestones');
    const existing: DriverMilestone[] = cached ? JSON.parse(cached) : sampleMilestones;
    const updated = [newM, ...existing];
    localStorage.setItem('trucker_milestones', JSON.stringify(updated));

    setMilestones(prev => [newM, ...prev]);

    // Also add to timeline items
    const timelineEntry: DriverTimelineItem = {
      id: `timeline-milestone-${newM.id}`,
      type: 'milestone',
      timestamp: newM.date,
      title: newM.title,
      description: newM.description,
      categoryBadge: newM.category.toUpperCase(),
      milestoneData: newM,
    };

    setTimelineItems(prev => [timelineEntry, ...prev]);
    setIsAddMilestoneOpen(false);
    setMilestoneTitle('');
    setMilestoneDesc('');
  };

  const filteredItems = timelineItems.filter(item => {
    if (activeFilter === 'all') return true;
    if (activeFilter === 'posts') return item.type === 'post';
    if (activeFilter === 'reports') return item.type === 'report';
    if (activeFilter === 'listings') return item.type === 'listing';
    if (activeFilter === 'milestones') return item.type === 'milestone';
    return true;
  });

  const getEventBadgeStyle = (type: DriverTimelineItem['type']) => {
    switch (type) {
      case 'milestone':
        return {
          icon: <Award className="w-4 h-4 text-amber-950" />,
          bg: 'bg-amber-500 text-slate-950 ring-4 ring-amber-100',
          label: 'Milestone',
          border: 'border-amber-200 bg-amber-50/20'
        };
      case 'report':
        return {
          icon: <ShieldAlert className="w-4 h-4 text-rose-700" />,
          bg: 'bg-rose-100 text-rose-800 ring-4 ring-rose-50',
          label: 'Road Alert',
          border: 'border-rose-100 bg-rose-50/20'
        };
      case 'listing':
        return {
          icon: <Tag className="w-4 h-4 text-emerald-700" />,
          bg: 'bg-emerald-100 text-emerald-800 ring-4 ring-emerald-50',
          label: 'Equipment',
          border: 'border-emerald-100 bg-emerald-50/20'
        };
      case 'post':
      default:
        return {
          icon: <Truck className="w-4 h-4 text-slate-800" />,
          bg: 'bg-slate-100 text-slate-800 ring-4 ring-zinc-50',
          label: 'Broadcast',
          border: 'border-zinc-100 bg-white'
        };
    }
  };

  return (
    <div className="space-y-6" id="driver-timeline-view">
      {/* FILTER CONTROLS & TIMELINE STATS HEADER */}
      <div className="bg-white rounded-2xl border border-zinc-100 p-4 shadow-sm space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center space-x-2">
            <Clock className="w-4 h-4 text-amber-500" />
            <h3 className="text-xs font-black uppercase tracking-wider text-slate-900">
              Commercial Driver Timeline ({timelineItems.length} Logged Events)
            </h3>
          </div>

          {isOwnProfile && (
            <button
              onClick={() => setIsAddMilestoneOpen(true)}
              className="inline-flex items-center space-x-1.5 bg-amber-500 hover:bg-amber-600 active:bg-amber-700 text-slate-950 font-black text-xs px-3.5 py-1.5 rounded-xl shadow-sm transition-all"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Log Milestone / Inspection</span>
            </button>
          )}
        </div>

        {/* Filter Pills */}
        <div className="flex items-center space-x-2 overflow-x-auto pb-1 text-xs font-bold no-scrollbar">
          {[
            { id: 'all', label: 'All Activities', count: timelineItems.length },
            { id: 'posts', label: 'Broadcasts', count: timelineItems.filter(i => i.type === 'post').length },
            { id: 'milestones', label: 'FMCSA Milestones', count: timelineItems.filter(i => i.type === 'milestone').length },
            { id: 'reports', label: 'Safety Alerts', count: timelineItems.filter(i => i.type === 'report').length },
            { id: 'listings', label: 'Rig Marketplace', count: timelineItems.filter(i => i.type === 'listing').length }
          ].map(f => (
            <button
              key={f.id}
              onClick={() => setActiveFilter(f.id as TimelineFilter)}
              className={`px-3 py-1.5 rounded-xl transition-all shrink-0 flex items-center space-x-1.5 border ${
                activeFilter === f.id
                  ? 'bg-slate-900 border-slate-900 text-white shadow-sm'
                  : 'bg-zinc-50 border-zinc-200 text-zinc-600 hover:bg-zinc-100'
              }`}
            >
              <span>{f.label}</span>
              <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-black ${
                activeFilter === f.id ? 'bg-white/20 text-white' : 'bg-zinc-200 text-zinc-700'
              }`}>
                {f.count}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* TIMELINE STREAM */}
      <div className="relative pl-6 sm:pl-8 space-y-6">
        {/* Continuous vertical timeline connector line */}
        <div className="absolute top-2 bottom-4 left-3 sm:left-4 w-0.5 bg-zinc-200"></div>

        {filteredItems.length === 0 ? (
          <div className="bg-white rounded-2xl border border-zinc-100 p-10 text-center text-zinc-500">
            <Clock className="w-10 h-10 text-zinc-300 mx-auto mb-2" />
            <p className="text-xs font-bold text-slate-800">No events logged in this category</p>
            <p className="text-[11px] text-zinc-400 mt-1">Switch to "All Activities" or log a new dispatch.</p>
          </div>
        ) : (
          filteredItems.map(item => {
            const style = getEventBadgeStyle(item.type);
            const dateObj = new Date(item.timestamp);
            const formattedDate = dateObj.toLocaleDateString('en-US', {
              month: 'short',
              day: 'numeric',
              year: 'numeric'
            });
            const formattedTime = dateObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

            return (
              <div key={item.id} className="relative group">
                {/* Node icon indicator */}
                <div className={`absolute -left-6 sm:-left-8 top-3 w-6 h-6 rounded-full flex items-center justify-center ${style.bg} transition-transform group-hover:scale-110 z-10`}>
                  {style.icon}
                </div>

                {/* Event Card */}
                <div className={`rounded-2xl border p-5 shadow-sm transition-all hover:shadow-md bg-white ${style.border}`}>
                  {/* Card Header */}
                  <div className="flex flex-wrap items-center justify-between gap-2 mb-2.5">
                    <div className="flex items-center space-x-2">
                      <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded bg-zinc-100 text-zinc-700 border border-zinc-200">
                        {item.categoryBadge}
                      </span>
                      {item.corridor && (
                        <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded bg-amber-100 text-amber-900">
                          {item.corridor}
                        </span>
                      )}
                      {item.type === 'milestone' && item.milestoneData?.verified && (
                        <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3 text-emerald-600" /> DOT Verified
                        </span>
                      )}
                    </div>

                    <div className="flex items-center space-x-1.5 text-[11px] text-zinc-400 font-semibold">
                      <Calendar className="w-3.5 h-3.5 text-zinc-400" />
                      <span>{formattedDate}</span>
                      <span>•</span>
                      <span>{formattedTime}</span>
                    </div>
                  </div>

                  {/* Title */}
                  <h4 className="font-extrabold text-slate-900 text-sm leading-snug mb-1">
                    {item.title}
                  </h4>

                  {/* Location if present */}
                  {item.location && (
                    <div className="flex items-center text-[11px] font-semibold text-zinc-500 mb-2">
                      <MapPin className="w-3.5 h-3.5 text-zinc-400 mr-1 shrink-0" />
                      <span>{item.location}</span>
                    </div>
                  )}

                  {/* Description */}
                  <p className="text-zinc-700 text-xs leading-relaxed whitespace-pre-wrap font-normal">
                    {item.description}
                  </p>

                  {/* Media Preview if attached */}
                  {item.mediaUrl && (
                    <div className="mt-3 rounded-xl overflow-hidden max-h-56 bg-zinc-900 border border-zinc-100">
                      <img 
                        src={item.mediaUrl} 
                        alt="Timeline Media Attachment" 
                        className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                        referrerPolicy="no-referrer"
                      />
                    </div>
                  )}

                  {/* Specialized Post Details: Reactions & Audio Note */}
                  {item.postData && (
                    <div className="mt-3 pt-3 border-t border-zinc-100 flex flex-wrap items-center justify-between gap-2 text-xs">
                      {item.postData.reactions && (
                        <div className="flex items-center space-x-3 text-[11px] font-extrabold text-zinc-600">
                          <span title="10-4 Affirmative" className="flex items-center space-x-1">
                            <span>👍</span>
                            <span>{item.postData.reactions.affirmative}</span>
                          </span>
                          <span title="Hammer Down" className="flex items-center space-x-1">
                            <span>💨</span>
                            <span>{item.postData.reactions.hammerDown}</span>
                          </span>
                          <span title="Diesel Horn" className="flex items-center space-x-1">
                            <span>🚛</span>
                            <span>{item.postData.reactions.airHorn}</span>
                          </span>
                          <span title="Safe Travels" className="flex items-center space-x-1">
                            <span>🙏</span>
                            <span>{item.postData.reactions.safeTravels}</span>
                          </span>
                        </div>
                      )}

                      <div className="flex items-center space-x-3 text-[11px] text-zinc-400 font-bold ml-auto">
                        <span>{item.postData.likeCount} Likes</span>
                        <span>•</span>
                        <span>{item.postData.commentCount} Comments</span>
                      </div>
                    </div>
                  )}

                  {/* Specialized Road Report Details */}
                  {item.reportData && (
                    <div className="mt-3 pt-3 border-t border-zinc-100 flex items-center justify-between text-xs">
                      <span className="text-[11px] text-emerald-700 font-bold flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        Verified by {item.reportData.verifiedByDriversCount || item.reportData.upvoteCount} highway drivers
                      </span>
                      {item.reportData.statusValue && (
                        <span className="text-[10px] font-black uppercase px-2 py-0.5 bg-zinc-100 rounded text-slate-800">
                          {item.reportData.statusValue}
                        </span>
                      )}
                    </div>
                  )}

                  {/* Specialized Listing Details */}
                  {item.listingData && (
                    <div className="mt-3 pt-3 border-t border-zinc-100 flex items-center justify-between text-xs">
                      <span className="font-extrabold text-emerald-950 text-sm">
                        ${item.listingData.price.toLocaleString()} USD
                      </span>
                      <div className="flex items-center space-x-2">
                        {item.listingData.dotInspected && (
                          <span className="text-[10px] font-black uppercase px-1.5 py-0.5 bg-emerald-600 text-white rounded">
                            DOT Passed
                          </span>
                        )}
                        <span className="text-[11px] font-bold text-zinc-500 uppercase">
                          {item.listingData.condition}
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* LOG MILESTONE MODAL */}
      {isAddMilestoneOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-md bg-white rounded-2xl shadow-xl overflow-hidden border border-zinc-100 flex flex-col">
            <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-100 bg-zinc-50">
              <div>
                <h3 className="text-sm font-bold text-slate-900">Log Milestone or Safety Inspection</h3>
                <p className="text-[11px] text-zinc-500">Record achievements to your verified commercial driver timeline</p>
              </div>
              <button 
                onClick={() => setIsAddMilestoneOpen(false)} 
                className="text-zinc-400 hover:text-slate-900 p-1 rounded-full hover:bg-zinc-100 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateMilestone} className="p-6 space-y-4">
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-zinc-500 mb-1">
                  Milestone Category
                </label>
                <select
                  value={milestoneCategory}
                  onChange={(e) => setMilestoneCategory(e.target.value as any)}
                  className="w-full px-3 py-2 rounded-xl border border-zinc-200 text-xs font-bold text-slate-800 bg-white"
                >
                  <option value="inspection">DOT Inspection (Passed / Clean)</option>
                  <option value="safety">FMCSA Safe Driving / Million Miler</option>
                  <option value="endorsement">CDL Endorsement (Hazmat, Tanker, TWIC)</option>
                  <option value="equipment">Rig Upgrade or New Commercial Tractor</option>
                  <option value="career">Carrier Alliance / Chapter Milestone</option>
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-zinc-500 mb-1">
                  Milestone Title
                </label>
                <input
                  required
                  type="text"
                  placeholder="e.g. Passed DOT Level 1 Inspection with Zero Violations"
                  value={milestoneTitle}
                  onChange={(e) => setMilestoneTitle(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-zinc-200 focus:outline-none focus:ring-2 focus:ring-amber-500 text-xs text-slate-800"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-zinc-500 mb-1">
                  Date Achieved
                </label>
                <input
                  required
                  type="date"
                  value={milestoneDate}
                  onChange={(e) => setMilestoneDate(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-zinc-200 text-xs text-slate-800"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-zinc-500 mb-1">
                  Inspection / Achievement Details
                </label>
                <textarea
                  required
                  rows={3}
                  placeholder="Include location, weigh station or carrier details, vehicle specs audited, or miles logged..."
                  value={milestoneDesc}
                  onChange={(e) => setMilestoneDesc(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-zinc-200 focus:outline-none focus:ring-2 focus:ring-amber-500 text-xs text-slate-800"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl transition-all text-xs shadow-md flex items-center justify-center space-x-1.5"
              >
                <Check className="w-4 h-4" />
                <span>Save to Commercial Timeline</span>
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
