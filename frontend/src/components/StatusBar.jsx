import React from 'react';
import { Wifi, Activity } from 'lucide-react';

export const StatusBar = ({
  responders = [],
  incidents = [],
  isConnected = true,
}) => {
  const availCount = responders.filter(r => r.status === 'AVAILABLE').length;
  const enRouteCount = responders.filter(r => r.status === 'EN_ROUTE').length;
  const onSceneCount = responders.filter(r => r.status === 'ON_SCENE' || r.status === 'ARRIVED').length;
  const unavailCount = responders.filter(r => r.status === 'UNAVAILABLE' || r.status === 'OFFLINE').length;

  const activeIncidentsCount = incidents.filter(i => i.status !== 'RESOLVED').length;
  const criticalCount = incidents.filter(i => i.status !== 'RESOLVED' && i.priority === 'CRITICAL').length;

  return (
    <footer className="h-7.5 px-4 bg-[#FFFFFF] border-t border-[#E2E5DF] flex items-center justify-between text-[11.5px] select-none shrink-0 z-20 text-[#475059]">
      {/* Left: Apparatus Fleet Status Indicators */}
      <div className="flex items-center gap-4">
        <span className="font-semibold text-[#111417] text-[11px] uppercase tracking-wider text-muted">
          Fleet Telemetry:
        </span>

        {/* Available */}
        <div className="flex items-center gap-1.5" title="Available apparatus in quarters or patrol">
          <span className="w-2 h-2 rounded-full bg-[#167A39]" />
          <span className="text-[#111417] font-semibold font-mono">{availCount}</span>
          <span className="text-[#78828C]">Available</span>
        </div>

        {/* En Route */}
        <div className="flex items-center gap-1.5" title="Apparatus currently responding to scene">
          <span className="w-2 h-2 rounded-full bg-[#1D4ED8]" />
          <span className="text-[#111417] font-semibold font-mono">{enRouteCount}</span>
          <span className="text-[#78828C]">En route</span>
        </div>

        {/* On Scene */}
        <div className="flex items-center gap-1.5" title="Apparatus operating on scene">
          <span className="w-2 h-2 rounded-full bg-[#B45309]" />
          <span className="text-[#111417] font-semibold font-mono">{onSceneCount}</span>
          <span className="text-[#78828C]">On scene</span>
        </div>

        {/* Offline / Maintenance */}
        <div className="flex items-center gap-1.5" title="Apparatus offline or in maintenance">
          <span className="w-2 h-2 rounded-full bg-[#78828C]" />
          <span className="text-[#111417] font-semibold font-mono">{unavailCount}</span>
          <span className="text-[#78828C]">Offline</span>
        </div>
      </div>

      {/* Right: Operational Health, Incidents & Telemetry Status */}
      <div className="flex items-center gap-4">
        {/* Active Emergency Calls */}
        <div className="flex items-center gap-1.5">
          <Activity className="w-3 h-3 text-[#78828C]" />
          <span className="text-[#111417] font-semibold font-mono">{activeIncidentsCount}</span>
          <span className="text-[#78828C]">Active calls</span>
          {criticalCount > 0 && (
            <span className="ml-1 px-1.5 py-0.2 rounded bg-[#FEF2F2] text-[#BA1A1A] font-semibold text-[10.5px]">
              {criticalCount} Critical
            </span>
          )}
        </div>

        <div className="w-[1px] h-3 bg-[#E2E5DF]" />

        {/* CAD Live Link */}
        <div className="flex items-center gap-1.5">
          <Wifi className={`w-3 h-3 ${isConnected ? 'text-[#167A39]' : 'text-[#BA1A1A]'}`} />
          <span className={isConnected ? 'text-[#167A39] font-medium' : 'text-[#BA1A1A] font-medium'}>
            {isConnected ? 'CAD Live (5s AVL)' : 'CAD Disconnected'}
          </span>
        </div>

        <div className="w-[1px] h-3 bg-[#E2E5DF]" />

        {/* EOC Bureau Station */}
        <div className="text-[#78828C] hidden sm:block">
          <span>Vadodara Municipal EOC</span>
          <span className="font-mono ml-1 text-[11px]">· WGS 84</span>
        </div>
      </div>
    </footer>
  );
};

export default StatusBar;
