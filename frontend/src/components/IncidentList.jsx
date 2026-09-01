import React, { useState } from 'react';
import {
  Search,
  Plus,
  Filter,
} from 'lucide-react';

const SEVERITY_CONFIG = {
  CRITICAL: { label: 'CRITICAL', text: '#C62828', bg: '#FFEBEE', line: '#C62828' },
  HIGH: { label: 'HIGH', text: '#B8620A', bg: '#FFF3E0', line: '#B8620A' },
  MEDIUM: { label: 'STANDARD', text: '#2864C7', bg: '#E8F0FE', line: '#2864C7' },
  LOW: { label: 'LOW', text: '#237A4B', bg: '#E8F5E9', line: '#237A4B' },
};

const STATUS_NAMES = {
  REPORTED: 'Reported',
  ANALYZED: 'Triaged',
  DISPATCHED: 'Dispatched',
  EN_ROUTE: 'En route',
  ARRIVED: 'On scene',
  RESOLVED: 'Cleared',
};

const formatElapsedTime = (timestamp) => {
  if (!timestamp) return 'Just now';
  const mins = Math.floor((Date.now() - new Date(timestamp).getTime()) / 60000);
  if (mins < 1) return 'Just now';
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  return `${hours}h ${mins % 60}m ago`;
};

