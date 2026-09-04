import React, { useState, useEffect } from 'react';
import { Group, Post } from '../../types';
import { sampleGroups, samplePosts } from '../../data';
import { Users, Shield, ArrowRight, CheckCircle2, ChevronRight, X } from 'lucide-react';

export default function GroupsSection() {
  const [groups, setGroups] = useState<Group[]>([]);
  const [selectedGroup, setSelectedGroup] = useState<Group | null>(null);
  const [activeTab, setActiveTab] = useState<'all' | 'association' | 'region'>('all');

  useEffect(() => {
    const cached = localStorage.getItem('trucker_groups');
    if (cached) {
      setGroups(JSON.parse(cached));
    } else {
      setGroups(sampleGroups);
      localStorage.setItem('trucker_groups', JSON.stringify(sampleGroups));
    }
  }, []);

  const saveGroups = (updated: Group[]) => {
    setGroups(updated);
    localStorage.setItem('trucker_groups', JSON.stringify(updated));
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

    // Sync selectedGroup if open
    if (selectedGroup && selectedGroup.id === id) {
      const match = updated.find(g => g.id === id);
      if (match) setSelectedGroup(match);
    }
  };

  const filteredGroups = activeTab === 'all'
    ? groups
    : groups.filter(g => g.category === activeTab);

  return (
    <div className="space-y-6" id="groups-container">
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
          <div className="h-44 relative bg-zinc-100">
            <img src={selectedGroup.coverImageUrl} className="w-full h-full object-cover" alt="" referrerPolicy="no-referrer" />
            <button
              id="back-to-chapters"
              onClick={() => setSelectedGroup(null)}
              className="absolute top-4 left-4 bg-slate-900/80 hover:bg-slate-900 text-white font-bold text-xs px-3 py-1.5 rounded-xl flex items-center space-x-1 backdrop-blur-sm transition-colors"
            >
              <span>← Back to Chapters</span>
            </button>
          </div>

          <div className="p-6 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 border-b border-zinc-50 pb-5">
              <div className="space-y-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-amber-600">{selectedGroup.category} Chapter</span>
                <h3 className="text-lg font-bold text-slate-900">{selectedGroup.name}</h3>
                <p className="text-zinc-500 text-xs flex items-center">
                  <Users className="w-4 h-4 mr-1 text-zinc-400" />
                  <span className="font-bold text-slate-700">{selectedGroup.memberCount.toLocaleString()} drivers</span> are discussing regulations in this chapter
                </p>
              </div>

              <button
                id={`detail-join-toggle-${selectedGroup.id}`}
                onClick={() => handleToggleJoin(selectedGroup.id)}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                  selectedGroup.isJoined
                    ? 'bg-zinc-100 text-zinc-600 border border-zinc-200'
                    : 'bg-amber-500 hover:bg-amber-600 text-slate-950 shadow-md'
                }`}
              >
                {selectedGroup.isJoined ? 'Joined Member' : 'Request Join'}
              </button>
            </div>

            {/* Description */}
            <div className="space-y-2">
              <h4 className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Chapter Mission</h4>
              <p className="text-zinc-600 text-xs leading-relaxed font-normal">{selectedGroup.description}</p>
            </div>

            {/* Simulated feed or discussion guidelines */}
            <div className="space-y-3 pt-4 border-t border-zinc-50">
              <h4 className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Chapter Live Discussion Board</h4>
              
              {selectedGroup.isJoined ? (
                <div className="space-y-4">
                  <div className="bg-zinc-50 border border-dashed border-zinc-200 p-4 rounded-xl text-center text-xs text-zinc-500">
                    You are a verified member of this chapter. Scroll the primary Home Feed to see specific discussions tagged under this chapter!
                  </div>

                  {/* Render simulated post related to category */}
                  <div className="bg-white p-4 rounded-xl border border-zinc-100 shadow-sm space-y-3">
                    <div className="flex items-center space-x-2">
                      <span className="font-bold text-xs text-slate-900">SafetyAdvocate_99</span>
                      <span className="text-[10px] text-zinc-400">· 2h ago</span>
                    </div>
                    <p className="text-xs text-zinc-700">Has anyone applied for the federal cargo securement discount in this state chapter yet? Looking for the application form links.</p>
                    <div className="flex items-center space-x-2 text-[10px] text-zinc-400 font-bold uppercase">
                      <span>3 replies</span>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="bg-zinc-50 border border-zinc-200 p-8 rounded-2xl text-center space-y-3">
                  <Shield className="w-8 h-8 text-zinc-400 mx-auto" />
                  <p className="text-xs font-bold text-slate-800">Chapter Content Locked</p>
                  <p className="text-[11px] text-zinc-500 max-w-xs mx-auto">Click 'Request Join' above to verify your CDL card and gain access to this local chapter's discussions.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
