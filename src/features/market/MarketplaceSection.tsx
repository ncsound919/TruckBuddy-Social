import React, { useState, useEffect } from 'react';
import { Listing } from '../../types';
import { sampleListings, currentUserProfile } from '../../data';
import { Tag, Search, Phone, MessageSquare, DollarSign, PlusCircle, Check, X, MapPin } from 'lucide-react';
import { db } from '../../lib/supabase';

export default function MarketplaceSection() {
  const [listings, setListings] = useState<Listing[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [maxPrice, setMaxPrice] = useState<number>(20000);
  
  // Create listing form state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [category, setCategory] = useState<'parts' | 'equipment' | 'truck' | 'trailer' | 'service'>('parts');
  const [condition, setCondition] = useState<'new' | 'used' | 'refurbished'>('used');
  const [location, setLocation] = useState('');
  const [mediaUrl, setMediaUrl] = useState('');

  // Contact Seller Form State
  const [contactListing, setContactListing] = useState<Listing | null>(null);
  const [contactMessage, setContactMessage] = useState('');
  const [contactSent, setContactSent] = useState(false);

  useEffect(() => {
    const fetchListings = async () => {
      const { data, error } = await db.from('listings').select('*');
      if (data && data.length > 0) {
        setListings(data);
        localStorage.setItem('trucker_listings', JSON.stringify(data));
      } else {
        const cached = localStorage.getItem('trucker_listings');
        if (cached) {
          setListings(JSON.parse(cached));
        } else {
          setListings(sampleListings);
          localStorage.setItem('trucker_listings', JSON.stringify(sampleListings));
        }
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
      location: location.trim(),
      mediaUrl: mediaUrl || 'https://images.unsplash.com/photo-1594897030264-ab7d87efc473?auto=format&fit=crop&q=80&w=400',
      createdAt: new Date().toISOString()
    };

    const updated = [newListing, ...listings];
    saveListings(updated);
    db.from('listings').insert(newListing);

    // Reset
    setTitle('');
    setDescription('');
    setPrice('');
    setLocation('');
    setMediaUrl('');
    setIsModalOpen(false);
  };

  const handleSendContact = (e: React.FormEvent) => {
    e.preventDefault();
    setContactSent(true);
    setTimeout(() => {
      setContactListing(null);
      setContactMessage('');
      setContactSent(false);
    }, 1500);
  };

  const filteredListings = listings.filter(item => {
    const matchesSearch = item.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          item.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = categoryFilter === 'all' || item.category === categoryFilter;
    const matchesPrice = item.price <= maxPrice;

    return matchesSearch && matchesCategory && matchesPrice;
  });

  return (
    <div className="space-y-6" id="marketplace-container">
      {/* Search, filters & Price bounds */}
      <div className="bg-white p-5 rounded-2xl border border-zinc-100 shadow-sm space-y-4" id="marketplace-filter-card">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-3.5 w-4 h-4 text-zinc-400" />
            <input
              type="text"
              placeholder="Search truck parts, trailer accessories, CB rigs, diesel tools..."
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
            <PlusCircle className="w-4 h-4" />
            <span>List Equipment / Rig Parts</span>
          </button>
        </div>

        {/* Categories filters scroll list & Max Price Range */}
        <div className="flex flex-wrap items-center justify-between gap-4 pt-2 border-t border-zinc-50">
          <div className="flex items-center space-x-1.5 overflow-x-auto pb-1 scrollbar-none">
            {[
              { id: 'all', label: 'All Gear' },
              { id: 'parts', label: 'Rig Parts' },
              { id: 'equipment', label: 'Safety Gears' },
              { id: 'truck', label: 'Tractors / Trucks' },
              { id: 'trailer', label: 'Trailers' },
              { id: 'service', label: 'Lanes Jobs' }
            ].map(c => (
              <button
                key={c.id}
                onClick={() => setCategoryFilter(c.id)}
                className={`px-3 py-1 text-[11px] font-bold rounded-lg border transition-all shrink-0 ${
                  categoryFilter === c.id
                    ? 'bg-amber-500 border-amber-500 text-slate-950 shadow-sm'
                    : 'bg-white border-zinc-200 text-zinc-500 hover:bg-zinc-50'
                }`}
              >
                {c.label}
              </button>
            ))}
          </div>

          {/* Price Cap Slide */}
          <div className="flex items-center space-x-3 text-xs w-full sm:w-auto">
            <span className="text-zinc-500 font-medium shrink-0">Max Price:</span>
            <input
              type="range"
              min="100"
              max="25000"
              step="100"
              value={maxPrice}
              onChange={(e) => setMaxPrice(parseInt(e.target.value))}
              className="w-32 h-1 bg-zinc-200 rounded-lg appearance-none cursor-pointer accent-slate-900"
            />
            <span className="font-bold text-slate-900 shrink-0">${maxPrice.toLocaleString()}</span>
          </div>
        </div>
      </div>

      {/* EQUIPMENT SELL LISTING CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5" id="listings-grid">
        {filteredListings.length === 0 ? (
          <div className="col-span-full bg-white rounded-2xl border border-zinc-100 p-12 text-center text-zinc-500">
            <Tag className="w-12 h-12 text-zinc-300 mx-auto mb-3" />
            <p className="font-semibold text-slate-800">No diesel parts or equipment found</p>
            <p className="text-xs mt-1">Try resetting your price slider or query keywords.</p>
          </div>
        ) : (
          filteredListings.map(listing => (
            <div 
              key={listing.id} 
              className="bg-white rounded-2xl border border-zinc-100 shadow-sm hover:shadow-md transition-all overflow-hidden flex flex-col justify-between"
              id={`listing-card-${listing.id}`}
            >
              <div>
                {/* Photo Header */}
                <div className="relative h-44 bg-zinc-100 border-b border-zinc-50">
                  <img src={listing.mediaUrl} className="w-full h-full object-cover" alt={listing.title} referrerPolicy="no-referrer" />
                  <span className="absolute top-3 right-3 bg-slate-900/95 backdrop-blur-sm text-amber-500 font-extrabold px-3 py-1 rounded-full text-xs shadow-sm">
                    ${listing.price.toLocaleString()}
                  </span>
                  
                  {/* Condition sticker */}
                  <span className={`absolute bottom-3 left-3 px-2 py-0.5 rounded text-[10px] font-bold uppercase shadow-sm border ${
                    listing.condition === 'new' 
                      ? 'bg-emerald-500 text-white border-emerald-500' 
                      : listing.condition === 'refurbished'
                        ? 'bg-purple-500 text-white border-purple-500'
                        : 'bg-amber-100 text-amber-800 border-amber-200'
                  }`}>
                    {listing.condition}
                  </span>
                </div>

                {/* Listing Core details */}
                <div className="p-4 space-y-1.5">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-amber-600 block">{listing.category}</span>
                  <h4 className="font-bold text-slate-900 text-sm leading-snug truncate">{listing.title}</h4>
                  <p className="text-zinc-600 text-xs font-normal leading-relaxed line-clamp-3">
                    {listing.description}
                  </p>
                </div>
              </div>

              {/* Location, seller & Contact details */}
              <div className="p-4 pt-0 space-y-3">
                <div className="flex items-center text-zinc-400 text-xs border-t border-zinc-50 pt-3">
                  <MapPin className="w-3.5 h-3.5 mr-1 shrink-0" />
                  <span className="truncate text-[11px]">{listing.location}</span>
                </div>

                {/* Seller section with Contact trigger */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <img src={listing.seller.avatarUrl} className="w-6 h-6 rounded-full object-cover" alt="seller" />
                    <span className="text-[10px] text-zinc-500 font-medium truncate max-w-[80px]">@{listing.seller.username}</span>
                  </div>

                  <button
                    id={`contact-seller-${listing.id}`}
                    onClick={() => setContactListing(listing)}
                    className="flex items-center space-x-1 px-3 py-1.5 bg-amber-500 hover:bg-amber-600 active:bg-amber-700 text-slate-950 font-extrabold rounded-lg text-[10px] uppercase tracking-wide transition-colors shadow-sm"
                  >
                    <MessageSquare className="w-3 h-3" />
                    <span>Contact Seller</span>
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* CREATE NEW LISTING MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4" id="listing-modal">
          <div className="w-full max-w-md bg-white rounded-2xl shadow-xl overflow-hidden border border-zinc-100 max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-100 bg-zinc-50">
              <h3 className="text-base font-bold text-slate-900">List Commercial Equipment</h3>
              <button 
                id="close-listing-modal"
                onClick={() => setIsModalOpen(false)} 
                className="text-zinc-400 hover:text-slate-900 p-1 rounded-full hover:bg-zinc-100 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateListing} className="p-6 space-y-4 overflow-y-auto flex-1">
              {/* Category */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-zinc-500 mb-2">Listing Category</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as any)}
                  className="w-full px-4 py-2.5 rounded-xl border border-zinc-200 focus:outline-none focus:ring-2 focus:ring-amber-500 text-xs text-slate-800 bg-white"
                >
                  <option value="parts">Rig Parts / Interior Gear</option>
                  <option value="equipment">Truck Accessories & Safety</option>
                  <option value="truck">Commercial Truck (Cab)</option>
                  <option value="trailer">Utility/Reefer Trailers</option>
                  <option value="service">Services / Contract Jobs</option>
                </select>
              </div>

              {/* Title */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-zinc-500 mb-2">Item Title</label>
                <input
                  required
                  type="text"
                  placeholder="e.g. Chrome Exhaust stacks, Cobra CB radio, 10-Tire Cascadia casings"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-zinc-200 focus:outline-none focus:ring-2 focus:ring-amber-500 text-xs text-slate-800"
                />
              </div>

              {/* Condition / Price row */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-zinc-500 mb-2">Condition</label>
                  <select
                    value={condition}
                    onChange={(e) => setCondition(e.target.value as any)}
                    className="w-full px-4 py-2.5 rounded-xl border border-zinc-200 focus:outline-none focus:ring-2 focus:ring-amber-500 text-xs text-slate-800 bg-white"
                  >
                    <option value="new">Brand New</option>
                    <option value="used">Used / Good casing</option>
                    <option value="refurbished">Refurbished</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-zinc-500 mb-2">Price ($)</label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-3 w-4 h-4 text-zinc-400" />
                    <input
                      required
                      type="number"
                      placeholder="e.g. 450"
                      value={price}
                      onChange={(e) => setPrice(e.target.value)}
                      className="w-full pl-8 pr-4 py-2.5 rounded-xl border border-zinc-200 focus:outline-none focus:ring-2 focus:ring-amber-500 text-xs text-slate-800"
                    />
                  </div>
                </div>
              </div>

              {/* Location */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-zinc-500 mb-2">Seller Location (City/State)</label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-3 w-4 h-4 text-zinc-400" />
                  <input
                    required
                    type="text"
                    placeholder="e.g. Salt Lake City, UT (Can ship)"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-zinc-200 focus:outline-none focus:ring-2 focus:ring-amber-500 text-xs text-slate-800"
                  />
                </div>
              </div>

              {/* Photo Select */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-zinc-500 mb-2">Select Preset Stock Image URL (Simulated)</label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { name: 'CB radio', url: 'https://images.unsplash.com/photo-1594897030264-ab7d87efc473?auto=format&fit=crop&q=80&w=400' },
                    { name: 'Tires', url: 'https://images.unsplash.com/photo-1578844251758-2f71da64c96f?auto=format&fit=crop&q=80&w=400' },
                    { name: 'Dry van', url: 'https://images.unsplash.com/photo-1516594798947-e65505dbb29d?auto=format&fit=crop&q=80&w=400' }
                  ].map((preset, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setMediaUrl(preset.url)}
                      className={`text-[10px] font-semibold py-1 px-2 border rounded-lg transition-all ${
                        mediaUrl === preset.url ? 'bg-amber-500 text-slate-950 border-amber-500' : 'bg-white text-zinc-600 hover:bg-zinc-50'
                      }`}
                    >
                      {preset.name}
                    </button>
                  ))}
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-zinc-500 mb-2">Item Specifications / Details</label>
                <textarea
                  placeholder="Provide casing info, model numbers, voltage support, freight parameters..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={3}
                  className="w-full px-4 py-3 rounded-xl border border-zinc-200 focus:outline-none focus:ring-2 focus:ring-amber-500 text-xs text-slate-800"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-slate-900 hover:bg-slate-800 active:bg-slate-950 text-white font-bold rounded-xl transition-all text-xs shadow-md mt-2"
              >
                Launch Marketplace Listing
              </button>
            </form>
          </div>
        </div>
      )}

      {/* CONTACT SELLER DIALOG */}
      {contactListing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4" id="contact-seller-modal">
          <div className="w-full max-w-sm bg-white rounded-2xl shadow-xl overflow-hidden border border-zinc-100 p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-zinc-50 pb-3">
              <h3 className="text-sm font-bold text-slate-900">Contact {contactListing.seller.displayName}</h3>
              <button 
                id="close-contact-modal"
                onClick={() => setContactListing(null)} 
                className="text-zinc-400 hover:text-slate-900 p-1 rounded-full hover:bg-zinc-100"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {contactSent ? (
              <div className="py-6 text-center space-y-2">
                <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-2">
                  <Check className="w-6 h-6 stroke-[3px]" />
                </div>
                <p className="text-sm font-bold text-slate-900">Message Broadcasted!</p>
                <p className="text-xs text-zinc-500">Secure connection created on driver chat board.</p>
              </div>
            ) : (
              <form onSubmit={handleSendContact} className="space-y-4">
                <div className="p-3 bg-zinc-50 rounded-xl flex items-center space-x-3 border border-zinc-100">
                  <img src={contactListing.mediaUrl} className="w-12 h-12 object-cover rounded-lg" alt="" />
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-slate-900 truncate">{contactListing.title}</p>
                    <p className="text-xs text-amber-600 font-extrabold">${contactListing.price.toLocaleString()}</p>
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-zinc-500 mb-1.5">Secure Driver Message</label>
                  <textarea
                    required
                    rows={3}
                    placeholder="Is this exhaust casing still available? I can take it this Thursday during my rest restart at Laramie..."
                    value={contactMessage}
                    onChange={(e) => setContactMessage(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-zinc-200 focus:outline-none focus:ring-2 focus:ring-amber-500 text-xs text-slate-800"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl text-xs transition-all shadow-md"
                >
                  Send Driver Board Ping
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