export const IncidentList = ({
  incidents = [],
  selectedIncidentId,
  onSelectIncident,
  onNewIncident,
}) => {
  const [activeTab, setActiveTab] = useState('ACTIVE');
  const [search, setSearch] = useState('');

  const filtered = incidents.filter(inc => {
    const isResolved = inc.status === 'RESOLVED';
    const matchesTab = activeTab === 'ACTIVE' ? !isResolved : isResolved;

    if (!matchesTab) return false;
    if (!search.trim()) return true;

    const query = search.toLowerCase();
    return (
      (inc.type || '').toLowerCase().includes(query) ||
      (inc.location?.address || '').toLowerCase().includes(query) ||
      (inc.incidentId || '').toLowerCase().includes(query)
    );
  });

  const activeCount = incidents.filter(i => i.status !== 'RESOLVED').length;
  const resolvedCount = incidents.filter(i => i.status === 'RESOLVED').length;

  return (
    <div className="flex flex-col h-full bg-[#FFFFFF] border-r border-[#DDE2DD] w-full select-none">
      {/* List Header */}
      <div className="p-3.5 border-b border-[#DDE2DD] bg-[#FFFFFF]">
        {/* Title & Action Row */}
        <div className="flex items-center justify-between mb-2.5">
          <div className="flex items-center gap-2">
            <h2 className="text-[17px] font-bold text-[#17201C] m-0 tracking-tight">
              Active Incidents
            </h2>
            <span className="text-[11.5px] font-bold px-2 py-0.5 rounded bg-[#F0F2EF] text-[#164E3D] font-mono">
              {activeCount}
            </span>
          </div>

          {onNewIncident && (
            <button
              onClick={onNewIncident}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded text-[12px] font-semibold bg-[#164E3D] text-white hover:bg-[#0F392D] transition-colors cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Intake</span>
            </button>
          )}
        </div>

        {/* Search Input */}
        <div className="relative mb-2.5">
          <Search className="w-3.5 h-3.5 text-[#7B847F] absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search incident, location, or ID..."
            className="w-full bg-[#F0F2EF] border border-[#DDE2DD] text-[13px] text-[#17201C] placeholder-[#7B847F] rounded pl-8 pr-7 py-1.5 outline-none focus:border-[#164E3D] transition-colors"
          />
          {search && (
            <button
              onClick={() => setSearch('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[11px] text-[#7B847F] hover:text-[#17201C] cursor-pointer"
            >
              ✕
            </button>
          )}
        </div>

        {/* Queue Filter Tabs */}
        <div className="flex items-center gap-1">
          <button
            onClick={() => setActiveTab('ACTIVE')}
            className={`px-3 py-1 rounded text-[12px] font-medium transition-colors cursor-pointer whitespace-nowrap ${
              activeTab === 'ACTIVE'
                ? 'bg-[#164E3D] text-white font-semibold'
                : 'bg-[#F0F2EF] text-[#5D6862] hover:bg-[#E6EAE5] hover:text-[#17201C]'
            }`}
          >
            Active ({activeCount})
          </button>
          <button
            onClick={() => setActiveTab('RESOLVED')}
            className={`px-3 py-1 rounded text-[12px] font-medium transition-colors cursor-pointer whitespace-nowrap ${
              activeTab === 'RESOLVED'
                ? 'bg-[#164E3D] text-white font-semibold'
                : 'bg-[#F0F2EF] text-[#5D6862] hover:bg-[#E6EAE5] hover:text-[#17201C]'
            }`}
          >
            Cleared ({resolvedCount})
          </button>
        </div>
      </div>

      {/* Incident List Feed */}
      <div className="flex-1 overflow-y-auto divide-y divide-[#E6EAE5] bg-[#FFFFFF]">
        {filtered.length === 0 ? (
          <div className="h-48 flex flex-col items-center justify-center p-4 text-center">
            <Filter className="w-5 h-5 text-[#7B847F] mb-2" />
            <div className="text-[14px] font-medium text-[#17201C] mb-1">
              No matching incidents
            </div>
            <p className="text-[12.5px] text-[#5D6862] max-w-xs m-0 leading-relaxed">
              {search ? 'Try adjusting your search query.' : 'All operational response queues are clear.'}
            </p>
          </div>
        ) : (
          filtered.map(inc => {
            const isSelected = selectedIncidentId === inc.incidentId;
            const isResolved = inc.status === 'RESOLVED';
            const sevConfig = SEVERITY_CONFIG[inc.priority] || SEVERITY_CONFIG.MEDIUM;
            const statusText = STATUS_NAMES[inc.status] || inc.status;
            const assignedUnit = inc.assignedResponders?.[0];
            const timeAgo = formatElapsedTime(inc.createdAt);

            return (
              <div
                key={inc._id}
                onClick={() => onSelectIncident(inc.incidentId)}
                className={`p-3 transition-colors duration-150 cursor-pointer border-b border-[#E6EAE5] relative ${
                  isSelected
                    ? 'bg-[#F0F2EF] border-l-[3px] border-l-[#164E3D]'
                    : 'bg-[#FFFFFF] hover:bg-[#F5F6F3] border-l-[3px]'
                }`}
                style={{
                  borderLeftColor: isSelected
                    ? '#164E3D'
                    : isResolved
                    ? '#7A8280'
                    : sevConfig.line,
                }}
              >
                {/* Header Row: Type + Case ID + Priority Badge */}
                <div className="flex items-center justify-between gap-2 mb-1">
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="text-[14px] font-bold text-[#17201C] truncate">
                      {inc.type}
                    </span>
                    <span className="text-[11.5px] font-mono text-[#7B847F] shrink-0">
                      #{inc.incidentId}
                    </span>
                  </div>

                  <span
                    className="text-[10.5px] font-bold px-1.5 py-0.5 rounded shrink-0 uppercase tracking-wide"
                    style={{ background: sevConfig.bg, color: sevConfig.text }}
                  >
                    {sevConfig.label}
                  </span>
                </div>

                {/* Address Row */}
                <div className="text-[12.5px] font-medium text-[#17201C] truncate mb-1">
                  {inc.location?.address}
                </div>

                {/* Metadata & Status Row */}
                <div className="flex items-center justify-between text-[11.5px] text-[#5D6862] font-mono">
                  <div className="flex items-center gap-1.5">
                    <span className="font-semibold" style={{ color: isResolved ? '#7A8280' : sevConfig.text }}>
                      {statusText}
                    </span>
                    <span>·</span>
                    <span>{timeAgo}</span>
                    {inc.victimsCount > 0 && (
                      <>
                        <span>·</span>
                        <span className="text-[#C62828] font-semibold">{inc.victimsCount} casualties</span>
                      </>
                    )}
                  </div>

                  {assignedUnit && (
                    <span className="font-semibold text-[#164E3D] bg-[#E8F0EC] px-1.5 py-0.5 rounded">
                      {assignedUnit.unitId}
                    </span>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default IncidentList;
