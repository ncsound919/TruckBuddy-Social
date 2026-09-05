import React, { useState, useEffect } from 'react';
import { RoadReport, RoadReportType, Profile } from '../../types';
import { sampleRoadReports, currentUserProfile } from '../../data';
import { broadcastCbMessage } from '../../utils/cbAudio';
import { 
  AlertTriangle, 
  ShieldAlert, 
  Navigation, 
  Compass, 
  Star, 
  ChevronUp, 
  PlusCircle, 
  Check, 
  X, 
  MapPin, 
  Radio, 
  Volume2, 
  VolumeX, 
  Scale, 
  Snowflake, 
  Truck, 
  Filter, 
  Flame, 
  Clock, 
  CheckCircle2, 
  Info,
  Layers,
  Camera,
  Locate
} from 'lucide-react';

interface WeighStationPreset {
  id: string;
  name: string;
  corridor: string;
  location: string;
  direction: string;
  status: 'open_pulling' | 'closed' | 'prepass_green' | 'level1_blitz';
  lastUpdated: string;
  verifiedCount: number;
}

const INITIAL_WEIGH_STATIONS: WeighStationPreset[] = [
  {
    id: 'scale-1',
    name: 'Evanston Port of Entry',
    corridor: 'I-80',
    location: 'MM 5 (Evanston, WY)',
    direction: 'Westbound',
    status: 'open_pulling',
    lastUpdated: '4 mins ago',
    verifiedCount: 18
  },
  {
    id: 'scale-2',
    name: 'Banning Weigh Station',
    corridor: 'I-10',
    location: 'MM 85 (Banning, CA)',
    direction: 'Eastbound',
    status: 'prepass_green',
    lastUpdated: '12 mins ago',
    verifiedCount: 24
  },
  {
    id: 'scale-3',
    name: 'Crossville Inspection Station',
    corridor: 'I-40',
    location: 'MM 315 (Crossville, TN)',
    direction: 'Eastbound',
    status: 'level1_blitz',
    lastUpdated: '8 mins ago',
    verifiedCount: 31
  },
  {
    id: 'scale-4',
    name: 'Toledo Turnpike Scales',
    corridor: 'I-80',
    location: 'MM 64 (Toledo, OH)',
    direction: 'Both Directions',
    status: 'closed',
    lastUpdated: '22 mins ago',
    verifiedCount: 9
  },
  {
    id: 'scale-5',
    name: 'Joplin Commercial Scales',
    corridor: 'I-44',
    location: 'MM 4 (Joplin, MO)',
    direction: 'Westbound',
    status: 'open_pulling',
    lastUpdated: '15 mins ago',
    verifiedCount: 14
  }
];

interface RoadReportsSectionProps {
  onViewProfile?: (profile: Profile) => void;
}

