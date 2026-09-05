import React, { useState, useEffect } from 'react';
import { 
  PitstopLocation, 
  PitstopReview, 
  PitstopCategory, 
  Profile 
} from '../../types';
import { 
  samplePitstopLocations, 
  samplePitstopReviews, 
  currentUserProfile 
} from '../../data';
import { 
  Star, 
  MapPin, 
  Plus, 
  Search, 
  Filter, 
  Truck, 
  Fuel, 
  Utensils, 
  Wrench, 
  ShieldCheck, 
  ThumbsUp, 
  Video, 
  Camera, 
  X, 
  Check, 
  Compass, 
  Phone, 
  Clock, 
  Wifi, 
  Sparkles, 
  ChevronRight, 
  ExternalLink,
  SlidersHorizontal,
  ShowerHead,
  Scale,
  Award,
  Upload
} from 'lucide-react';

interface PitstopYelpSectionProps {
  onViewProfile?: (profile: Profile) => void;
}

const CATEGORY_CONFIG: Record<PitstopCategory, { label: string; icon: React.ReactNode; color: string; badgeColor: string }> = {
  truck_stop: {
    label: 'Truck Stops',
    icon: <Truck className="w-4 h-4" />,
    color: 'text-amber-400',
    badgeColor: 'bg-amber-500/10 text-amber-400 border-amber-500/30'
  },
  fuel_station: {
    label: 'Gas & Diesel Plazas',
    icon: <Fuel className="w-4 h-4" />,
    color: 'text-sky-400',
    badgeColor: 'bg-sky-500/10 text-sky-400 border-sky-500/30'
  },
  food_dining: {
    label: 'Food & Diners',
    icon: <Utensils className="w-4 h-4" />,
    color: 'text-rose-400',
    badgeColor: 'bg-rose-500/10 text-rose-400 border-rose-500/30'
  },
  repair_tire: {
    label: 'Repair & Tires',
    icon: <Wrench className="w-4 h-4" />,
    color: 'text-emerald-400',
    badgeColor: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
  },
  overnight_parking: {
    label: 'Overnight Staging',
    icon: <Compass className="w-4 h-4" />,
    color: 'text-purple-400',
    badgeColor: 'bg-purple-500/10 text-purple-400 border-purple-500/30'
  },
  driver_amenity: {
    label: 'Driver Amenities',
    icon: <Sparkles className="w-4 h-4" />,
    color: 'text-indigo-400',
    badgeColor: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/30'
  }
};

const CORRIDORS = ['All Corridors', 'I-80', 'I-40', 'I-10', 'I-95', 'I-70', 'I-5', 'I-35', 'I-15', 'I-75'];

