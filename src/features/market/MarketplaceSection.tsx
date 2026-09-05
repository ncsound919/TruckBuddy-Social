import React, { useState, useEffect } from 'react';
import { Listing, Profile, ListingCategory } from '../../types';
import { sampleListings, currentUserProfile } from '../../data';
import { 
  Tag, 
  Search, 
  MessageSquare, 
  PlusCircle, 
  Check, 
  X, 
  MapPin, 
  Calculator, 
  ShieldCheck, 
  Truck, 
  DollarSign, 
  Calendar, 
  Filter, 
  Send,
  CheckCircle2,
  Sparkles,
  Info,
  Radio,
  ShoppingBag,
  Disc,
  Cpu,
  Wrench,
  Shirt
} from 'lucide-react';


interface MarketplaceSectionProps {
  onViewProfile?: (profile: Profile) => void;
}

export default function MarketplaceSection({ onViewProfile }: MarketplaceSectionProps = {}) {
  const [listings, setListings] = useState<Listing[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [corridorFilter, setCorridorFilter] = useState('all');
  const [specFilter, setSpecFilter] = useState<'all' | 'dot' | 'pre_def' | 'warranty'>('all');
  const [maxPrice, setMaxPrice] = useState<number>(85000);
  
  // Create listing form state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [category, setCategory] = useState<ListingCategory>('electronics');
  const [condition, setCondition] = useState<'new' | 'used' | 'refurbished'>('used');
  const [isNegotiable, setIsNegotiable] = useState(true);
  const [contactMethod, setContactMethod] = useState<'in_app' | 'cb_radio' | 'phone'>('in_app');
  const [location, setLocation] = useState('');
  const [corridor, setCorridor] = useState('I-80');
  const [mediaUrl, setMediaUrl] = useState('');
  const [dotInspected, setDotInspected] = useState(false);
  const [preDef, setPreDef] = useState(false);
  const [warrantyIncluded, setWarrantyIncluded] = useState(false);

  // Contact & Offer Modal State
  const [contactListing, setContactListing] = useState<Listing | null>(null);
  const [contactMode, setContactMode] = useState<'message' | 'offer'>('message');
  const [contactMessage, setContactMessage] = useState('');
  const [offerAmount, setOfferAmount] = useState('');
  const [downPaymentOffer, setDownPaymentOffer] = useState('');
  const [pickupDate, setPickupDate] = useState('');
  const [contactSent, setContactSent] = useState(false);

  // Financing Calculator Modal State
  const [calcListing, setCalcListing] = useState<Listing | null>(null);
  const [calcDownPaymentPct, setCalcDownPaymentPct] = useState(20);
  const [calcTermMonths, setCalcTermMonths] = useState(48);
  const [calcApr, setCalcApr] = useState(8.5);

  useEffect(() => {
    const fetchListings = async () => {
      try {
        // Fallback to local storage/mock for now during migration
        const cached = localStorage.getItem('trucker_listings');
        if (cached) {
          setListings(JSON.parse(cached));
        } else {
          setListings(sampleListings);
          localStorage.setItem('trucker_listings', JSON.stringify(sampleListings));
        }
      } catch (e) {
        console.error('Failed to load listings from database, falling back to local storage:', e);
        setListings(sampleListings);
      }
    };
    fetchListings();
  }, []);

  const saveListings = async (updated: Listing[]) => {
    setListings(updated);
    localStorage.setItem('trucker_listings', JSON.stringify(updated));
  };

  const handleCreateListing = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !price || !location.trim()) return;

    const newListing: Listing = {
      id: `list-${Date.now()}`,
      seller: currentUserProfile,
      title: title.trim(),
      description: description.trim(),
      price: parseFloat(price) || 0,
      category,
      condition,
      isNegotiable,
      contactMethod,
      location: location.trim(),
      corridor: corridor.trim() || 'I-80',
      dotInspected,
      preDef,
      warrantyIncluded,
      mediaUrl: mediaUrl || 'https://images.unsplash.com/photo-1594897030264-ab7d87efc473?auto=format&fit=crop&q=80&w=600',
      createdAt: new Date().toISOString()
    };

    const updated = [newListing, ...listings];
    saveListings(updated);
    
    try {
      throw new Error("Migrate to Firebase!"); // ('listings').insert(newListing);
    } catch (e) {
      console.warn('Failed to insert listing to backend database, saved locally:', e);
    }

    // Reset form
    setTitle('');
    setDescription('');
    setPrice('');
    setLocation('');
    setMediaUrl('');
    setDotInspected(false);
    setPreDef(false);
    setWarrantyIncluded(false);
    setIsModalOpen(false);
  };

  const handleSendContact = (e: React.FormEvent) => {
    e.preventDefault();
    setContactSent(true);
    setTimeout(() => {
      setContactListing(null);
      setContactMessage('');
      setOfferAmount('');
      setDownPaymentOffer('');
      setPickupDate('');
      setContactSent(false);
    }, 1800);
  };

  // Financing calculation helper
  const calculateMonthlyPayment = (price: number, downPct: number, termMonths: number, apr: number) => {
    const principal = price * (1 - downPct / 100);
    const monthlyRate = (apr / 100) / 12;
    if (monthlyRate === 0) return principal / termMonths;
    const payment = (principal * monthlyRate * Math.pow(1 + monthlyRate, termMonths)) / (Math.pow(1 + monthlyRate, termMonths) - 1);
    return Math.round(payment);
  };

  const filteredListings = listings.filter(item => {
    const matchesSearch = item.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          item.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          (item.corridor && item.corridor.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesCategory = categoryFilter === 'all' || item.category === categoryFilter;
    const matchesCorridor = corridorFilter === 'all' || item.corridor === corridorFilter;
    const matchesPrice = item.price <= maxPrice;

    // Spec filters
    let matchesSpec = true;
    if (specFilter === 'dot') matchesSpec = !!item.dotInspected;
    if (specFilter === 'pre_def') matchesSpec = !!item.preDef;
    if (specFilter === 'warranty') matchesSpec = !!item.warrantyIncluded;

    return matchesSearch && matchesCategory && matchesCorridor && matchesPrice && matchesSpec;
  });

  const corridors = ['all', 'I-80', 'I-10', 'I-40', 'I-70', 'I-75', 'I-95', 'I-5'];

  return (
    <div className="space-y-6" id="marketplace-container">
      {/* Search, filters & Price bounds */}
      <div className="bg-white p-5 rounded-2xl border border-zinc-100 shadow-sm space-y-4" id="marketplace-filter-card">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-3.5 w-4 h-4 text-zinc-400" />
            <input
              type="text"
              placeholder="Search trucks, trailers, Pre-DEF rigs, APUs, chains, tires..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 text-xs rounded-xl bg-zinc-50 border border-zinc-100 focus:outline-none focus:ring-2 focus:ring-amber-500 text-slate-800"
            />
          </div>

          <button
            id="btn-add-listing"
            onClick={() => setIsModalOpen(true)}
            className="flex items-center justify-center space-x-2 bg-slate-900 hover:bg-slate-800 active:bg-slate-950 text-white font-bold px-4 py-2.5 rounded-xl transition-all shadow-sm text-xs shrink-0"
          >
            <PlusCircle className="w-4 h-4 text-amber-400" />
            <span>List Equipment / Rig</span>
          </button>
        </div>

        {/* Categories filters scroll list & Max Price Range */}
        <div className="flex flex-wrap items-center justify-between gap-4 pt-2 border-t border-zinc-50">
          <div className="flex items-center space-x-1.5 overflow-x-auto pb-1 scrollbar-none">
            {[
              { id: 'all', label: 'All Marketplace Goods' },
              { id: 'electronics', label: '📻 CBs & GPS Electronics' },
              { id: 'tires', label: '🛞 Steer & Drive Tires' },
              { id: 'parts', label: '🔧 Engine & Heavy Parts' },
              { id: 'chains_straps', label: '⛓️ Chains & Cargo Straps' },
              { id: 'cab_comfort', label: '🛏️ Cab Comfort & Power' },
              { id: 'merch', label: '👕 Trucker Merch' },
              { id: 'truck', label: '🚛 Tractors / Rigs' },
              { id: 'trailer', label: '📦 Trailers' },
              { id: 'service', label: '💼 Jobs & Services' }
            ].map(c => (
              <button
                key={c.id}
                onClick={() => setCategoryFilter(c.id)}
                className={`px-3 py-1.5 text-[11px] font-bold rounded-xl border transition-all shrink-0 ${
                  categoryFilter === c.id
                    ? 'bg-amber-500 border-amber-500 text-slate-950 shadow-sm'
                    : 'bg-white border-zinc-200 text-zinc-600 hover:bg-zinc-50'
                }`}
              >
                {c.label}
              </button>
            ))}
          </div>

          {/* Price Cap Slider */}
          <div className="flex items-center space-x-3 text-xs w-full sm:w-auto">
            <span className="text-zinc-500 font-medium shrink-0">Budget Cap:</span>
            <input
              type="range"
              min="50"
              max="150000"
              step="50"
              value={maxPrice}
              onChange={(e) => setMaxPrice(parseInt(e.target.value))}
              className="w-28 sm:w-36 h-1 bg-zinc-200 rounded-lg appearance-none cursor-pointer accent-slate-900"
            />
            <span className="font-black text-slate-900 shrink-0">${maxPrice.toLocaleString()}</span>
          </div>
        </div>

        {/* Rig Verification & Corridor Filter Row */}
        <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-zinc-50 text-xs">
          <div className="flex items-center space-x-1.5 overflow-x-auto scrollbar-none">
            <span className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider mr-1">Corridor:</span>
            {corridors.map(c => (
              <button
                key={c}
                onClick={() => setCorridorFilter(c)}
                className={`px-2.5 py-1 rounded-lg text-[10px] font-bold border transition-all ${
                  corridorFilter === c
                    ? 'bg-slate-900 text-white border-slate-900'
                    : 'bg-zinc-50 text-zinc-600 border-zinc-200 hover:bg-zinc-100'
                }`}
              >
                {c === 'all' ? 'All Interstates' : c}
              </button>
            ))}
          </div>

          {/* Rig spec badges toggles */}
          <div className="flex items-center space-x-1.5">
            <button
              onClick={() => setSpecFilter(specFilter === 'dot' ? 'all' : 'dot')}
              className={`px-2 py-1 rounded-lg text-[10px] font-bold border flex items-center space-x-1 ${
                specFilter === 'dot' ? 'bg-emerald-600 text-white border-emerald-600' : 'bg-zinc-50 text-zinc-600 border-zinc-200 hover:bg-zinc-100'
              }`}
            >
              <ShieldCheck className="w-3 h-3" />
              <span>DOT Certified</span>
            </button>
            <button
              onClick={() => setSpecFilter(specFilter === 'pre_def' ? 'all' : 'pre_def')}
              className={`px-2 py-1 rounded-lg text-[10px] font-bold border flex items-center space-x-1 ${
                specFilter === 'pre_def' ? 'bg-amber-600 text-white border-amber-600' : 'bg-zinc-50 text-zinc-600 border-zinc-200 hover:bg-zinc-100'
              }`}
            >
              <span>Pre-DEF / ELD Exempt</span>
            </button>
            <button
              onClick={() => setSpecFilter(specFilter === 'warranty' ? 'all' : 'warranty')}
              className={`px-2 py-1 rounded-lg text-[10px] font-bold border flex items-center space-x-1 ${
                specFilter === 'warranty' ? 'bg-blue-600 text-white border-blue-600' : 'bg-zinc-50 text-zinc-600 border-zinc-200 hover:bg-zinc-100'
              }`}
            >
              <span>Warranty</span>
            </button>
          </div>
        </div>
      </div>

      {/* EQUIPMENT SELL LISTING CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5" id="listings-grid">
        {filteredListings.length === 0 ? (
          <div className="col-span-full bg-white rounded-2xl border border-zinc-100 p-12 text-center text-zinc-500">
            <Tag className="w-12 h-12 text-zinc-300 mx-auto mb-3" />
            <p className="font-semibold text-slate-800">No equipment or rigs match these criteria</p>
            <p className="text-xs mt-1">Try broadening your corridor filter or increasing the budget cap slider.</p>
          </div>
        ) : (
          filteredListings.map(listing => {
            const isHighTicket = listing.price >= 3000;
            const estimatedPayment = isHighTicket ? calculateMonthlyPayment(listing.price, 20, 48, 8.5) : null;

            return (
              <div 
                key={listing.id} 
                className="bg-white rounded-2xl border border-zinc-100 shadow-sm hover:shadow-md transition-all overflow-hidden flex flex-col justify-between"
                id={`listing-card-${listing.id}`}
              >
                <div>
                  {/* Photo Header with badges */}
                  <div className="relative h-48 bg-zinc-100 border-b border-zinc-50 overflow-hidden">
                    <img src={listing.mediaUrl || null} className="w-full h-full object-cover" alt={listing.title} referrerPolicy="no-referrer" />
                    
                    {/* Price tag */}
                    <div className="absolute top-3 right-3 flex items-center space-x-1">
                      {listing.isNegotiable && (
                        <span className="bg-amber-400 text-slate-950 font-black px-1.5 py-1 rounded-full text-[10px] shadow-md uppercase">
                          OBO
                        </span>
                      )}
                      <span className="bg-slate-900/95 backdrop-blur-sm text-amber-400 font-black px-3 py-1 rounded-full text-xs shadow-md">
                        ${listing.price.toLocaleString()}
                      </span>
                    </div>

                    {/* Corridor badge */}
                    {listing.corridor && (
                      <span className="absolute top-3 left-3 bg-slate-900/80 backdrop-blur-sm text-white font-black px-2 py-0.5 rounded text-[10px] uppercase tracking-wider">
                        {listing.corridor}
                      </span>
                    )}

                    {/* Condition sticker */}
                    <div className="absolute bottom-3 left-3 flex items-center space-x-1.5">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase shadow-sm border ${
                        listing.condition === 'new' 
                          ? 'bg-emerald-500 text-white border-emerald-500' 
                          : listing.condition === 'refurbished'
                            ? 'bg-purple-500 text-white border-purple-500'
                            : 'bg-amber-100 text-amber-900 border-amber-200'
                      }`}>
                        {listing.condition}
                      </span>

                      {listing.preDef && (
                        <span className="bg-amber-500 text-slate-950 font-black px-1.5 py-0.5 rounded text-[9px] uppercase shadow-sm">
                          Pre-DEF
                        </span>
                      )}

                      {listing.dotInspected && (
                        <span className="bg-emerald-600 text-white font-black px-1.5 py-0.5 rounded text-[9px] uppercase shadow-sm flex items-center space-x-0.5">
                          <Check className="w-2.5 h-2.5" />
                          <span>DOT Passed</span>
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Listing Core details */}
                  <div className="p-4 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-black uppercase tracking-wider text-amber-600">{listing.category}</span>
                      {listing.warrantyIncluded && (
                        <span className="text-[10px] font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded">
                          Warranty Included
                        </span>
                      )}
                    </div>

                    <h4 className="font-bold text-slate-900 text-sm leading-snug truncate">{listing.title}</h4>
                    
                    <p className="text-zinc-600 text-xs font-normal leading-relaxed line-clamp-2">
                      {listing.description}
                    </p>

                    {/* Estimated Financing Callout for Trucks/Trailers */}
                    {isHighTicket && estimatedPayment && (
                      <div 
                        onClick={() => setCalcListing(listing)}
                        className="bg-amber-50/70 hover:bg-amber-100/70 border border-amber-200/60 rounded-xl p-2.5 flex items-center justify-between cursor-pointer transition-colors"
                      >
                        <div className="flex items-center space-x-2">
                          <Calculator className="w-4 h-4 text-amber-700" />
                          <div className="text-left">
                            <span className="text-[10px] font-bold text-amber-900 uppercase tracking-wider block">Commercial Lease Estimate</span>
                            <span className="text-xs font-extrabold text-slate-900">~${estimatedPayment.toLocaleString()}/mo</span>
                          </div>
                        </div>
                        <span className="text-[10px] font-bold text-amber-700 underline">Customize</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Location, seller & Action buttons */}
                <div className="p-4 pt-0 space-y-3">
                  <div className="flex items-center text-zinc-500 text-xs border-t border-zinc-50 pt-3">
                    <MapPin className="w-3.5 h-3.5 text-zinc-400 mr-1 shrink-0" />
                    <span className="truncate text-[11px] font-medium">{listing.location}</span>
                  </div>

                  {/* Seller action bar */}
                  <div className="flex items-center justify-between pt-1">
                    <div 
                      onClick={() => onViewProfile?.(listing.seller)}
                      className="flex items-center space-x-2 cursor-pointer group"
                      title={`View @${listing.seller.username}'s Profile & Timeline`}
                    >
                      <img src={listing.seller.avatarUrl || null} className="w-6 h-6 rounded-full object-cover group-hover:ring-2 ring-amber-400 transition-all" alt="seller" />
                      <span className="text-[10px] text-zinc-500 font-medium truncate max-w-[85px] group-hover:text-amber-600 transition-colors">@{listing.seller.username}</span>
                    </div>

                    <div className="flex items-center space-x-1.5">
                      <button
                        onClick={() => {
                          setContactListing(listing);
                          setContactMode('offer');
                        }}
                        className="px-2.5 py-1.5 bg-zinc-100 hover:bg-zinc-200 text-slate-900 font-bold rounded-lg text-[10px] uppercase tracking-wider transition-colors"
                      >
                        Make Offer
                      </button>

                      <button
                        id={`contact-seller-${listing.id}`}
                        onClick={() => {
                          setContactListing(listing);
                          setContactMode('message');
                        }}
                        className="flex items-center space-x-1 px-3 py-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black rounded-lg text-[10px] uppercase tracking-wider transition-colors shadow-sm"
                      >
                        <MessageSquare className="w-3 h-3" />
                        <span>Inquire</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* FINANCING ESTIMATOR MODAL */}
      {calcListing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4" id="calc-modal">
          <div className="w-full max-w-md bg-white rounded-2xl shadow-xl overflow-hidden border border-zinc-100">
            <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-100 bg-zinc-50">
              <div className="flex items-center space-x-2">
                <Calculator className="w-5 h-5 text-amber-600" />
                <h3 className="text-base font-bold text-slate-900">Commercial Rig Financing</h3>
              </div>
              <button 
                onClick={() => setCalcListing(null)} 
                className="text-zinc-400 hover:text-slate-900 p-1 rounded-full hover:bg-zinc-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-5">
              <div className="bg-zinc-50 p-3 rounded-xl border border-zinc-100">
                <p className="text-xs text-zinc-500">Selected Equipment</p>
                <h4 className="text-sm font-bold text-slate-900 truncate">{calcListing.title}</h4>
                <p className="text-base font-black text-amber-600 mt-0.5">${calcListing.price.toLocaleString()}</p>
              </div>

              {/* Down payment option */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs font-bold">
                  <span className="text-zinc-600">Down Payment</span>
                  <span className="text-slate-900">{calcDownPaymentPct}% (${Math.round(calcListing.price * (calcDownPaymentPct / 100)).toLocaleString()})</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="50"
                  step="5"
                  value={calcDownPaymentPct}
                  onChange={(e) => setCalcDownPaymentPct(parseInt(e.target.value))}
                  className="w-full h-1 bg-zinc-200 rounded-lg appearance-none cursor-pointer accent-amber-500"
                />
              </div>

              {/* Term length */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-zinc-600">Lease Term (Months)</label>
                <div className="grid grid-cols-4 gap-2">
                  {[24, 36, 48, 60].map(term => (
                    <button
                      key={term}
                      onClick={() => setCalcTermMonths(term)}
                      className={`py-2 rounded-xl text-xs font-bold border transition-all ${
                        calcTermMonths === term
                          ? 'bg-slate-900 text-white border-slate-900'
                          : 'bg-white text-zinc-600 border-zinc-200 hover:bg-zinc-50'
                      }`}
                    >
                      {term} mo
                    </button>
                  ))}
                </div>
              </div>

              {/* Commercial APR */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs font-bold">
                  <span className="text-zinc-600">Estimated Commercial APR</span>
                  <span className="text-slate-900">{calcApr}%</span>
                </div>
                <input
                  type="range"
                  min="5"
                  max="16"
                  step="0.5"
                  value={calcApr}
                  onChange={(e) => setCalcApr(parseFloat(e.target.value))}
                  className="w-full h-1 bg-zinc-200 rounded-lg appearance-none cursor-pointer accent-slate-900"
                />
              </div>

              {/* Calculated Monthly Box */}
              <div className="bg-slate-900 rounded-2xl p-5 text-center text-white space-y-1">
                <span className="text-[11px] font-bold uppercase tracking-wider text-amber-400">Estimated Monthly Payment</span>
                <p className="text-3xl font-black text-white">
                  ${calculateMonthlyPayment(calcListing.price, calcDownPaymentPct, calcTermMonths, calcApr).toLocaleString()}
                  <span className="text-sm font-normal text-zinc-400"> / mo</span>
                </p>
                <p className="text-[10px] text-zinc-400 pt-1">Principal financed: ${(calcListing.price * (1 - calcDownPaymentPct / 100)).toLocaleString()}</p>
              </div>

              <button
                onClick={() => {
                  const monthly = calculateMonthlyPayment(calcListing.price, calcDownPaymentPct, calcTermMonths, calcApr);
                  setCalcListing(null);
                  setContactListing(calcListing);
                  setContactMode('offer');
                  setOfferAmount(calcListing.price.toString());
                  setDownPaymentOffer(Math.round(calcListing.price * (calcDownPaymentPct / 100)).toString());
                  setContactMessage(`I am pre-qualifying for commercial financing on this rig at estimated $${monthly}/mo with $${Math.round(calcListing.price * (calcDownPaymentPct / 100)).toLocaleString()} down payment in hand. Is the title clean and available for inspection?`);
                }}
                className="w-full py-3 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black rounded-xl text-xs uppercase tracking-wider shadow-md transition-colors"
              >
                Submit Pre-Financing Inquiry to Seller
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MAKE OFFER / CONTACT SELLER MODAL */}
      {contactListing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4" id="contact-seller-modal">
          <div className="w-full max-w-md bg-white rounded-2xl shadow-xl overflow-hidden border border-zinc-100">
            <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-100 bg-zinc-50">
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  {contactMode === 'offer' ? 'Make Offer on Equipment' : 'Contact Equipment Seller'}
                </h3>
                <p className="text-xs text-zinc-500">Communicating with @{contactListing.seller.username}</p>
              </div>
              <button 
                onClick={() => setContactListing(null)} 
                className="text-zinc-400 hover:text-slate-900 p-1 rounded-full hover:bg-zinc-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {contactSent ? (
              <div className="p-8 text-center space-y-3">
                <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <h4 className="text-base font-bold text-slate-900">Inquiry Transmitted!</h4>
                <p className="text-xs text-zinc-500">
                  {contactMode === 'offer' ? 'Your offer has been logged and sent directly to the seller.' : 'Your message has been dispatched to the driver.'}
                </p>
              </div>
            ) : (
              <form onSubmit={handleSendContact} className="p-6 space-y-4">
                {/* Mode Selector */}
                <div className="grid grid-cols-2 gap-2 bg-zinc-100 p-1 rounded-xl">
                  <button
                    type="button"
                    onClick={() => setContactMode('message')}
                    className={`py-1.5 text-xs font-bold rounded-lg transition-all ${
                      contactMode === 'message' ? 'bg-white text-slate-900 shadow-sm' : 'text-zinc-500'
                    }`}
                  >
                    Question / Inquiry
                  </button>
                  <button
                    type="button"
                    onClick={() => setContactMode('offer')}
                    className={`py-1.5 text-xs font-bold rounded-lg transition-all ${
                      contactMode === 'offer' ? 'bg-white text-slate-900 shadow-sm' : 'text-zinc-500'
                    }`}
                  >
                    Counter-Offer
                  </button>
                </div>

                <div className="bg-zinc-50 p-3 rounded-xl border border-zinc-100">
                  <span className="text-[10px] font-bold text-zinc-400 uppercase">Item</span>
                  <p className="text-xs font-bold text-slate-900 truncate">{contactListing.title}</p>
                  <p className="text-xs font-black text-amber-600">Listed at ${contactListing.price.toLocaleString()}</p>
                </div>

                {contactMode === 'offer' && (
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-zinc-500 mb-1">Your Offer ($)</label>
                      <input
                        type="number"
                        required
                        placeholder="e.g. 52000"
                        value={offerAmount}
                        onChange={(e) => setOfferAmount(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl border border-zinc-200 text-xs"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-zinc-500 mb-1">Down Payment ($)</label>
                      <input
                        type="number"
                        placeholder="e.g. 10000"
                        value={downPaymentOffer}
                        onChange={(e) => setDownPaymentOffer(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl border border-zinc-200 text-xs"
                      />
                    </div>
                  </div>
                )}

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-zinc-500 mb-1">
                    {contactMode === 'offer' ? 'Offer Terms & Inspection Request' : 'Direct Message'}
                  </label>
                  <textarea
                    required
                    rows={3}
                    placeholder={
                      contactMode === 'offer' 
                        ? 'State your proposed pickup date, payment method (wire, certified check), and inspection requirements...'
                        : 'Ask about maintenance logs, ECM engine readouts, tire depth, or title status...'
                    }
                    value={contactMessage}
                    onChange={(e) => setContactMessage(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-zinc-200 text-xs text-slate-800"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-3 bg-slate-900 hover:bg-slate-800 text-white font-extrabold rounded-xl transition-all text-xs uppercase tracking-wider shadow-md"
                >
                  {contactMode === 'offer' ? 'Transmit Counter-Offer' : 'Send Message to Driver'}
                </button>
              </form>
            )}
          </div>
        </div>
      )}

      {/* CREATE NEW LISTING MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4" id="listing-modal">
          <div className="w-full max-w-lg bg-white rounded-2xl shadow-xl overflow-hidden border border-zinc-100 max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-100 bg-zinc-50">
              <div>
                <h3 className="text-base font-bold text-slate-900">List Commercial Rig or Equipment</h3>
                <p className="text-xs text-zinc-500">Reach verified CDL drivers across major interstate corridors</p>
              </div>
              <button 
                id="close-listing-modal"
                onClick={() => setIsModalOpen(false)} 
                className="text-zinc-400 hover:text-slate-900 p-1 rounded-full hover:bg-zinc-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateListing} className="p-6 space-y-4 overflow-y-auto flex-1">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-zinc-500 mb-1">Category</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-xl border border-zinc-200 text-xs bg-white"
                  >
                    <option value="electronics">📻 CBs, Dashcams & GPS Electronics</option>
                    <option value="tires">🛞 Steer & Drive Tires</option>
                    <option value="parts">🔧 Engine, Transmission & Heavy Parts</option>
                    <option value="chains_straps">⛓️ Chains, Binders & 4" Straps</option>
                    <option value="cab_comfort">🛏️ Cab Comfort, Mattresses & Inverters</option>
                    <option value="merch">👕 Trucker Merch & Apparel</option>
                    <option value="truck">🚛 Commercial Tractor / Rig</option>
                    <option value="trailer">📦 Utility/Reefer/Flatbed Trailer</option>
                    <option value="equipment">🛡️ APUs, Toolboxes & Safety Gear</option>
                    <option value="service">💼 Escort & Freight Services</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-zinc-500 mb-1">Condition</label>
                  <select
                    value={condition}
                    onChange={(e) => setCondition(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-xl border border-zinc-200 text-xs bg-white"
                  >
                    <option value="used">Used / Field Tested</option>
                    <option value="new">Brand New in Box</option>
                    <option value="refurbished">Remanufactured / Rebuilt</option>
                  </select>
                </div>
              </div>

              {/* Price and Negotiable Row */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-zinc-500 mb-1">Price ($ USD)</label>
                  <input
                    required
                    type="number"
                    placeholder="e.g. 350"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl border border-zinc-200 text-xs text-slate-800"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-zinc-500 mb-1">Preferred Contact</label>
                  <select
                    value={contactMethod}
                    onChange={(e) => setContactMethod(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-xl border border-zinc-200 text-xs bg-white"
                  >
                    <option value="in_app">In-App Chat / Offer</option>
                    <option value="cb_radio">CB Radio Ch. 19</option>
                    <option value="phone">Direct Phone / Text</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="is-negotiable-check"
                  checked={isNegotiable}
                  onChange={(e) => setIsNegotiable(e.target.checked)}
                  className="w-4 h-4 text-amber-500 rounded"
                />
                <label htmlFor="is-negotiable-check" className="text-xs text-zinc-700 font-bold cursor-pointer">
                  Price is negotiable / Open to gear trades with fellow drivers
                </label>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-zinc-500 mb-1">Listing Headline</label>
                <input
                  required
                  type="text"
                  placeholder="e.g. 2018 Kenworth W900L Studio Sleeper, Cummins X15"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl border border-zinc-200 text-xs text-slate-800"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-zinc-500 mb-1">Interstate Corridor</label>
                  <select
                    value={corridor}
                    onChange={(e) => setCorridor(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl border border-zinc-200 text-xs bg-white"
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

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-zinc-500 mb-1">Terminal / City Location</label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-3 w-4 h-4 text-zinc-400" />
                    <input
                      required
                      type="text"
                      placeholder="e.g. Des Moines, IA (Exit 137)"
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                      className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-zinc-200 text-xs text-slate-800"
                    />
                  </div>
                </div>
              </div>

              {/* Verified specs checkboxes */}
              <div className="bg-zinc-50 p-3 rounded-xl border border-zinc-100 space-y-2">
                <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block">Equipment Qualifications</span>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  <label className="flex items-center space-x-1.5 text-xs text-slate-800 font-semibold cursor-pointer">
                    <input
                      type="checkbox"
                      checked={dotInspected}
                      onChange={(e) => setDotInspected(e.target.checked)}
                      className="w-4 h-4 text-amber-600 rounded"
                    />
                    <span>DOT Inspected</span>
                  </label>
                  <label className="flex items-center space-x-1.5 text-xs text-slate-800 font-semibold cursor-pointer">
                    <input
                      type="checkbox"
                      checked={preDef}
                      onChange={(e) => setPreDef(e.target.checked)}
                      className="w-4 h-4 text-amber-600 rounded"
                    />
                    <span>Pre-DEF / Exempt</span>
                  </label>
                  <label className="flex items-center space-x-1.5 text-xs text-slate-800 font-semibold cursor-pointer">
                    <input
                      type="checkbox"
                      checked={warrantyIncluded}
                      onChange={(e) => setWarrantyIncluded(e.target.checked)}
                      className="w-4 h-4 text-amber-600 rounded"
                    />
                    <span>Warranty Included</span>
                  </label>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-zinc-500 mb-1">Equipment Description & ECM Specs</label>
                <textarea
                  required
                  rows={3}
                  placeholder="Engine model, transmission speeds, rear axle ratios, overhaul paperwork, tire tread life..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-zinc-200 text-xs text-slate-800"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-slate-900 hover:bg-slate-800 text-white font-extrabold rounded-xl transition-all text-xs uppercase tracking-wider shadow-md"
              >
                Publish Equipment to Corridor
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