export default function RoadReportsSection({ onViewProfile }: RoadReportsSectionProps = {}) {
  const [reports, setReports] = useState<RoadReport[]>([]);
  const [weighStations, setWeighStations] = useState<WeighStationPreset[]>([]);
  const [filterType, setFilterType] = useState<string>('all');
  const [selectedCorridor, setSelectedCorridor] = useState<string>('all');
  const [activeSubTab, setActiveSubTab] = useState<'alerts' | 'weigh_stations'>('alerts');
  
  // CB Radio broadcast state
  const [isRadioPlaying, setIsRadioPlaying] = useState(false);
  const [radioStatusText, setRadioStatusText] = useState('Channel 19 Squelch Standby • 27.185 MHz');

  // Create report modal state
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [locationName, setLocationName] = useState('');
  const [corridor, setCorridor] = useState('I-80');
  const [reportType, setReportType] = useState<RoadReportType>('scale');
  const [statusValue, setStatusValue] = useState('');
  const [weighStatus, setWeighStatus] = useState<'open_pulling' | 'closed' | 'prepass_green' | 'level1_blitz'>('open_pulling');

  // Load state from localStorage or seed
  useEffect(() => {
    const cachedReports = localStorage.getItem('trucker_road_reports');
    if (cachedReports) {
      setReports(JSON.parse(cachedReports));
    } else {
      setReports(sampleRoadReports);
      localStorage.setItem('trucker_road_reports', JSON.stringify(sampleRoadReports));
    }

    const cachedScales = localStorage.getItem('trucker_weigh_stations');
    if (cachedScales) {
      setWeighStations(JSON.parse(cachedScales));
    } else {
      setWeighStations(INITIAL_WEIGH_STATIONS);
      localStorage.setItem('trucker_weigh_stations', JSON.stringify(INITIAL_WEIGH_STATIONS));
    }
  }, []);

  const saveReports = (updated: RoadReport[]) => {
    setReports(updated);
    localStorage.setItem('trucker_road_reports', JSON.stringify(updated));
  };

  const saveWeighStations = (updated: WeighStationPreset[]) => {
    setWeighStations(updated);
    localStorage.setItem('trucker_weigh_stations', JSON.stringify(updated));
  };

  // Upvote / Confirm report
  const handleUpvote = (id: string) => {
    const updated = reports.map(r => {
      if (r.id === id) {
        const hasUpvoted = r.upvotedUsers.includes(currentUserProfile.id);
        let upvotedUsers = [...r.upvotedUsers];
        let upvoteCount = r.upvoteCount;
        let verifiedCount = r.verifiedByDriversCount || r.upvoteCount;

        if (hasUpvoted) {
          upvotedUsers = upvotedUsers.filter(u => u !== currentUserProfile.id);
          upvoteCount = Math.max(0, upvoteCount - 1);
          verifiedCount = Math.max(1, verifiedCount - 1);
        } else {
          upvotedUsers.push(currentUserProfile.id);
          upvoteCount += 1;
          verifiedCount += 1;
        }
        return { ...r, upvoteCount, upvotedUsers, verifiedByDriversCount: verifiedCount };
      }
      return r;
    });
    saveReports(updated);
  };

  // Update Weigh Station Status in 1-click
  const handleUpdateWeighStationStatus = (scaleId: string, newStatus: WeighStationPreset['status']) => {
    const updated = weighStations.map(ws => {
      if (ws.id === scaleId) {
        return {
          ...ws,
          status: newStatus,
          lastUpdated: 'Just now by you',
          verifiedCount: ws.verifiedCount + 1
        };
      }
      return ws;
    });
    saveWeighStations(updated);
  };

  // Trigger CB Radio Voice Alert Broadcast
  const handleToggleRadioBroadcast = () => {
    if (isRadioPlaying) {
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
      setIsRadioPlaying(false);
      setRadioStatusText('Channel 19 Squelch Standby • 27.185 MHz');
      return;
    }

    setRadioStatusText('🎙️ TRANSMITTING: Highway Channel 19 Emergency Bulletins...');

    const speechText = reports.slice(0, 3).map(r => 
      `Attention drivers on ${r.locationName}. ${r.title}. ${r.description}`
    ).join('. Next bulletin: ');

    broadcastCbMessage(
      `Breaker one-nine. ${speechText}`,
      () => setIsRadioPlaying(true),
      () => {
        setIsRadioPlaying(false);
        setRadioStatusText('Channel 19 Squelch Standby • 27.185 MHz');
      }
    );
  };

  const handleAutoLocate = () => {
    if (typeof navigator !== 'undefined' && navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const lat = pos.coords.latitude.toFixed(3);
          const lng = pos.coords.longitude.toFixed(3);
          setLocationName(`GPS Ref: ${lat}°N, ${lng}°W`);
        },
        (err) => {
          console.warn('GPS location unavailable', err);
        }
      );
    }
  };

  // Quick Rapid SOS Preset Drop
  const handleQuickPreset = (presetType: 'ice' | 'scale' | 'blitz' | 'closure' | 'parking') => {
    setIsFormOpen(true);
    if (presetType === 'ice') {
      setReportType('weather');
      setTitle('Severe Black Ice / Multiple Spin-outs');
      setLocationName('I-80 Elk Mountain Mile Marker 265');
      setCorridor('I-80');
      setStatusValue('Extremely Hazardous / Chain Law In Effect');
      setDescription('Sudden freezing rain created pure black ice across both lanes. Reduce speed to under 30 MPH immediately.');
    } else if (presetType === 'scale') {
      setReportType('scale');
      setTitle('Weigh Station Open & Pulling All Rigs');
      setLocationName('I-80 Westbound MM 120 (Mansfield, OH)');
      setCorridor('I-80');
      setStatusValue('Scale Open / Inspection Active');
      setWeighStatus('open_pulling');
      setDescription('Static platform scale is open. PrePass red light pulling everyone in for credential and permit verification.');
    } else if (presetType === 'blitz') {
      setReportType('inspection');
      setTitle('State Trooper Level 1 Inspection Blitz');
      setLocationName('I-40 Eastbound MM 315 (Crossville, TN)');
      setCorridor('I-40');
      setStatusValue('DOT Level 1 Blitz Active');
      setWeighStatus('level1_blitz');
      setDescription('Multiple highway patrol units doing comprehensive brake, logbook, and tire tread depth verifications.');
    } else if (presetType === 'closure') {
      setReportType('hazard');
      setTitle('Highway Shut Down / Jackknifed Semi');
      setLocationName('I-70 Vail Pass Mile Marker 180');
      setCorridor('I-70');
      setStatusValue('Both Lanes Blocked / 4 Mile Backup');
      setDescription('Emergency crews on scene. Wreckers attempting to clear rig. Expect 2+ hour delay.');
    } else if (presetType === 'parking') {
      setReportType('parking');
      setTitle('Truck Stop Parking 100% Full');
      setLocationName('Love\'s Travel Stop I-75 MM 42');
      setCorridor('I-75');
      setStatusValue('Full (No Spots / Overflow Packed)');
      setDescription('All designated truck spots and back perimeter lanes are filled. Drivers circling. Divert to next rest area.');
    }
  };

  // Submit report
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
      corridor: corridor.trim() || 'I-80',
      upvoteCount: 1,
      upvotedUsers: [currentUserProfile.id],
      expiresAt: new Date(Date.now() + 6 * 3600 * 1000).toISOString(),
      createdAt: new Date().toISOString(),
      statusValue: statusValue.trim() || undefined,
      weighStatus: reportType === 'scale' || reportType === 'inspection' ? weighStatus : undefined,
      verifiedByDriversCount: 1
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
        return <Scale className="w-4 h-4 text-purple-600" />;
      case 'parking':
        return <Navigation className="w-4 h-4 text-emerald-600" />;
      case 'weather':
        return <Snowflake className="w-4 h-4 text-blue-600" />;
      case 'fuel':
        return <Star className="w-4 h-4 text-amber-600" />;
      case 'inspection':
        return <ShieldAlert className="w-4 h-4 text-rose-600" />;
      case 'hazard':
        return <AlertTriangle className="w-4 h-4 text-orange-600" />;
      default:
        return <AlertTriangle className="w-4 h-4 text-slate-600" />;
    }
  };

  const getReportTypeBg = (type: RoadReportType) => {
    switch (type) {
      case 'scale': return 'bg-purple-50 border-purple-200 text-purple-900';
      case 'parking': return 'bg-emerald-50 border-emerald-200 text-emerald-900';
      case 'weather': return 'bg-blue-50 border-blue-200 text-blue-900';
      case 'fuel': return 'bg-amber-50 border-amber-200 text-amber-900';
      case 'inspection': return 'bg-rose-50 border-rose-200 text-rose-900';
      case 'hazard': return 'bg-orange-50 border-orange-200 text-orange-900';
      default: return 'bg-slate-50 border-slate-200 text-slate-900';
    }
  };

  // Filtered reports
  const filteredReports = reports.filter(r => {
    const matchesType = filterType === 'all' || r.reportType === filterType;
    const matchesCorridor = selectedCorridor === 'all' || r.corridor === selectedCorridor || r.locationName.includes(selectedCorridor);
    return matchesType && matchesCorridor;
  });

  const corridors = ['all', 'I-80', 'I-10', 'I-40', 'I-70', 'I-75', 'I-95', 'I-5', 'I-94'];

  return (
    <div className="space-y-6" id="reports-container">
      {/* CB RADIO HIGHWAY CHANNEL 19 LIVE AUDIO BROADCAST BAR */}
      <div className="bg-slate-900 rounded-2xl p-4 sm:p-5 border border-slate-800 shadow-md text-white flex flex-col md:flex-row md:items-center justify-between gap-4 relative overflow-hidden" id="cb-radio-banner">
        <div className="flex items-center space-x-3.5 z-10">
          <div className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all ${
            isRadioPlaying ? 'bg-amber-500 text-slate-950 animate-pulse ring-4 ring-amber-500/30' : 'bg-slate-800 text-amber-400 border border-slate-700'
          }`}>
            <Radio className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-[10px] font-black uppercase tracking-widest px-2 py-0.5 bg-amber-500/20 text-amber-400 border border-amber-500/30 rounded">
                CB RADIO • CHANNEL 19
              </span>
              <span className="flex items-center space-x-1 text-[10px] text-zinc-400">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
                <span>Live Squelch</span>
              </span>
            </div>
            <h3 className="text-sm font-black tracking-tight text-white mt-1">Highway Emergency Audio Alerts</h3>
            <p className="text-xs text-zinc-400 font-mono mt-0.5">{radioStatusText}</p>
          </div>
        </div>

        <div className="flex items-center space-x-2.5 z-10">
          <button
            onClick={handleToggleRadioBroadcast}
            className={`px-4 py-2.5 rounded-xl font-black text-xs uppercase tracking-wider flex items-center space-x-2 transition-all shadow-md ${
              isRadioPlaying 
                ? 'bg-rose-600 hover:bg-rose-700 text-white' 
                : 'bg-amber-500 hover:bg-amber-400 text-slate-950'
            }`}
          >
            {isRadioPlaying ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
            <span>{isRadioPlaying ? 'Mute Channel 19' : 'Listen Channel 19'}</span>
          </button>
          <button
            id="btn-add-report"
            onClick={() => setIsFormOpen(true)}
            className="flex items-center space-x-2 bg-slate-800 hover:bg-slate-700 text-zinc-200 border border-slate-700 font-bold px-4 py-2.5 rounded-xl transition-all text-xs"
          >
            <PlusCircle className="w-4 h-4 text-amber-400" />
            <span>Post Hazard</span>
          </button>
        </div>
      </div>

      {/* RAPID SOS 1-CLICK PRESET BUTTONS */}
      <div className="bg-white p-4 rounded-2xl border border-zinc-100 shadow-sm space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-extrabold text-slate-800 uppercase tracking-wider flex items-center space-x-1.5">
            <Flame className="w-3.5 h-3.5 text-amber-500" />
            <span>1-Tap Highway Hazard Droppers</span>
          </span>
          <span className="text-[10px] text-zinc-400 font-medium">Click to auto-broadcast instantly</span>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 pt-1">
          <button
            onClick={() => handleQuickPreset('ice')}
            className="flex items-center space-x-2 p-2 bg-blue-50/70 hover:bg-blue-100 border border-blue-200/60 rounded-xl text-left transition-all"
          >
            <Snowflake className="w-4 h-4 text-blue-600 shrink-0" />
            <div className="min-w-0">
              <p className="text-[11px] font-bold text-blue-950 truncate">Black Ice Ahead</p>
              <p className="text-[9px] text-blue-600 font-medium">Spin-outs on pass</p>
            </div>
          </button>
          <button
            onClick={() => handleQuickPreset('scale')}
            className="flex items-center space-x-2 p-2 bg-purple-50/70 hover:bg-purple-100 border border-purple-200/60 rounded-xl text-left transition-all"
          >
            <Scale className="w-4 h-4 text-purple-600 shrink-0" />
            <div className="min-w-0">
              <p className="text-[11px] font-bold text-purple-950 truncate">Scale Open / Pulling</p>
              <p className="text-[9px] text-purple-600 font-medium">PrePass Red</p>
            </div>
          </button>
          <button
            onClick={() => handleQuickPreset('blitz')}
            className="flex items-center space-x-2 p-2 bg-rose-50/70 hover:bg-rose-100 border border-rose-200/60 rounded-xl text-left transition-all"
          >
            <ShieldAlert className="w-4 h-4 text-rose-600 shrink-0" />
            <div className="min-w-0">
              <p className="text-[11px] font-bold text-rose-950 truncate">DOT Level 1 Blitz</p>
              <p className="text-[9px] text-rose-600 font-medium">Log & Brake Checks</p>
            </div>
          </button>
          <button
            onClick={() => handleQuickPreset('closure')}
            className="flex items-center space-x-2 p-2 bg-orange-50/70 hover:bg-orange-100 border border-orange-200/60 rounded-xl text-left transition-all"
          >
            <AlertTriangle className="w-4 h-4 text-orange-600 shrink-0" />
            <div className="min-w-0">
              <p className="text-[11px] font-bold text-orange-950 truncate">Lanes Blocked</p>
              <p className="text-[9px] text-orange-600 font-medium">Major Wreck Ahead</p>
            </div>
          </button>
          <button
            onClick={() => handleQuickPreset('parking')}
            className="flex items-center space-x-2 p-2 bg-emerald-50/70 hover:bg-emerald-100 border border-emerald-200/60 rounded-xl text-left transition-all col-span-2 sm:col-span-1"
          >
            <Navigation className="w-4 h-4 text-emerald-600 shrink-0" />
            <div className="min-w-0">
              <p className="text-[11px] font-bold text-emerald-950 truncate">Parking 100% Full</p>
              <p className="text-[9px] text-emerald-600 font-medium">No Spots Left</p>
            </div>
          </button>
        </div>
      </div>

      {/* SUB-NAVIGATION TABS: HIGHWAY ALERTS vs LIVE WEIGH STATIONS */}
      <div className="flex items-center space-x-3 border-b border-zinc-200 pb-2">
        <button
          onClick={() => setActiveSubTab('alerts')}
          className={`pb-2 px-1 text-xs font-black uppercase tracking-wider flex items-center space-x-2 border-b-2 transition-all ${
            activeSubTab === 'alerts'
              ? 'border-amber-500 text-slate-900'
              : 'border-transparent text-zinc-400 hover:text-slate-700'
          }`}
        >
          <ShieldAlert className="w-4 h-4" />
          <span>Active Highway Alerts ({filteredReports.length})</span>
        </button>
        <button
          onClick={() => setActiveSubTab('weigh_stations')}
          className={`pb-2 px-1 text-xs font-black uppercase tracking-wider flex items-center space-x-2 border-b-2 transition-all ${
            activeSubTab === 'weigh_stations'
              ? 'border-amber-500 text-slate-900'
              : 'border-transparent text-zinc-400 hover:text-slate-700'
          }`}
        >
          <Scale className="w-4 h-4" />
          <span>Live Weigh Stations & Ports of Entry ({weighStations.length})</span>
        </button>
      </div>

      {/* INTERSTATE CORRIDOR FILTER PILLS */}
      <div className="flex items-center space-x-2 overflow-x-auto pb-1 scrollbar-none" id="corridor-pills">
        <span className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider shrink-0 flex items-center space-x-1">
          <Filter className="w-3 h-3" />
          <span>Corridor:</span>
        </span>
        {corridors.map(c => (
          <button
            key={c}
            onClick={() => setSelectedCorridor(c)}
            className={`px-3 py-1 rounded-full text-xs font-bold transition-all shrink-0 border ${
              selectedCorridor === c
                ? 'bg-amber-500 border-amber-500 text-slate-950 shadow-sm'
                : 'bg-white border-zinc-200 text-zinc-600 hover:bg-zinc-50'
            }`}
          >
            {c === 'all' ? 'All Corridors' : c}
          </button>
        ))}
      </div>

      {/* IF SUBTAB === WEIGH STATIONS: LIVE SCALE BOARD */}
      {activeSubTab === 'weigh_stations' && (
        <div className="space-y-4">
          <div className="bg-purple-50/50 border border-purple-100 rounded-2xl p-4 text-xs text-purple-900 flex items-start space-x-3">
            <Info className="w-4 h-4 text-purple-600 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold">Live Crowdsourced Scale & Port of Entry Network:</span> Confirmed by active CDL drivers passing scale sensors in real time. Tap any button below to update or confirm current status!
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {weighStations
              .filter(ws => selectedCorridor === 'all' || ws.corridor === selectedCorridor)
              .map(ws => (
                <div key={ws.id} className="bg-white rounded-2xl border border-zinc-100 p-5 shadow-sm space-y-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 bg-zinc-100 text-zinc-600 rounded">
                        {ws.corridor} • {ws.direction}
                      </span>
                      <h4 className="font-bold text-slate-900 text-sm mt-1">{ws.name}</h4>
                      <p className="text-xs text-zinc-500 font-medium">{ws.location}</p>
                    </div>

                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider border ${
                      ws.status === 'open_pulling' ? 'bg-purple-50 text-purple-700 border-purple-200' :
                      ws.status === 'prepass_green' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                      ws.status === 'level1_blitz' ? 'bg-rose-50 text-rose-700 border-rose-200' :
                      'bg-zinc-100 text-zinc-600 border-zinc-200'
                    }`}>
                      {ws.status === 'open_pulling' ? 'Open & Pulling' :
                       ws.status === 'prepass_green' ? 'PrePass Green / Bypass' :
                       ws.status === 'level1_blitz' ? 'Level 1 Blitz' : 'Closed / Off'}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-zinc-400 border-t border-zinc-50 pt-3">
                    <span className="flex items-center space-x-1">
                      <Clock className="w-3.5 h-3.5" />
                      <span>Reported {ws.lastUpdated}</span>
                    </span>
                    <span className="flex items-center space-x-1 text-emerald-600 font-semibold">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Verified by {ws.verifiedCount} drivers</span>
                    </span>
                  </div>

                  {/* 1-Click Status Confirmation Buttons */}
                  <div className="grid grid-cols-3 gap-1.5 pt-1">
                    <button
                      onClick={() => handleUpdateWeighStationStatus(ws.id, 'open_pulling')}
                      className={`py-1.5 px-2 rounded-lg text-[10px] font-bold border text-center transition-all ${
                        ws.status === 'open_pulling' 
                          ? 'bg-purple-600 text-white border-purple-600 shadow-sm' 
                          : 'bg-zinc-50 text-zinc-600 border-zinc-200 hover:bg-zinc-100'
                      }`}
                    >
                      Report Open
                    </button>
                    <button
                      onClick={() => handleUpdateWeighStationStatus(ws.id, 'prepass_green')}
                      className={`py-1.5 px-2 rounded-lg text-[10px] font-bold border text-center transition-all ${
                        ws.status === 'prepass_green' 
                          ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm' 
                          : 'bg-zinc-50 text-zinc-600 border-zinc-200 hover:bg-zinc-100'
                      }`}
                    >
                      PrePass Green
                    </button>
                    <button
                      onClick={() => handleUpdateWeighStationStatus(ws.id, 'closed')}
                      className={`py-1.5 px-2 rounded-lg text-[10px] font-bold border text-center transition-all ${
                        ws.status === 'closed' 
                          ? 'bg-slate-800 text-white border-slate-800 shadow-sm' 
                          : 'bg-zinc-50 text-zinc-600 border-zinc-200 hover:bg-zinc-100'
                      }`}
                    >
                      Report Closed
                    </button>
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}

      {/* IF SUBTAB === ALERTS: HIGHWAY ALERTS LIST */}
      {activeSubTab === 'alerts' && (
        <>
          {/* Category selector */}
          <div className="flex items-center space-x-2 overflow-x-auto pb-1 scrollbar-none" id="reports-filters">
            {[
              { id: 'all', label: 'All Categories' },
              { id: 'scale', label: 'DOT Scales' },
              { id: 'parking', label: 'Truck Parking' },
              { id: 'inspection', label: 'Inspections' },
              { id: 'weather', label: 'Weather Hazards' },
              { id: 'hazard', label: 'Road Hazards' },
              { id: 'fuel', label: 'Diesel Deals' }
            ].map(c => (
              <button
                key={c.id}
                onClick={() => setFilterType(c.id)}
                className={`px-3 py-1.5 text-xs font-bold rounded-xl border transition-all shrink-0 ${
                  filterType === c.id
                    ? 'bg-slate-900 border-slate-900 text-white shadow-sm'
                    : 'bg-white border-zinc-200 text-zinc-600 hover:bg-zinc-50'
                }`}
              >
                {c.label}
              </button>
            ))}
          </div>

          {/* ROAD REPORT ALERTS GRID */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4" id="reports-grid">
            {filteredReports.length === 0 ? (
              <div className="col-span-full bg-white rounded-2xl border border-zinc-100 p-12 text-center text-zinc-500">
                <Compass className="w-12 h-12 text-zinc-300 mx-auto mb-3" />
                <p className="font-semibold text-slate-800">No highway alerts active for this category/corridor</p>
                <p className="text-xs mt-1">Check back soon or submit a new hazard alert from the field.</p>
              </div>
            ) : (
              filteredReports.map(report => {
                const upvoted = report.upvotedUsers.includes(currentUserProfile.id);

                return (
                  <div 
                    key={report.id} 
                    className={`bg-white rounded-2xl border p-5 shadow-sm hover:shadow-md transition-all flex flex-col justify-between ${
                      report.reportType === 'inspection' ? 'border-rose-100 bg-rose-50/10' : 'border-zinc-100'
                    }`}
                    id={`report-card-${report.id}`}
                  >
                    {/* Upper Metadata Tag Row */}
                    <div className="space-y-3">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center space-x-2">
                          <span className={`flex items-center space-x-1 px-2.5 py-1 rounded-full text-[10px] font-bold border ${getReportTypeBg(report.reportType)}`}>
                            {getReportIcon(report.reportType)}
                            <span className="uppercase tracking-wider ml-1">{report.reportType}</span>
                          </span>
                          {report.corridor && (
                            <span className="bg-zinc-100 text-zinc-700 text-[10px] font-black uppercase px-2 py-0.5 rounded">
                              {report.corridor}
                            </span>
                          )}
                        </div>

                        <span className="text-[10px] text-zinc-400 font-medium">
                          {new Date(report.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
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
                        <div className="inline-flex items-center px-2.5 py-1 rounded-lg bg-zinc-100 border border-zinc-200 text-[11px] font-bold text-zinc-800">
                          <Check className="w-3.5 h-3.5 text-emerald-600 mr-1.5 shrink-0" />
                          <span>{report.statusValue}</span>
                        </div>
                      )}

                      {/* Body description details */}
                      {report.description && (
                        <p className="text-zinc-600 text-xs leading-relaxed font-normal bg-zinc-50/70 p-3 rounded-xl border border-zinc-100">
                          {report.description}
                        </p>
                      )}
                    </div>

                    {/* Voter and feedback action row */}
                    <div className="mt-5 pt-3 border-t border-zinc-50 flex items-center justify-between">
                      <div 
                        onClick={() => onViewProfile?.(report.author)}
                        className="flex items-center space-x-2 cursor-pointer group"
                        title={`View @${report.author.username}'s Profile & Timeline`}
                      >
                        <img 
                          src={report.author.avatarUrl} 
                          className="w-6 h-6 rounded-full object-cover group-hover:ring-2 ring-amber-400 transition-all" 
                          alt={report.author.displayName} 
                        />
                        <span className="text-[10px] text-zinc-500">
                          By <span className="font-bold text-slate-700 group-hover:text-amber-600 transition-colors">{report.author.displayName}</span>
                        </span>
                      </div>

                      {/* Upvote & Verification Button */}
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
                        <span>Confirmed by {report.verifiedByDriversCount || report.upvoteCount} Drivers</span>
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </>
      )}

      {/* ROAD REPORT SUBMIT MODAL */}
      {isFormOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4" id="report-modal">
          <div className="w-full max-w-lg bg-white rounded-2xl shadow-xl overflow-hidden border border-zinc-100 max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-100 bg-zinc-50">
              <div>
                <h3 className="text-base font-bold text-slate-900">Broadcast Highway Alert</h3>
                <p className="text-xs text-zinc-500">Send real-time road conditions to all drivers on corridor</p>
              </div>
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
                    { id: 'weather', label: 'Weather Hazard' },
                    { id: 'hazard', label: 'Road Hazard' },
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

              {/* Corridor & Location */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-zinc-500 mb-1">Corridor</label>
                  <select
                    value={corridor}
                    onChange={(e) => setCorridor(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl border border-zinc-200 text-xs text-slate-800 bg-white"
                  >
                    <option value="I-80">I-80 Corridor</option>
                    <option value="I-10">I-10 Corridor</option>
                    <option value="I-40">I-40 Corridor</option>
                    <option value="I-70">I-70 Corridor</option>
                    <option value="I-75">I-75 Corridor</option>
                    <option value="I-95">I-95 Corridor</option>
                    <option value="I-5">I-5 Corridor</option>
                    <option value="Other">Other Route</option>
                  </select>
                </div>
                <div className="sm:col-span-2">
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-xs font-bold uppercase tracking-wider text-zinc-500">Mile Marker / Location</label>
                    <button
                      type="button"
                      onClick={handleAutoLocate}
                      className="text-[10px] font-bold text-amber-600 hover:text-amber-700 flex items-center gap-1"
                    >
                      <Locate className="w-3 h-3" /> Auto-Detect GPS
                    </button>
                  </div>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-3 w-4 h-4 text-zinc-400" />
                    <input
                      required
                      type="text"
                      placeholder="e.g. I-80 WB MM 120 (Mansfield, OH)"
                      value={locationName}
                      onChange={(e) => setLocationName(e.target.value)}
                      className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-zinc-200 text-xs text-slate-800"
                    />
                  </div>
                </div>
              </div>

              {/* Title */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-zinc-500 mb-1">Alert Headline</label>
                <input
                  required
                  type="text"
                  placeholder="e.g. Scales Open & Pulling, Parking Full, Black Ice"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-zinc-200 text-xs text-slate-800"
                />
              </div>

              {/* Current Status Value */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-zinc-500 mb-1">Status Badge Text (Optional)</label>
                <input
                  type="text"
                  placeholder="e.g. Scale Open, PrePass Green, Level 1 Blitz, $3.25/gal"
                  value={statusValue}
                  onChange={(e) => setStatusValue(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-zinc-200 text-xs text-slate-800"
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-zinc-500 mb-1">Safety Advisory Details</label>
                <textarea
                  rows={3}
                  placeholder="Provide essential details: lane blockage, safe detour, weather visibility, DOT checklist focus..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-zinc-200 text-xs text-slate-800"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-slate-900 hover:bg-slate-800 text-white font-extrabold rounded-xl transition-all text-xs uppercase tracking-wider shadow-md"
              >
                Broadcast Highway Alert to Corridor
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
