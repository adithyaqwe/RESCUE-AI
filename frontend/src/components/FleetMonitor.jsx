import React, { useState } from 'react';
import { Search } from 'lucide-react';

const TYPE_CONFIG = {
  Ambulance: { label: '108 Ambulance', color: '#0284C7' },
  Fire: { label: 'VMC Fire Tender', color: '#BA1A1A' },
  Police: { label: '112 PCR Patrol', color: '#334155' },
  Medical: { label: 'Mobile Clinic', color: '#19483A' },
};

const STATUS_CONFIG = {
  AVAILABLE: { label: 'Available', dot: '#167A39' },
  EN_ROUTE: { label: 'En route', dot: '#1D4ED8' },
  ON_SCENE: { label: 'On scene', dot: '#B45309' },
  UNAVAILABLE: { label: 'Offline', dot: '#78828C' },
};

export const FleetMonitor = ({ responders = [] }) => {
  const [filterType, setFilterType] = useState('ALL');
  const [search, setSearch] = useState('');

  const avail = responders.filter(r => r.status === 'AVAILABLE').length;
  const enRoute = responders.filter(r => r.status === 'EN_ROUTE').length;
  const onScene = responders.filter(r => r.status === 'ON_SCENE').length;
  const unavail = responders.filter(r => r.status === 'UNAVAILABLE').length;

  const filtered = responders.filter(r => {
    const matchType = filterType === 'ALL' || r.type === filterType;
    const matchSearch =
      !search ||
      (r.unitId || '').toLowerCase().includes(search.toLowerCase()) ||
      (r.type || '').toLowerCase().includes(search.toLowerCase()) ||
      (r.status || '').toLowerCase().includes(search.toLowerCase());
    return matchType && matchSearch;
  });

  return (
    <div className="max-w-6xl mx-auto bg-[#FFFFFF] border border-[#E2E5DF] rounded-md p-6 select-none shadow-2xs">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5 pb-4 border-b border-[#E2E5DF]">
        <div>
          <h2 className="text-[20px] font-semibold text-[#111417] m-0">
            Apparatus Fleet Roster
          </h2>
          <div className="text-[13px] text-[#78828C] mt-0.5">
            {responders.length} units registered with Automatic Vehicle Location (AVL) telemetry
          </div>
        </div>

        {/* Status Counts */}
        <div className="flex items-center gap-3 text-[12px] flex-wrap">
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-[#F6F7F5] border border-[#E2E5DF]">
            <span className="w-2 h-2 rounded-full bg-[#167A39]" />
            <span className="font-semibold text-[#111417]">{avail}</span>
            <span className="text-[#78828C]">Available</span>
          </div>
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-[#F6F7F5] border border-[#E2E5DF]">
            <span className="w-2 h-2 rounded-full bg-[#1D4ED8]" />
            <span className="font-semibold text-[#111417]">{enRoute}</span>
            <span className="text-[#78828C]">En route</span>
          </div>
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-[#F6F7F5] border border-[#E2E5DF]">
            <span className="w-2 h-2 rounded-full bg-[#B45309]" />
            <span className="font-semibold text-[#111417]">{onScene}</span>
            <span className="text-[#78828C]">On scene</span>
          </div>
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-[#F6F7F5] border border-[#E2E5DF]">
            <span className="w-2 h-2 rounded-full bg-[#78828C]" />
            <span className="font-semibold text-[#111417]">{unavail}</span>
            <span className="text-[#78828C]">Offline</span>
          </div>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
        <div className="flex items-center gap-1.5 overflow-x-auto">
          {['ALL', 'Ambulance', 'Fire', 'Police', 'Medical'].map(t => (
            <button
              key={t}
              onClick={() => setFilterType(t)}
              className={`px-3 py-1 rounded text-[12.5px] font-medium transition-colors cursor-pointer ${
                filterType === t
                  ? 'bg-[#19483A] text-white'
                  : 'bg-[#F6F7F5] text-[#475059] hover:bg-[#E8EBE6]'
              }`}
            >
              {t === 'ALL' ? 'All apparatus' : t}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2 px-3 py-1.5 rounded bg-[#F6F7F5] border border-[#E2E5DF] focus-within:border-[#19483A] text-[13px] w-full sm:w-64">
          <Search className="w-3.5 h-3.5 text-[#78828C]" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Filter callsign or status..."
            className="bg-transparent outline-none flex-1 text-[#111417] placeholder-[#78828C]"
          />
        </div>
      </div>

      {/* Structured Fleet Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-[13px] border-collapse">
          <thead>
            <tr className="border-b border-[#E2E5DF] text-[11.5px] text-[#78828C] uppercase font-semibold tracking-wider">
              <th className="py-2.5 px-3">Apparatus ID</th>
              <th className="py-2.5 px-3">Type</th>
              <th className="py-2.5 px-3">Status</th>
              <th className="py-2.5 px-3">Location / GPS</th>
              <th className="py-2.5 px-3">Radio</th>
              <th className="py-2.5 px-3">Assignment</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(r => {
              const typeCfg = TYPE_CONFIG[r.type] || TYPE_CONFIG.Ambulance;
              const statCfg = STATUS_CONFIG[r.status] || STATUS_CONFIG.AVAILABLE;

              return (
                <tr key={r._id} className="border-b border-[#EAECE8] hover:bg-[#F9FAF8] transition-colors">
                  {/* Apparatus ID */}
                  <td className="py-2.5 px-3 font-mono font-semibold text-[#111417]">
                    {r.unitId}
                  </td>

                  {/* Type */}
                  <td className="py-2.5 px-3">
                    <span className="font-medium text-[#111417]">{typeCfg.label}</span>
                  </td>

                  {/* Status with small dot indicator */}
                  <td className="py-2.5 px-3">
                    <div className="flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full" style={{ background: statCfg.dot }} />
                      <span className="text-[#475059] font-medium">{statCfg.label}</span>
                    </div>
                  </td>

                  {/* Location / GPS */}
                  <td className="py-2.5 px-3 text-[#475059] font-mono text-[12px]">
                    {r.currentLocation ? (
                      <span>
                        {r.currentLocation.lat.toFixed(4)}° N, {r.currentLocation.lng.toFixed(4)}° E
                      </span>
                    ) : (
                      <span className="text-[#78828C]">Station 04 Quarters</span>
                    )}
                  </td>

                  {/* Radio */}
                  <td className="py-2.5 px-3 text-[#78828C] font-mono text-[12px]">
                    TG-{r.unitId.replace(/[^0-9]/g, '').slice(-3) || '104'}
                  </td>

                  {/* Assignment */}
                  <td className="py-2.5 px-3">
                    {r.currentIncidentId ? (
                      <span className="font-mono text-[#19483A] font-semibold">
                        #{r.currentIncidentId}
                      </span>
                    ) : (
                      <span className="text-[#78828C]">Unassigned</span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default FleetMonitor;
