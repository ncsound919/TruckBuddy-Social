import React, { useState } from 'react';
import { Fuel } from 'lucide-react';

export function FuelTripCalculator() {
  const [tripMiles, setTripMiles] = useState<number>(1850);
  const [truckMpg, setTruckMpg] = useState<number>(6.8);
  const [dieselPrice, setDieselPrice] = useState<number>(3.89);
  const [tollCost, setTollCost] = useState<number>(145);
  const [driverPayRate, setDriverPayRate] = useState<number>(0.65);
  const [fixedOverheadDay, setFixedOverheadDay] = useState<number>(180);
  const [tripDays, setTripDays] = useState<number>(3);

  const totalDieselGallons = truckMpg > 0 ? tripMiles / truckMpg : 0;
  const totalDieselCost = totalDieselGallons * dieselPrice;
  const defGallons = totalDieselGallons * 0.025;
  const defCost = defGallons * 3.89;
  const driverPayTotal = tripMiles * driverPayRate;
  const fixedOverheadTotal = tripDays * fixedOverheadDay;
  const totalTripCost = totalDieselCost + defCost + tollCost + driverPayTotal + fixedOverheadTotal;
  const costPerMile = tripMiles > 0 ? totalTripCost / tripMiles : 0;
  const recommendedFreightRate = costPerMile * 1.25;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 animate-in fade-in duration-300">
      <div className="lg:col-span-5 bg-white p-6 rounded-2xl border border-zinc-100 shadow-sm space-y-4">
        <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-wider flex items-center gap-1">
          <Fuel className="w-4 h-4 text-zinc-400" /> Trip & Expense Parameters
        </h3>

        <div>
          <label className="block text-[11px] font-bold text-slate-700 mb-1">Total Trip Mileage</label>
          <input
            type="number" value={tripMiles}
            onChange={(e) => setTripMiles(parseFloat(e.target.value) || 0)}
            className="w-full px-3 py-2 rounded-xl border border-zinc-200 text-xs font-bold text-slate-800"
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-[11px] font-bold text-slate-700 mb-1">Truck MPG (Loaded)</label>
            <input
              type="number" step="0.1" value={truckMpg}
              onChange={(e) => setTruckMpg(parseFloat(e.target.value) || 6.5)}
              className="w-full px-3 py-2 rounded-xl border border-zinc-200 text-xs font-bold text-slate-800"
            />
          </div>
          <div>
            <label className="block text-[11px] font-bold text-slate-700 mb-1">Diesel Price ($/gal)</label>
            <input
              type="number" step="0.01" value={dieselPrice}
              onChange={(e) => setDieselPrice(parseFloat(e.target.value) || 3.89)}
              className="w-full px-3 py-2 rounded-xl border border-zinc-200 text-xs font-bold text-slate-800"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-[11px] font-bold text-slate-700 mb-1">Tolls & Scales ($)</label>
            <input
              type="number" value={tollCost}
              onChange={(e) => setTollCost(parseFloat(e.target.value) || 0)}
              className="w-full px-3 py-2 rounded-xl border border-zinc-200 text-xs font-bold text-slate-800"
            />
          </div>
          <div>
            <label className="block text-[11px] font-bold text-slate-700 mb-1">Driver Pay ($/mile)</label>
            <input
              type="number" step="0.01" value={driverPayRate}
              onChange={(e) => setDriverPayRate(parseFloat(e.target.value) || 0)}
              className="w-full px-3 py-2 rounded-xl border border-zinc-200 text-xs font-bold text-slate-800"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-[11px] font-bold text-slate-700 mb-1">Fixed Daily Cost ($/day)</label>
            <input
              type="number" value={fixedOverheadDay}
              onChange={(e) => setFixedOverheadDay(parseFloat(e.target.value) || 0)}
              className="w-full px-3 py-2 rounded-xl border border-zinc-200 text-xs font-bold text-slate-800"
            />
          </div>
          <div>
            <label className="block text-[11px] font-bold text-slate-700 mb-1">Trip Duration (Days)</label>
            <input
              type="number" value={tripDays}
              onChange={(e) => setTripDays(parseFloat(e.target.value) || 1)}
              className="w-full px-3 py-2 rounded-xl border border-zinc-200 text-xs font-bold text-slate-800"
            />
          </div>
        </div>
      </div>

      <div className="lg:col-span-7 bg-white p-6 rounded-2xl border border-zinc-100 shadow-sm space-y-5">
        <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Freight Cost & Breakeven Analysis</h3>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          <div className="p-3.5 bg-zinc-50 rounded-xl border border-zinc-150">
            <span className="text-[10px] font-bold uppercase text-zinc-400 block">Diesel Burn</span>
            <strong className="text-base font-black text-slate-900">${totalDieselCost.toFixed(2)}</strong>
            <span className="text-[10px] text-zinc-500 block">{totalDieselGallons.toFixed(0)} gallons</span>
          </div>

          <div className="p-3.5 bg-zinc-50 rounded-xl border border-zinc-150">
            <span className="text-[10px] font-bold uppercase text-zinc-400 block">DEF Fluid (2.5%)</span>
            <strong className="text-base font-black text-slate-900">${defCost.toFixed(2)}</strong>
            <span className="text-[10px] text-zinc-500 block">{defGallons.toFixed(1)} gallons</span>
          </div>

          <div className="p-3.5 bg-zinc-50 rounded-xl border border-zinc-150">
            <span className="text-[10px] font-bold uppercase text-zinc-400 block">Driver Compensation</span>
            <strong className="text-base font-black text-slate-900">${driverPayTotal.toFixed(2)}</strong>
            <span className="text-[10px] text-zinc-500 block">${driverPayRate}/mile</span>
          </div>
        </div>

        <div className="p-5 bg-slate-900 text-white rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <span className="text-[10px] uppercase font-bold text-zinc-400 block">Total Operational Cost</span>
            <strong className="text-2xl font-black text-amber-400">${totalTripCost.toFixed(2)}</strong>
          </div>
          <div className="text-right">
            <span className="text-[10px] uppercase font-bold text-zinc-400 block">Trip Breakeven CPM</span>
            <strong className="text-2xl font-black text-sky-400">${costPerMile.toFixed(2)} / mile</strong>
          </div>
        </div>

        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl space-y-1">
          <div className="flex items-center justify-between text-xs font-black text-emerald-900 uppercase">
            <span>Recommended Freight Rate (25% Margin)</span>
            <span>${recommendedFreightRate.toFixed(2)} / mile</span>
          </div>
          <p className="text-[11px] text-emerald-700 leading-tight">
            Target a gross revenue of <strong>${(recommendedFreightRate * tripMiles).toFixed(2)}</strong> for this 10-4 profitable run.
          </p>
        </div>
      </div>
    </div>
  );
}
