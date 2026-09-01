import React, { useState } from 'react';
import { Search } from 'lucide-react';

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
    <div className="max-w-6xl mx-auto bg-[#FFFFFF] border border-[#DDE2DD] rounded-md p-6 select-none shadow-2xs">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5 pb-4 border-b border-[#DDE2DD]">
        <div>
          <h2 className="text-[20px] font-semibold text-[#17201C] m-0">
            Apparatus Fleet Roster
          </h2>
          <div className="text-[13px] text-[#5D6862] mt-0.5">
            {responders.length} units registered with Automatic Vehicle Location (AVL) telemetry
          </div>
        </div>

        {/* Status Counts */}
        <div className="flex items-center gap-3 text-[12px] flex-wrap">
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-[#F5F6F3] border border-[#DDE2DD]">
            <span className="w-2 h-2 rounded-full bg-[#237A4B]" />
            <span className="font-semibold text-[#17201C]">{avail}</span>
            <span className="text-[#5D6862]">Available</span>
          </div>
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-[#F5F6F3] border border-[#DDE2DD]">
            <span className="w-2 h-2 rounded-full bg-[#2864C7]" />
            <span className="font-semibold text-[#17201C]">{enRoute}</span>
            <span className="text-[#5D6862]">En route</span>
          </div>
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-[#F5F6F3] border border-[#DDE2DD]">
            <span className="w-2 h-2 rounded-full bg-[#B8620A]" />
            <span className="font-semibold text-[#17201C]">{onScene}</span>
            <span className="text-[#5D6862]">On scene</span>
          </div>
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-[#F5F6F3] border border-[#DDE2DD]">
            <span className="w-2 h-2 rounded-full bg-[#7A8280]" />
            <span className="font-semibold text-[#17201C]">{unavail}</span>
            <span className="text-[#5D6862]">Offline</span>
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
                  ? 'bg-[#164E3D] text-white'
                  : 'bg-[#F5F6F3] text-[#5D6862] hover:bg-[#E6EAE5]'
              }`}
            >
              {t === 'ALL' ? 'All apparatus' : t}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2 px-3 py-1.5 rounded bg-[#F5F6F3] border border-[#DDE2DD] focus-within:border-[#164E3D] text-[13px] w-full sm:w-64">
          <Search className="w-3.5 h-3.5 text-[#7B847F]" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Filter callsign or status..."
            className="bg-transparent outline-none flex-1 text-[#17201C] placeholder-[#7B847F]"
          />
        </div>
      </div>

      {/* Apparatus Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-[13px] border-collapse">
          <thead>
            <tr className="border-b border-[#DDE2DD] text-[11.5px] text-[#7B847F] font-semibold uppercase tracking-wider">
              <th className="py-2.5 px-3">Apparatus ID</th>
              <th className="py-2.5 px-3">Type</th>
              <th className="py-2.5 px-3">Status</th>
              <th className="py-2.5 px-3">Station / Zone</th>
              <th className="py-2.5 px-3">Telemetry / GPS</th>
              <th className="py-2.5 px-3">Current assignment</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(r => {
              const statusColor =
                r.status === 'AVAILABLE' ? '#237A4B' :
                r.status === 'EN_ROUTE' ? '#2864C7' :
                r.status === 'ON_SCENE' ? '#B8620A' : '#7A8280';

              return (
                <tr key={r._id || r.unitId} className="border-b border-[#E6EAE5] hover:bg-[#F5F6F3] transition-colors">
                  <td className="py-3 px-3 font-mono font-bold text-[#17201C]">
                    {r.unitId}
                  </td>
                  <td className="py-3 px-3 font-medium text-[#17201C]">
                    {r.type}
                  </td>
                  <td className="py-3 px-3">
                    <div className="flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full" style={{ background: statusColor }} />
                      <span className="font-semibold text-[12.5px]" style={{ color: statusColor }}>
                        {r.status}
                      </span>
                    </div>
                  </td>
                  <td className="py-3 px-3 text-[#5D6862]">
                    {r.station || 'Vadodara Central Stn'}
                  </td>
                  <td className="py-3 px-3 font-mono text-[11.5px] text-[#7B847F]">
                    {r.currentLocation ? `${r.currentLocation.lat.toFixed(4)}, ${r.currentLocation.lng.toFixed(4)}` : 'AVL Active'}
                  </td>
                  <td className="py-3 px-3 text-[#5D6862]">
                    {r.currentIncident ? (
                      <span className="font-mono text-[#164E3D] font-semibold">Incident #{r.currentIncident}</span>
                    ) : (
                      <span className="text-[#7B847F] italic">Unassigned</span>
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