export default function PitstopYelpSection({ onViewProfile }: PitstopYelpSectionProps = {}) {
  const [locations, setLocations] = useState<PitstopLocation[]>([]);
  const [reviews, setReviews] = useState<PitstopReview[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedCorridor, setSelectedCorridor] = useState<string>('All Corridors');
  const [searchQuery, setSearchQuery] = useState('');
  const [minRating, setMinRating] = useState<number>(0);
  const [requireShowers, setRequireShowers] = useState(false);
  const [requireCatScale, setRequireCatScale] = useState(false);
  const [requireDef, setRequireDef] = useState(false);

  // Active Selected Location Modal/Drawer
  const [selectedLocation, setSelectedLocation] = useState<PitstopLocation | null>(null);

  // New Location Modal State
  const [isNewLocationModalOpen, setIsNewLocationModalOpen] = useState(false);
  const [newLocName, setNewLocName] = useState('');
  const [newLocCategory, setNewLocCategory] = useState<PitstopCategory>('truck_stop');
  const [newLocBrand, setNewLocBrand] = useState('');
  const [newLocCorridor, setNewLocCorridor] = useState('I-80');
  const [newLocExit, setNewLocExit] = useState('');
  const [newLocCity, setNewLocCity] = useState('');
  const [newLocState, setNewLocState] = useState('');
  const [newLocAddress, setNewLocAddress] = useState('');
  const [newLocPhone, setNewLocPhone] = useState('');
  const [newLocHours, setNewLocHours] = useState('24/7 Open');
  const [newLocParking, setNewLocParking] = useState(120);
  const [newLocHasShowers, setNewLocHasShowers] = useState(true);
  const [newLocShowerCount, setNewLocShowerCount] = useState(12);
  const [newLocHasDef, setNewLocHasDef] = useState(true);
  const [newLocHasScale, setNewLocHasScale] = useState(true);
  const [newLocHasRepair, setNewLocHasRepair] = useState(false);
  const [newLocFoodOptions, setNewLocFoodOptions] = useState('');
  const [newLocPhotoUrl, setNewLocPhotoUrl] = useState('');
  const [newLocInitialReview, setNewLocInitialReview] = useState('');
  const [newLocInitialRating, setNewLocInitialRating] = useState(5);

  // New Review Modal State
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [reviewLocation, setReviewLocation] = useState<PitstopLocation | null>(null);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewCleanliness, setReviewCleanliness] = useState(5);
  const [reviewParking, setReviewParking] = useState(5);
  const [reviewFood, setReviewFood] = useState(5);
  const [reviewService, setReviewService] = useState(5);
  const [reviewText, setReviewText] = useState('');
  const [reviewMediaType, setReviewMediaType] = useState<'none' | 'image' | 'video'>('none');
  const [reviewMediaUrl, setReviewMediaUrl] = useState('');
  const [reviewMediaCaption, setReviewMediaCaption] = useState('');
  const [confirmedAmenities, setConfirmedAmenities] = useState<string[]>(['Showers Clean', 'DEF at Pump']);

  // Media Lightbox
  const [lightboxMedia, setLightboxMedia] = useState<{ url: string; type: 'image' | 'video'; caption?: string } | null>(null);

  // Review Filter within modal
  const [reviewFilterMode, setReviewFilterMode] = useState<'all' | 'media' | '5star'>('all');

  // Load from local storage or default sample data
  useEffect(() => {
    const cachedLocs = localStorage.getItem('trucker_pitstop_locations');
    if (cachedLocs) {
      setLocations(JSON.parse(cachedLocs));
    } else {
      setLocations(samplePitstopLocations);
      localStorage.setItem('trucker_pitstop_locations', JSON.stringify(samplePitstopLocations));
    }

    const cachedRevs = localStorage.getItem('trucker_pitstop_reviews');
    if (cachedRevs) {
      setReviews(JSON.parse(cachedRevs));
    } else {
      setReviews(samplePitstopReviews);
      localStorage.setItem('trucker_pitstop_reviews', JSON.stringify(samplePitstopReviews));
    }
  }, []);

  const saveLocations = (newLocs: PitstopLocation[]) => {
    setLocations(newLocs);
    localStorage.setItem('trucker_pitstop_locations', JSON.stringify(newLocs));
  };

  const saveReviews = (newRevs: PitstopReview[]) => {
    setReviews(newRevs);
    localStorage.setItem('trucker_pitstop_reviews', JSON.stringify(newRevs));
  };

  // Upvote a review
  const handleToggleHelpful = (reviewId: string) => {
    const updated = reviews.map(r => {
      if (r.id === reviewId) {
        const hasVoted = r.helpfulUsers.includes(currentUserProfile.id);
        const newHelpfulUsers = hasVoted
          ? r.helpfulUsers.filter(id => id !== currentUserProfile.id)
          : [...r.helpfulUsers, currentUserProfile.id];
        return {
          ...r,
          helpfulCount: newHelpfulUsers.length,
          helpfulUsers: newHelpfulUsers
        };
      }
      return r;
    });
    saveReviews(updated);
  };

  // Submit New Review
  const handleSubmitReview = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reviewLocation || !reviewText.trim()) return;

    const newRev: PitstopReview = {
      id: `rev-${Date.now()}`,
      locationId: reviewLocation.id,
      author: currentUserProfile,
      rating: reviewRating,
      cleanlinessRating: reviewCleanliness,
      parkingRating: reviewParking,
      foodRating: reviewFood,
      serviceRating: reviewService,
      reviewText: reviewText.trim(),
      mediaUrl: reviewMediaType !== 'none' ? (reviewMediaUrl.trim() || undefined) : undefined,
      mediaType: reviewMediaType !== 'none' ? reviewMediaType : undefined,
      mediaCaption: reviewMediaCaption.trim() || undefined,
      amenitiesConfirmed: confirmedAmenities,
      visitedAt: new Date().toISOString().split('T')[0],
      createdAt: new Date().toISOString(),
      helpfulCount: 0,
      helpfulUsers: []
    };

    const updatedReviews = [newRev, ...reviews];
    saveReviews(updatedReviews);

    // Recalculate average rating for this location
    const locReviews = updatedReviews.filter(r => r.locationId === reviewLocation.id);
    const avgRating = Number((locReviews.reduce((sum, r) => sum + r.rating, 0) / locReviews.length).toFixed(1));

    const updatedLocations = locations.map(loc => {
      if (loc.id === reviewLocation.id) {
        return {
          ...loc,
          overallRating: avgRating,
          reviewCount: locReviews.length
        };
      }
      return loc;
    });
    saveLocations(updatedLocations);

    // Update selected location reference
    const updatedSelected = updatedLocations.find(l => l.id === reviewLocation.id);
    if (updatedSelected) setSelectedLocation(updatedSelected);

    // Reset review form
    setIsReviewModalOpen(false);
    setReviewText('');
    setReviewMediaUrl('');
    setReviewMediaCaption('');
    setReviewMediaType('none');
  };

  // Submit New Location
  const handleCreateLocation = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newLocName.trim() || !newLocCity.trim() || !newLocState.trim()) return;

    const newLocId = `pit-${Date.now()}`;
    const parsedFood = newLocFoodOptions
      .split(',')
      .map(s => s.trim())
      .filter(Boolean);

    const newLocation: PitstopLocation = {
      id: newLocId,
      name: newLocName.trim(),
      category: newLocCategory,
      brand: newLocBrand.trim() || 'Independent',
      address: newLocAddress.trim() || `${newLocCorridor} ${newLocExit ? newLocExit : 'Corridor'}`,
      city: newLocCity.trim(),
      state: newLocState.trim().toUpperCase(),
      corridor: newLocCorridor,
      exitNumber: newLocExit.trim() || undefined,
      phone: newLocPhone.trim() || undefined,
      hours: newLocHours.trim() || '24/7 Open',
      photoUrl: newLocPhotoUrl.trim() || 'https://images.unsplash.com/photo-1594897030264-ab7d87efc473?auto=format&fit=crop&q=80&w=800',
      semiParkingSpots: Number(newLocParking) || 50,
      hasDefAtPump: newLocHasDef,
      hasShowers: newLocHasShowers,
      showerCount: newLocHasShowers ? Number(newLocShowerCount) || 8 : 0,
      hasCatScale: newLocHasScale,
      hasRepairShop: newLocHasRepair,
      hasLaundry: true,
      hasWifi: true,
      hasFoodCourt: parsedFood.length > 0,
      foodOptions: parsedFood.length > 0 ? parsedFood : ['Driver Grill & Quick Mart'],
      overallRating: newLocInitialRating,
      reviewCount: newLocInitialReview.trim() ? 1 : 0,
      addedBy: currentUserProfile,
      createdAt: new Date().toISOString()
    };

    const updatedLocations = [newLocation, ...locations];
    saveLocations(updatedLocations);

    // If initial review was provided, add it
    if (newLocInitialReview.trim()) {
      const initialRev: PitstopReview = {
        id: `rev-${Date.now()}`,
        locationId: newLocId,
        author: currentUserProfile,
        rating: newLocInitialRating,
        cleanlinessRating: newLocInitialRating,
        parkingRating: 5,
        foodRating: 4,
        serviceRating: 5,
        reviewText: newLocInitialReview.trim(),
        amenitiesConfirmed: ['Showers Clean', 'DEF at Pump', 'High Clearance'],
        visitedAt: new Date().toISOString().split('T')[0],
        createdAt: new Date().toISOString(),
        helpfulCount: 1,
        helpfulUsers: [currentUserProfile.id]
      };
      saveReviews([initialRev, ...reviews]);
    }

    setIsNewLocationModalOpen(false);
    setSelectedLocation(newLocation);
    // Reset form
    setNewLocName('');
    setNewLocCity('');
    setNewLocState('');
    setNewLocExit('');
    setNewLocAddress('');
    setNewLocPhone('');
    setNewLocPhotoUrl('');
    setNewLocInitialReview('');
  };

  // Preset photo selection for easy addition
  const presetPhotos = [
    { label: 'Truck Plaza Fuel Island', url: 'https://images.unsplash.com/photo-1594897030264-ab7d87efc473?auto=format&fit=crop&q=80&w=800' },
    { label: 'Semi Staging & Sunset', url: 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&q=80&w=800' },
    { label: 'Highway Diner & Smokehouse', url: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&q=80&w=800' },
    { label: 'Diesel Service Bay', url: 'https://images.unsplash.com/photo-1486006920555-c77dce18193b?auto=format&fit=crop&q=80&w=800' }
  ];

  // Filtered list
  const filteredLocations = locations.filter(loc => {
    if (selectedCategory !== 'all' && loc.category !== selectedCategory) return false;
    if (selectedCorridor !== 'All Corridors' && loc.corridor !== selectedCorridor) return false;
    if (minRating > 0 && loc.overallRating < minRating) return false;
    if (requireShowers && !loc.hasShowers) return false;
    if (requireCatScale && !loc.hasCatScale) return false;
    if (requireDef && !loc.hasDefAtPump) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchName = loc.name.toLowerCase().includes(q);
      const matchCity = loc.city.toLowerCase().includes(q);
      const matchState = loc.state.toLowerCase().includes(q);
      const matchBrand = (loc.brand || '').toLowerCase().includes(q);
      const matchCorridor = loc.corridor.toLowerCase().includes(q);
      const matchFood = loc.foodOptions.some(f => f.toLowerCase().includes(q));
      if (!matchName && !matchCity && !matchState && !matchBrand && !matchCorridor && !matchFood) return false;
    }
    return true;
  });

  return (
    <div className="space-y-6" id="pitstops-yelp-section">
      {/* SECTION HEADER & POST LOCATION BANNER */}
      <div className="bg-gradient-to-br from-slate-900 via-slate-900 to-slate-950 p-6 sm:p-7 rounded-3xl border border-slate-800 shadow-xl relative overflow-hidden">
        <div className="absolute -right-12 -top-12 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-5">
          <div className="space-y-1.5 max-w-2xl">
            <div className="flex items-center space-x-2">
              <span className="bg-amber-500 text-slate-950 text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md flex items-center space-x-1">
                <Star className="w-3 h-3 fill-slate-950" />
                <span>TRUCKER YELP</span>
              </span>
              <span className="text-zinc-500 text-xs">•</span>
              <span className="text-xs font-bold text-amber-400">Crowdsourced Driver Pitstops & Ratings</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              Highway Pitstop Reviews & Fuel Radar
            </h2>
            <p className="text-xs sm:text-sm text-zinc-300 font-medium leading-relaxed">
              Real reviews, photo walkarounds, and video tours from verified CDL drivers. Check semi parking spot capacity, shower cleanliness, DEF availability, and prime rib diners along your corridor.
            </p>
          </div>

          <div className="flex items-center space-x-3 shrink-0">
            <button
              onClick={() => setIsNewLocationModalOpen(true)}
              className="flex items-center space-x-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black text-xs uppercase tracking-wider px-4 py-3 rounded-2xl shadow-lg transition-all active:scale-95"
              id="btn-post-new-location"
            >
              <Plus className="w-4 h-4 stroke-[3]" />
              <span>Post New Location</span>
            </button>
          </div>
        </div>

        {/* SEARCH & FILTERS ROW */}
        <div className="mt-6 pt-5 border-t border-slate-800/80 grid grid-cols-1 md:grid-cols-12 gap-3 relative z-10">
          <div className="md:col-span-5 relative">
            <Search className="w-4 h-4 text-zinc-400 absolute left-3.5 top-3" />
            <input
              type="text"
              placeholder="Search truck stops, BBQ diners, Loves, Pilot, city, corridor..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full bg-slate-950/80 border border-slate-700/90 rounded-2xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-amber-400"
              id="input-pitstop-search"
            />
            {searchQuery && (
              <button 
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-3 text-zinc-500 hover:text-white"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          <div className="md:col-span-4 flex space-x-2">
            <select
              value={selectedCorridor}
              onChange={e => setSelectedCorridor(e.target.value)}
              className="flex-1 bg-slate-950/80 border border-slate-700/90 rounded-2xl px-3 py-2.5 text-xs text-zinc-200 font-bold focus:outline-none focus:border-amber-400"
            >
              {CORRIDORS.map(cor => (
                <option key={cor} value={cor}>{cor}</option>
              ))}
            </select>

            <select
              value={minRating}
              onChange={e => setMinRating(Number(e.target.value))}
              className="bg-slate-950/80 border border-slate-700/90 rounded-2xl px-3 py-2.5 text-xs text-zinc-200 font-bold focus:outline-none focus:border-amber-400"
            >
              <option value={0}>Any Stars</option>
              <option value={4.5}>4.5+ Stars</option>
              <option value={4.0}>4.0+ Stars</option>
              <option value={3.5}>3.5+ Stars</option>
            </select>
          </div>

          <div className="md:col-span-3 flex items-center justify-between sm:justify-end space-x-2 text-[11px] font-bold text-zinc-300">
            <button
              onClick={() => setRequireShowers(!requireShowers)}
              className={`px-3 py-2 rounded-xl border text-xs font-bold transition-all flex items-center space-x-1.5 ${
                requireShowers ? 'bg-amber-500 text-slate-950 border-amber-400 shadow' : 'bg-slate-950/80 border-slate-800 text-zinc-400 hover:text-white'
              }`}
            >
              <ShowerHead className="w-3.5 h-3.5" />
              <span>Showers</span>
            </button>
            <button
              onClick={() => setRequireCatScale(!requireCatScale)}
              className={`px-3 py-2 rounded-xl border text-xs font-bold transition-all flex items-center space-x-1.5 ${
                requireCatScale ? 'bg-amber-500 text-slate-950 border-amber-400 shadow' : 'bg-slate-950/80 border-slate-800 text-zinc-400 hover:text-white'
              }`}
            >
              <Scale className="w-3.5 h-3.5" />
              <span>CAT Scale</span>
            </button>
            <button
              onClick={() => setRequireDef(!requireDef)}
              className={`px-3 py-2 rounded-xl border text-xs font-bold transition-all flex items-center space-x-1.5 ${
                requireDef ? 'bg-amber-500 text-slate-950 border-amber-400 shadow' : 'bg-slate-950/80 border-slate-800 text-zinc-400 hover:text-white'
              }`}
            >
              <Fuel className="w-3.5 h-3.5" />
              <span>DEF</span>
            </button>
          </div>
        </div>

        {/* CATEGORY PILL TABS */}
        <div className="mt-4 flex items-center space-x-2 overflow-x-auto pb-1 relative z-10 scrollbar-none">
          <button
            onClick={() => setSelectedCategory('all')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap border ${
              selectedCategory === 'all'
                ? 'bg-amber-500 text-slate-950 border-amber-400 shadow-md font-black'
                : 'bg-slate-950/80 text-zinc-400 hover:text-white border-slate-800'
            }`}
          >
            All Pitstops ({locations.length})
          </button>
          {(Object.keys(CATEGORY_CONFIG) as PitstopCategory[]).map(catKey => {
            const config = CATEGORY_CONFIG[catKey];
            const count = locations.filter(l => l.category === catKey).length;
            return (
              <button
                key={catKey}
                onClick={() => setSelectedCategory(catKey)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap border flex items-center space-x-1.5 ${
                  selectedCategory === catKey
                    ? 'bg-amber-500 text-slate-950 border-amber-400 shadow-md font-black'
                    : 'bg-slate-950/80 text-zinc-300 hover:text-white border-slate-800'
                }`}
              >
                {config.icon}
                <span>{config.label}</span>
                <span className={`text-[10px] px-1 rounded ${selectedCategory === catKey ? 'bg-slate-950/20 text-slate-950' : 'bg-slate-800 text-zinc-400'}`}>
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* LOCATIONS GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" id="pitstops-locations-grid">
        {filteredLocations.length === 0 ? (
          <div className="col-span-full py-16 text-center space-y-3 bg-white rounded-3xl border border-slate-200/80 p-8 shadow-sm">
            <Compass className="w-12 h-12 text-zinc-300 mx-auto animate-pulse" />
            <h3 className="text-base font-bold text-slate-800">No Pitstops Found</h3>
            <p className="text-xs text-zinc-500 max-w-md mx-auto">
              We couldn't find locations matching your search or filters. Be the first trucker to post a location on this corridor!
            </p>
            <button
              onClick={() => setIsNewLocationModalOpen(true)}
              className="mt-2 bg-amber-500 text-slate-950 font-black text-xs px-4 py-2 rounded-xl shadow"
            >
              Post New Location
            </button>
          </div>
        ) : (
          filteredLocations.map(loc => {
            const catConfig = CATEGORY_CONFIG[loc.category];
            const locReviews = reviews.filter(r => r.locationId === loc.id);
            const reviewsWithMedia = locReviews.filter(r => !!r.mediaUrl);

            return (
              <div
                key={loc.id}
                onClick={() => setSelectedLocation(loc)}
                className="bg-white rounded-3xl border border-slate-200/90 shadow-sm hover:shadow-xl hover:border-amber-400/80 transition-all cursor-pointer group flex flex-col overflow-hidden"
                id={`pitstop-card-${loc.id}`}
              >
                {/* Image Cover */}
                <div className="relative h-48 w-full overflow-hidden bg-slate-900">
                  <img
                    src={loc.photoUrl}
                    alt={loc.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-black/30" />

                  {/* Top Badges */}
                  <div className="absolute top-3 left-3 right-3 flex items-center justify-between">
                    <span className={`text-[10px] font-black uppercase px-2.5 py-1 rounded-full border backdrop-blur-md shadow-md flex items-center space-x-1 ${catConfig.badgeColor}`}>
                      {catConfig.icon}
                      <span>{catConfig.label}</span>
                    </span>

                    <span className="bg-slate-950/80 backdrop-blur-md text-amber-400 border border-slate-700/80 text-xs font-black px-2.5 py-1 rounded-xl flex items-center space-x-1 shadow">
                      <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                      <span>{loc.overallRating}</span>
                      <span className="text-[10px] text-zinc-400 font-medium">({loc.reviewCount})</span>
                    </span>
                  </div>

                  {/* Bottom Image Stats */}
                  <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-white text-xs">
                    <div className="flex items-center space-x-1 font-bold text-[11px] text-zinc-200">
                      <MapPin className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                      <span className="truncate">{loc.city}, {loc.state}</span>
                      <span className="text-zinc-400">•</span>
                      <span className="text-amber-400 font-extrabold">{loc.corridor}</span>
                      {loc.exitNumber && <span className="text-zinc-300 text-[10px]">({loc.exitNumber})</span>}
                    </div>

                    {reviewsWithMedia.length > 0 && (
                      <span className="bg-slate-900/90 text-[10px] font-bold px-2 py-0.5 rounded-md text-zinc-200 flex items-center space-x-1">
                        <Camera className="w-3 h-3 text-sky-400" />
                        <span>{reviewsWithMedia.length} Media</span>
                      </span>
                    )}
                  </div>
                </div>

                {/* Card Content */}
                <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                  <div className="space-y-2">
                    <h3 className="text-base font-black text-slate-900 group-hover:text-amber-600 transition-colors leading-tight">
                      {loc.name}
                    </h3>
                    <p className="text-[11px] text-zinc-500 font-medium line-clamp-1">
                      {loc.address}
                    </p>

                    {/* Semi Specs Checklist */}
                    <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-100 text-[11px]">
                      <div className="flex items-center space-x-1.5 font-bold text-slate-700">
                        <Truck className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                        <span>{loc.semiParkingSpots}+ Semi Spots</span>
                      </div>
                      <div className="flex items-center space-x-1.5 font-bold text-slate-700">
                        <ShowerHead className="w-3.5 h-3.5 text-sky-500 shrink-0" />
                        <span>{loc.hasShowers ? `${loc.showerCount || 'Hot'} Showers` : 'No Showers'}</span>
                      </div>
                      <div className="flex items-center space-x-1.5 font-bold text-slate-700">
                        <Fuel className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                        <span>{loc.hasDefAtPump ? 'Bulk DEF Pump' : 'No DEF'}</span>
                      </div>
                      <div className="flex items-center space-x-1.5 font-bold text-slate-700">
                        <Scale className="w-3.5 h-3.5 text-purple-500 shrink-0" />
                        <span>{loc.hasCatScale ? 'CAT Scale On-Site' : 'No Scale'}</span>
                      </div>
                    </div>

                    {/* Food options chips */}
                    {loc.foodOptions && loc.foodOptions.length > 0 && (
                      <div className="pt-2 flex flex-wrap gap-1">
                        {loc.foodOptions.slice(0, 3).map((food, idx) => (
                          <span key={idx} className="bg-slate-100 text-slate-700 text-[10px] font-bold px-2 py-0.5 rounded-md">
                            {food}
                          </span>
                        ))}
                        {loc.foodOptions.length > 3 && (
                          <span className="text-[10px] font-bold text-zinc-400 self-center">
                            +{loc.foodOptions.length - 3} more
                          </span>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Latest CDL Review snippet */}
                  {locReviews[0] && (
                    <div className="bg-slate-50 p-2.5 rounded-2xl border border-slate-100 space-y-1">
                      <div className="flex items-center justify-between text-[10px]">
                        <span className="font-bold text-slate-800 truncate">{locReviews[0].author.displayName}</span>
                        <div className="flex text-amber-500">
                          {Array.from({ length: locReviews[0].rating }).map((_, i) => (
                            <Star key={i} className="w-2.5 h-2.5 fill-amber-500" />
                          ))}
                        </div>
                      </div>
                      <p className="text-[11px] text-zinc-600 line-clamp-2 italic">
                        "{locReviews[0].reviewText}"
                      </p>
                    </div>
                  )}

                  {/* Action Bar */}
                  <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                    <span className="text-[11px] font-bold text-zinc-400">
                      Hours: <strong className="text-slate-800">{loc.hours}</strong>
                    </span>

                    <span className="font-black text-amber-600 group-hover:translate-x-0.5 transition-transform flex items-center space-x-1">
                      <span>View & Review</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </span>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* SELECTED LOCATION DETAIL MODAL / REVIEWS DRAWER */}
      {selectedLocation && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 overflow-y-auto animate-in fade-in duration-200">
          <div className="bg-white text-slate-900 w-full max-w-4xl max-h-[92vh] rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col">
            {/* Modal Header Bar */}
            <div className="relative h-64 sm:h-72 w-full bg-slate-900 shrink-0">
              <img
                src={selectedLocation.photoUrl}
                alt={selectedLocation.name}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/50 to-transparent" />

              <button
                onClick={() => setSelectedLocation(null)}
                className="absolute top-4 right-4 p-2 bg-slate-950/70 hover:bg-slate-900 text-white rounded-full transition shadow"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="absolute bottom-5 left-5 right-5 text-white space-y-2">
                <div className="flex flex-wrap items-center gap-2">
                  <span className={`text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full border backdrop-blur-md ${CATEGORY_CONFIG[selectedLocation.category].badgeColor}`}>
                    {CATEGORY_CONFIG[selectedLocation.category].label}
                  </span>
                  <span className="bg-amber-500 text-slate-950 text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full">
                    {selectedLocation.corridor} {selectedLocation.exitNumber || ''}
                  </span>
                  <span className="bg-slate-800 text-zinc-300 text-[10px] font-bold px-2 py-0.5 rounded-full">
                    {selectedLocation.brand || 'Verified Stop'}
                  </span>
                </div>

                <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3">
                  <div>
                    <h2 className="text-xl sm:text-2xl font-black text-white leading-tight">
                      {selectedLocation.name}
                    </h2>
                    <p className="text-xs text-zinc-300 font-medium flex items-center space-x-1.5 mt-0.5">
                      <MapPin className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                      <span>{selectedLocation.address}, {selectedLocation.city}, {selectedLocation.state}</span>
                    </p>
                  </div>

                  <div className="flex items-center space-x-3 shrink-0">
                    <div className="text-right">
                      <div className="flex items-center space-x-1 text-amber-400 font-black text-lg">
                        <Star className="w-5 h-5 fill-amber-400 text-amber-400" />
                        <span>{selectedLocation.overallRating}</span>
                      </div>
                      <span className="text-[10px] text-zinc-400 font-bold block">
                        {selectedLocation.reviewCount} Driver Reviews
                      </span>
                    </div>

                    <button
                      onClick={() => {
                        setReviewLocation(selectedLocation);
                        setIsReviewModalOpen(true);
                      }}
                      className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs uppercase px-4 py-2.5 rounded-2xl shadow-lg transition active:scale-95 flex items-center space-x-1.5"
                      id="btn-write-review-modal"
                    >
                      <Star className="w-4 h-4 fill-slate-950" />
                      <span>Write Review</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Body */}
            <div className="p-5 sm:p-6 overflow-y-auto space-y-6">
              {/* Semi-Trucker Amenities Grid */}
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/80 space-y-3">
                <h4 className="text-xs font-black uppercase tracking-wider text-slate-700 flex items-center space-x-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  <span>Verified Big-Rig Driver Amenities</span>
                </h4>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                  <div className="p-2.5 bg-white rounded-xl border border-slate-200 shadow-sm">
                    <span className="text-zinc-500 text-[10px] font-bold block">Semi Parking</span>
                    <strong className="text-slate-900 text-sm font-black">{selectedLocation.semiParkingSpots} Spaces</strong>
                  </div>
                  <div className="p-2.5 bg-white rounded-xl border border-slate-200 shadow-sm">
                    <span className="text-zinc-500 text-[10px] font-bold block">Private Showers</span>
                    <strong className="text-slate-900 text-sm font-black">{selectedLocation.hasShowers ? `${selectedLocation.showerCount || 'Clean'} Suites` : 'None'}</strong>
                  </div>
                  <div className="p-2.5 bg-white rounded-xl border border-slate-200 shadow-sm">
                    <span className="text-zinc-500 text-[10px] font-bold block">DEF at Pump</span>
                    <strong className="text-slate-900 text-sm font-black">{selectedLocation.hasDefAtPump ? 'High Flow DEF' : 'Jug Only'}</strong>
                  </div>
                  <div className="p-2.5 bg-white rounded-xl border border-slate-200 shadow-sm">
                    <span className="text-zinc-500 text-[10px] font-bold block">Certified Scale</span>
                    <strong className="text-slate-900 text-sm font-black">{selectedLocation.hasCatScale ? 'CAT Scale 24/7' : 'None'}</strong>
                  </div>
                </div>

                {/* Food Options */}
                {selectedLocation.foodOptions.length > 0 && (
                  <div className="pt-2 border-t border-slate-200/60 flex flex-wrap items-center gap-1.5 text-xs">
                    <Utensils className="w-3.5 h-3.5 text-rose-500 mr-1" />
                    <span className="font-bold text-slate-700 mr-1">Food Options:</span>
                    {selectedLocation.foodOptions.map((opt, i) => (
                      <span key={i} className="bg-amber-100/70 text-amber-900 font-bold text-[11px] px-2.5 py-0.5 rounded-lg">
                        {opt}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* REVIEWS STREAM SECTION */}
              <div className="space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
                  <div className="flex items-center space-x-2">
                    <h3 className="text-base font-black text-slate-900">
                      Driver Reviews & Media Walkarounds
                    </h3>
                    <span className="bg-slate-100 text-slate-700 text-xs font-bold px-2 py-0.5 rounded-full">
                      {reviews.filter(r => r.locationId === selectedLocation.id).length}
                    </span>
                  </div>

                  <div className="flex items-center space-x-1.5 text-xs font-bold text-zinc-500">
                    <button
                      onClick={() => setReviewFilterMode('all')}
                      className={`px-2.5 py-1 rounded-lg transition ${reviewFilterMode === 'all' ? 'bg-slate-900 text-white' : 'hover:bg-slate-100'}`}
                    >
                      All
                    </button>
                    <button
                      onClick={() => setReviewFilterMode('media')}
                      className={`px-2.5 py-1 rounded-lg transition flex items-center space-x-1 ${reviewFilterMode === 'media' ? 'bg-slate-900 text-white' : 'hover:bg-slate-100'}`}
                    >
                      <Camera className="w-3 h-3" />
                      <span>Photos & Video</span>
                    </button>
                    <button
                      onClick={() => setReviewFilterMode('5star')}
                      className={`px-2.5 py-1 rounded-lg transition ${reviewFilterMode === '5star' ? 'bg-slate-900 text-white' : 'hover:bg-slate-100'}`}
                    >
                      5 Stars Only
                    </button>
                  </div>
                </div>

                {/* Reviews List */}
                <div className="space-y-4">
                  {reviews
                    .filter(r => r.locationId === selectedLocation.id)
                    .filter(r => {
                      if (reviewFilterMode === 'media') return !!r.mediaUrl;
                      if (reviewFilterMode === '5star') return r.rating === 5;
                      return true;
                    })
                    .map(rev => (
                      <div 
                        key={rev.id} 
                        className="bg-white rounded-2xl border border-slate-200/90 p-4 sm:p-5 space-y-3 shadow-sm hover:border-slate-300 transition"
                        id={`review-item-${rev.id}`}
                      >
                        {/* Driver Header */}
                        <div className="flex items-center justify-between">
                          <div 
                            className="flex items-center space-x-3 cursor-pointer"
                            onClick={() => onViewProfile && onViewProfile(rev.author)}
                          >
                            <img
                              src={rev.author.avatarUrl}
                              alt=""
                              className="w-10 h-10 rounded-xl object-cover ring-1 ring-slate-200 shadow-sm"
                            />
                            <div>
                              <div className="flex items-center space-x-1.5">
                                <h4 className="text-xs font-black text-slate-900">{rev.author.displayName}</h4>
                                {rev.author.isVerified && (
                                  <ShieldCheck className="w-3.5 h-3.5 text-amber-500 fill-amber-500/20" />
                                )}
                              </div>
                              <span className="text-[10px] text-zinc-400 font-semibold block">
                                CDL Class {rev.author.cdlClass} • {rev.author.currentRig}
                              </span>
                            </div>
                          </div>

                          <div className="text-right">
                            <div className="flex text-amber-400 justify-end">
                              {Array.from({ length: rev.rating }).map((_, i) => (
                                <Star key={i} className="w-3.5 h-3.5 fill-amber-400" />
                              ))}
                            </div>
                            <span className="text-[10px] text-zinc-400 block mt-0.5">
                              Visited {rev.visitedAt}
                            </span>
                          </div>
                        </div>

                        {/* Review text */}
                        <p className="text-xs sm:text-sm text-slate-700 leading-relaxed font-medium">
                          {rev.reviewText}
                        </p>

                        {/* Verified Amenities Tag Pills */}
                        {rev.amenitiesConfirmed && rev.amenitiesConfirmed.length > 0 && (
                          <div className="flex flex-wrap gap-1.5 pt-1">
                            {rev.amenitiesConfirmed.map((am, i) => (
                              <span key={i} className="bg-emerald-50 text-emerald-800 border border-emerald-200/70 text-[10px] font-black px-2 py-0.5 rounded-md flex items-center space-x-1">
                                <Check className="w-2.5 h-2.5 stroke-[3]" />
                                <span>{am}</span>
                              </span>
                            ))}
                          </div>
                        )}

                        {/* Video / Photo Attachment */}
                        {rev.mediaUrl && (
                          <div className="pt-2">
                            <div 
                              onClick={() => setLightboxMedia({ url: rev.mediaUrl!, type: rev.mediaType || 'image', caption: rev.mediaCaption })}
                              className="relative rounded-2xl overflow-hidden bg-slate-950 border border-slate-200 cursor-pointer group max-h-72 w-full flex items-center justify-center"
                            >
                              <img
                                src={rev.mediaUrl}
                                alt="Truck stop review photo"
                                className="w-full h-auto max-h-72 object-cover group-hover:scale-105 transition-transform duration-300"
                              />

                              {/* Media overlay badge */}
                              <div className="absolute top-2 left-2 bg-slate-950/80 backdrop-blur-md text-white text-[10px] font-black px-2.5 py-1 rounded-lg flex items-center space-x-1.5 shadow">
                                {rev.mediaType === 'video' ? (
                                  <>
                                    <Video className="w-3.5 h-3.5 text-rose-400 animate-pulse" />
                                    <span>Driver Video Clip</span>
                                  </>
                                ) : (
                                  <>
                                    <Camera className="w-3.5 h-3.5 text-sky-400" />
                                    <span>Cab Photo Proof</span>
                                  </>
                                )}
                              </div>

                              {rev.mediaCaption && (
                                <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent p-3 text-white text-xs font-medium">
                                  {rev.mediaCaption}
                                </div>
                              )}
                            </div>
                          </div>
                        )}

                        {/* Review Footer & Helpful Upvote */}
                        <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
                          <button
                            onClick={() => handleToggleHelpful(rev.id)}
                            className={`flex items-center space-x-1.5 px-3 py-1 rounded-xl text-xs font-bold transition ${
                              rev.helpfulUsers.includes(currentUserProfile.id)
                                ? 'bg-amber-500 text-slate-950 shadow-sm font-black'
                                : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                            }`}
                          >
                            <ThumbsUp className="w-3.5 h-3.5" />
                            <span>Helpful 10-4 ({rev.helpfulCount})</span>
                          </button>

                          <span className="text-[10px] text-zinc-400">
                            Posted {new Date(rev.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* WRITE A REVIEW MODAL */}
      {isReviewModalOpen && reviewLocation && (
        <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white text-slate-900 w-full max-w-xl rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col animate-in fade-in zoom-in-95 duration-150">
            <div className="p-5 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800">
              <div>
                <span className="text-[10px] font-black uppercase tracking-wider text-amber-400 block">
                  Write CDL Review
                </span>
                <h3 className="text-base font-black text-white">{reviewLocation.name}</h3>
              </div>
              <button
                onClick={() => setIsReviewModalOpen(false)}
                className="p-1.5 text-zinc-400 hover:text-white rounded-lg hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmitReview} className="p-5 space-y-5">
              {/* Overall Star Rating */}
              <div className="space-y-1.5">
                <label className="text-xs font-black uppercase text-slate-700 block">
                  Overall Trucker Score
                </label>
                <div className="flex items-center space-x-2">
                  {[1, 2, 3, 4, 5].map(star => (
                    <button
                      type="button"
                      key={star}
                      onClick={() => setReviewRating(star)}
                      className="p-1 text-2xl focus:outline-none transition hover:scale-110"
                    >
                      <Star
                        className={`w-7 h-7 ${
                          star <= reviewRating ? 'fill-amber-400 text-amber-400' : 'text-zinc-300'
                        }`}
                      />
                    </button>
                  ))}
                  <span className="text-sm font-black text-slate-800 ml-2">
                    {reviewRating === 5 ? '5.0 - Legendary Stop' :
                     reviewRating === 4 ? '4.0 - Good Road Stop' :
                     reviewRating === 3 ? '3.0 - Average / In a pinch' :
                     reviewRating === 2 ? '2.0 - Tight / Avoid if possible' : '1.0 - Do Not Stop'}
                  </span>
                </div>
              </div>

              {/* Sub-ratings */}
              <div className="grid grid-cols-2 gap-3 bg-slate-50 p-3 rounded-2xl border border-slate-200 text-xs">
                <div>
                  <span className="text-zinc-600 font-bold block mb-1">Shower Cleanliness</span>
                  <div className="flex space-x-1">
                    {[1, 2, 3, 4, 5].map(s => (
                      <button type="button" key={s} onClick={() => setReviewCleanliness(s)}>
                        <Star className={`w-3.5 h-3.5 ${s <= reviewCleanliness ? 'fill-sky-500 text-sky-500' : 'text-zinc-300'}`} />
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <span className="text-zinc-600 font-bold block mb-1">Semi Parking Room</span>
                  <div className="flex space-x-1">
                    {[1, 2, 3, 4, 5].map(s => (
                      <button type="button" key={s} onClick={() => setReviewParking(s)}>
                        <Star className={`w-3.5 h-3.5 ${s <= reviewParking ? 'fill-amber-500 text-amber-500' : 'text-zinc-300'}`} />
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Typed Review Text */}
              <div className="space-y-1">
                <label className="text-xs font-black uppercase text-slate-700 block">
                  Written Highway Review & Tips
                </label>
                <textarea
                  rows={4}
                  required
                  placeholder="Share details that matter to drivers: lot pavement condition, parking after 9pm, shower water pressure, food quality, turning radius..."
                  value={reviewText}
                  onChange={e => setReviewText(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-2xl p-3 text-xs text-slate-900 focus:outline-none focus:border-amber-500 focus:bg-white"
                  id="textarea-review-body"
                />
              </div>

              {/* PHOTO / VIDEO ATTACHMENT */}
              <div className="space-y-2 bg-slate-50 p-4 rounded-2xl border border-slate-200">
                <label className="text-xs font-black uppercase text-slate-800 flex items-center justify-between">
                  <span className="flex items-center space-x-1.5">
                    <Camera className="w-3.5 h-3.5 text-sky-600" />
                    <span>Attach Photo or Video Tour</span>
                  </span>
                  <span className="text-[10px] text-zinc-400 font-normal">Optional</span>
                </label>

                <div className="flex space-x-2">
                  <button
                    type="button"
                    onClick={() => setReviewMediaType('none')}
                    className={`px-3 py-1.5 text-xs font-bold rounded-xl border transition ${
                      reviewMediaType === 'none' ? 'bg-slate-900 text-white border-slate-900' : 'bg-white text-zinc-600 border-slate-200'
                    }`}
                  >
                    No Media
                  </button>
                  <button
                    type="button"
                    onClick={() => setReviewMediaType('image')}
                    className={`px-3 py-1.5 text-xs font-bold rounded-xl border transition flex items-center space-x-1 ${
                      reviewMediaType === 'image' ? 'bg-sky-500 text-slate-950 font-black border-sky-400 shadow' : 'bg-white text-zinc-600 border-slate-200'
                    }`}
                  >
                    <Camera className="w-3.5 h-3.5" />
                    <span>Attach Photo</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setReviewMediaType('video')}
                    className={`px-3 py-1.5 text-xs font-bold rounded-xl border transition flex items-center space-x-1 ${
                      reviewMediaType === 'video' ? 'bg-rose-500 text-white font-black border-rose-400 shadow' : 'bg-white text-zinc-600 border-slate-200'
                    }`}
                  >
                    <Video className="w-3.5 h-3.5" />
                    <span>Attach Video</span>
                  </button>
                </div>

                {reviewMediaType !== 'none' && (
                  <div className="space-y-2 pt-2">
                    <input
                      type="url"
                      placeholder={reviewMediaType === 'video' ? "Paste video stream URL or mp4..." : "Paste photo image URL..."}
                      value={reviewMediaUrl}
                      onChange={e => setReviewMediaUrl(e.target.value)}
                      className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-amber-500"
                    />

                    {/* Or quick select sample trucking photo */}
                    <div className="flex items-center space-x-2 overflow-x-auto pb-1">
                      <span className="text-[10px] font-bold text-zinc-500 shrink-0">Presets:</span>
                      {presetPhotos.map((p, idx) => (
                        <button
                          type="button"
                          key={idx}
                          onClick={() => setReviewMediaUrl(p.url)}
                          className="text-[10px] font-bold text-slate-700 bg-white hover:bg-amber-50 border border-slate-200 px-2 py-1 rounded-lg shrink-0"
                        >
                          {p.label}
                        </button>
                      ))}
                    </div>

                    <input
                      type="text"
                      placeholder="Media caption (e.g. Clean showers, pulled in at 10 PM row 4)..."
                      value={reviewMediaCaption}
                      onChange={e => setReviewMediaCaption(e.target.value)}
                      className="w-full bg-white border border-slate-300 rounded-xl px-3 py-1.5 text-xs text-slate-900 focus:outline-none"
                    />
                  </div>
                )}
              </div>

              {/* Submit Buttons */}
              <div className="flex items-center justify-end space-x-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsReviewModalOpen(false)}
                  className="px-4 py-2 text-xs font-bold text-zinc-600 hover:text-slate-900"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs uppercase px-5 py-2.5 rounded-2xl shadow-md transition active:scale-95 flex items-center space-x-1.5"
                  id="btn-submit-review"
                >
                  <Check className="w-4 h-4 stroke-[3]" />
                  <span>Publish Review</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* POST NEW LOCATION MODAL */}
      {isNewLocationModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
          <div className="bg-white text-slate-900 w-full max-w-2xl max-h-[92vh] rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col animate-in fade-in zoom-in-95 duration-150">
            <div className="p-5 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800 shrink-0">
              <div>
                <span className="text-[10px] font-black uppercase tracking-wider text-amber-400 block">
                  Add to National Driver Radar
                </span>
                <h3 className="text-base font-black text-white">Post a Highway Pitstop</h3>
              </div>
              <button
                onClick={() => setIsNewLocationModalOpen(false)}
                className="p-1.5 text-zinc-400 hover:text-white rounded-lg hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateLocation} className="p-6 overflow-y-auto space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="font-bold text-slate-700">Location Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Iowa 80, Little America, Love's #405..."
                    value={newLocName}
                    onChange={e => setNewLocName(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 text-slate-900 focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-700">Category *</label>
                  <select
                    value={newLocCategory}
                    onChange={e => setNewLocCategory(e.target.value as PitstopCategory)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 text-slate-900 focus:outline-none focus:border-amber-500 font-bold"
                  >
                    <option value="truck_stop">Truck Stop & Travel Center</option>
                    <option value="fuel_station">Gas & Diesel Station</option>
                    <option value="food_dining">Food Spot & Highway Diner</option>
                    <option value="repair_tire">Repair Shop & Tire Center</option>
                    <option value="overnight_parking">Overnight Staging & Parking</option>
                    <option value="driver_amenity">Driver Amenities (Showers/Lounge)</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-700">Corridor *</label>
                  <select
                    value={newLocCorridor}
                    onChange={e => setNewLocCorridor(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 text-slate-900 focus:outline-none font-bold"
                  >
                    {CORRIDORS.filter(c => c !== 'All Corridors').map(c => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-700">Exit / Mile Marker</label>
                  <input
                    type="text"
                    placeholder="e.g. Exit 284, MM 68..."
                    value={newLocExit}
                    onChange={e => setNewLocExit(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 text-slate-900 focus:outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-700">City *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Walcott, Laramie, OKC..."
                    value={newLocCity}
                    onChange={e => setNewLocCity(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 text-slate-900 focus:outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-700">State *</label>
                  <input
                    type="text"
                    required
                    maxLength={2}
                    placeholder="e.g. IA, WY, TX, OK..."
                    value={newLocState}
                    onChange={e => setNewLocState(e.target.value.toUpperCase())}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 text-slate-900 focus:outline-none uppercase font-black"
                  />
                </div>
              </div>

              {/* Trucker specs */}
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-3">
                <span className="font-black text-slate-800 uppercase tracking-wider text-[11px] block">
                  Semi-Truck Access & Capacity
                </span>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div className="space-y-1">
                    <label className="text-[11px] text-zinc-500 font-bold">Semi Parking Spots</label>
                    <input
                      type="number"
                      min={0}
                      value={newLocParking}
                      onChange={e => setNewLocParking(Number(e.target.value))}
                      className="w-full bg-white border border-slate-300 rounded-xl p-2 text-slate-900 font-black"
                    />
                  </div>
                  <div className="flex items-center space-x-2 pt-4">
                    <input
                      type="checkbox"
                      id="check-showers"
                      checked={newLocHasShowers}
                      onChange={e => setNewLocHasShowers(e.target.checked)}
                      className="w-4 h-4 text-amber-500 rounded"
                    />
                    <label htmlFor="check-showers" className="font-bold text-slate-800">Showers</label>
                  </div>
                  <div className="flex items-center space-x-2 pt-4">
                    <input
                      type="checkbox"
                      id="check-def"
                      checked={newLocHasDef}
                      onChange={e => setNewLocHasDef(e.target.checked)}
                      className="w-4 h-4 text-amber-500 rounded"
                    />
                    <label htmlFor="check-def" className="font-bold text-slate-800">Bulk DEF</label>
                  </div>
                  <div className="flex items-center space-x-2 pt-4">
                    <input
                      type="checkbox"
                      id="check-scale"
                      checked={newLocHasScale}
                      onChange={e => setNewLocHasScale(e.target.checked)}
                      className="w-4 h-4 text-amber-500 rounded"
                    />
                    <label htmlFor="check-scale" className="font-bold text-slate-800">CAT Scale</label>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] text-zinc-600 font-bold">Food Options (comma separated)</label>
                  <input
                    type="text"
                    placeholder="e.g. Iron Skillet, Wendy's, Smoked Brisket, Subway..."
                    value={newLocFoodOptions}
                    onChange={e => setNewLocFoodOptions(e.target.value)}
                    className="w-full bg-white border border-slate-300 rounded-xl p-2 text-slate-900"
                  />
                </div>
              </div>

              {/* Photo */}
              <div className="space-y-1">
                <label className="font-bold text-slate-700">Photo URL</label>
                <input
                  type="url"
                  placeholder="https://... or choose from presets below"
                  value={newLocPhotoUrl}
                  onChange={e => setNewLocPhotoUrl(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 text-slate-900 focus:outline-none"
                />
                <div className="flex space-x-2 pt-1 overflow-x-auto">
                  {presetPhotos.map((p, idx) => (
                    <button
                      type="button"
                      key={idx}
                      onClick={() => setNewLocPhotoUrl(p.url)}
                      className="text-[10px] font-bold text-zinc-600 bg-slate-100 hover:bg-amber-100 px-2.5 py-1 rounded-lg shrink-0"
                    >
                      {p.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Initial Review */}
              <div className="space-y-1 pt-2 border-t border-slate-200">
                <label className="font-bold text-slate-800">Your First Driver Review (Optional)</label>
                <textarea
                  rows={2}
                  placeholder="What should fellow drivers know about parking, food, or showers here?"
                  value={newLocInitialReview}
                  onChange={e => setNewLocInitialReview(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 text-slate-900"
                />
              </div>

              <div className="flex items-center justify-end space-x-3 pt-3">
                <button
                  type="button"
                  onClick={() => setIsNewLocationModalOpen(false)}
                  className="px-4 py-2 font-bold text-zinc-600 hover:text-slate-900"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs uppercase px-5 py-2.5 rounded-2xl shadow-md transition active:scale-95"
                >
                  Save & Post Location
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MEDIA LIGHTBOX */}
      {lightboxMedia && (
        <div 
          onClick={() => setLightboxMedia(null)}
          className="fixed inset-0 z-50 bg-black/95 backdrop-blur-md flex items-center justify-center p-4 cursor-pointer"
        >
          <div className="relative max-w-4xl max-h-[90vh] flex flex-col items-center">
            <button
              onClick={() => setLightboxMedia(null)}
              className="absolute -top-12 right-0 p-2 text-white hover:text-amber-400 text-sm font-bold flex items-center space-x-1"
            >
              <X className="w-5 h-5" />
              <span>Close</span>
            </button>
            <img
              src={lightboxMedia.url}
              alt=""
              className="max-w-full max-h-[80vh] rounded-2xl object-contain shadow-2xl"
            />
            {lightboxMedia.caption && (
              <p className="mt-3 text-sm text-zinc-200 font-medium text-center bg-slate-900/80 px-4 py-2 rounded-xl">
                {lightboxMedia.caption}
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
