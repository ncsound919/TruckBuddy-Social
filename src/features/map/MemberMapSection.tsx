import React, { useState, useEffect, useMemo, useRef } from 'react';
import { MemberLocation, Profile, DriverMapStatus } from '../../types';
import { sampleMemberLocations, currentUserProfile } from '../../data';
import { 
  subscribeLiveMemberLocations, 
  updateLiveMemberLocation 
} from '../../lib/firebase';
import {
  MAP_BOUNDS,
  projectCoords,
  USA_COASTLINE_POINTS,
  GREAT_LAKES,
  MAJOR_RIVERS,
  MOUNTAIN_RANGES,
  US_STATE_CENTROIDS,
  EXTENDED_INTERSTATE_HIGHWAYS,
  TRUCKING_POIS,
  ACTIVE_WEATHER_ZONES,
  TruckingPoi,
  WeatherHazardZone,
  HighwayRoute
} from './mapData';
import { 
  MapPin, 
  Navigation, 
  Eye, 
  EyeOff, 
  Search, 
  Compass, 
  Truck, 
  Radio, 
  MessageSquare, 
  User, 
  ShieldCheck, 
  Gauge, 
  Layers, 
  RotateCcw, 
  Plus, 
  Minus, 
  ChevronRight,
  Sparkles,
  Maximize2,
  Minimize2,
  CloudRain,
  Wind,
  Mountain,
  Fuel,
  Scale,
  Crosshair,
  Volume2,
  AlertTriangle,
  Sun,
  Moon,
  Satellite
} from 'lucide-react';

interface MemberMapSectionProps {
  onViewProfile?: (profile: Profile) => void;
  onOpenDirectMessage?: (profile: Profile) => void;
  isDeadZone?: boolean;
}

type MapTheme = 'tactical' | 'satellite' | 'cockpit' | 'weather';

