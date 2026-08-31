import React from 'react';
import type { Responder } from '../api';
import { Activity, Flame, Shield, ShieldAlert, MapPin, Wifi, WifiOff } from 'lucide-react';

interface FleetMonitorProps { responders: Responder[]; }

const TYPE_CONFIG: Record<string, { label: string; icon: React.ReactNode; accent: string }> = {
  Ambulance: { label: 'AMBULANCE', icon: <Activity className="w-4 h-4" />, accent: '#4FA3D1' },
  Fire:      { label: 'FIRE DEPT', icon: <Flame     className="w-4 h-4" />, accent: '#E54848' },
  Police:    { label: 'POLICE',    icon: <Shield    className="w-4 h-4" />, accent: '#8EA2B2' },
  Medical:   { label: 'MEDICAL',  icon: <ShieldAlert className="w-4 h-4" />, accent: '#45B87A' },
};

const STATUS_CONFIG: Record<string, { label: string; color: string; dotClass: string }> = {
  AVAILABLE:   { label: 'AVAILABLE',  color: '#45B87A', dotClass: 'online' },
  EN_ROUTE:    { label: 'EN ROUTE',   color: '#4FA3D1', dotClass: 'active' },
  ON_SCENE:    { label: 'ON SCENE',   color: '#E0A43A', dotClass: 'warning' },
  UNAVAILABLE: { label: 'OFFLINE',    color: '#E54848', dotClass: 'offline' },
};

export const FleetMonitor: React.FC<FleetMonitorProps> = ({ responders }) => {
  const avail  = responders.filter(r => r.status === 'AVAILABLE').length;
  const enRoute = responders.filter(r => r.status === 'EN_ROUTE').length;
  const onScene = responders.filter(r => r.status === 'ON_SCENE').length;
  const unavail = responders.filter(r => r.status === 'UNAVAILABLE').length;

  return (
    <div
      className="hud-bracket"
      style={{ background: '#0D141C', border: '1px solid #243442', borderRadius: '6px', padding: '14px' }}
    >
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
        <div className="flex items-center gap-2">
          <div className="text-[9px] font-mono tracking-widest uppercase" style={{ color: '#8EA2B2' }}>03 //</div>
          <span className="text-xs font-bold tracking-widest uppercase" style={{ color: '#E8F0F5' }}>Fleet Telemetry</span>
          <span
            className="text-[8px] font-mono px-1.5 py-0.5 rounded-sm"
            style={{ background: '#111B24', border: '1px solid #243442', color: '#8EA2B2' }}
          >
            {responders.length} UNITS
          </span>
        </div>

        <div className="flex gap-3 text-[9px] font-mono">
          {[
            { label: 'AVAILABLE', count: avail,  color: '#45B87A', dot: 'online'  },
            { label: 'EN ROUTE',  count: enRoute, color: '#4FA3D1', dot: 'active'  },
            { label: 'ON SCENE',  count: onScene, color: '#E0A43A', dot: 'warning' },
            { label: 'OFFLINE',   count: unavail, color: '#E54848', dot: 'offline' },
          ].map(s => (
            <div key={s.label} className="flex items-center gap-1.5">
              <span className={`status-dot ${s.dot}`} />
              <span style={{ color: s.color }}>{s.count}</span>
              <span style={{ color: '#243442' }}>{s.label}</span>
            </div>
          ))}
        </div>
      </div>

      <hr className="hud-divider mb-4" />

      {/* Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-7 gap-3">
        {responders.map(unit => {
          const type   = TYPE_CONFIG[unit.type]   ?? TYPE_CONFIG.Ambulance;
          const status = STATUS_CONFIG[unit.status] ?? STATUS_CONFIG.UNAVAILABLE;
          const isActive = unit.status === 'EN_ROUTE' || unit.status === 'ON_SCENE';

          return (
            <div
              key={unit._id}
              className="relative flex flex-col gap-2.5 rounded-sm p-3 transition-all duration-200"
              style={{
                background: '#111B24',
                border: `1px solid ${isActive ? type.accent + '55' : '#243442'}`,
                boxShadow: isActive ? `0 0 12px ${type.accent}15` : 'none',
              }}
            >
              {/* Top accent bar */}
              <div
                className="absolute top-0 inset-x-0 h-0.5 rounded-t-sm"
                style={{ background: type.accent, opacity: isActive ? 0.8 : 0.25 }}
              />

              {/* Type icon + link status */}
              <div className="flex items-center justify-between pt-0.5">
                <span style={{ color: type.accent }}>{type.icon}</span>
                {isActive
                  ? <Wifi    className="w-3 h-3" style={{ color: type.accent, opacity: 0.7 }} />
                  : <WifiOff className="w-3 h-3" style={{ color: '#243442' }} />
                }
              </div>

              {/* Unit ID */}
              <div>
                <div className="text-sm font-black leading-none font-mono" style={{ color: '#E8F0F5' }}>{unit.unitId}</div>
                <div className="text-[9px] font-mono mt-0.5" style={{ color: type.accent }}>{type.label}</div>
              </div>

              {/* Status */}
              <div className="flex items-center gap-1.5">
                <span className={`status-dot ${status.dotClass}`} style={{ width: '5px', height: '5px' }} />
                <span className="text-[9px] font-mono font-bold" style={{ color: status.color }}>{status.label}</span>
              </div>

              {/* GPS */}
              <div className="flex items-start gap-1 text-[8px] font-mono" style={{ color: '#243442' }}>
                <MapPin className="w-2.5 h-2.5 mt-0.5 shrink-0" />
                <span>
                  {unit.currentLocation.lat.toFixed(4)}<br />
                  {unit.currentLocation.lng.toFixed(4)}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
