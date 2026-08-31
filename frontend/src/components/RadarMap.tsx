import React, { useState, useEffect } from 'react';
import type { Incident, Responder } from '../api';
import { MapPin, Navigation, Radio } from 'lucide-react';

interface RadarMapProps {
  incidents: Incident[];
  responders: Responder[];
  selectedIncident: Incident | null;
  onSelectIncident: (incident: Incident) => void;
}

const CAMPUS_LAT = 40.730610;
const CAMPUS_LNG = -73.935242;
const MAX_DELTA = 0.035;

export const RadarMap: React.FC<RadarMapProps> = ({
  incidents,
  responders,
  selectedIncident,
  onSelectIncident,
}) => {
  const [hoveredItem, setHoveredItem] = useState<{
    type: 'incident' | 'responder';
    name: string;
    details: string;
    x: number;
    y: number;
  } | null>(null);

  const [selectedResponderId, setSelectedResponderId] = useState<string | null>(null);
  const [showAllUnits, setShowAllUnits] = useState(true);

  // Track historical positions for the subtle trail
  const [trails, setTrails] = useState<Record<string, { x: number; y: number }[]>>({});

  const width = 500;
  const height = 500;
  const centerX = width / 2;
  const centerY = height / 2;

  const getXY = (lat: number, lng: number) => {
    const x = centerX + ((lng - CAMPUS_LNG) / MAX_DELTA) * (width / 2) * 0.85;
    const y = centerY - ((lat - CAMPUS_LAT) / MAX_DELTA) * (height / 2) * 0.85;
    return { x, y };
  };

  // Update trails when responders move
  useEffect(() => {
    setTrails(prev => {
      const newTrails = { ...prev };
      responders.forEach(r => {
        if (r.status === 'EN_ROUTE') {
          const { x, y } = getXY(r.currentLocation.lat, r.currentLocation.lng);
          if (!newTrails[r._id]) {
            newTrails[r._id] = [];
          }
          // Only add if it moved significantly to avoid huge arrays
          const lastPos = newTrails[r._id][newTrails[r._id].length - 1];
          if (!lastPos || Math.hypot(lastPos.x - x, lastPos.y - y) > 2) {
            newTrails[r._id] = [...newTrails[r._id], { x, y }].slice(-20); // Keep last 20 positions
          }
        } else {
          // Clean up trail if arrived or available
          if (newTrails[r._id]) {
            delete newTrails[r._id];
          }
        }
      });
      return newTrails;
    });
  }, [responders]);

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'CRITICAL': return '#E54848';
      case 'HIGH':     return '#E0A43A';
      case 'MEDIUM':   return '#4FA3D1';
      case 'LOW':      return '#45B87A';
      default:         return '#8EA2B2';
    }
  };

  const getResponderColor = (type: string) => {
    switch (type) {
      case 'Ambulance': return '#4FA3D1';
      case 'Fire':      return '#E54848';
      case 'Police':    return '#8EA2B2';
      case 'Medical':   return '#45B87A';
      default:          return '#4FA3D1';
    }
  };

  // Build a lookup: responder._id -> assigned incident (for EN_ROUTE responders)
  const responderTargetMap = new Map<string, { incident: Incident; incXY: { x: number; y: number } }>();
  incidents
    .filter(inc => ['DISPATCHED', 'EN_ROUTE', 'ARRIVED'].includes(inc.status) && inc.location.coordinates)
    .forEach(inc => {
      const incXY = getXY(inc.location.coordinates!.lat, inc.location.coordinates!.lng);
      inc.assignedResponders.forEach(r => {
        responderTargetMap.set(r._id, { incident: inc, incXY });
      });
    });

  const selectedResponder = responders.find(r => r._id === selectedResponderId);
  const selectedResponderTarget = selectedResponder ? responderTargetMap.get(selectedResponder._id) : null;

  return (
    <div
      className="radar-container hud-bracket flex flex-col items-center select-none overflow-hidden"
      style={{ background: '#0D141C', border: '1px solid #243442', borderRadius: '6px', padding: '14px', height: '540px' }}
    >
      {/* Panel Header */}
      <div className="w-full flex justify-between items-center mb-3">
        <div className="flex items-center gap-2">
          <span className="text-[9px] font-mono tracking-widest" style={{ color: '#8EA2B2' }}>00 //</span>
          <Radio style={{ color: '#4FA3D1', width: '14px', height: '14px' }} className="animate-pulse" />
          <span className="text-xs font-bold tracking-widest uppercase" style={{ color: '#E8F0F5' }}>Tactical Radar Array</span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowAllUnits(p => !p)}
            className="text-[8px] font-mono px-1.5 py-0.5 rounded-sm transition-all cursor-pointer hover:border-[#4FA3D1] hover:text-[#4FA3D1]"
            style={{
              background: showAllUnits ? 'rgba(79,163,209,0.15)' : '#111B24',
              border: `1px solid ${showAllUnits ? '#4FA3D1' : '#243442'}`,
              color: showAllUnits ? '#4FA3D1' : '#8EA2B2',
            }}
          >
            {showAllUnits ? 'FLEET: ALL' : 'FLEET: ACTIVE'}
          </button>
          <span
            className="text-[8px] font-mono px-1.5 py-0.5 rounded-sm"
            style={{ background: '#111B24', border: '1px solid #243442', color: '#8EA2B2' }}
          >
            HQ · 40.7306 / -73.9352
          </span>
        </div>
      </div>

      {/* SVG Canvas */}
      <div
        className="relative w-full aspect-square max-w-[440px] overflow-hidden flex items-center justify-center"
        style={{ background: '#070B10', border: '1px solid #1a2430', borderRadius: '4px' }}
      >
        {/* Radar sweep overlay */}
        <div className="absolute inset-0 pointer-events-none">
          <div
            className="w-full h-full animate-[spin_8s_linear_infinite] origin-center"
            style={{ background: 'conic-gradient(from 0deg, transparent 70%, rgba(79,163,209,0.08) 100%)', opacity: 0.6 }}
          />
        </div>

        <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-full z-10">
          <defs>
            {['Ambulance', 'Fire', 'Police', 'Medical'].map(type => {
              const color = getResponderColor(type);
              return (
                <marker
                  key={type}
                  id={`arrowhead-${type}`}
                  markerWidth="12"
                  markerHeight="12"
                  refX="10"
                  refY="5"
                  orient="auto"
                >
                  <path d="M0,0 L10,5 L0,10 Z" fill={color} opacity="1" />
                </marker>
              );
            })}
            <style>{`
              @keyframes dashMove {
                to { stroke-dashoffset: -24; }
              }
              .route-line {
                animation: dashMove 1s linear infinite;
              }
            `}</style>
          </defs>

          {/* Fine grid lines */}
          <line x1={0} y1={centerY} x2={width} y2={centerY} stroke="#1a2430" strokeWidth="0.5" />
          <line x1={centerX} y1={0} x2={centerX} y2={height} stroke="#1a2430" strokeWidth="0.5" />
          <line x1={0} y1={0} x2={width} y2={height} stroke="#111B24" strokeWidth="0.5" />
          <line x1={width} y1={0} x2={0} y2={height} stroke="#111B24" strokeWidth="0.5" />

          {/* Distance rings */}
          <circle cx={centerX} cy={centerY} r={50}  fill="none" stroke="#1a2430" strokeWidth="0.8" strokeDasharray="2,4" />
          <circle cx={centerX} cy={centerY} r={100} fill="none" stroke="#1a2430" strokeWidth="1" />
          <circle cx={centerX} cy={centerY} r={150} fill="none" stroke="#1a2430" strokeWidth="0.8" strokeDasharray="2,4" />
          <circle cx={centerX} cy={centerY} r={200} fill="none" stroke="#243442" strokeWidth="1" />

          {/* Tick marks on outer ring */}
          {[0, 45, 90, 135, 180, 225, 270, 315].map(deg => {
            const rad = (deg * Math.PI) / 180;
            return (
              <line
                key={deg}
                x1={centerX + 196 * Math.cos(rad)} y1={centerY + 196 * Math.sin(rad)}
                x2={centerX + 205 * Math.cos(rad)} y2={centerY + 205 * Math.sin(rad)}
                stroke="#243442" strokeWidth="1"
              />
            );
          })}

          {/* Ring labels */}
          <text x={centerX + 4} y={centerY - 102} fill="#243442" fontSize="7" fontFamily="JetBrains Mono">1.0KM</text>
          <text x={centerX + 4} y={centerY - 202} fill="#243442" fontSize="7" fontFamily="JetBrains Mono">2.0KM</text>

          {/* Compass Rose */}
          <g transform="translate(45, 45)" opacity="0.45" className="pointer-events-none">
            <circle cx="0" cy="0" r="18" fill="none" stroke="#243442" strokeWidth="0.8" />
            <line x1="0" y1="-22" x2="0" y2="22" stroke="#243442" strokeWidth="0.8" />
            <line x1="-22" y1="0" x2="22" y2="0" stroke="#243442" strokeWidth="0.8" />
            <polygon points="0,-18 4,-4 0,-1 -4,-4" fill="#4FA3D1" />
            <polygon points="0,18 4,4 0,1 -4,4" fill="#243442" />
            <text x="-2.5" y="-23" fill="#4FA3D1" fontSize="7" fontFamily="JetBrains Mono" fontWeight="bold">N</text>
          </g>

          {/* Campus Center */}
          <circle cx={centerX} cy={centerY} r={5} fill="#4FA3D1" className="animate-pulse" />
          <circle cx={centerX} cy={centerY} r={12} fill="none" stroke="#4FA3D1" strokeWidth="0.8"
            className="animate-ping" style={{ animationDuration: '3s' }} />
          <text x={centerX + 8} y={centerY - 8} fill="#4FA3D1" fontSize="7" fontFamily="JetBrains Mono">HQ</text>

          {/* ── ROUTING LINES & TRAILS (EN_ROUTE) ────────── */}
          {responders.filter(r => r.status === 'EN_ROUTE').map(responder => {
            const target = responderTargetMap.get(responder._id);
            if (!target) return null;

            const resXY = getXY(responder.currentLocation.lat, responder.currentLocation.lng);
            const incXY = target.incXY;
            const color = getResponderColor(responder.type);
            const isSelected = selectedResponderId === responder._id;

            // Calculate angle and gap for the arrow
            const dx = incXY.x - resXY.x;
            const dy = incXY.y - resXY.y;
            const distance = Math.sqrt(dx * dx + dy * dy);

            // Gap so arrowhead doesn't cover the incident circle
            const gap = 16;
            const ratio = Math.max(0, distance - gap) / distance;
            const targetX = resXY.x + dx * ratio;
            const targetY = resXY.y + dy * ratio;

            // Trail rendering
            const trail = trails[responder._id] || [];

            return (
              <g key={`route-${responder._id}`} opacity={selectedResponderId && !isSelected ? 0.3 : 1}>
                {/* Trail line */}
                {trail.length > 1 && (
                  <polyline
                    points={trail.map(p => `${p.x},${p.y}`).join(' ')}
                    fill="none"
                    stroke={color}
                    strokeWidth="3"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    opacity="0.3"
                  />
                )}

                {/* Subdued shadow line for route */}
                <line
                  x1={resXY.x} y1={resXY.y}
                  x2={targetX} y2={targetY}
                  stroke={color}
                  strokeWidth={isSelected ? "5" : "3"}
                  opacity="0.15"
                />

                {/* Dashed animated route line with dynamic arrowhead */}
                <line
                  x1={resXY.x} y1={resXY.y}
                  x2={targetX} y2={targetY}
                  stroke={color}
                  strokeWidth="2"
                  strokeDasharray="6,4"
                  opacity="0.9"
                  markerEnd={`url(#arrowhead-${responder.type})`}
                  className="route-line"
                />

                {/* Distance/ETA Label along the route */}
                {distance > 30 && (
                  <g transform={`translate(${(resXY.x + targetX) / 2}, ${(resXY.y + targetY) / 2})`}>
                    <rect x="-26" y="-14" width="52" height="28" fill="#070B10" rx="2" opacity="0.9" />
                    <rect x="-26" y="-14" width="52" height="28" fill="none" rx="2" stroke={color} strokeWidth="0.5" opacity="0.5" />
                    <text x="0" y="-2" fill={color} fontSize="8" fontWeight="bold" textAnchor="middle" fontFamily="JetBrains Mono">
                      {responder.unitId}
                    </text>
                    <text x="0" y="8" fill="#8EA2B2" fontSize="7" textAnchor="middle" fontFamily="JetBrains Mono">
                      {(distance * MAX_DELTA).toFixed(1)}KM
                    </text>
                  </g>
                )}
              </g>
            );
          })}

          {/* ── INCIDENT MARKERS ───────────────────────────────────────── */}
          {incidents
            .filter(inc => inc.status !== 'RESOLVED' && inc.location.coordinates)
            .map(incident => {
              const { lat, lng } = incident.location.coordinates!;
              const { x, y } = getXY(lat, lng);
              const color = getPriorityColor(incident.priority);
              const isSelected = selectedIncident?.incidentId === incident.incidentId || selectedResponderTarget?.incident.incidentId === incident.incidentId;

              return (
                <g
                  key={incident._id}
                  onClick={() => onSelectIncident(incident)}
                  className="cursor-pointer group"
                  onMouseEnter={() => setHoveredItem({
                    type: 'incident',
                    name: incident.incidentId,
                    details: `${incident.type} · ${incident.priority} · VICS: ${incident.victimsCount} ${incident.estimatedArrival ? `· ETA: ${incident.estimatedArrival}m` : ''}`,
                    x, y: y - 10,
                  })}
                  onMouseLeave={() => setHoveredItem(null)}
                >
                  {/* Outer pulse ring for critical/high */}
                  {['CRITICAL', 'HIGH'].includes(incident.priority) && (
                    <circle cx={x} cy={y}
                      r={14}
                      fill="none" stroke={color} strokeWidth="1.5"
                      className="animate-ping"
                      style={{ animationDuration: incident.priority === 'CRITICAL' ? '1.2s' : '2.5s' }}
                    />
                  )}
                  {isSelected && (
                    <circle cx={x} cy={y} r={16} fill="none" stroke={color} strokeWidth="2" strokeDasharray="4,2" className="animate-[spin_4s_linear_infinite]" />
                  )}
                  {/* Solid core */}
                  <circle cx={x} cy={y} r={isSelected ? 9 : 7} fill={color} />
                  <circle cx={x} cy={y} r={isSelected ? 5 : 3} fill="#070B10" />
                  {/* Cross-hair ticks on selected */}
                  {isSelected && (
                    <>
                      <line x1={x - 14} y1={y} x2={x - 10} y2={y} stroke={color} strokeWidth="1" />
                      <line x1={x + 10} y1={y} x2={x + 14} y2={y} stroke={color} strokeWidth="1" />
                      <line x1={x} y1={y - 14} x2={x} y2={y - 10} stroke={color} strokeWidth="1" />
                      <line x1={x} y1={y + 10} x2={x} y2={y + 14} stroke={color} strokeWidth="1" />
                    </>
                  )}
                  {/* Label */}
                  <text x={x + 12} y={y + 3} fill="#E8F0F5" fontSize="8" fontWeight="bold"
                    fontFamily="JetBrains Mono"
                    className="opacity-90 group-hover:opacity-100 pointer-events-none">
                    {incident.incidentId}
                  </text>
                </g>
              );
            })}

          {/* ── RESPONDER MARKERS ──────────────────────────────────────── */}
          {responders
            .filter(r => showAllUnits || r.status === 'EN_ROUTE' || r.status === 'ON_SCENE')
            .map(responder => {
              const { lat, lng } = responder.currentLocation;
            const { x, y } = getXY(lat, lng);
            const color = getResponderColor(responder.type);
            const isEnRoute = responder.status === 'EN_ROUTE';
            const isOnScene = responder.status === 'ON_SCENE';
            const target = responderTargetMap.get(responder._id);
            const isSelected = selectedResponderId === responder._id;

            // Calculate rotation angle if en route
            let angle = 0;
            if (isEnRoute && target) {
              const dx = target.incXY.x - x;
              const dy = target.incXY.y - y;
              angle = (Math.atan2(dy, dx) * 180) / Math.PI;
            }

            return (
              <g
                key={responder._id}
                className="cursor-pointer group"
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedResponderId(isSelected ? null : responder._id);
                }}
                onMouseEnter={() => setHoveredItem({
                  type: 'responder',
                  name: responder.unitId,
                  details: isEnRoute && target
                    ? `${responder.type} — EN ROUTE → ${target.incident.incidentId}`
                    : isOnScene
                      ? `${responder.type} — ON SCENE`
                      : `${responder.type} — ${responder.status}`,
                  x, y: y - 10,
                })}
                onMouseLeave={() => setHoveredItem(null)}
                opacity={selectedResponderId && !isSelected ? 0.3 : 1}
              >
                {/* Selection Highlight */}
                {isSelected && (
                  <circle cx={x} cy={y} r={14} fill={color} opacity="0.2" />
                )}

                {/* Core vehicle marker rotated towards target */}
                <g transform={isEnRoute ? `translate(${x}, ${y}) rotate(${angle}) translate(${-x}, ${-y})` : ''}>
                  {/* Vehicle Body */}
                  <rect x={x - 6} y={y - 4} width="12" height="8" rx="2" fill={color} stroke="#ffffff" strokeWidth="1" />

                  {/* Direction indicator (headlights/front) */}
                  {isEnRoute && (
                    <path d={`M${x + 6},${y - 4} L${x + 9},${y} L${x + 6},${y + 4} Z`} fill="#ffffff" />
                  )}
                </g>

                {/* Status glyph for non-moving */}
                {isOnScene && (
                  <circle cx={x} cy={y} r={2} fill="#ffffff" />
                )}

                {/* Unit ID label */}
                <text x={x} y={y - 10} fill={color} fontSize="8" fontWeight="700" textAnchor="middle"
                  fontFamily="JetBrains Mono">
                  {responder.unitId}
                </text>
              </g>
            );
          })}

        </svg>

        {/* Hover Tooltip */}
        {hoveredItem && (
          <div
            className="absolute z-30 pointer-events-none"
            style={{
              left: `${(hoveredItem.x / width) * 100}%`,
              top: `${(hoveredItem.y / height) * 100 - 8}%`,
              transform: 'translate(-50%, -100%)',
              background: '#0D141C',
              border: '1px solid #4FA3D1',
              borderRadius: '3px',
              padding: '6px 8px',
              maxWidth: '200px',
            }}
          >
            <div className="font-bold font-mono text-[10px] flex items-center gap-1" style={{ color: '#4FA3D1' }}>
              {hoveredItem.type === 'incident'
                ? <MapPin className="w-3 h-3" style={{ color: '#E54848' }} />
                : <Navigation className="w-3 h-3 rotate-45" style={{ color: '#4FA3D1' }} />}
              {hoveredItem.name}
            </div>
            <div className="font-mono text-[9px] mt-0.5" style={{ color: '#8EA2B2' }}>{hoveredItem.details}</div>
          </div>
        )}

        {/* Selected Responder Info Panel */}
        {selectedResponder && (
          <div
            className="absolute bottom-3 right-3 z-40"
            style={{ background: '#0D141C', border: '1px solid #4FA3D1', borderRadius: '4px', padding: '10px', minWidth: '150px' }}
          >
            <div className="flex justify-between items-start mb-2">
              <span className="text-[10px] font-mono font-bold" style={{ color: '#4FA3D1' }}>{selectedResponder.unitId}</span>
              <button onClick={() => setSelectedResponderId(null)} className="text-[9px] font-mono" style={{ color: '#8EA2B2' }}>✕</button>
            </div>
            <div className="space-y-1 text-[9px] font-mono">
              <div className="flex justify-between">
                <span style={{ color: '#243442' }}>TYPE</span>
                <span style={{ color: getResponderColor(selectedResponder.type) }}>{selectedResponder.type.toUpperCase()}</span>
              </div>
              <div className="flex justify-between">
                <span style={{ color: '#243442' }}>STATUS</span>
                <span style={{ color: '#E8F0F5' }}>{selectedResponder.status.replace('_', ' ')}</span>
              </div>
              {selectedResponderTarget && selectedResponder.status === 'EN_ROUTE' && (
                <>
                  <hr style={{ borderColor: '#243442', margin: '4px 0' }} />
                  <div className="flex justify-between">
                    <span style={{ color: '#243442' }}>TARGET</span>
                    <span style={{ color: '#E54848' }}>{selectedResponderTarget.incident.incidentId}</span>
                  </div>
                  <div className="flex justify-between">
                    <span style={{ color: '#243442' }}>DIST</span>
                    <span style={{ color: '#4FA3D1' }}>
                      {Math.max(0.1, (Math.hypot(
                        selectedResponder.currentLocation.lat - selectedResponderTarget.incident.location.coordinates!.lat,
                        selectedResponder.currentLocation.lng - selectedResponderTarget.incident.location.coordinates!.lng
                      ) * 111)).toFixed(1)} KM
                    </span>
                  </div>
                </>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Legend */}
      <div
        className="flex flex-wrap gap-x-4 gap-y-1.5 mt-3 pt-3 w-full text-[8px] font-mono"
        style={{ borderTop: '1px solid #1a2430', color: '#243442' }}
      >
        {[
          { color: '#E54848', label: 'CRITICAL' },
          { color: '#E0A43A', label: 'HIGH' },
          { color: '#4FA3D1', label: 'AMBULANCE' },
          { color: '#E54848', label: 'FIRE DEPT' },
          { color: '#8EA2B2', label: 'POLICE' },
          { color: '#45B87A', label: 'MEDICAL' },
        ].map(item => (
          <div key={item.label} className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full inline-block" style={{ background: item.color }} />
            {item.label}
          </div>
        ))}
        <div className="flex items-center gap-1">
          <svg width="22" height="8">
            <line x1="0" y1="4" x2="16" y2="4" stroke="#4FA3D1" strokeWidth="1.5" strokeDasharray="3,2" markerEnd="url(#arrowhead-Ambulance)" />
          </svg>
          EN ROUTE
        </div>
      </div>
    </div>
  );
};