export default function MemberMapSection({
  onViewProfile,
  onOpenDirectMessage,
  isDeadZone = false
}: MemberMapSectionProps) {
  // Member locations state with live Firestore subscription
  const [locations, setLocations] = useState<MemberLocation[]>(sampleMemberLocations);

  useEffect(() => {
    const unsubscribe = subscribeLiveMemberLocations((liveLocs) => {
      if (liveLocs && liveLocs.length > 0) {
        setLocations(liveLocs);
      } else {
        setLocations(sampleMemberLocations);
      }
    });
    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, []);

  // Location broadcasting toggle
  const [isSharingLocation, setIsSharingLocation] = useState<boolean>(() => {
    const saved = localStorage.getItem('trucker_broadcast_location');
    return saved !== null ? JSON.parse(saved) : true;
  });

  // Current user's 20 status
  const [userStatusNote, setUserStatusNote] = useState<string>('Cruising steady with 42,000 lbs coils. Clear pavement.');
  const [userStatus, setUserStatus] = useState<DriverMapStatus>('rolling');
  const [userSpeed, setUserSpeed] = useState<number>(67);
  const [userCorridor, setUserCorridor] = useState<string>('I-40');
  const [userCity, setUserCity] = useState<string>('Nashville, TN (MM 215)');

  // Selected driver for detail dossier card
  const [selectedLocation, setSelectedLocation] = useState<MemberLocation | null>(null);
  
  // Hovered item for interactive floating tooltips
  const [hoveredDriver, setHoveredDriver] = useState<MemberLocation | null>(null);
  const [hoveredPoi, setHoveredPoi] = useState<TruckingPoi | null>(null);
  const [hoveredWeather, setHoveredWeather] = useState<WeatherHazardZone | null>(null);
  const [tooltipPos, setTooltipPos] = useState<{ x: number; y: number }>({ x: 0, y: 0 });

  // Map theme: tactical (dark radar), satellite (topo relief), cockpit (high-contrast day), weather (storm radar)
  const [mapTheme, setMapTheme] = useState<MapTheme>('tactical');

  // Layer toggles
  const [showHighways, setShowHighways] = useState<boolean>(true);
  const [showMegastops, setShowMegastops] = useState<boolean>(true);
  const [showPasses, setShowPasses] = useState<boolean>(true);
  const [showScales, setShowScales] = useState<boolean>(true);
  const [showWeather, setShowWeather] = useState<boolean>(true);
  const [showRadarSweep, setShowRadarSweep] = useState<boolean>(true);
  const [showFlowAnimation, setShowFlowAnimation] = useState<boolean>(true);
  const [showStateNames, setShowStateNames] = useState<boolean>(true);

  // Filters & Search
  const [corridorFilter, setCorridorFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [viewMode, setViewMode] = useState<'map' | 'split'>('map');

  // Map zoom and pan
  const [zoomLevel, setZoomLevel] = useState<number>(1);
  const [panOffset, setPanOffset] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [dragStart, setDragStart] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [targetLock, setTargetLock] = useState<boolean>(false);

  // Toast message
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const mapContainerRef = useRef<HTMLDivElement>(null);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3800);
  };

  // Sound horn chime using Web Audio API
  const playAirHornSound = () => {
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc1 = audioCtx.createOscillator();
      const osc2 = audioCtx.createOscillator();
      const gainNode = audioCtx.createGain();

      // Commercial truck dual horn harmonic frequencies (F#3 and A#3)
      osc1.frequency.setValueAtTime(185, audioCtx.currentTime);
      osc2.frequency.setValueAtTime(233, audioCtx.currentTime);

      osc1.type = 'sawtooth';
      osc2.type = 'sawtooth';

      gainNode.gain.setValueAtTime(0.12, audioCtx.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.45);

      osc1.connect(gainNode);
      osc2.connect(gainNode);
      gainNode.connect(audioCtx.destination);

      osc1.start();
      osc2.start();
      osc1.stop(audioCtx.currentTime + 0.45);
      osc2.stop(audioCtx.currentTime + 0.45);
    } catch {
      // Audio not supported or blocked by policy
    }
  };

  // Handle sharing toggle
  const handleToggleSharing = async (enabled: boolean) => {
    setIsSharingLocation(enabled);
    localStorage.setItem('trucker_broadcast_location', JSON.stringify(enabled));
    
    let updatedLoc: MemberLocation | undefined;
    setLocations(prev => {
      const updated = prev.map(loc => {
        if (loc.driver.id === currentUserProfile.id) {
          updatedLoc = { ...loc, isSharingLocation: enabled };
          return updatedLoc;
        }
        return loc;
      });
      return updated;
    });

    if (updatedLoc) {
      try {
        await updateLiveMemberLocation(updatedLoc);
      } catch (e) {
        console.warn('Live location sync note:', e);
      }
    }

    if (enabled) {
      showToast('🟢 Live 20 Broadcast Active: Verified CDL members can locate your rig along highway corridors.');
    } else {
      showToast('🔒 Ghost Mode Active: Your rig coordinates are hidden. You still have full radar visibility.');
    }
  };

  // Update current user's 20
  const handleUpdateMy20 = async (e: React.FormEvent) => {
    e.preventDefault();
    let updatedLoc: MemberLocation | undefined;
    setLocations(prev => {
      const updated = prev.map(loc => {
        if (loc.driver.id === currentUserProfile.id) {
          updatedLoc = {
            ...loc,
            status: userStatus,
            speedMph: userStatus === 'rolling' ? userSpeed : 0,
            corridor: userCorridor,
            statusNote: userStatusNote,
            lastUpdated: 'Just now'
          };
          return updatedLoc;
        }
        return loc;
      });
      return updated;
    });

    if (updatedLoc) {
      try {
        await updateLiveMemberLocation(updatedLoc);
      } catch (e) {
        console.warn('Live location sync note:', e);
      }
    }

    playAirHornSound();
    showToast('📡 10-4! Your 20 coordinates and status have updated on the National Radar.');
  };

  // Center on user's rig (Willie Overdrive)
  const handleLocateMyRig = () => {
    const userLoc = locations.find(l => l.driver.id === currentUserProfile.id);
    if (!userLoc) return;

    const proj = projectCoords(userLoc.lat, userLoc.lng);
    // Center point in SVG (960 / 2 = 480, 600 / 2 = 300)
    const newZoom = 1.9;
    const targetX = (480 - proj.x) * newZoom;
    const targetY = (300 - proj.y) * newZoom;

    setZoomLevel(newZoom);
    setPanOffset({ x: targetX, y: targetY });
    setSelectedLocation(userLoc);
    setTargetLock(true);
    setTimeout(() => setTargetLock(false), 3000);

    playAirHornSound();
    showToast(`🎯 Locked on Your Rig: ${userLoc.corridor} ${userLoc.mileMarker || ''} (${userLoc.city}, ${userLoc.state})`);
  };

  // Zoom helpers
  const handleZoomIn = () => setZoomLevel(prev => Math.min(prev + 0.35, 3.8));
  const handleZoomOut = () => setZoomLevel(prev => Math.max(prev - 0.35, 0.75));
  const handleResetZoom = () => {
    setZoomLevel(1);
    setPanOffset({ x: 0, y: 0 });
    setSelectedLocation(null);
  };

  // Mouse pan handlers
  const handleMouseDown = (e: React.MouseEvent) => {
    // Only left click drags
    if (e.button !== 0) return;
    setIsDragging(true);
    setDragStart({ x: e.clientX - panOffset.x, y: e.clientY - panOffset.y });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging) {
      setPanOffset({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y
      });
    }
  };

  const handleMouseUp = () => setIsDragging(false);

  // Filtered members list
  const filteredMembers = useMemo(() => {
    return locations.filter(loc => {
      // If user disabled sharing and this is someone else inspecting, they might hide,
      // but in local preview we honor isSharingLocation
      if (!loc.isSharingLocation && loc.driver.id !== currentUserProfile.id) {
        return false;
      }

      // Corridor filter
      if (corridorFilter !== 'all' && !loc.corridor.toLowerCase().includes(corridorFilter.toLowerCase())) {
        return false;
      }

      // Status filter
      if (statusFilter !== 'all' && loc.status !== statusFilter) {
        return false;
      }

      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchHandle = loc.driver.username.toLowerCase().includes(q);
        const matchName = loc.driver.displayName.toLowerCase().includes(q);
        const matchCity = loc.city.toLowerCase().includes(q);
        const matchState = loc.state.toLowerCase().includes(q);
        const matchRig = loc.rigType.toLowerCase().includes(q);
        const matchCarrier = (loc.driver.carrierName || '').toLowerCase().includes(q);
        return matchHandle || matchName || matchCity || matchState || matchRig || matchCarrier;
      }

      return true;
    });
  }, [locations, corridorFilter, statusFilter, searchQuery]);

  // Aggregate highway statistics
  const highwayStats = useMemo(() => {
    const rollingDrivers = filteredMembers.filter(m => m.status === 'rolling');
    const avgSpeed = rollingDrivers.length > 0 
      ? Math.round(rollingDrivers.reduce((acc, d) => acc + d.speedMph, 0) / rollingDrivers.length) 
      : 65;
    
    const activePasses = TRUCKING_POIS.filter(p => p.type === 'pass').length;
    const activeScales = TRUCKING_POIS.filter(p => p.type === 'scale').length;
    
    return {
      activeCount: filteredMembers.length,
      rollingCount: rollingDrivers.length,
      avgSpeed,
      activePasses,
      activeScales,
      severeWeatherCount: ACTIVE_WEATHER_ZONES.filter(w => w.severity === 'warning').length
    };
  }, [filteredMembers]);

  // Generate SVG path string from LatLng array
  const generatePathFromPoints = (points: { lat: number; lng: number }[], closed = false) => {
    const d = points.map((pt, idx) => {
      const proj = projectCoords(pt.lat, pt.lng);
      return `${idx === 0 ? 'M' : 'L'} ${proj.x.toFixed(1)},${proj.y.toFixed(1)}`;
    }).join(' ');
    return closed ? `${d} Z` : d;
  };

  // US Landmass perimeter path
  const usaLandmassPath = useMemo(() => {
    return generatePathFromPoints(USA_COASTLINE_POINTS, true);
  }, []);

  // Status helper badge
  const getStatusBadge = (status: DriverMapStatus, speed?: number) => {
    switch (status) {
      case 'rolling':
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded-md font-black text-[10px] bg-emerald-500/20 text-emerald-400 border border-emerald-500/40">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping mr-1" />
            ROLLING ({speed || 68} MPH)
          </span>
        );
      case 'parked':
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded-md font-black text-[10px] bg-amber-500/20 text-amber-400 border border-amber-500/40">
            PARKED / REST
          </span>
        );
      case 'loading':
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded-md font-black text-[10px] bg-sky-500/20 text-sky-400 border border-sky-500/40">
            LOADING DOCK
          </span>
        );
      case 'off_duty':
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded-md font-black text-[10px] bg-purple-500/20 text-purple-400 border border-purple-500/40">
            10-HR RESET
          </span>
        );
    }
  };

  return (
    <div className="space-y-5" id="national-member-map-section">
      {/* SECTION HEADER & CONTROL BANNER */}
      <div className="bg-slate-900 text-white rounded-3xl p-5 sm:p-6 border border-slate-800 shadow-xl space-y-4 relative overflow-hidden">
        {/* Subtle background radar grid accent */}
        <div className="absolute -right-16 -top-16 w-80 h-80 rounded-full border border-amber-500/10 pointer-events-none" />
        <div className="absolute -right-8 -top-8 w-64 h-64 rounded-full border border-amber-500/10 pointer-events-none" />

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 relative z-10">
          <div>
            <div className="flex items-center space-x-2.5">
              <span className="p-2.5 rounded-2xl bg-amber-500 text-slate-950 font-black shadow-md flex items-center justify-center">
                <Compass className="w-5 h-5 text-slate-950" />
              </span>
              <div>
                <h2 className="text-xl sm:text-2xl font-black tracking-tight text-white flex items-center space-x-2">
                  <span>National Member Radar & Live US Map</span>
                  <span className="text-[11px] font-black uppercase px-2 py-0.5 bg-amber-500/20 text-amber-400 border border-amber-500/40 rounded-full">
                    GPS Transponders
                  </span>
                </h2>
                <p className="text-xs text-zinc-400 mt-0.5">
                  Real-time transcontinental freight tracking, commercial corridors, mountain summits, and verified driver telemetry.
                </p>
              </div>
            </div>
          </div>

          {/* TELEMETRY QUICK PILLS */}
          <div className="flex flex-wrap items-center gap-2 text-xs">
            <div className="bg-slate-800/90 px-3 py-1.5 rounded-xl border border-slate-700/80 flex items-center space-x-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="font-black text-white">{highwayStats.activeCount}</span>
              <span className="text-zinc-400 text-[11px]">Rigs On Radar</span>
            </div>

            <div className="bg-slate-800/90 px-3 py-1.5 rounded-xl border border-slate-700/80 flex items-center space-x-2">
              <Gauge className="w-3.5 h-3.5 text-amber-400" />
              <span className="font-black text-white">{highwayStats.avgSpeed} MPH</span>
              <span className="text-zinc-400 text-[11px]">Avg Pace</span>
            </div>

            {/* Quick Locate My Rig button */}
            <button
              id="btn-locate-my-rig"
              onClick={handleLocateMyRig}
              className="px-3.5 py-1.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black rounded-xl shadow-md transition flex items-center space-x-1.5 active:scale-95"
              title="Smooth zoom & center onto Willie Overdrive's current 20"
            >
              <Crosshair className="w-4 h-4" />
              <span>Locate My 20</span>
            </button>
          </div>
        </div>

        {/* BROADCAST / GHOST MODE STATUS BAR */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pt-3 border-t border-slate-800 text-xs">
          <div className="flex items-center space-x-2 text-zinc-300">
            {isSharingLocation ? (
              <span className="flex items-center space-x-1.5 text-emerald-400 font-bold">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
                <span>Broadcasting Live 20:</span>
              </span>
            ) : (
              <span className="flex items-center space-x-1.5 text-amber-400 font-bold">
                <EyeOff className="w-3.5 h-3.5" />
                <span>Ghost Mode Active:</span>
              </span>
            )}
            <span className="text-zinc-400 font-medium truncate max-w-md">
              {isSharingLocation 
                ? 'Your GPS beacon is active on I-40 (MM 215) Nashville, TN.' 
                : 'Your rig coordinates are hidden from fellow drivers.'}
            </span>
          </div>

          <div className="flex items-center space-x-3 shrink-0">
            <span className="text-[11px] font-bold text-zinc-400">
              {isSharingLocation ? 'Beacon ON' : 'Beacon OFF'}
            </span>
            <button
              id="btn-toggle-broadcast"
              type="button"
              onClick={() => handleToggleSharing(!isSharingLocation)}
              className={`relative inline-flex h-6 w-12 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                isSharingLocation ? 'bg-amber-500' : 'bg-slate-700'
              }`}
              title="Toggle Live 20 Broadcast"
            >
              <span
                className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-slate-950 shadow ring-0 transition duration-200 ease-in-out ${
                  isSharingLocation ? 'translate-x-6' : 'translate-x-0'
                }`}
              />
            </button>
          </div>
        </div>

        {/* CORRIDOR & STATUS QUICK FILTERS */}
        <div className="grid grid-cols-1 sm:grid-cols-12 gap-2.5 pt-3 border-t border-slate-800/80 text-xs">
          {/* Search Box */}
          <div className="sm:col-span-4 relative">
            <Search className="w-4 h-4 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search handle, carrier, rig, or city..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 bg-slate-950/80 border border-slate-700 rounded-xl text-white placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-amber-500 font-medium"
            />
          </div>

          {/* Corridor Dropdown */}
          <div className="sm:col-span-3">
            <select
              value={corridorFilter}
              onChange={e => setCorridorFilter(e.target.value)}
              className="w-full py-2 px-3 bg-slate-950/80 border border-slate-700 rounded-xl font-bold text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
            >
              <option value="all">🛣️ All Freight Corridors ({locations.length})</option>
              <option value="I-80">I-80 Transcon (CA/WY/NE/IA/IL/PA)</option>
              <option value="I-40">I-40 Sunbelt (CA/AZ/NM/TX/TN/NC)</option>
              <option value="I-10">I-10 Southern Pass (CA/AZ/TX/FL)</option>
              <option value="I-95">I-95 Eastern Seaboard (FL→ME)</option>
              <option value="I-5">I-5 West Coast Spine (CA/OR/WA)</option>
              <option value="I-70">I-70 Heartland (UT/CO/KS/MO/IN)</option>
              <option value="I-35">I-35 NAFTA Corridor (TX→MN)</option>
              <option value="I-75">I-75 Auto & Fruit Chute (MI→FL)</option>
              <option value="I-90">I-90 Northern Tier (WA→MA)</option>
            </select>
          </div>

          {/* Status Dropdown */}
          <div className="sm:col-span-3">
            <select
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value)}
              className="w-full py-2 px-3 bg-slate-950/80 border border-slate-700 rounded-xl font-bold text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
            >
              <option value="all">All Driving Statuses</option>
              <option value="rolling">🟢 Rolling on Highway ({highwayStats.rollingCount})</option>
              <option value="parked">🟡 Parked at Truck Stop / Rest</option>
              <option value="loading">🔵 Shipper / Receiver Loading Dock</option>
              <option value="off_duty">🟣 10-Hour Reset / Off Duty</option>
            </select>
          </div>

          {/* View Mode Toggle */}
          <div className="sm:col-span-2 flex items-center justify-end space-x-1.5">
            <button
              onClick={() => setViewMode('map')}
              className={`flex-1 py-2 px-2.5 rounded-xl font-bold text-xs transition flex items-center justify-center space-x-1.5 ${
                viewMode === 'map' ? 'bg-amber-500 text-slate-950 shadow' : 'bg-slate-800 text-zinc-300 hover:bg-slate-700'
              }`}
              title="Full Map View"
            >
              <Layers className="w-3.5 h-3.5" />
              <span>Map</span>
            </button>
            <button
              onClick={() => setViewMode('split')}
              className={`flex-1 py-2 px-2.5 rounded-xl font-bold text-xs transition flex items-center justify-center space-x-1.5 ${
                viewMode === 'split' ? 'bg-amber-500 text-slate-950 shadow' : 'bg-slate-800 text-zinc-300 hover:bg-slate-700'
              }`}
              title="Split Radar Roster"
            >
              <Truck className="w-3.5 h-3.5" />
              <span>List ({filteredMembers.length})</span>
            </button>
          </div>
        </div>
      </div>

      {/* TOAST MESSAGE */}
      {toastMsg && (
        <div className="bg-slate-900 text-white text-xs font-bold px-4 py-2.5 rounded-2xl shadow-xl flex items-center space-x-2 border border-amber-500/50 animate-in fade-in">
          <Sparkles className="w-4 h-4 text-amber-400 shrink-0" />
          <span>{toastMsg}</span>
        </div>
      )}

      {/* MAP STAGE CONTAINER */}
      <div className={`grid gap-5 ${viewMode === 'split' ? 'lg:grid-cols-12' : 'grid-cols-1'}`}>
        {/* INTERACTIVE VECTOR US MAP */}
        <div 
          ref={mapContainerRef}
          className={`relative bg-slate-950 rounded-3xl overflow-hidden border border-slate-800 shadow-2xl ${
            isFullscreen ? 'fixed inset-0 z-50 rounded-none' : ''
          } ${viewMode === 'split' ? 'lg:col-span-8' : 'w-full'}`}
        >
          {/* TOP-LEFT HUD: DRIVER RADAR COUNT & THEME SWITCHER */}
          <div className="absolute top-4 left-4 z-20 flex flex-wrap items-center gap-2 pointer-events-auto">
            {/* Live Count Badge */}
            <div className="bg-slate-900/90 backdrop-blur-md px-3 py-1.5 rounded-xl border border-slate-700/80 text-xs shadow-lg flex items-center space-x-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
              <span className="font-black text-white">
                {filteredMembers.length} CDL Transponders
              </span>
              <span className="text-zinc-400 text-[10px] hidden sm:inline">• Live Grid</span>
            </div>

            {/* Map Theme Selector Pill */}
            <div className="bg-slate-900/90 backdrop-blur-md p-1 rounded-xl border border-slate-700/80 flex items-center space-x-1 shadow-lg text-[11px]">
              <button
                onClick={() => setMapTheme('tactical')}
                className={`px-2 py-1 rounded-lg font-black transition flex items-center space-x-1 ${
                  mapTheme === 'tactical' ? 'bg-amber-500 text-slate-950' : 'text-zinc-400 hover:text-white'
                }`}
                title="Tactical Dark Radar"
              >
                <Moon className="w-3 h-3" />
                <span className="hidden sm:inline">Tactical</span>
              </button>
              <button
                onClick={() => setMapTheme('satellite')}
                className={`px-2 py-1 rounded-lg font-black transition flex items-center space-x-1 ${
                  mapTheme === 'satellite' ? 'bg-emerald-500 text-slate-950' : 'text-zinc-400 hover:text-white'
                }`}
                title="Topographic Terrain Satellite"
              >
                <Satellite className="w-3 h-3" />
                <span className="hidden sm:inline">Satellite</span>
              </button>
              <button
                onClick={() => setMapTheme('cockpit')}
                className={`px-2 py-1 rounded-lg font-black transition flex items-center space-x-1 ${
                  mapTheme === 'cockpit' ? 'bg-sky-400 text-slate-950' : 'text-zinc-400 hover:text-white'
                }`}
                title="Cockpit Day Dispatch"
              >
                <Sun className="w-3 h-3" />
                <span className="hidden sm:inline">Day</span>
              </button>
              <button
                onClick={() => setMapTheme('weather')}
                className={`px-2 py-1 rounded-lg font-black transition flex items-center space-x-1 ${
                  mapTheme === 'weather' ? 'bg-rose-500 text-white' : 'text-zinc-400 hover:text-white'
                }`}
                title="Live Weather & Wind Hazard Radar"
              >
                <CloudRain className="w-3 h-3" />
                <span className="hidden sm:inline">Weather</span>
              </button>
            </div>
          </div>

          {/* TOP-RIGHT CONTROLS: ZOOM & FULLSCREEN */}
          <div className="absolute top-4 right-4 z-20 flex flex-col space-y-2 pointer-events-auto">
            <button
              onClick={handleZoomIn}
              className="p-2.5 sm:p-2 min-w-[44px] min-h-[44px] sm:min-w-0 sm:min-h-0 bg-slate-900/90 hover:bg-slate-800 text-white rounded-xl border border-slate-700 shadow-lg transition active:scale-95 flex items-center justify-center"
              title="Zoom In (+)"
            >
              <Plus className="w-4 h-4" />
            </button>
            <button
              onClick={handleZoomOut}
              className="p-2.5 sm:p-2 min-w-[44px] min-h-[44px] sm:min-w-0 sm:min-h-0 bg-slate-900/90 hover:bg-slate-800 text-white rounded-xl border border-slate-700 shadow-lg transition active:scale-95 flex items-center justify-center"
              title="Zoom Out (-)"
            >
              <Minus className="w-4 h-4" />
            </button>
            <button
              onClick={handleResetZoom}
              className="p-2.5 sm:p-2 min-w-[44px] min-h-[44px] sm:min-w-0 sm:min-h-0 bg-slate-900/90 hover:bg-slate-800 text-white rounded-xl border border-slate-700 shadow-lg transition active:scale-95 flex items-center justify-center"
              title="Reset USA Overview"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
            <button
              onClick={() => setIsFullscreen(prev => !prev)}
              className="p-2.5 sm:p-2 min-w-[44px] min-h-[44px] sm:min-w-0 sm:min-h-0 bg-slate-900/90 hover:bg-slate-800 text-white rounded-xl border border-slate-700 shadow-lg transition active:scale-95 flex items-center justify-center"
              title={isFullscreen ? "Exit Fullscreen" : "Fullscreen Radar"}
            >
              {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
            </button>
          </div>

          {/* BOTTOM-LEFT LAYER TOGGLES HUD */}
          <div className="absolute bottom-3 left-3 right-3 sm:right-auto z-20 flex overflow-x-auto sm:flex-wrap gap-1.5 text-[10px] pointer-events-auto max-w-full sm:max-w-xl pb-1 scrollbar-none">
            <button
              onClick={() => setShowHighways(p => !p)}
              className={`px-2.5 py-1.5 rounded-xl font-black transition border shadow-md flex items-center space-x-1 shrink-0 min-h-[36px] ${
                showHighways ? 'bg-amber-500 text-slate-950 border-amber-400' : 'bg-slate-900/90 text-zinc-400 border-slate-700 hover:text-white'
              }`}
            >
              <span>🛣️ Interstates</span>
            </button>
            <button
              onClick={() => setShowMegastops(p => !p)}
              className={`px-2.5 py-1.5 rounded-xl font-black transition border shadow-md flex items-center space-x-1 shrink-0 min-h-[36px] ${
                showMegastops ? 'bg-sky-500 text-slate-950 border-sky-400' : 'bg-slate-900/90 text-zinc-400 border-slate-700 hover:text-white'
              }`}
            >
              <Fuel className="w-3 h-3" />
              <span>Megastops</span>
            </button>
            <button
              onClick={() => setShowPasses(p => !p)}
              className={`px-2.5 py-1.5 rounded-xl font-black transition border shadow-md flex items-center space-x-1 shrink-0 min-h-[36px] ${
                showPasses ? 'bg-emerald-500 text-slate-950 border-emerald-400' : 'bg-slate-900/90 text-zinc-400 border-slate-700 hover:text-white'
              }`}
            >
              <Mountain className="w-3 h-3" />
              <span>Mountain Summits</span>
            </button>
            <button
              onClick={() => setShowScales(p => !p)}
              className={`px-2.5 py-1.5 rounded-xl font-black transition border shadow-md flex items-center space-x-1 shrink-0 min-h-[36px] ${
                showScales ? 'bg-indigo-500 text-white border-indigo-400' : 'bg-slate-900/90 text-zinc-400 border-slate-700 hover:text-white'
              }`}
            >
              <Scale className="w-3 h-3" />
              <span>Weigh Stations</span>
            </button>
            <button
              onClick={() => setShowWeather(p => !p)}
              className={`px-2.5 py-1.5 rounded-xl font-black transition border shadow-md flex items-center space-x-1 shrink-0 min-h-[36px] ${
                showWeather ? 'bg-rose-500 text-white border-rose-400' : 'bg-slate-900/90 text-zinc-400 border-slate-700 hover:text-white'
              }`}
            >
              <Wind className="w-3 h-3" />
              <span>Hazards</span>
            </button>
            <button
              onClick={() => setShowRadarSweep(p => !p)}
              className={`px-2.5 py-1.5 rounded-xl font-black transition border shadow-md flex items-center space-x-1 shrink-0 min-h-[36px] ${
                showRadarSweep ? 'bg-emerald-400 text-slate-950 border-emerald-300' : 'bg-slate-900/90 text-zinc-400 border-slate-700 hover:text-white'
              }`}
              title="Toggle sweeping radar beam"
            >
              <Radio className="w-3 h-3" />
              <span>Sweep: {showRadarSweep ? 'ON' : 'OFF'}</span>
            </button>
          </div>

          {/* SVG MAP CANVAS */}
          <div
            className={`w-full ${isFullscreen ? 'h-screen' : 'aspect-16/10 min-h-[480px] sm:min-h-[580px]'} cursor-grab active:cursor-grabbing select-none overflow-hidden flex items-center justify-center relative`}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
          >
            <svg
              viewBox={`0 0 ${MAP_BOUNDS.WIDTH} ${MAP_BOUNDS.HEIGHT}`}
              className="w-full h-full transition-transform duration-100 ease-out"
              style={{
                transform: `scale(${zoomLevel}) translate(${panOffset.x / zoomLevel}px, ${panOffset.y / zoomLevel}px)`
              }}
            >
              <defs>
                {/* Embedded CSS for smooth SVG animations */}
                <style>{`
                  @keyframes radarRotate {
                    from { transform: rotate(0deg); }
                    to { transform: rotate(360deg); }
                  }
                  @keyframes dashFlow {
                    to { stroke-dashoffset: -32; }
                  }
                  @keyframes pulseRing {
                    0% { r: 12; opacity: 0.9; }
                    100% { r: 28; opacity: 0; }
                  }
                  .radar-sweep-beam {
                    transform-origin: 480px 300px;
                    animation: radarRotate 8s linear infinite;
                  }
                  .highway-traffic-pulse {
                    stroke-dasharray: 6, 12;
                    animation: dashFlow 1.8s linear infinite;
                  }
                `}</style>

                {/* Tactical Theme Gradients */}
                <radialGradient id="tacticalOcean" cx="50%" cy="50%" r="75%">
                  <stop offset="0%" stopColor="#0a101f" />
                  <stop offset="100%" stopColor="#030712" />
                </radialGradient>
                <linearGradient id="tacticalLand" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#0f172a" />
                  <stop offset="50%" stopColor="#0d1527" />
                  <stop offset="100%" stopColor="#090e1a" />
                </linearGradient>

                {/* Satellite Topo Gradients */}
                <radialGradient id="satelliteOcean" cx="50%" cy="50%" r="75%">
                  <stop offset="0%" stopColor="#0b2038" />
                  <stop offset="100%" stopColor="#05101d" />
                </radialGradient>
                <linearGradient id="satelliteLand" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#1e2d24" />
                  <stop offset="40%" stopColor="#252c1e" />
                  <stop offset="70%" stopColor="#2c271e" />
                  <stop offset="100%" stopColor="#1a2520" />
                </linearGradient>

                {/* Day Cockpit Gradients */}
                <radialGradient id="dayOcean" cx="50%" cy="50%" r="75%">
                  <stop offset="0%" stopColor="#c7d2fe" />
                  <stop offset="100%" stopColor="#93c5fd" />
                </radialGradient>
                <linearGradient id="dayLand" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#f8fafc" />
                  <stop offset="100%" stopColor="#f1f5f9" />
                </linearGradient>

                {/* Weather Radar Gradients */}
                <radialGradient id="weatherOcean" cx="50%" cy="50%" r="75%">
                  <stop offset="0%" stopColor="#050b14" />
                  <stop offset="100%" stopColor="#020408" />
                </radialGradient>

                {/* Radar Sweep Conical Shading */}
                <linearGradient id="sweepBeamGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#10b981" stopOpacity="0.35" />
                  <stop offset="60%" stopColor="#10b981" stopOpacity="0.08" />
                  <stop offset="100%" stopColor="#10b981" stopOpacity="0" />
                </linearGradient>

                {/* Glow Filter for Highways & Transponders */}
                <filter id="corridorGlow" x="-20%" y="-20%" width="140%" height="140%">
                  <feGaussianBlur stdDeviation="2.5" result="blur" />
                  <feComposite in="SourceGraphic" in2="blur" operator="over" />
                </filter>
                <filter id="beaconGlow" x="-30%" y="-30%" width="160%" height="160%">
                  <feGaussianBlur stdDeviation="3.5" result="blur" />
                  <feComposite in="SourceGraphic" in2="blur" operator="over" />
                </filter>
              </defs>

              {/* 1. MARITIME OCEAN BASE */}
              <rect
                width={MAP_BOUNDS.WIDTH}
                height={MAP_BOUNDS.HEIGHT}
                fill={
                  mapTheme === 'tactical' ? 'url(#tacticalOcean)' :
                  mapTheme === 'satellite' ? 'url(#satelliteOcean)' :
                  mapTheme === 'cockpit' ? 'url(#dayOcean)' :
                  'url(#weatherOcean)'
                }
              />

              {/* Radar Coordinate Grid Rings (Tactical Mode) */}
              {(mapTheme === 'tactical' || mapTheme === 'weather') && (
                <g id="radar-range-rings" opacity="0.18">
                  <circle cx="480" cy="300" r="140" fill="none" stroke="#10b981" strokeWidth="0.75" strokeDasharray="3,6" />
                  <circle cx="480" cy="300" r="280" fill="none" stroke="#10b981" strokeWidth="0.75" strokeDasharray="3,6" />
                  <circle cx="480" cy="300" r="420" fill="none" stroke="#10b981" strokeWidth="0.75" strokeDasharray="3,6" />
                  <line x1="480" y1="20" x2="480" y2="580" stroke="#10b981" strokeWidth="0.75" strokeDasharray="2,8" />
                  <line x1="20" y1="300" x2="940" y2="300" stroke="#10b981" strokeWidth="0.75" strokeDasharray="2,8" />
                </g>
              )}

              {/* 2. USA CONTIGUOUS LANDMASS */}
              <g id="usa-continental-landmass">
                {/* Land Shadow Drop */}
                <path
                  d={usaLandmassPath}
                  fill="none"
                  stroke="#000"
                  strokeWidth="8"
                  opacity="0.35"
                />

                {/* Primary Continental Fill */}
                <path
                  d={usaLandmassPath}
                  fill={
                    mapTheme === 'tactical' ? 'url(#tacticalLand)' :
                    mapTheme === 'satellite' ? 'url(#satelliteLand)' :
                    mapTheme === 'cockpit' ? 'url(#dayLand)' :
                    '#0c1527'
                  }
                  stroke={
                    mapTheme === 'cockpit' ? '#cbd5e1' :
                    mapTheme === 'satellite' ? '#334155' :
                    '#1e293b'
                  }
                  strokeWidth={mapTheme === 'cockpit' ? 1.5 : 2}
                />
              </g>

              {/* 3. SATELLITE TOPO: MOUNTAIN RELIEF SHADING */}
              {(mapTheme === 'satellite' || mapTheme === 'tactical') && (
                <g id="mountain-shading" opacity={mapTheme === 'satellite' ? 0.45 : 0.2}>
                  {MOUNTAIN_RANGES.map(range => {
                    const pathData = generatePathFromPoints(range.points, false);
                    return (
                      <g key={range.name}>
                        <path
                          d={pathData}
                          fill="none"
                          stroke="#78716c"
                          strokeWidth="24"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          opacity="0.25"
                        />
                        <path
                          d={pathData}
                          fill="none"
                          stroke="#a8a29e"
                          strokeWidth="10"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          opacity="0.35"
                        />
                      </g>
                    );
                  })}
                </g>
              )}

              {/* 4. MAJOR RIVER SYSTEMS */}
              <g id="river-systems" opacity={mapTheme === 'cockpit' ? 0.7 : 0.35}>
                {MAJOR_RIVERS.map(river => {
                  const pathData = generatePathFromPoints(river.points, false);
                  return (
                    <path
                      key={river.name}
                      d={pathData}
                      fill="none"
                      stroke={mapTheme === 'cockpit' ? '#60a5fa' : '#0284c7'}
                      strokeWidth="1.6"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  );
                })}
              </g>

              {/* 5. GREAT LAKES CUTOUT WATER BODIES */}
              <g id="great-lakes">
                {GREAT_LAKES.map(lake => {
                  const pathData = generatePathFromPoints(lake.points, true);
                  return (
                    <path
                      key={lake.name}
                      d={pathData}
                      fill={
                        mapTheme === 'cockpit' ? '#93c5fd' :
                        mapTheme === 'satellite' ? '#081729' :
                        '#07101f'
                      }
                      stroke={mapTheme === 'cockpit' ? '#60a5fa' : '#1e293b'}
                      strokeWidth="1"
                    />
                  );
                })}
              </g>

              {/* 6. STATE CENTROID LABELS */}
              {showStateNames && (
                <g id="state-labels" opacity={mapTheme === 'cockpit' ? 0.6 : 0.35}>
                  {US_STATE_CENTROIDS.map(st => {
                    const proj = projectCoords(st.lat, st.lng);
                    return (
                      <text
                        key={st.code}
                        x={proj.x}
                        y={proj.y}
                        fill={mapTheme === 'cockpit' ? '#64748b' : '#475569'}
                        fontSize="9.5"
                        fontWeight="800"
                        textAnchor="middle"
                        pointerEvents="none"
                        letterSpacing="1"
                      >
                        {st.code}
                      </text>
                    );
                  })}
                </g>
              )}

              {/* 7. LIVE WEATHER & WIND HAZARDS OVERLAY */}
              {showWeather && (
                <g id="weather-hazard-zones">
                  {ACTIVE_WEATHER_ZONES.map(hazard => {
                    const proj = projectCoords(hazard.lat, hazard.lng);
                    const isWarning = hazard.severity === 'warning';

                    return (
                      <g
                        key={hazard.id}
                        transform={`translate(${proj.x}, ${proj.y})`}
                        className="cursor-pointer"
                        onMouseEnter={(e) => {
                          const rect = mapContainerRef.current?.getBoundingClientRect();
                          if (rect) {
                            setTooltipPos({ x: e.clientX - rect.left, y: e.clientY - rect.top - 10 });
                          }
                          setHoveredWeather(hazard);
                        }}
                        onMouseLeave={() => setHoveredWeather(null)}
                      >
                        {/* Hazard Radar Pulse Zone */}
                        <circle
                          r={hazard.type === 'severe_storm' ? 38 : 26}
                          fill={isWarning ? '#ef4444' : '#f59e0b'}
                          fillOpacity={mapTheme === 'weather' ? '0.35' : '0.18'}
                          stroke={isWarning ? '#ef4444' : '#f59e0b'}
                          strokeWidth="1.5"
                          strokeDasharray={isWarning ? '4,3' : 'none'}
                        />

                        {/* Storm Center Beacon */}
                        <circle
                          r="4"
                          fill={isWarning ? '#ef4444' : '#f59e0b'}
                          stroke="#ffffff"
                          strokeWidth="1"
                        />

                        {/* Hazard Label */}
                        <text
                          x="0"
                          y="-14"
                          fill={isWarning ? '#fca5a5' : '#fde68a'}
                          fontSize="7.5"
                          fontWeight="900"
                          textAnchor="middle"
                          filter="url(#beaconGlow)"
                        >
                          {hazard.type === 'high_wind' ? '💨 WIND MM250' : 
                           hazard.type === 'blizzard' ? '❄️ DONNER ICE' : 
                           '⛈️ SQUALL LINE'}
                        </text>
                      </g>
                    );
                  })}
                </g>
              )}

              {/* 8. INTERSTATE FREIGHT CORRIDORS */}
              {showHighways && (
                <g id="interstate-corridors">
                  {EXTENDED_INTERSTATE_HIGHWAYS.map(highway => {
                    const pathData = generatePathFromPoints(highway.points, false);
                    const isHighlight = corridorFilter === 'all' || corridorFilter === highway.name;
                    const corridorOpacity = isHighlight ? 1 : 0.15;

                    return (
                      <g key={highway.name} opacity={corridorOpacity}>
                        {/* Underlay glow on dark themes */}
                        {mapTheme !== 'cockpit' && (
                          <path
                            d={pathData}
                            fill="none"
                            stroke={highway.color}
                            strokeWidth="5"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            opacity="0.3"
                            filter="url(#corridorGlow)"
                          />
                        )}

                        {/* Main Interstate Solid Line */}
                        <path
                          d={pathData}
                          fill="none"
                          stroke={highway.color}
                          strokeWidth={isHighlight && corridorFilter !== 'all' ? 3.4 : 2.2}
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />

                        {/* Animated Traffic Convoy Energy Pulse (Dash Flow) */}
                        {showFlowAnimation && isHighlight && (
                          <path
                            d={pathData}
                            fill="none"
                            stroke="#ffffff"
                            strokeWidth="1.6"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            opacity="0.75"
                            className="highway-traffic-pulse"
                          />
                        )}

                        {/* Highway Shield Emblem at Midpoint */}
                        {highway.points.length > 3 && (
                          (() => {
                            const midIdx = Math.floor(highway.points.length / 2);
                            const midPt = highway.points[midIdx];
                            const proj = projectCoords(midPt.lat, midPt.lng);
                            return (
                              <g transform={`translate(${proj.x}, ${proj.y - 12})`} className="pointer-events-none">
                                {/* Authentic Interstate Shield Badge */}
                                <path
                                  d="M -9,-7 L 9,-7 C 9,-7 9,2 0,9 C -9,2 -9,-7 -9,-7 Z"
                                  fill="#1e3a8a"
                                  stroke="#dc2626"
                                  strokeWidth="1.2"
                                />
                                <text
                                  x="0"
                                  y="1"
                                  fill="#ffffff"
                                  fontSize="7"
                                  fontWeight="900"
                                  textAnchor="middle"
                                >
                                  {highway.shield}
                                </text>
                              </g>
                            );
                          })()
                        )}
                      </g>
                    );
                  })}
                </g>
              )}

              {/* 9. ICONIC TRUCKING POIS: MEGASTOPS, PASSES, SCALES */}
              <g id="trucking-pois">
                {TRUCKING_POIS.map(poi => {
                  if (poi.type === 'megastop' || poi.type === 'fuel') {
                    if (!showMegastops) return null;
                  }
                  if (poi.type === 'pass' && !showPasses) return null;
                  if (poi.type === 'scale' && !showScales) return null;

                  const proj = projectCoords(poi.lat, poi.lng);
                  const isPass = poi.type === 'pass';
                  const isScale = poi.type === 'scale';
                  const isMegastop = poi.type === 'megastop';

                  // Badge colors
                  const iconColor = isPass ? '#10b981' : isScale ? '#6366f1' : '#38bdf8';

                  return (
                    <g
                      key={poi.id}
                      transform={`translate(${proj.x}, ${proj.y})`}
                      className="cursor-pointer group"
                      onMouseEnter={(e) => {
                        const rect = mapContainerRef.current?.getBoundingClientRect();
                        if (rect) {
                          setTooltipPos({ x: e.clientX - rect.left, y: e.clientY - rect.top - 10 });
                        }
                        setHoveredPoi(poi);
                      }}
                      onMouseLeave={() => setHoveredPoi(null)}
                    >
                      {/* Pulse halo for passes and scales */}
                      {isPass && (
                        <circle r="8" fill="none" stroke="#10b981" strokeWidth="1" opacity="0.5" />
                      )}

                      {/* POI Diamond or Pin */}
                      <rect
                        x="-5"
                        y="-5"
                        width="10"
                        height="10"
                        rx="2"
                        transform={isPass ? 'rotate(45)' : 'none'}
                        fill="#0f172a"
                        stroke={iconColor}
                        strokeWidth="1.5"
                      />

                      {/* Center dot */}
                      <circle r="2.2" fill={iconColor} />

                      {/* Quick Label on Hover */}
                      <text
                        x="0"
                        y="-8"
                        fill="#f8fafc"
                        fontSize="6.5"
                        fontWeight="800"
                        textAnchor="middle"
                        className="opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"
                      >
                        {poi.name.split('(')[0]}
                      </text>
                    </g>
                  );
                })}
              </g>

              {/* 10. ROTATING PHOSPHOR RADAR SWEEP BEAM */}
              {showRadarSweep && (
                <g className="radar-sweep-beam pointer-events-none">
                  {/* Conical 45-degree beam wedge */}
                  <path
                    d="M 480,300 L 920,160 A 460,460 0 0,1 940,300 Z"
                    fill="url(#sweepBeamGrad)"
                  />
                  {/* Leading sharp phosphor scan line */}
                  <line
                    x1="480"
                    y1="300"
                    x2="940"
                    y2="300"
                    stroke="#10b981"
                    strokeWidth="1.5"
                    opacity="0.8"
                    filter="url(#beaconGlow)"
                  />
                </g>
              )}

              {/* 11. MEMBER RIG TRANSPONDERS (DRIVERS) */}
              <g id="member-driver-transponders">
                {filteredMembers.map(loc => {
                  const proj = projectCoords(loc.lat, loc.lng);
                  const isCurrentUser = loc.driver.id === currentUserProfile.id;
                  const isSelected = selectedLocation?.id === loc.id;

                  // Status halo colors
                  let statusColor = '#10b981'; // rolling green
                  if (loc.status === 'parked') statusColor = '#f59e0b'; // amber
                  if (loc.status === 'loading') statusColor = '#38bdf8'; // sky
                  if (loc.status === 'off_duty') statusColor = '#a855f7'; // purple

                  return (
                    <g
                      key={loc.id}
                      transform={`translate(${proj.x}, ${proj.y})`}
                      onClick={() => {
                        setSelectedLocation(loc);
                        playAirHornSound();
                      }}
                      onMouseEnter={(e) => {
                        const rect = mapContainerRef.current?.getBoundingClientRect();
                        if (rect) {
                          setTooltipPos({ x: e.clientX - rect.left, y: e.clientY - rect.top - 15 });
                        }
                        setHoveredDriver(loc);
                      }}
                      onMouseLeave={() => setHoveredDriver(null)}
                      className="cursor-pointer transition-transform hover:scale-135 group"
                    >
                      {/* Radar pulse for rolling drivers */}
                      {loc.status === 'rolling' && (
                        <circle
                          r={isSelected ? '22' : '16'}
                          fill="none"
                          stroke={statusColor}
                          strokeWidth="2"
                          opacity="0.75"
                          className="animate-ping origin-center"
                        />
                      )}

                      {/* CURRENT USER GOLDEN TARGET LOCK ANIMATION */}
                      {isCurrentUser && targetLock && (
                        <g>
                          <circle r="34" fill="none" stroke="#f59e0b" strokeWidth="2" strokeDasharray="5,3" className="animate-spin origin-center" />
                          <line x1="-40" y1="0" x2="40" y2="0" stroke="#f59e0b" strokeWidth="1.5" />
                          <line x1="0" y1="-40" x2="0" y2="40" stroke="#f59e0b" strokeWidth="1.5" />
                        </g>
                      )}

                      {/* Current user golden beacon shockwave */}
                      {isCurrentUser && (
                        <circle
                          r="24"
                          fill="none"
                          stroke="#f59e0b"
                          strokeWidth="2.5"
                          opacity="0.8"
                          className="animate-ping origin-center"
                        />
                      )}

                      {/* Outer transponder ring */}
                      <circle
                        r={isSelected ? '16' : '13'}
                        fill="#0f172a"
                        stroke={isCurrentUser ? '#f59e0b' : statusColor}
                        strokeWidth={isSelected ? '3.5' : '2'}
                        filter="url(#beaconGlow)"
                      />

                      {/* Driver Avatar clipped inside circle */}
                      <clipPath id={`avatar-clip-${loc.id}`}>
                        <circle r="10" cx="0" cy="0" />
                      </clipPath>

                      <image
                        href={loc.driver.avatarUrl}
                        x="-10"
                        y="-10"
                        width="20"
                        height="20"
                        clipPath={`url(#avatar-clip-${loc.id})`}
                        preserveAspectRatio="xMidYMid slice"
                      />

                      {/* Heading direction arrow badge for rolling drivers */}
                      {loc.status === 'rolling' && (
                        <g transform="translate(10, -10)">
                          <circle r="6" fill="#0f172a" stroke={statusColor} strokeWidth="1.2" />
                          <text
                            x="0"
                            y="2.5"
                            fill="#ffffff"
                            fontSize="6.5"
                            fontWeight="900"
                            textAnchor="middle"
                          >
                            {loc.heading}
                          </text>
                        </g>
                      )}

                      {/* Current User 'YOU' Flag */}
                      {isCurrentUser && (
                        <g transform="translate(0, -19)">
                          <rect
                            x="-16"
                            y="-7"
                            width="32"
                            height="13"
                            rx="3.5"
                            fill="#f59e0b"
                            stroke="#000"
                            strokeWidth="0.75"
                          />
                          <text
                            x="0"
                            y="2.5"
                            fill="#030712"
                            fontSize="7"
                            fontWeight="900"
                            textAnchor="middle"
                          >
                            YOU (20)
                          </text>
                        </g>
                      )}
                    </g>
                  );
                })}
              </g>

              {/* 12. TACTICAL COMPASS ROSE IN CORNER */}
              <g transform="translate(900, 70)" opacity="0.75" className="pointer-events-none">
                <circle r="22" fill="#0f172a" stroke="#334155" strokeWidth="1.5" />
                <polygon points="0,-18 4,-4 0,0 -4,-4" fill="#ef4444" />
                <polygon points="0,18 4,4 0,0 -4,4" fill="#94a3b8" />
                <polygon points="18,0 4,4 0,0 4,-4" fill="#94a3b8" />
                <polygon points="-18,0 -4,4 0,0 -4,-4" fill="#94a3b8" />
                <text x="0" y="-8" fill="#ffffff" fontSize="7" fontWeight="900" textAnchor="middle">N</text>
                <text x="0" y="14" fill="#94a3b8" fontSize="6" fontWeight="800" textAnchor="middle">S</text>
                <text x="13" y="2" fill="#94a3b8" fontSize="6" fontWeight="800" textAnchor="middle">E</text>
                <text x="-13" y="2" fill="#94a3b8" fontSize="6" fontWeight="800" textAnchor="middle">W</text>
                <circle r="3" fill="#f59e0b" />
              </g>
            </svg>

            {/* FLOATING HOVER MICRO-TOOLTIP FOR DRIVER TRANSPONDER */}
            {hoveredDriver && (
              <div 
                className="absolute z-40 bg-slate-900/95 backdrop-blur-md text-white p-3 rounded-2xl border border-amber-400/50 shadow-2xl pointer-events-none text-xs w-64 space-y-1.5 animate-in fade-in"
                style={{
                  left: `${Math.min(tooltipPos.x, (mapContainerRef.current?.clientWidth || 600) - 270)}px`,
                  top: `${Math.max(10, tooltipPos.y - 120)}px`
                }}
              >
                <div className="flex items-center space-x-2">
                  <img
                    src={hoveredDriver.driver.avatarUrl}
                    alt=""
                    className="w-8 h-8 rounded-full object-cover border border-amber-400 shrink-0"
                  />
                  <div className="overflow-hidden">
                    <div className="flex items-center space-x-1">
                      <span className="font-black text-white truncate">
                        {hoveredDriver.driver.displayName}
                      </span>
                      {hoveredDriver.driver.isVerified && (
                        <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                      )}
                    </div>
                    <p className="text-[10px] text-zinc-400 truncate">
                      @{hoveredDriver.driver.username} • {hoveredDriver.driver.carrierName}
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-between text-[11px] pt-1 border-t border-slate-800">
                  <span className="text-amber-400 font-bold">
                    📍 {hoveredDriver.corridor} {hoveredDriver.mileMarker}
                  </span>
                  {getStatusBadge(hoveredDriver.status, hoveredDriver.speedMph)}
                </div>

                <p className="text-[10px] text-zinc-300 italic truncate">
                  "{hoveredDriver.statusNote || 'Cruising freight corridor.'}"
                </p>
              </div>
            )}

            {/* FLOATING HOVER TOOLTIP FOR POIS (MEGASTOPS, PASSES, SCALES) */}
            {hoveredPoi && (
              <div 
                className="absolute z-40 bg-slate-900/95 backdrop-blur-md text-white p-3 rounded-2xl border border-sky-400/50 shadow-2xl pointer-events-none text-xs w-60 space-y-1 animate-in fade-in"
                style={{
                  left: `${Math.min(tooltipPos.x, (mapContainerRef.current?.clientWidth || 600) - 250)}px`,
                  top: `${Math.max(10, tooltipPos.y - 95)}px`
                }}
              >
                <div className="flex items-center justify-between">
                  <span className="font-black text-white text-[11px]">
                    {hoveredPoi.name}
                  </span>
                  <span className="px-1.5 py-0.5 rounded bg-sky-500/20 text-sky-300 text-[9px] font-bold">
                    {hoveredPoi.corridor}
                  </span>
                </div>
                <p className="text-[10px] text-zinc-300 leading-snug">
                  {hoveredPoi.details}
                </p>
                {hoveredPoi.statusText && (
                  <p className="text-[10px] font-bold text-amber-300 pt-1 border-t border-slate-800">
                    {hoveredPoi.statusText}
                  </p>
                )}
              </div>
            )}

            {/* FLOATING HOVER TOOLTIP FOR WEATHER HAZARDS */}
            {hoveredWeather && (
              <div 
                className="absolute z-40 bg-rose-950/95 backdrop-blur-md text-white p-3 rounded-2xl border border-rose-500/50 shadow-2xl pointer-events-none text-xs w-64 space-y-1 animate-in fade-in"
                style={{
                  left: `${Math.min(tooltipPos.x, (mapContainerRef.current?.clientWidth || 600) - 270)}px`,
                  top: `${Math.max(10, tooltipPos.y - 110)}px`
                }}
              >
                <div className="flex items-center space-x-1.5 text-rose-400 font-black text-[11px]">
                  <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
                  <span>{hoveredWeather.name}</span>
                </div>
                <p className="text-[10px] text-zinc-200 leading-snug">
                  {hoveredWeather.advisoryText}
                </p>
                <div className="text-[9px] font-bold text-rose-300 pt-1 border-t border-rose-800/60">
                  Affects: {hoveredWeather.corridor} ({hoveredWeather.state})
                </div>
              </div>
            )}
          </div>

          {/* MAP FOOTER: STATUS LEGEND & HINTS */}
          <div className="bg-slate-900/90 border-t border-slate-800 p-3 px-5 flex flex-wrap items-center justify-between gap-3 text-[11px] text-zinc-300">
            <div className="flex items-center flex-wrap gap-x-4 gap-y-1">
              <span className="font-black text-white">Legend:</span>
              <span className="flex items-center space-x-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
                <span>Rolling</span>
              </span>
              <span className="flex items-center space-x-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-400" />
                <span>Truckstop / Rest</span>
              </span>
              <span className="flex items-center space-x-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-sky-400" />
                <span>Shipper Dock</span>
              </span>
              <span className="flex items-center space-x-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-purple-400" />
                <span>10-Hr Reset</span>
              </span>
              <span className="flex items-center space-x-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500 ring-2 ring-amber-400/40" />
                <span className="text-amber-300 font-bold">Your 20</span>
              </span>
            </div>

            <div className="text-zinc-400 hidden sm:block">
              Left-drag to pan • Scroll or +/- to zoom • Click rig marker for CB contact
            </div>
          </div>
        </div>

        {/* DRIVER RADAR ROSTER LIST (SPLIT VIEW MODE) */}
        {viewMode === 'split' && (
          <div className="lg:col-span-4 space-y-3 max-h-[660px] overflow-y-auto scrollbar-thin pr-1">
            <div className="bg-white rounded-2xl p-4 border border-zinc-100 shadow-sm flex items-center justify-between">
              <h3 className="font-black text-slate-900 text-xs flex items-center space-x-2">
                <Truck className="w-4 h-4 text-amber-500" />
                <span>Highway Transponders ({filteredMembers.length})</span>
              </h3>
              <span className="text-[10px] font-bold text-zinc-400">
                Sorted by corridor
              </span>
            </div>

            {filteredMembers.map(loc => {
              const isCurrentUser = loc.driver.id === currentUserProfile.id;
              const isSelected = selectedLocation?.id === loc.id;

              return (
                <div
                  key={loc.id}
                  onClick={() => {
                    setSelectedLocation(loc);
                    playAirHornSound();
                  }}
                  className={`p-4 rounded-2xl border transition cursor-pointer text-xs space-y-2 ${
                    isSelected
                      ? 'bg-amber-50/70 border-amber-400 shadow-md ring-2 ring-amber-400/20'
                      : 'bg-white hover:bg-zinc-50 border-zinc-100 shadow-xs'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-2.5">
                      <img
                        src={loc.driver.avatarUrl}
                        alt=""
                        className="w-10 h-10 rounded-full object-cover border border-zinc-200 shrink-0"
                      />
                      <div>
                        <div className="flex items-center space-x-1">
                          <span className="font-black text-slate-900 leading-tight">
                            {loc.driver.displayName}
                          </span>
                          {loc.driver.isVerified && (
                            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                          )}
                          {isCurrentUser && (
                            <span className="bg-amber-500 text-slate-950 font-black text-[9px] px-1.5 py-0.2 rounded">
                              YOU
                            </span>
                          )}
                        </div>
                        <span className="text-[11px] text-zinc-500 font-medium block">
                          @{loc.driver.username} • {loc.rigType}
                        </span>
                      </div>
                    </div>

                    <span className="px-2 py-0.5 rounded font-black text-[10px] bg-slate-100 text-slate-800 shrink-0">
                      {loc.corridor}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-[11px] pt-1.5 border-t border-zinc-100">
                    <span className="text-zinc-600 font-medium">
                      📍 {loc.city}, {loc.state} {loc.mileMarker && `(${loc.mileMarker})`}
                    </span>
                    {getStatusBadge(loc.status, loc.speedMph)}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* SELECTED DRIVER DOSSIER FLYOUT CARD */}
      {selectedLocation && (
        <div className="bg-white rounded-3xl p-6 border-2 border-amber-400 shadow-xl animate-in fade-in space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-zinc-100">
            <div className="flex items-center space-x-3.5">
              <img
                src={selectedLocation.driver.avatarUrl}
                alt=""
                className="w-14 h-14 rounded-2xl object-cover border-2 border-amber-400 shadow-md"
              />
              <div>
                <div className="flex items-center space-x-2">
                  <h3 className="text-base font-black text-slate-900">
                    {selectedLocation.driver.displayName}
                  </h3>
                  {selectedLocation.driver.isVerified && (
                    <span className="bg-emerald-100 text-emerald-900 text-[10px] font-black px-2 py-0.5 rounded flex items-center space-x-1">
                      <ShieldCheck className="w-3 h-3 text-emerald-600" />
                      <span>Verified CDL</span>
                    </span>
                  )}
                  {selectedLocation.driver.id === currentUserProfile.id && (
                    <span className="bg-amber-500 text-slate-950 text-[10px] font-black px-2 py-0.5 rounded">
                      YOUR RIG (CURRENT 20)
                    </span>
                  )}
                </div>
                <div className="text-xs text-zinc-500 font-medium flex items-center space-x-2 mt-0.5">
                  <span>@{selectedLocation.driver.username}</span>
                  <span>•</span>
                  <span>{selectedLocation.driver.carrierName}</span>
                  <span>•</span>
                  <span>{selectedLocation.driver.yearsExperience} yrs on asphalt</span>
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-2 shrink-0">
              {getStatusBadge(selectedLocation.status, selectedLocation.speedMph)}
              <button
                onClick={() => setSelectedLocation(null)}
                className="p-2 rounded-full hover:bg-zinc-100 text-zinc-400 hover:text-zinc-700 transition"
                title="Close Dossier"
              >
                ✕
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
            <div className="p-4 rounded-2xl bg-zinc-50 border border-zinc-100 space-y-1">
              <span className="font-bold text-zinc-400 uppercase text-[10px] tracking-wider block">
                Current Position & Heading
              </span>
              <p className="font-black text-slate-900 text-sm">
                {selectedLocation.city}, {selectedLocation.state}
              </p>
              <p className="text-[11px] text-zinc-600">
                {selectedLocation.corridor} {selectedLocation.mileMarker} • Heading {selectedLocation.heading}
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-zinc-50 border border-zinc-100 space-y-1">
              <span className="font-bold text-zinc-400 uppercase text-[10px] tracking-wider block">
                Tractor & Freight Lane
              </span>
              <p className="font-black text-slate-900 text-sm">
                {selectedLocation.rigType}
              </p>
              <p className="text-[11px] text-zinc-600">
                En route to: {selectedLocation.destinationCity}
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-zinc-50 border border-zinc-100 space-y-1">
              <span className="font-bold text-zinc-400 uppercase text-[10px] tracking-wider block">
                Driver Status Broadcast
              </span>
              <p className="font-medium text-slate-800 italic">
                "{selectedLocation.statusNote || 'Cruising freight corridor.'}"
              </p>
              <p className="text-[10px] text-zinc-400">
                Last GPS ping: {selectedLocation.lastUpdated}
              </p>
            </div>
          </div>

          {/* ACTION BUTTONS */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-zinc-100">
            <div className="flex items-center space-x-2">
              <button
                id="btn-sound-horn-ping"
                onClick={() => {
                  playAirHornSound();
                  showToast(`📯 10-4 Horn Ping sounded to @${selectedLocation.driver.username}!`);
                }}
                className="px-4 py-2.5 bg-amber-50 hover:bg-amber-100 text-amber-950 font-black text-xs rounded-xl border border-amber-300 flex items-center space-x-1.5 transition active:scale-95 shadow-xs"
              >
                <Radio className="w-4 h-4 text-amber-600" />
                <span>Send 10-4 Horn Ping</span>
              </button>

              <button
                id="btn-open-cb-chat"
                onClick={() => {
                  onOpenDirectMessage?.(selectedLocation.driver);
                }}
                className="px-4 py-2.5 bg-sky-50 hover:bg-sky-100 text-sky-950 font-black text-xs rounded-xl border border-sky-300 flex items-center space-x-1.5 transition active:scale-95 shadow-xs"
              >
                <MessageSquare className="w-4 h-4 text-sky-600" />
                <span>Open CB Direct Chat</span>
              </button>
            </div>

            <button
              onClick={() => {
                onViewProfile?.(selectedLocation.driver);
              }}
              className="px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-black text-xs rounded-xl flex items-center space-x-1.5 transition shadow-sm active:scale-95"
            >
              <User className="w-4 h-4 text-amber-400" />
              <span>Inspect Full CDL Profile</span>
            </button>
          </div>
        </div>
      )}

      {/* QUICK 'UPDATE MY 20' DRAWER (FOR CURRENT DRIVER) */}
      <div className="bg-white rounded-3xl p-6 border border-zinc-100 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <Navigation className="w-5 h-5 text-amber-500" />
            <h3 className="font-black text-slate-900 text-sm">
              Update Your 20 & Freight Corridor Status
            </h3>
          </div>
          <span className="text-xs text-zinc-400">
            Willie "Overdrive" Nelson • Nashville, TN
          </span>
        </div>

        <form onSubmit={handleUpdateMy20} className="grid grid-cols-1 sm:grid-cols-4 gap-3 text-xs">
          <div>
            <label className="font-bold text-slate-700 block mb-1">Status</label>
            <select
              value={userStatus}
              onChange={e => setUserStatus(e.target.value as any)}
              className="w-full p-2.5 bg-zinc-50 border border-zinc-200 rounded-xl font-bold text-slate-800 focus:ring-2 focus:ring-amber-500 focus:outline-none"
            >
              <option value="rolling">🟢 Rolling (Active on Highway)</option>
              <option value="parked">🟡 Parked (Truck Stop / Rest Area)</option>
              <option value="loading">🔵 Loading / Unloading at Dock</option>
              <option value="off_duty">🟣 10-Hour Reset / Off Duty</option>
            </select>
          </div>

          <div>
            <label className="font-bold text-slate-700 block mb-1">Cruising Speed (MPH)</label>
            <input
              type="number"
              min="0"
              max="85"
              value={userSpeed}
              onChange={e => setUserSpeed(parseInt(e.target.value) || 0)}
              className="w-full p-2.5 bg-zinc-50 border border-zinc-200 rounded-xl font-bold text-slate-800 focus:ring-2 focus:ring-amber-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="font-bold text-slate-700 block mb-1">Current Corridor</label>
            <select
              value={userCorridor}
              onChange={e => setUserCorridor(e.target.value)}
              className="w-full p-2.5 bg-zinc-50 border border-zinc-200 rounded-xl font-bold text-slate-800 focus:ring-2 focus:ring-amber-500 focus:outline-none"
            >
              <option value="I-40">I-40 Sunbelt</option>
              <option value="I-80">I-80 Transcon</option>
              <option value="I-10">I-10 Southern Pass</option>
              <option value="I-95">I-95 Eastern Spine</option>
              <option value="I-5">I-5 West Coast</option>
              <option value="I-70">I-70 Heartland</option>
              <option value="I-35">I-35 NAFTA</option>
              <option value="I-75">I-75 Midwest/FL</option>
              <option value="I-90">I-90 Northern Tier</option>
            </select>
          </div>

          <div className="sm:col-span-4 flex flex-col sm:flex-row gap-2 pt-1">
            <input
              type="text"
              placeholder="Broadcast note e.g. Cruising steady with coils, pavement dry..."
              value={userStatusNote}
              onChange={e => setUserStatusNote(e.target.value)}
              className="flex-1 p-2.5 bg-zinc-50 border border-zinc-200 rounded-xl font-medium focus:ring-2 focus:ring-amber-500 focus:outline-none"
            />
            <button
              type="submit"
              className="px-5 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black rounded-xl shadow-md transition shrink-0 active:scale-95"
            >
              Broadcast My 20
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
