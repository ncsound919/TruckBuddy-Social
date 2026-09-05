import React, { useState } from 'react';
import { Calculator } from 'lucide-react';

interface IftaRow {
  id: string;
  state: string;
  taxRate: number;
  miles: number;
  gallonsPurchased: number;
}

const STATE_IFTA_RATES: Record<string, number> = {
  'CA': 0.945, 'PA': 0.785, 'IL': 0.730, 'IN': 0.590, 'OH': 0.470,
  'NY': 0.448, 'NC': 0.404, 'TX': 0.200, 'GA': 0.352, 'FL': 0.370,
  'MI': 0.485, 'WI': 0.329, 'IA': 0.325, 'MO': 0.245, 'TN': 0.270,
  'WY': 0.240, 'CO': 0.205, 'UT': 0.364, 'AZ': 0.260, 'NV': 0.270,
  'OR': 0.400, 'WA': 0.494
};

export function IftaCalculator() {
  const [iftaRows, setIftaRows] = useState<IftaRow[]>([
    { id: '1', state: 'IL', taxRate: STATE_IFTA_RATES['IL'], miles: 420, gallonsPurchased: 80 },
    { id: '2', state: 'IN', taxRate: STATE_IFTA_RATES['IN'], miles: 280, gallonsPurchased: 50 },
    { id: '3', state: 'OH', taxRate: STATE_IFTA_RATES['OH'], miles: 340, gallonsPurchased: 65 },
    { id: '4', state: 'PA', taxRate: STATE_IFTA_RATES['PA'], miles: 360, gallonsPurchased: 0 }
  ]);

  const totalIftaMiles = iftaRows.reduce((sum, r) => sum + (Number(r.miles) || 0), 0);
  const totalIftaGallonsPurchased = iftaRows.reduce((sum, r) => sum + (Number(r.gallonsPurchased) || 0), 0);
  const fleetIftaMpg = totalIftaGallonsPurchased > 0 ? (totalIftaMiles / totalIftaGallonsPurchased) : 6.5;

  const iftaCalculations = iftaRows.map(row => {
    const miles = Number(row.miles) || 0;
    const gallonsPurchased = Number(row.gallonsPurchased) || 0;
    const taxableGallons = fleetIftaMpg > 0 ? (miles / fleetIftaMpg) : 0;
    const taxDue = taxableGallons * row.taxRate;
    const taxPaid = gallonsPurchased * row.taxRate;
    const netTax = taxDue - taxPaid;
    return { ...row, taxableGallons, taxDue, taxPaid, netTax };
  });

  const totalIftaNetTax = iftaCalculations.reduce((sum, r) => sum + r.netTax, 0);

  const handleAddIftaRow = () => {
    const newId = String(Date.now());
    setIftaRows(prev => [...prev, { id: newId, state: 'TX', taxRate: STATE_IFTA_RATES['TX'], miles: 250, gallonsPurchased: 40 }]);
  };

  const handleRemoveIftaRow = (id: string) => {
    setIftaRows(prev => prev.filter(r => r.id !== id));
  };

  return (
    <div className="bg-white p-6 rounded-2xl border border-zinc-100 shadow-sm space-y-6 animate-in fade-in duration-300">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-zinc-100 pb-4">
        <div>
          <h3 className="text-sm font-black text-slate-900">IFTA Quarterly Fuel Tax Calculation Matrix</h3>
          <p className="text-xs text-zinc-500">Calculates taxable gallons, tax paid at the pump, and net tax owed / refund.</p>
        </div>
        <div className="flex items-center space-x-3">
          <span className="text-xs font-bold text-slate-700">Fleet MPG: <strong>{fleetIftaMpg.toFixed(2)}</strong></span>
          <button
            onClick={handleAddIftaRow}
            className="px-3 py-1.5 bg-slate-900 text-white rounded-xl text-xs font-black uppercase tracking-wider hover:bg-slate-800 transition"
          >
            + Add State
          </button>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="border-b border-zinc-200 text-zinc-400 font-bold uppercase text-[10px]">
              <th className="pb-3">State</th>
              <th className="pb-3">Rate</th>
              <th className="pb-3">Miles</th>
              <th className="pb-3">Gals Bought</th>
              <th className="pb-3">Taxable Gals</th>
              <th className="pb-3">Tax Paid</th>
              <th className="pb-3">Net Due</th>
              <th className="pb-3"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-100">
            {iftaCalculations.map((row) => (
              <tr key={row.id} className="hover:bg-zinc-50">
                <td className="py-2.5 font-black text-slate-900">
                  <select
                    value={row.state}
                    onChange={(e) => {
                      const newState = e.target.value;
                      setIftaRows(prev => prev.map(r => r.id === row.id ? { ...r, state: newState, taxRate: STATE_IFTA_RATES[newState] || 0.30 } : r));
                    }}
                    className="font-bold border border-zinc-200 rounded px-1.5 py-1 bg-white"
                  >
                    {Object.keys(STATE_IFTA_RATES).map(st => <option key={st} value={st}>{st}</option>)}
                  </select>
                </td>
                <td className="py-2.5 text-zinc-600">${row.taxRate.toFixed(3)}/gal</td>
                <td className="py-2.5">
                  <input
                    type="number" value={row.miles}
                    onChange={(e) => {
                      const val = parseFloat(e.target.value) || 0;
                      setIftaRows(prev => prev.map(r => r.id === row.id ? { ...r, miles: val } : r));
                    }}
                    className="w-20 px-2 py-1 border border-zinc-200 rounded font-bold"
                  />
                </td>
                <td className="py-2.5">
                  <input
                    type="number" value={row.gallonsPurchased}
                    onChange={(e) => {
                      const val = parseFloat(e.target.value) || 0;
                      setIftaRows(prev => prev.map(r => r.id === row.id ? { ...r, gallonsPurchased: val } : r));
                    }}
                    className="w-20 px-2 py-1 border border-zinc-200 rounded font-bold"
                  />
                </td>
                <td className="py-2.5 text-zinc-600 font-bold">{row.taxableGallons.toFixed(1)}</td>
                <td className="py-2.5 text-zinc-600">${row.taxPaid.toFixed(2)}</td>
                <td className={`py-2.5 font-black ${row.netTax > 0 ? 'text-red-600' : 'text-emerald-600'}`}>
                  {row.netTax > 0 ? `+$${row.netTax.toFixed(2)}` : `-$${Math.abs(row.netTax).toFixed(2)}`}
                </td>
                <td className="py-2.5">
                  <button onClick={() => handleRemoveIftaRow(row.id)} className="text-zinc-400 hover:text-red-600 font-black px-1">✕</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="bg-slate-900 text-white p-5 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-[10px] uppercase font-bold text-zinc-400 block">Total IFTA Quarter Summary</span>
          <p className="text-xs text-zinc-300">Total Miles: <strong>{totalIftaMiles.toLocaleString()}</strong> • Fuel: <strong>{totalIftaGallonsPurchased.toLocaleString()} gals</strong></p>
        </div>
        <div className="text-right">
          <span className="text-[10px] uppercase font-bold text-zinc-400 block">Net Quarterly IFTA Tax Position</span>
          <strong className={`text-2xl font-black ${totalIftaNetTax > 0 ? 'text-red-400' : 'text-emerald-400'}`}>
            {totalIftaNetTax > 0 ? `Owe $${totalIftaNetTax.toFixed(2)}` : `Refund $${Math.abs(totalIftaNetTax).toFixed(2)}`}
          </strong>
        </div>
      </div>
    </div>
  );
}
