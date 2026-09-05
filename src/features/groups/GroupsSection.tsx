import React, { useState, useEffect } from 'react';
import { Group, GroupDiscussion, GroupEvent, Profile } from '../../types';
import { sampleGroups, sampleGroupDiscussions, sampleGroupEvents, currentUserProfile } from '../../data';
import { broadcastCbMessage, playCbSquelch } from '../../utils/cbAudio';
import { 
  Users, 
  Shield, 
  ArrowRight, 
  CheckCircle2, 
  ChevronRight, 
  X, 
  MessageSquare, 
  Calendar, 
  Radio, 
  ThumbsUp, 
  Plus, 
  Volume2, 
  MapPin, 
  Clock, 
  Check, 
  Send,
  Sparkles,
  Tag,
  Share2
} from 'lucide-react';

interface GroupsSectionProps {
  onViewProfile?: (profile: Profile) => void;
  onOpenDirectMessage?: (profile: Profile) => void;
}

export default function GroupsSection({ onViewProfile, onOpenDirectMessage }: GroupsSectionProps) {
  const [groups, setGroups] = useState<Group[]>([]);
  const [selectedGroup, setSelectedGroup] = useState<Group | null>(null);
  const [activeTab, setActiveTab] = useState<'all' | 'association' | 'region'>('all');
  
  // Chapter sub-tab
  const [chapterSubTab, setChapterSubTab] = useState<'discussions' | 'events' | 'roster'>('discussions');

  // Discussions & Events State
  const [discussions, setDiscussions] = useState<GroupDiscussion[]>([]);
  const [events, setEvents] = useState<GroupEvent[]>([]);
  const [openDiscussionId, setOpenDiscussionId] = useState<string | null>(null);
  const [replyInputs, setReplyInputs] = useState<Record<string, string>>({});
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  // New Discussion Modal
  const [isNewTopicModalOpen, setIsNewTopicModalOpen] = useState(false);
  const [newTopicTitle, setNewTopicTitle] = useState('');
  const [newTopicContent, setNewTopicContent] = useState('');
  const [newTopicCategory, setNewTopicCategory] = useState<'safety_regulations' | 'rig_builds' | 'rates_contracts' | 'road_meetups'>('safety_regulations');

  // New Event Modal
  const [isNewEventModalOpen, setIsNewEventModalOpen] = useState(false);
  const [newEventTitle, setNewEventTitle] = useState('');
  const [newEventDesc, setNewEventDesc] = useState('');
  const [newEventOrigin, setNewEventOrigin] = useState('');
  const [newEventDest, setNewEventDest] = useState('');
  const [newEventDate, setNewEventDate] = useState('');
  const [newEventChannel, setNewEventChannel] = useState(19);

  useEffect(() => {
    const cachedGroups = localStorage.getItem('trucker_groups');
    if (cachedGroups) {
      setGroups(JSON.parse(cachedGroups));
    } else {
      setGroups(sampleGroups);
      localStorage.setItem('trucker_groups', JSON.stringify(sampleGroups));
    }

    const cachedDiscussions = localStorage.getItem('trucker_group_discussions');
    if (cachedDiscussions) {
      setDiscussions(JSON.parse(cachedDiscussions));
    } else {
      setDiscussions(sampleGroupDiscussions);
      localStorage.setItem('trucker_group_discussions', JSON.stringify(sampleGroupDiscussions));
    }

    const cachedEvents = localStorage.getItem('trucker_group_events');
    if (cachedEvents) {
      setEvents(JSON.parse(cachedEvents));
    } else {
      setEvents(sampleGroupEvents);
      localStorage.setItem('trucker_group_events', JSON.stringify(sampleGroupEvents));
    }
  }, []);

  const saveGroups = (updated: Group[]) => {
    setGroups(updated);
    localStorage.setItem('trucker_groups', JSON.stringify(updated));
  };

  const saveDiscussions = (updated: GroupDiscussion[]) => {
    setDiscussions(updated);
    localStorage.setItem('trucker_group_discussions', JSON.stringify(updated));
  };

  const saveEvents = (updated: GroupEvent[]) => {
    setEvents(updated);
    localStorage.setItem('trucker_group_events', JSON.stringify(updated));
  };

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3500);
  };

  const handleToggleJoin = (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    const updated = groups.map(g => {
      if (g.id === id) {
        const joined = !g.isJoined;
        return { ...g, isJoined: joined, memberCount: joined ? g.memberCount + 1 : Math.max(0, g.memberCount - 1) };
      }
      return g;
    });
    saveGroups(updated);

    if (selectedGroup && selectedGroup.id === id) {
      const match = updated.find(g => g.id === id);
      if (match) setSelectedGroup(match);
    }

    const target = updated.find(g => g.id === id);
    if (target?.isJoined) {
      playCbSquelch();
      showToast(`⭐ You have joined the ${target.name} chapter!`);
    }
  };

  // Upvote Discussion
  const handleToggleUpvote = (discId: string) => {
    const updated = discussions.map(d => {
      if (d.id === discId) {
        const hasUpvoted = d.upvotedUsers.includes(currentUserProfile.id);
        const upvotedUsers = hasUpvoted
          ? d.upvotedUsers.filter(uid => uid !== currentUserProfile.id)
          : [...d.upvotedUsers, currentUserProfile.id];
        return {
          ...d,
          upvotes: upvotedUsers.length,
          upvotedUsers
        };
      }
      return d;
    });
    saveDiscussions(updated);
  };

  // Submit Reply to Discussion
  const handleAddReply = (discId: string) => {
    const text = replyInputs[discId]?.trim();
    if (!text) return;

    const updated = discussions.map(d => {
      if (d.id === discId) {
        const newReply = {
          id: `reply-${Date.now()}`,
          author: currentUserProfile,
          text,
          createdAt: new Date().toISOString()
        };
        const replies = [...(d.replies || []), newReply];
        return {
          ...d,
          replyCount: replies.length,
          replies
        };
      }
      return d;
    });

    saveDiscussions(updated);
    setReplyInputs(prev => ({ ...prev, [discId]: '' }));
    showToast('💬 Reply posted to discussion thread!');
  };

  // Create Discussion Topic
  const handleCreateTopic = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedGroup || !newTopicTitle.trim() || !newTopicContent.trim()) return;

    const newDisc: GroupDiscussion = {
      id: `disc-${Date.now()}`,
      groupId: selectedGroup.id,
      author: currentUserProfile,
      title: newTopicTitle.trim(),
      content: newTopicContent.trim(),
      category: newTopicCategory,
      createdAt: new Date().toISOString(),
      upvotes: 1,
      upvotedUsers: [currentUserProfile.id],
      replyCount: 0,
      replies: []
    };

    const updated = [newDisc, ...discussions];
    saveDiscussions(updated);
    setIsNewTopicModalOpen(false);
    setNewTopicTitle('');
    setNewTopicContent('');
    showToast('📜 Discussion topic created successfully!');
  };

  // Toggle Event RSVP
  const handleToggleRsvp = (eventId: string) => {
    const updated = events.map(ev => {
      if (ev.id === eventId) {
        const isAttending = !ev.isAttending;
        const attendeesCount = isAttending ? ev.attendeesCount + 1 : Math.max(0, ev.attendeesCount - 1);
        const attendeeProfiles = isAttending
          ? [...ev.attendeeProfiles, currentUserProfile]
          : ev.attendeeProfiles.filter(p => p.id !== currentUserProfile.id);
        return {
          ...ev,
          isAttending,
          attendeesCount,
          attendeeProfiles
        };
      }
      return ev;
    });

    saveEvents(updated);
    const target = updated.find(ev => ev.id === eventId);
    if (target?.isAttending) {
      playCbSquelch();
      showToast(`🚛 RSVP Confirmed! Monitor CB Ch ${target.cbChannel} during convoy.`);
    } else {
      showToast('RSVP removed from convoy schedule.');
    }
  };

  // Create New Event
  const handleCreateEvent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedGroup || !newEventTitle.trim()) return;

    const newEv: GroupEvent = {
      id: `event-${Date.now()}`,
      groupId: selectedGroup.id,
      title: newEventTitle.trim(),
      description: newEventDesc.trim(),
      originLocation: newEventOrigin.trim() || 'Regional Terminals',
      destinationLocation: newEventDest.trim() || 'Highway Corridor Hub',
      date: newEventDate || new Date(Date.now() + 86400000 * 3).toISOString(),
      cbChannel: newEventChannel,
      coordinator: currentUserProfile,
      attendeesCount: 1,
      attendeeProfiles: [currentUserProfile],
      isAttending: true
    };

    const updated = [newEv, ...events];
    saveEvents(updated);
    setIsNewEventModalOpen(false);
    setNewEventTitle('');
    setNewEventDesc('');
    setNewEventOrigin('');
    setNewEventDest('');
    showToast('📅 Convoy Event published to Chapter Schedule!');
  };

  const handleVoiceReadout = (text: string) => {
    broadcastCbMessage(text);
  };

  const filteredGroups = activeTab === 'all'
    ? groups
    : groups.filter(g => g.category === activeTab);

  const groupDiscussions = selectedGroup 
    ? discussions.filter(d => d.groupId === selectedGroup.id)
    : [];

  const groupEvents = selectedGroup
    ? events.filter(e => e.groupId === selectedGroup.id)
    : [];

  return (
    <div className="space-y-6" id="groups-container">
      {toastMsg && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white text-xs font-bold px-4 py-2.5 rounded-xl shadow-2xl border border-amber-500/30 flex items-center space-x-2 animate-bounce">
          <Sparkles className="w-4 h-4 text-amber-400 shrink-0" />
          <span>{toastMsg}</span>
        </div>
      )}

      {/* Chapter Overview Headers */}
      {!selectedGroup ? (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-4 rounded-xl shadow-sm border border-zinc-100" id="groups-tabs-panel">
            <div className="flex space-x-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
              {[
                { id: 'all', label: 'All Association Chapters' },
                { id: 'association', label: 'Official Alliances' },
                { id: 'region', label: 'Regional Corridors' }
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`px-3 py-1.5 text-xs font-bold rounded-lg border transition-all shrink-0 ${
                    activeTab === tab.id
                      ? 'bg-slate-900 border-slate-900 text-white shadow-sm'
                      : 'bg-white border-zinc-200 text-zinc-500 hover:bg-zinc-50'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
            <div className="text-xs text-zinc-400 font-bold uppercase tracking-wider">
              {filteredGroups.length} Chapters Active
            </div>
          </div>

          {/* GROUP CHAPTER CARDS GRID */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5" id="groups-cards-grid">
            {filteredGroups.map(group => (
              <div
                key={group.id}
                onClick={() => setSelectedGroup(group)}
                className="bg-white rounded-2xl border border-zinc-100 shadow-sm hover:shadow-md transition-all overflow-hidden flex flex-col justify-between cursor-pointer group"
                id={`group-card-${group.id}`}
              >
                <div>
                  <div className="h-32 bg-zinc-100 relative">
                    <img src={group.coverImageUrl} className="w-full h-full object-cover" alt={group.name} referrerPolicy="no-referrer" />
                    <span className="absolute top-3 right-3 bg-slate-900/80 backdrop-blur-sm text-white text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded">
                      {group.category}
                    </span>
                  </div>

                  <div className="p-5 space-y-2">
                    <div className="flex items-center space-x-1.5">
                      <h4 className="font-bold text-slate-900 text-sm group-hover:text-amber-600 transition-colors">{group.name}</h4>
                    </div>
                    <p className="text-zinc-600 text-xs font-normal leading-relaxed line-clamp-2">
                      {group.description}
                    </p>
                  </div>
                </div>

                <div className="p-5 pt-0 flex items-center justify-between border-t border-zinc-50 mt-4">
                  <span className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider flex items-center">
                    <Users className="w-3.5 h-3.5 mr-1 text-zinc-400" />
                    {group.memberCount.toLocaleString()} Drivers
                  </span>

                  <div className="flex items-center space-x-2">
                    <button
                      id={`join-btn-${group.id}`}
                      onClick={(e) => handleToggleJoin(group.id, e)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                        group.isJoined
                          ? 'bg-zinc-100 text-zinc-600 border border-zinc-200'
                          : 'bg-amber-500 hover:bg-amber-600 text-slate-950 shadow-sm'
                      }`}
                    >
                      {group.isJoined ? 'Joined' : 'Join Chapter'}
                    </button>
                    
                    <ChevronRight className="w-4 h-4 text-zinc-300 group-hover:translate-x-0.5 transition-transform" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        /* SINGLE GROUP CHAPTER DETAILED VIEW */
        <div className="bg-white rounded-2xl border border-zinc-100 shadow-sm overflow-hidden" id="group-details-panel">
          {/* Cover Photo banner */}
          <div className="h-48 relative bg-zinc-100">
            <img src={selectedGroup.coverImageUrl} className="w-full h-full object-cover" alt="" referrerPolicy="no-referrer" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
            
            <button
              id="back-to-chapters"
              onClick={() => setSelectedGroup(null)}
              className="absolute top-4 left-4 bg-slate-900/80 hover:bg-slate-900 text-white font-bold text-xs px-3 py-1.5 rounded-xl flex items-center space-x-1 backdrop-blur-sm transition-colors"
            >
              <span>← Back to Chapters</span>
            </button>

            <div className="absolute bottom-4 left-6 right-6 flex items-end justify-between text-white">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400 bg-black/40 px-2 py-0.5 rounded">
                  {selectedGroup.category} Chapter
                </span>
                <h2 className="text-xl font-black mt-1 text-white">{selectedGroup.name}</h2>
              </div>

              <button
                id={`detail-join-toggle-${selectedGroup.id}`}
                onClick={() => handleToggleJoin(selectedGroup.id)}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all shadow-lg ${
                  selectedGroup.isJoined
                    ? 'bg-zinc-800 text-zinc-200 border border-zinc-700'
                    : 'bg-amber-500 hover:bg-amber-400 text-slate-950 font-black'
                }`}
              >
                {selectedGroup.isJoined ? '✓ Joined Member' : 'Request Chapter Access'}
              </button>
            </div>
          </div>

          <div className="p-6 space-y-6">
            {/* Chapter Stats Bar */}
            <div className="flex items-center justify-between text-xs text-zinc-500 bg-zinc-50 p-3.5 rounded-xl border border-zinc-100">
              <span className="flex items-center gap-1.5 font-medium">
                <Users className="w-4 h-4 text-amber-600" />
                <strong className="text-slate-900">{selectedGroup.memberCount.toLocaleString()}</strong> Active CDL Drivers
              </span>
              <span className="text-[11px] text-zinc-400">
                Corridor Safety Alliance Chapter
              </span>
            </div>

            {/* Description */}
            <div className="space-y-1">
              <h4 className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Chapter Mission</h4>
              <p className="text-zinc-700 text-xs leading-relaxed">{selectedGroup.description}</p>
            </div>

            {/* Chapter Sub Navigation Tabs */}
            <div className="border-b border-zinc-200 flex space-x-4">
              <button
                onClick={() => setChapterSubTab('discussions')}
                className={`pb-2.5 text-xs font-bold transition-all border-b-2 flex items-center gap-1.5 ${
                  chapterSubTab === 'discussions'
                    ? 'border-amber-500 text-amber-600'
                    : 'border-transparent text-zinc-400 hover:text-slate-900'
                }`}
              >
                <MessageSquare className="w-3.5 h-3.5" />
                <span>Discussions ({groupDiscussions.length})</span>
              </button>
              <button
                onClick={() => setChapterSubTab('events')}
                className={`pb-2.5 text-xs font-bold transition-all border-b-2 flex items-center gap-1.5 ${
                  chapterSubTab === 'events'
                    ? 'border-amber-500 text-amber-600'
                    : 'border-transparent text-zinc-400 hover:text-slate-900'
                }`}
              >
                <Calendar className="w-3.5 h-3.5" />
                <span>Convoy Events ({groupEvents.length})</span>
              </button>
            </div>

            {/* SUB TAB: DISCUSSIONS */}
            {chapterSubTab === 'discussions' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                    Recent Regulatory & Rig Topics
                  </h4>
                  {selectedGroup.isJoined && (
                    <button
                      onClick={() => setIsNewTopicModalOpen(true)}
                      className="text-xs font-bold bg-amber-500 hover:bg-amber-600 text-slate-950 px-3 py-1.5 rounded-lg flex items-center gap-1 shadow-sm"
                    >
                      <Plus className="w-3.5 h-3.5" /> Start New Topic
                    </button>
                  )}
                </div>

                {groupDiscussions.length === 0 ? (
                  <div className="p-8 text-center bg-zinc-50 rounded-2xl border border-dashed border-zinc-200 text-xs text-zinc-500">
                    No discussion topics started in this chapter yet. Be the first to start a conversation!
                  </div>
                ) : (
                  <div className="space-y-3">
                    {groupDiscussions.map(disc => {
                      const hasUpvoted = disc.upvotedUsers.includes(currentUserProfile.id);
                      const isExpanded = openDiscussionId === disc.id;

                      return (
                        <div
                          key={disc.id}
                          className="bg-white rounded-xl border border-zinc-200/80 p-4 shadow-sm hover:border-amber-200 transition-all space-y-3"
                        >
                          <div className="flex items-start justify-between gap-3">
                            <div className="flex items-center space-x-2.5">
                              <img
                                src={disc.author.avatarUrl}
                                alt={disc.author.displayName}
                                className="w-8 h-8 rounded-full object-cover cursor-pointer hover:ring-2 hover:ring-amber-400"
                                onClick={() => onViewProfile && onViewProfile(disc.author)}
                                referrerPolicy="no-referrer"
                              />
                              <div>
                                <div className="flex items-center space-x-1.5">
                                  <span 
                                    className="text-xs font-bold text-slate-900 hover:text-amber-600 cursor-pointer"
                                    onClick={() => onViewProfile && onViewProfile(disc.author)}
                                  >
                                    {disc.author.displayName}
                                  </span>
                                  {disc.author.cdlClass !== 'None' && (
                                    <span className="bg-amber-100 text-amber-800 font-bold px-1 rounded text-[9px]">
                                      CDL-{disc.author.cdlClass}
                                    </span>
                                  )}
                                </div>
                                <span className="text-[10px] text-zinc-400">
                                  {new Date(disc.createdAt).toLocaleDateString()}
                                </span>
                              </div>
                            </div>

                            <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-zinc-100 text-zinc-600">
                              {disc.category.replace('_', ' ')}
                            </span>
                          </div>

                          <div>
                            <h5 className="font-bold text-sm text-slate-900 leading-snug">
                              {disc.title}
                            </h5>
                            <p className="text-xs text-zinc-600 mt-1 leading-relaxed">
                              {disc.content}
                            </p>
                          </div>

                          <div className="flex items-center justify-between pt-2 border-t border-zinc-100 text-xs">
                            <div className="flex items-center space-x-2">
                              <button
                                onClick={() => handleToggleUpvote(disc.id)}
                                className={`px-2.5 py-1 rounded-lg font-bold flex items-center gap-1 transition-all ${
                                  hasUpvoted
                                    ? 'bg-amber-100 text-amber-900 border border-amber-300'
                                    : 'bg-zinc-50 text-zinc-600 hover:bg-zinc-100 border border-zinc-200'
                                }`}
                              >
                                <ThumbsUp className="w-3.5 h-3.5" />
                                <span>{disc.upvotes}</span>
                              </button>

                              <button
                                onClick={() => setOpenDiscussionId(isExpanded ? null : disc.id)}
                                className="px-2.5 py-1 rounded-lg font-bold bg-zinc-50 text-zinc-600 hover:bg-zinc-100 border border-zinc-200 flex items-center gap-1"
                              >
                                <MessageSquare className="w-3.5 h-3.5" />
                                <span>{disc.replyCount} Replies</span>
                              </button>
                            </div>

                            <button
                              onClick={() => handleVoiceReadout(`${disc.title}. ${disc.content}`)}
                              className="text-zinc-400 hover:text-amber-600 p-1 flex items-center gap-1 text-[11px] font-medium"
                              title="Listen on CB Voice Dispatch"
                            >
                              <Volume2 className="w-3.5 h-3.5" />
                              <span className="hidden sm:inline">Voice</span>
                            </button>
                          </div>

                          {/* EXPANDED REPLIES */}
                          {isExpanded && (
                            <div className="pt-3 border-t border-zinc-100 space-y-3 bg-zinc-50/60 p-3 rounded-xl">
                              <h6 className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">
                                Replies ({disc.replies?.length || 0})
                              </h6>

                              {disc.replies && disc.replies.length > 0 ? (
                                <div className="space-y-2">
                                  {disc.replies.map(r => (
                                    <div key={r.id} className="bg-white p-2.5 rounded-lg border border-zinc-100 flex items-start space-x-2">
                                      <img
                                        src={r.author.avatarUrl}
                                        alt=""
                                        className="w-6 h-6 rounded-full object-cover shrink-0"
                                        referrerPolicy="no-referrer"
                                      />
                                      <div className="flex-1">
                                        <div className="flex items-center justify-between">
                                          <span className="font-bold text-xs text-slate-900">
                                            {r.author.displayName}
                                          </span>
                                          <span className="text-[9px] text-zinc-400">
                                            {new Date(r.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                          </span>
                                        </div>
                                        <p className="text-xs text-zinc-600 mt-0.5">{r.text}</p>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              ) : (
                                <p className="text-[11px] text-zinc-400 italic">No replies yet. Chime in below!</p>
                              )}

                              {/* Post Reply Input */}
                              <div className="flex items-center gap-2 pt-1">
                                <input
                                  type="text"
                                  placeholder="Reply to this thread..."
                                  value={replyInputs[disc.id] || ''}
                                  onChange={(e) => setReplyInputs({ ...replyInputs, [disc.id]: e.target.value })}
                                  className="flex-1 bg-white border border-zinc-200 rounded-lg px-3 py-1.5 text-xs text-slate-800 focus:outline-none focus:border-amber-500"
                                  onKeyDown={(e) => {
                                    if (e.key === 'Enter') handleAddReply(disc.id);
                                  }}
                                />
                                <button
                                  onClick={() => handleAddReply(disc.id)}
                                  className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-lg flex items-center gap-1"
                                >
                                  <Send className="w-3 h-3" /> Reply
                                </button>
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {/* SUB TAB: EVENTS */}
            {chapterSubTab === 'events' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                    Chapter Convoys & Highway Meets
                  </h4>
                  {selectedGroup.isJoined && (
                    <button
                      onClick={() => setIsNewEventModalOpen(true)}
                      className="text-xs font-bold bg-amber-500 hover:bg-amber-600 text-slate-950 px-3 py-1.5 rounded-lg flex items-center gap-1 shadow-sm"
                    >
                      <Plus className="w-3.5 h-3.5" /> Schedule Convoy Meet
                    </button>
                  )}
                </div>

                {groupEvents.length === 0 ? (
                  <div className="p-8 text-center bg-zinc-50 rounded-2xl border border-dashed border-zinc-200 text-xs text-zinc-500">
                    No convoy meets scheduled for this chapter currently.
                  </div>
                ) : (
                  <div className="space-y-4">
                    {groupEvents.map(event => (
                      <div
                        key={event.id}
                        className="bg-white rounded-2xl border border-zinc-200 p-5 shadow-sm space-y-4"
                      >
                        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                          <div className="space-y-1">
                            <span className="text-[10px] font-black uppercase tracking-wider text-amber-600 bg-amber-50 px-2 py-0.5 rounded">
                              Official Convoy
                            </span>
                            <h4 className="font-bold text-base text-slate-900">{event.title}</h4>
                            <p className="text-xs text-zinc-600 leading-relaxed">{event.description}</p>
                          </div>

                          <button
                            onClick={() => handleToggleRsvp(event.id)}
                            className={`px-4 py-2 rounded-xl text-xs font-bold shrink-0 transition-all ${
                              event.isAttending
                                ? 'bg-emerald-100 text-emerald-900 border border-emerald-300'
                                : 'bg-amber-500 hover:bg-amber-600 text-slate-950 font-black shadow-sm'
                            }`}
                          >
                            {event.isAttending ? '✓ RSVP Attending' : 'Join Convoy'}
                          </button>
                        </div>

                        {/* Route and CB Channel Details Grid */}
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-zinc-50 p-3 rounded-xl border border-zinc-100 text-xs">
                          <div className="flex items-center space-x-2">
                            <MapPin className="w-4 h-4 text-amber-600 shrink-0" />
                            <div>
                              <div className="text-[10px] text-zinc-400 font-bold uppercase">Route Origin → Destination</div>
                              <div className="font-bold text-slate-800">{event.originLocation} → {event.destinationLocation}</div>
                            </div>
                          </div>

                          <div className="flex items-center space-x-2">
                            <Calendar className="w-4 h-4 text-amber-600 shrink-0" />
                            <div>
                              <div className="text-[10px] text-zinc-400 font-bold uppercase">Departure Date</div>
                              <div className="font-bold text-slate-800">{new Date(event.date).toLocaleDateString()} @ {new Date(event.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                            </div>
                          </div>

                          <div className="flex items-center space-x-2">
                            <Radio className="w-4 h-4 text-amber-600 shrink-0" />
                            <div>
                              <div className="text-[10px] text-zinc-400 font-bold uppercase">CB Radio Channel</div>
                              <div className="font-bold text-slate-800">Channel {event.cbChannel} AM</div>
                            </div>
                          </div>
                        </div>

                        {/* Attendees List */}
                        <div className="flex items-center justify-between pt-1 text-xs text-zinc-500">
                          <div className="flex items-center space-x-2">
                            <div className="flex -space-x-1.5 overflow-hidden">
                              {event.attendeeProfiles.slice(0, 4).map(p => (
                                <img
                                  key={p.id}
                                  src={p.avatarUrl}
                                  alt={p.displayName}
                                  className="w-6 h-6 rounded-full border-2 border-white object-cover"
                                  referrerPolicy="no-referrer"
                                />
                              ))}
                            </div>
                            <span className="font-semibold text-slate-800">
                              {event.attendeesCount} Rigs Rolling
                            </span>
                          </div>

                          <span className="text-[11px] text-zinc-400">
                            Lead Coordinator: <strong className="text-slate-700">{event.coordinator.displayName}</strong>
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* NEW TOPIC MODAL */}
      {isNewTopicModalOpen && selectedGroup && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-md overflow-hidden text-slate-900 shadow-2xl border border-zinc-100 animate-in fade-in zoom-in-95">
            <div className="p-4 border-b border-zinc-100 flex items-center justify-between bg-zinc-50">
              <h3 className="font-bold text-sm text-slate-900">Start Discussion in {selectedGroup.name}</h3>
              <button
                onClick={() => setIsNewTopicModalOpen(false)}
                className="text-zinc-400 hover:text-slate-900 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateTopic} className="p-5 space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-zinc-500 mb-1.5">
                  Category
                </label>
                <select
                  value={newTopicCategory}
                  onChange={(e) => setNewTopicCategory(e.target.value as any)}
                  className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-800 focus:outline-none focus:border-amber-500"
                >
                  <option value="safety_regulations">Safety & Regulations</option>
                  <option value="rig_builds">Rig Builds & Maintenance</option>
                  <option value="rates_contracts">Rates & Broker Transparency</option>
                  <option value="road_meetups">Road Meetups & Convoys</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-zinc-500 mb-1.5">
                  Topic Title
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Winter chain law updates on Donner Summit"
                  value={newTopicTitle}
                  onChange={(e) => setNewTopicTitle(e.target.value)}
                  className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-3 py-2 text-xs text-slate-800 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-zinc-500 mb-1.5">
                  Discussion Body
                </label>
                <textarea
                  rows={4}
                  required
                  placeholder="Share details, regulations, advice, or questions..."
                  value={newTopicContent}
                  onChange={(e) => setNewTopicContent(e.target.value)}
                  className="w-full bg-zinc-50 border border-zinc-200 rounded-xl p-3 text-xs text-slate-800 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="pt-2 flex items-center justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setIsNewTopicModalOpen(false)}
                  className="px-4 py-2 text-xs font-bold text-zinc-500 hover:text-slate-900"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold rounded-xl text-xs flex items-center gap-1.5 shadow-md"
                >
                  Publish Topic
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* NEW EVENT MODAL */}
      {isNewEventModalOpen && selectedGroup && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-md overflow-hidden text-slate-900 shadow-2xl border border-zinc-100 animate-in fade-in zoom-in-95">
            <div className="p-4 border-b border-zinc-100 flex items-center justify-between bg-zinc-50">
              <h3 className="font-bold text-sm text-slate-900">Schedule Convoy Meet</h3>
              <button
                onClick={() => setIsNewEventModalOpen(false)}
                className="text-zinc-400 hover:text-slate-900 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateEvent} className="p-5 space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-zinc-500 mb-1.5">
                  Convoy Title
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Midwest Harvest Grain Run"
                  value={newEventTitle}
                  onChange={(e) => setNewEventTitle(e.target.value)}
                  className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-3 py-2 text-xs text-slate-800 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-zinc-500 mb-1.5">
                  Description & Speed Target
                </label>
                <textarea
                  rows={2}
                  placeholder="Target cruising speed, drafting distance, fuel stops..."
                  value={newEventDesc}
                  onChange={(e) => setNewEventDesc(e.target.value)}
                  className="w-full bg-zinc-50 border border-zinc-200 rounded-xl p-3 text-xs text-slate-800 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-zinc-500 mb-1.5">
                    Origin
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Cheyenne, WY"
                    value={newEventOrigin}
                    onChange={(e) => setNewEventOrigin(e.target.value)}
                    className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-3 py-2 text-xs text-slate-800 focus:outline-none focus:border-amber-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-zinc-500 mb-1.5">
                    Destination
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Laramie, WY"
                    value={newEventDest}
                    onChange={(e) => setNewEventDest(e.target.value)}
                    className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-3 py-2 text-xs text-slate-800 focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-zinc-500 mb-1.5">
                    Date & Time
                  </label>
                  <input
                    type="datetime-local"
                    value={newEventDate}
                    onChange={(e) => setNewEventDate(e.target.value)}
                    className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-3 py-2 text-xs text-slate-800 focus:outline-none focus:border-amber-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-zinc-500 mb-1.5">
                    CB Channel (1-40)
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={40}
                    value={newEventChannel}
                    onChange={(e) => setNewEventChannel(Number(e.target.value))}
                    className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-3 py-2 text-xs text-slate-800 focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div className="pt-2 flex items-center justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setIsNewEventModalOpen(false)}
                  className="px-4 py-2 text-xs font-bold text-zinc-500 hover:text-slate-900"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold rounded-xl text-xs flex items-center gap-1.5 shadow-md"
                >
                  Schedule Convoy
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

