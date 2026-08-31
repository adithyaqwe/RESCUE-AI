import React, { useState } from 'react';
import type { Incident } from '../api';
import { AlertTriangle, ShieldAlert, CheckCircle, Search, Clock, Target } from 'lucide-react';

interface IncidentListProps {
  incidents: Incident[];
  selectedIncidentId: string | null;
  onSelectIncident: (id: string) => void;
}

const PRIORITY_COLOR: Record<string, string> = {
  CRITICAL: '#E54848',
  HIGH: '#E0A43A',
  MEDIUM: '#4FA3D1',
  LOW: '#45B87A',
};

export const IncidentList: React.FC<IncidentListProps> = ({
  incidents,
  selectedIncidentId,
  onSelectIncident,
}) => {
  const [search, setSearch] = useState('');
  const [priorityFilter, setPriorityFilter] = useState<string>('ALL');
  const [statusFilter, setStatusFilter] = useState<string>('ACTIVE');

  // Filter logic
  const filtered = incidents.filter(inc => {
    const matchesSearch =
      inc.incidentId.toLowerCase().includes(search.toLowerCase()) ||
      inc.description.toLowerCase().includes(search.toLowerCase()) ||
      inc.location.address.toLowerCase().includes(search.toLowerCase()) ||
      inc.type.toLowerCase().includes(search.toLowerCase());

    const matchesPriority = priorityFilter === 'ALL' || inc.priority === priorityFilter;

    const matchesStatus =
      statusFilter === 'ALL' ||
      (statusFilter === 'ACTIVE' && inc.status !== 'RESOLVED') ||
      (statusFilter === 'RESOLVED' && inc.status === 'RESOLVED');

    return matchesSearch && matchesPriority && matchesStatus;
  });

  return (
    <div
      className="flex flex-col hud-bracket"
      style={{
        background: '#0D141C',
        border: '1px solid #243442',
        borderRadius: '6px',
        height: '540px',
        padding: '14px',
      }}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="text-[9px] font-mono tracking-widest" style={{ color: '#8EA2B2' }}>01 //</span>
          <span className="text-xs font-bold tracking-widest uppercase" style={{ color: '#E8F0F5' }}>
            Incident Registry
          </span>
          <span
            className="text-[8px] font-mono px-1.5 py-0.5 rounded-sm"
            style={{ background: '#111B24', border: '1px solid #243442', color: '#8EA2B2' }}
          >
            {filtered.length} RECORDS
          </span>
        </div>
      </div>

      <hr className="hud-divider mb-3" />

      {/* Filters */}
      <div className="space-y-2 mb-3">
        {/* Search */}
        <div
          className="flex items-center gap-2 px-2 py-1 rounded-sm"
          style={{ background: '#111B24', border: '1px solid #243442' }}
        >
          <Search className="w-3.5 h-3.5" style={{ color: '#243442' }} />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search registry..."
            className="bg-transparent text-xs font-mono outline-none flex-1"
            style={{ color: '#E8F0F5' }}
          />
        </div>

        {/* Quick toggles */}
        <div className="grid grid-cols-2 gap-2 text-[9px] font-mono">
          <div>
            <div className="text-[7px] text-[#243442] uppercase mb-0.5">STATUS</div>
            <select
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value)}
              className="w-full bg-[#111B24] border border-[#243442] rounded-sm p-1 text-[10px] outline-none text-[#E8F0F5]"
            >
              <option value="ACTIVE">ACTIVE ONLY</option>
              <option value="RESOLVED">RESOLVED ONLY</option>
              <option value="ALL">ALL CASES</option>
            </select>
          </div>
          <div>
            <div className="text-[7px] text-[#243442] uppercase mb-0.5">PRIORITY</div>
            <select
              value={priorityFilter}
              onChange={e => setPriorityFilter(e.target.value)}
              className="w-full bg-[#111B24] border border-[#243442] rounded-sm p-1 text-[10px] outline-none text-[#E8F0F5]"
            >
              <option value="ALL">ALL URGENCY</option>
              <option value="CRITICAL">CRITICAL</option>
              <option value="HIGH">HIGH</option>
              <option value="MEDIUM">MEDIUM</option>
              <option value="LOW">LOW</option>
            </select>
          </div>
        </div>
      </div>

      {/* List Container */}
      <div className="flex-1 overflow-y-auto space-y-2 pr-1">
        {filtered.length === 0 ? (
          <div className="text-center py-8 text-[10px] font-mono" style={{ color: '#243442' }}>
            NO RECORD MATCHES FILTER
          </div>
        ) : (
          filtered.map(inc => {
            const isSelected = selectedIncidentId === inc.incidentId;
            const pColor = PRIORITY_COLOR[inc.priority] || '#8EA2B2';
            
            return (
              <div
                key={inc._id}
                onClick={() => onSelectIncident(inc.incidentId)}
                className="p-2.5 rounded-sm transition-all relative cursor-pointer"
                style={{
                  background: isSelected ? 'rgba(79,163,209,0.1)' : '#111B24',
                  border: `1px solid ${isSelected ? '#4FA3D1' : '#243442'}`,
                  boxShadow: isSelected ? '0 0 8px rgba(79,163,209,0.15)' : 'none',
                }}
              >
                {/* Left side accent indicator */}
                <div
                  className="absolute left-0 top-0 bottom-0 w-1 rounded-l-sm"
                  style={{ background: pColor }}
                />

                <div className="flex justify-between items-start mb-1 pl-1">
                  <div className="flex items-center gap-1.5">
                    <span className="text-[10px] font-mono font-bold" style={{ color: '#E8F0F5' }}>
                      {inc.incidentId}
                    </span>
                    <span className="text-[8px] font-mono px-1 rounded-sm" style={{ background: pColor + '20', color: pColor }}>
                      {inc.priority}
                    </span>
                  </div>
                  <span className="text-[8px] font-mono" style={{ color: '#243442' }}>
                    {new Date(inc.createdAt).toLocaleTimeString('en-US', { hour12: false })}
                  </span>
                </div>

                <div className="text-[10px] font-mono pl-1 truncate" style={{ color: '#8EA2B2' }}>
                  {inc.type.toUpperCase()} · {inc.location.address}
                </div>

                <div className="text-[9px] font-mono mt-1 pl-1 flex items-center justify-between">
                  <span style={{ color: isSelected ? '#4FA3D1' : '#243442' }}>
                    {inc.status}
                  </span>
                  {inc.status === 'RESOLVED' && inc.responseTimeMs && (
                    <span className="text-[8px] text-green-500 font-bold">
                      {(inc.responseTimeMs / 60000).toFixed(1)}m Res
                    </span>
                  )}
                  {inc.status !== 'RESOLVED' && inc.estimatedArrival !== undefined && inc.estimatedArrival > 0 && (
                    <span className="text-[8px] text-yellow-500 animate-pulse font-bold">
                      ETA {inc.estimatedArrival}m
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
