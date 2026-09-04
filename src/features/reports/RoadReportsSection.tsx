import React, { useState, useEffect } from 'react';
import { RoadReport, RoadReportType } from '../../types';
import { sampleRoadReports, currentUserProfile } from '../../data';
import { AlertTriangle, ShieldAlert, Navigation, Compass, Star, ChevronUp, PlusCircle, Check, X, MapPin } from 'lucide-react';

export default function RoadReportsSection() {
  const [reports, setReports] = useState<RoadReport[]>([]);
  const [filterType, setFilterType] = useState<string>('all');
  
  // Create report state
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [locationName, setLocationName] = useState('');
  const [reportType, setReportType] = useState<RoadReportType>('scale');
  const [statusValue, setStatusValue] = useState('');

  // Load state from localStorage or seed
  useEffect(() => {
    const cached = localStorage.getItem('trucker_road_reports');
    if (cached) {
      setReports(JSON.parse(cached));
    } else {
      setReports(sampleRoadReports);
      localStorage.setItem('trucker_road_reports', JSON.stringify(sampleRoadReports));
    }
  }, []);

  const saveReports = (updated: RoadReport[]) => {
    setReports(updated);
    localStorage.setItem('trucker_road_reports', JSON.stringify(updated));
  };

  // Upvote report
  const handleUpvote = (id: string) => {
    const updated = reports.map(r => {
      if (r.id === id) {
        const hasUpvoted = r.upvotedUsers.includes(currentUserProfile.id);
        let upvotedUsers = [...r.upvotedUsers];
        let upvoteCount = r.upvoteCount;

        if (hasUpvoted) {
          upvotedUsers = upvotedUsers.filter(u => u !== currentUserProfile.id);
          upvoteCount = Math.max(0, upvoteCount - 1);
        } else {
          upvotedUsers.push(currentUserProfile.id);
          upvoteCount += 1;
        }
        return { ...r, upvoteCount, upvotedUsers };
      }
      return r;
    });
    saveReports(updated);
  };

  // Create new road report
  const handleSubmitReport = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !locationName.trim()) return;

    const newReport: RoadReport = {
      id: `report-${Date.now()}`,
      author: currentUserProfile,
      reportType,
      title: title.trim(),
      description: description.trim(),
      locationName: locationName.trim(),
      upvoteCount: 1,
      upvotedUsers: [currentUserProfile.id],
      expiresAt: new Date(Date.now() + 6 * 3600 * 1000).toISOString(), // 6 hours safety window
      createdAt: new Date().toISOString(),
      statusValue: statusValue.trim() || undefined
    };

    const updated = [newReport, ...reports];
    saveReports(updated);

    // Reset
    setTitle('');
    setDescription('');
    setLocationName('');
    setStatusValue('');
    setIsFormOpen(false);
  };

  const getReportIcon = (type: RoadReportType) => {
    switch (type) {
      case 'scale':
        return <Compass className="w-5 h-5 text-purple-600" />;
      case 'parking':
        return <Navigation className="w-5 h-5 text-emerald-600" />;
      case 'weather':
        return <Compass className="w-5 h-5 text-blue-600" />;
      case 'fuel':
        return <Star className="w-5 h-5 text-amber-600" />;
      case 'inspection':
        return <ShieldAlert className="w-5 h-5 text-red-600" />;
      case 'hazard':
        return <AlertTriangle className="w-5 h-5 text-orange-600" />;
      default:
        return <AlertTriangle className="w-5 h-5 text-slate-600" />;
    }
  };

  const getReportTypeBg = (type: RoadReportType) => {
    switch (type) {
      case 'scale': return 'bg-purple-50 border-purple-100 text-purple-800';
      case 'parking': return 'bg-emerald-50 border-emerald-100 text-emerald-800';
      case 'weather': return 'bg-blue-50 border-blue-100 text-blue-800';
      case 'fuel': return 'bg-amber-50 border-amber-100 text-amber-800';
      case 'inspection': return 'bg-red-50 border-red-100 text-red-800';
      case 'hazard': return 'bg-orange-50 border-orange-100 text-orange-800';
      default: return 'bg-slate-50 border-slate-100 text-slate-800';
    }
  };

  const filteredReports = filterType === 'all'
    ? reports
    : reports.filter(r => r.reportType === filterType);

  return (
    <div className="space-y-6" id="reports-container">
      {/* Category selector and Add Report Button */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-4 rounded-xl shadow-sm border border-zinc-100" id="reports-header-panel">
        <div className="flex items-center space-x-2 overflow-x-auto pb-1 md:pb-0 scrollbar-none" id="reports-filters">
          {[
            { id: 'all', label: 'All Alerts' },
            { id: 'scale', label: 'DOT Scales' },
            { id: 'parking', label: 'Parking Space' },
            { id: 'inspection', label: 'Inspections' },
            { id: 'weather', label: 'Weather Hazards' },
            { id: 'hazard', label: 'Road Hazards' },
            { id: 'fuel', label: 'Diesel Prices' }
          ].map(c => (
            <button
              key={c.id}
              onClick={() => setFilterType(c.id)}
              className={`px-3 py-1.5 text-xs font-bold rounded-lg border transition-all shrink-0 ${
                filterType === c.id
                  ? 'bg-slate-900 border-slate-900 text-white shadow-sm'
                  : 'bg-white border-zinc-200 text-zinc-600 hover:bg-zinc-50'
              }`}
            >
              {c.label}
            </button>
          ))}
        </div>

        <button
          id="btn-add-report"
          onClick={() => setIsFormOpen(true)}
          className="flex items-center justify-center space-x-2 bg-amber-500 hover:bg-amber-600 active:bg-amber-700 text-slate-950 font-bold px-4 py-2 rounded-xl transition-all shadow-sm text-xs"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Broadcast Road Hazard</span>
        </button>
      </div>

      {/* ROAD REPORT SUBMIT MODAL */}
      {isFormOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4" id="report-modal">
          <div className="w-full max-w-md bg-white rounded-2xl shadow-xl overflow-hidden border border-zinc-100 max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-100 bg-zinc-50">
              <h3 className="text-base font-bold text-slate-900">Broadcast Highway Alert</h3>
              <button 
                id="close-report-modal"
                onClick={() => setIsFormOpen(false)} 
                className="text-zinc-400 hover:text-slate-900 p-1 rounded-full hover:bg-zinc-100 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmitReport} className="p-6 space-y-4 overflow-y-auto flex-1">
              {/* Type Grid */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-zinc-500 mb-2">Alert Category</label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: 'scale', label: 'DOT Scale' },
                    { id: 'parking', label: 'Truck Parking' },
                    { id: 'inspection', label: 'Inspections' },
                    { id: 'weather', label: 'Weather' },
                    { id: 'hazard', label: 'Hazard' },
                    { id: 'fuel', label: 'Diesel Price' }
                  ].map(item => (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => setReportType(item.id as RoadReportType)}
                      className={`py-2 px-1 text-[11px] font-bold rounded-lg border text-center transition-all ${
                        reportType === item.id
                          ? 'bg-amber-500 text-slate-950 border-amber-500'
                          : 'bg-white text-zinc-600 border-zinc-200 hover:bg-zinc-50'
                      }`}
                    >
                      {item.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Title */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-zinc-500 mb-2">Alert Title / Summary</label>
                <input
                  required
                  type="text"
                  placeholder="e.g. WB Scale Open & Pulling, Parking Full, Ice on road"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-zinc-200 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent text-xs text-slate-800"
                />
              </div>

              {/* Location */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-zinc-500 mb-2">Exact Mile Marker / Route</label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-3 w-4 h-4 text-zinc-400" />
                  <input
                    required
                    type="text"
                    placeholder="e.g. I-40 East MM 312 (Crossville, TN)"
                    value={locationName}
                    onChange={(e) => setLocationName(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-zinc-200 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent text-xs text-slate-800"
                  />
                </div>
              </div>

              {/* Current Status Value */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-zinc-500 mb-2">Current Value / Status (Optional)</label>
                <input
                  type="text"
                  placeholder="e.g. Scale Open, Level 1 inspections active, $3.35/gal"
                  value={statusValue}
                  onChange={(e) => setStatusValue(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-zinc-200 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent text-xs text-slate-800"
                />
              </div>

              {/* Details Description */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-zinc-500 mb-2">Additional Safety Details</label>
                <textarea
                  placeholder="e.g. Traffic is bottlenecked, DOT checking logs and fire extinguishers, parking lane is icy but fuel island is cleared..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={3}
                  className="w-full px-4 py-3 rounded-xl border border-zinc-200 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent text-xs text-slate-800"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-slate-900 hover:bg-slate-800 active:bg-slate-950 text-white font-bold rounded-xl transition-all text-xs shadow-md mt-2"
              >
                Broadcast Safety Alert
              </button>
            </form>
          </div>
        </div>
      )}

      {/* ROAD REPORT ALERTS LIST */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4" id="reports-grid">
        {filteredReports.length === 0 ? (
          <div className="col-span-full bg-white rounded-2xl border border-zinc-100 p-12 text-center text-zinc-500">
            <Compass className="w-12 h-12 text-zinc-300 mx-auto mb-3" />
            <p className="font-semibold text-slate-800">No highway alerts active for this category</p>
            <p className="text-xs mt-1">Check back soon or submit a new hazard alert from the field.</p>
          </div>
        ) : (
          filteredReports.map(report => {
            const upvoted = report.upvotedUsers.includes(currentUserProfile.id);

            return (
              <div 
                key={report.id} 
                className={`bg-white rounded-2xl border p-5 shadow-sm hover:shadow-md transition-all flex flex-col justify-between ${
                  report.reportType === 'inspection' ? 'border-red-100 bg-red-50/10' : 'border-zinc-100'
                }`}
                id={`report-card-${report.id}`}
              >
                {/* Upper Metadata Tag Row */}
                <div className="space-y-3">
                  <div className="flex items-start justify-between">
                    <span className={`flex items-center space-x-1 px-2.5 py-1 rounded-full text-[10px] font-bold border ${getReportTypeBg(report.reportType)}`}>
                      {getReportIcon(report.reportType)}
                      <span className="uppercase tracking-wider ml-1">{report.reportType}</span>
                    </span>

                    <span className="text-[10px] text-zinc-400 font-medium">
                      Alert live: {new Date(report.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>

                  {/* Title and location */}
                  <div className="space-y-1">
                    <h4 className="font-bold text-slate-900 text-sm leading-snug">{report.title}</h4>
                    <div className="flex items-center text-zinc-500 text-xs font-semibold">
                      <MapPin className="w-3.5 h-3.5 text-zinc-400 mr-1 shrink-0" />
                      <span className="truncate">{report.locationName}</span>
                    </div>
                  </div>

                  {/* Status Indicator Badge (if exists) */}
                  {report.statusValue && (
                    <div className="inline-flex items-center px-2 py-0.5 rounded bg-zinc-100 border border-zinc-200 text-[10px] font-bold text-zinc-700">
                      <Check className="w-3 h-3 text-zinc-500 mr-1 shrink-0" />
                      <span>{report.statusValue}</span>
                    </div>
                  )}

                  {/* Body description details */}
                  {report.description && (
                    <p className="text-zinc-600 text-xs leading-relaxed font-normal bg-zinc-50/50 p-2.5 rounded-lg border border-zinc-100/30">
                      {report.description}
                    </p>
                  )}
                </div>

                {/* Voter and feedback action row */}
                <div className="mt-5 pt-3 border-t border-zinc-50 flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <img src={report.author.avatarUrl} className="w-6 h-6 rounded-full object-cover" alt={report.author.displayName} />
                    <span className="text-[10px] text-zinc-500">
                      By <span className="font-bold text-slate-700">{report.author.displayName}</span>
                    </span>
                  </div>

                  {/* Upvote Button */}
                  <button
                    id={`upvote-report-${report.id}`}
                    onClick={() => handleUpvote(report.id)}
                    className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all border ${
                      upvoted 
                        ? 'bg-amber-500 border-amber-500 text-slate-950 shadow-sm' 
                        : 'bg-white border-zinc-200 text-zinc-600 hover:bg-zinc-50'
                    }`}
                  >
                    <ChevronUp className={`w-3.5 h-3.5 ${upvoted ? 'stroke-[3px]' : ''}`} />
                    <span>{report.upvoteCount} Confirm Alert</span>
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
