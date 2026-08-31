import React, { useState } from 'react';
import {
  type Incident,
  type Responder,
  createIncident,
  assignResponders,
  updateIncidentStatus
} from '../api';
import {
  AlertTriangle, Send, Users, MapPin, Clock,
  CheckSquare, Square, ChevronRight, Target, Cpu
} from 'lucide-react';

interface IncidentControlProps {
  selectedIncident: Incident | null;
  onClearSelection: () => void;
  availableResponders: Responder[];
}

const PRIORITY_COLOR: Record<string, string> = {
  CRITICAL: '#E54848', HIGH: '#E0A43A', MEDIUM: '#4FA3D1', LOW: '#45B87A',
};
const STATUS_COLOR: Record<string, string> = {
  REPORTED: '#8EA2B2', ANALYZED: '#4FA3D1', DISPATCHED: '#E0A43A',
  EN_ROUTE: '#4FA3D1', ARRIVED: '#45B87A', RESOLVED: '#243442',
};

const PRESETS = [
  {
    label: 'Chemical Fire',
    desc: 'Explosion in chemistry lab on 3rd floor. Active chemical fire, smoke filling corridors. Two students are injured and unresponsive.',
    addr: 'Chemistry Hall, North Wing Room 302',
    vics: 2
  },
  {
    label: 'Car Collision',
    desc: 'Head-on collision between SUV and sedan outside campus gate. Driver of sedan has a broken leg and is trapped in the vehicle.',
    addr: 'West Gate Entrance Highway intersections',
    vics: 1
  },
  {
    label: 'Medical Emergency',
    desc: 'Elderly professor fainted during a lecture and is currently breathing shallowly but unconscious.',
    addr: 'Main Auditorium, Building C',
    vics: 1
  }
];

export const IncidentControl: React.FC<IncidentControlProps> = ({
  selectedIncident, onClearSelection, availableResponders
}) => {
  const [description, setDescription] = useState('');
  const [address, setAddress] = useState('');
  const [victims, setVictims] = useState<number>(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [selectedUnits, setSelectedUnits] = useState<string[]>([]);
  const [isDispatching, setIsDispatching] = useState(false);
  const [dispatched, setDispatched] = useState(false);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!description || !address) { setErrorMsg('Description and location are required.'); return; }
    setErrorMsg(''); setIsSubmitting(true);
    try {
      await createIncident({ description, locationAddress: address, victimsCount: victims });
      setDescription(''); setAddress(''); setVictims(0);
    } catch (err: any) {
      setErrorMsg(err.response?.data?.error || 'Failed to report incident.');
    } finally { setIsSubmitting(false); }
  };

  const handleDispatch = async () => {
    if (!selectedIncident || selectedUnits.length === 0) return;
    setIsDispatching(true);
    try {
      await assignResponders(selectedIncident.incidentId, selectedUnits);
      setSelectedUnits([]); setDispatched(true);
      setTimeout(() => setDispatched(false), 3000);
    } catch { } finally { setIsDispatching(false); }
  };

  const handleResolve = async () => {
    if (!selectedIncident) return;
    try { await updateIncidentStatus(selectedIncident.incidentId, 'RESOLVED'); onClearSelection(); } catch { }
  };

  const panelStyle = {
    background: '#0D141C', border: '1px solid #243442', borderRadius: '6px', padding: '16px',
    height: '540px', display: 'flex', flexDirection: 'column' as const,
  };

  const inputStyle = {
    background: '#111B24', border: '1px solid #243442', borderRadius: '4px',
    padding: '8px 10px', color: '#E8F0F5', fontSize: '11px',
    fontFamily: "'JetBrains Mono', monospace", outline: 'none', width: '100%',
  };

  if (selectedIncident) {
    const pColor = PRIORITY_COLOR[selectedIncident.priority] || '#8EA2B2';
    const sColor = STATUS_COLOR[selectedIncident.status] || '#8EA2B2';
    const scoreWidth = Math.min(100, (selectedIncident.priorityScore / 120) * 100);
    const STATUS_STEPS = ['REPORTED', 'ANALYZED', 'DISPATCHED', 'ARRIVED', 'RESOLVED'];
    const activeIndex = STATUS_STEPS.indexOf(selectedIncident.status === 'EN_ROUTE' ? 'DISPATCHED' : selectedIncident.status);

    return (
      <div className="hud-bracket" style={panelStyle}>
        {/* Header */}
        <div className="flex items-start justify-between mb-3">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[9px] font-mono tracking-widest" style={{ color: '#8EA2B2' }}>00 //</span>
              <span className="text-base font-black font-mono tracking-widest" style={{ color: '#E8F0F5' }}>
                INCIDENT · {selectedIncident.incidentId}
              </span>
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              <span
                className="text-[9px] font-mono font-bold px-2 py-0.5 rounded-sm"
                style={{ background: pColor + '1A', color: pColor, border: `1px solid ${pColor}55` }}
              >
                {selectedIncident.priority}
              </span>
              <span
                className="text-[9px] font-mono px-2 py-0.5 rounded-sm"
                style={{ background: sColor + '1A', color: sColor, border: `1px solid ${sColor}44` }}
              >
                {selectedIncident.status}
              </span>
              <span className="text-[9px] font-mono" style={{ color: '#8EA2B2' }}>
                SCORE: <span style={{ color: pColor }}>{selectedIncident.priorityScore}</span>
              </span>
            </div>
          </div>
          <button
            onClick={onClearSelection}
            className="text-[9px] font-mono px-2 py-1 rounded-sm transition-all"
            style={{ background: '#111B24', border: '1px solid #243442', color: '#8EA2B2' }}
            onMouseEnter={e => e.currentTarget.style.color = '#E8F0F5'}
            onMouseLeave={e => e.currentTarget.style.color = '#8EA2B2'}
          >
            ← BACK
          </button>
        </div>

        <hr className="hud-divider mb-3" />

        {/* Status Pipeline Step Progress */}
        <div className="mb-3">
          <div className="text-[8px] font-mono uppercase mb-1.5" style={{ color: '#243442' }}>DISPATCH PIPELINE</div>
          <div className="flex items-center justify-between px-2 py-2 rounded-sm" style={{ background: '#111B24', border: '1px solid #243442' }}>
            {STATUS_STEPS.map((step, idx) => {
              const isCurrent = activeIndex === idx;
              const isPast = idx < activeIndex;
              const stepColor = isCurrent ? '#4FA3D1' : isPast ? '#45B87A' : '#243442';
              return (
                <div key={step} className="flex flex-col items-center flex-1 relative">
                  {idx < STATUS_STEPS.length - 1 && (
                    <div className="absolute top-1.5 left-[50%] right-[-50%] h-[2px]" style={{ background: idx < activeIndex ? '#45B87A' : '#243442' }} />
                  )}
                  <div className="w-3.5 h-3.5 rounded-full flex items-center justify-center z-10" style={{ background: '#070B10', border: `2px solid ${stepColor}` }}>
                    {isPast && <div className="w-1.5 h-1.5 rounded-full" style={{ background: '#45B87A' }} />}
                    {isCurrent && <div className="w-1.5 h-1.5 rounded-full animate-ping" style={{ background: '#4FA3D1' }} />}
                  </div>
                  <span className="text-[7px] font-mono mt-1 font-bold" style={{ color: stepColor }}>{step}</span>
                </div>
              );
            })}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto space-y-3 pr-1">
          {/* Location + Victims */}
          <div className="grid grid-cols-2 gap-2">
            <div className="p-2.5 rounded-sm" style={{ background: '#111B24', border: '1px solid #243442' }}>
              <div className="text-[8px] font-mono uppercase mb-1" style={{ color: '#8EA2B2' }}>
                <MapPin className="w-2.5 h-2.5 inline mr-1" />LOCATION
              </div>
              <div className="text-[10px] font-mono" style={{ color: '#E8F0F5' }}>{selectedIncident.location.address}</div>
            </div>
            <div className="p-2.5 rounded-sm" style={{ background: '#111B24', border: '1px solid #243442' }}>
              <div className="text-[8px] font-mono uppercase mb-1" style={{ color: '#8EA2B2' }}>
                <Users className="w-2.5 h-2.5 inline mr-1" />VICTIMS
              </div>
              <div
                className="text-xl font-black font-mono"
                style={{ color: selectedIncident.victimsCount > 0 ? '#E54848' : '#45B87A' }}
              >
                {String(selectedIncident.victimsCount).padStart(2, '0')}
              </div>
            </div>
          </div>

          {/* Performance & ETA Ticker */}
          {((selectedIncident.status === 'RESOLVED' && selectedIncident.responseTimeMs) ||
            (selectedIncident.status !== 'RESOLVED' && selectedIncident.estimatedArrival !== undefined && selectedIncident.estimatedArrival > 0)) && (
            <div className="grid grid-cols-1 gap-2">
              {selectedIncident.status === 'RESOLVED' && selectedIncident.responseTimeMs && (
                <div className="p-2.5 rounded-sm" style={{ background: 'rgba(69,184,122,0.06)', border: '1px solid rgba(69,184,122,0.2)' }}>
                  <div className="text-[8px] font-mono uppercase mb-1" style={{ color: '#45B87A' }}>
                    TOTAL RESPONSE TIME
                  </div>
                  <div className="text-sm font-black font-mono animate-pulse" style={{ color: '#45B87A' }}>
                    {(selectedIncident.responseTimeMs / 60000).toFixed(1)} MINUTES
                  </div>
                </div>
              )}
              {selectedIncident.status !== 'RESOLVED' && selectedIncident.estimatedArrival !== undefined && selectedIncident.estimatedArrival > 0 && (
                <div className="p-2.5 rounded-sm" style={{ background: 'rgba(224,164,58,0.06)', border: '1px solid rgba(224,164,58,0.2)' }}>
                  <div className="text-[8px] font-mono uppercase mb-1" style={{ color: '#E0A43A' }}>
                    ESTIMATED SCENE ARRIVAL TIME
                  </div>
                  <div className="text-sm font-black font-mono animate-pulse" style={{ color: '#E0A43A' }}>
                    {selectedIncident.estimatedArrival} MINUTES (EN ROUTE)
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Priority bar */}
          <div className="p-2.5 rounded-sm" style={{ background: '#111B24', border: '1px solid #243442' }}>
            <div className="flex justify-between items-center mb-1.5">
              <span className="text-[8px] font-mono uppercase" style={{ color: '#8EA2B2' }}>THREAT LEVEL</span>
              <span className="text-[9px] font-mono font-bold" style={{ color: pColor }}>{selectedIncident.priority}</span>
            </div>
            <div className="priority-bar">
              <div className="priority-bar-fill" style={{ width: `${scoreWidth}%`, background: pColor }} />
            </div>
          </div>

          {/* Description */}
          <div className="p-2.5 rounded-sm" style={{ background: '#111B24', border: '1px solid #243442' }}>
            <div className="text-[8px] font-mono uppercase mb-1.5" style={{ color: '#8EA2B2' }}>OPERATOR REPORT</div>
            <p className="text-[11px] leading-relaxed font-mono" style={{ color: '#8EA2B2' }}>{selectedIncident.description}</p>
          </div>

          {/* AI Cognition Card */}
          {selectedIncident.aiAnalysis && (
            <div
              className="p-3 rounded-sm space-y-2"
              style={{ background: 'rgba(79,163,209,0.04)', border: '1px solid rgba(79,163,209,0.18)' }}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <Cpu className="w-3.5 h-3.5" style={{ color: '#4FA3D1' }} />
                  <span className="text-[8px] font-mono uppercase font-bold" style={{ color: '#4FA3D1' }}>AI DISPATCH COGNITION</span>
                </div>
                {selectedIncident.aiConfidence !== undefined && (
                  <span className="text-[8px] font-mono font-bold px-1.5 py-0.5 rounded-sm" style={{ background: 'rgba(79,163,209,0.15)', color: '#4FA3D1' }}>
                    {Math.round(selectedIncident.aiConfidence * 100)}% CONFIDENCE
                  </span>
                )}
              </div>

              <div className="grid grid-cols-2 gap-3 text-[10px] font-mono">
                <div>
                  <div className="text-[7px] uppercase" style={{ color: '#243442' }}>TRIAGE TYPE</div>
                  <div style={{ color: '#E8F0F5' }}>{selectedIncident.aiAnalysis.type}</div>
                </div>
                <div>
                  <div className="text-[7px] uppercase" style={{ color: '#243442' }}>SEVERITY LEVEL</div>
                  <div style={{ color: PRIORITY_COLOR[selectedIncident.aiAnalysis.severity] || '#E8F0F5' }}>{selectedIncident.aiAnalysis.severity}</div>
                </div>
                <div className="col-span-2">
                  <div className="text-[7px] uppercase" style={{ color: '#243442' }}>REQUIRED SERVICES</div>
                  <div className="flex gap-1 mt-1 flex-wrap">
                    {selectedIncident.aiAnalysis.requiredServices.map((svc: string) => (
                      <span key={svc} className="text-[8px] px-1.5 py-0.5 rounded-sm" style={{ background: '#111B24', border: '1px solid #243442', color: '#E8F0F5' }}>
                        {svc.toUpperCase()}
                      </span>
                    ))}
                  </div>
                </div>
                <div className="col-span-2 p-2 rounded-sm" style={{ background: 'rgba(224,164,58,0.06)', border: '1px solid rgba(224,164,58,0.2)' }}>
                  <div className="text-[7px] uppercase font-bold" style={{ color: '#E0A43A' }}>CRITICAL FIRST ACTION</div>
                  <div className="text-[10px] leading-normal" style={{ color: '#E8F0F5' }}>{selectedIncident.aiAnalysis.immediateAction}</div>
                </div>
                {selectedIncident.aiAnalysis.reasoning && (
                  <div className="col-span-2">
                    <div className="text-[7px] uppercase" style={{ color: '#243442' }}>DISPATCHER REASONING</div>
                    <div className="text-[9px] leading-relaxed italic" style={{ color: '#8EA2B2' }}>"{selectedIncident.aiAnalysis.reasoning}"</div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Dispatch panel */}
          {selectedIncident.status === 'ANALYZED' && (
            <div className="space-y-2">
              <div className="flex items-center gap-1.5">
                <Target className="w-3 h-3" style={{ color: '#E0A43A' }} />
                <span className="text-[8px] font-mono uppercase font-bold" style={{ color: '#E0A43A' }}>
                  RECOMMENDED RESPONSE
                </span>
              </div>

              {dispatched && (
                <div
                  className="p-2 rounded-sm text-center text-[10px] font-mono font-bold animate-pulse"
                  style={{ background: 'rgba(69,184,122,0.1)', border: '1px solid rgba(69,184,122,0.3)', color: '#45B87A' }}
                >
                  ✓ DISPATCH AUTHORIZED
                </div>
              )}

              <div className="space-y-1.5 max-h-36 overflow-y-auto">
                {(selectedIncident.aiAnalysis?.recommendations || []).map(rec => {
                  const checked = selectedUnits.includes(rec.responder._id);
                  return (
                    <div
                      key={rec.responder._id}
                      onClick={() => setSelectedUnits(p => checked ? p.filter(id => id !== rec.responder._id) : [...p, rec.responder._id])}
                      className="flex items-center justify-between p-2 rounded-sm transition-all"
                      style={{
                        background: checked ? 'rgba(79,163,209,0.1)' : '#111B24',
                        border: `1px solid ${checked ? 'rgba(79,163,209,0.4)' : '#243442'}`,
                        cursor: 'pointer',
                      }}
                    >
                      <div className="flex items-center gap-2">
                        {checked
                          ? <CheckSquare className="w-3.5 h-3.5" style={{ color: '#4FA3D1' }} />
                          : <Square     className="w-3.5 h-3.5" style={{ color: '#243442' }} />
                        }
                        <span className="text-[10px] font-mono font-bold" style={{ color: '#E8F0F5' }}>
                          {rec.responder.unitId}
                        </span>
                        <span className="text-[8px] font-mono" style={{ color: '#8EA2B2' }}>
                          {rec.responder.type.toUpperCase()}
                        </span>
                      </div>
                      <div className="text-right">
                        <div className="text-[9px] font-mono font-bold" style={{ color: '#4FA3D1' }}>{rec.distance} km</div>
                        <div className="text-[8px] font-mono" style={{ color: '#243442' }}>ETA {rec.eta}m</div>
                      </div>
                    </div>
                  );
                })}
                {availableResponders
                  .filter(r => !selectedIncident.aiAnalysis?.recommendations.some(rec => rec.responder._id === r._id))
                  .map(r => {
                    const checked = selectedUnits.includes(r._id);
                    return (
                      <div
                        key={r._id}
                        onClick={() => setSelectedUnits(p => checked ? p.filter(id => id !== r._id) : [...p, r._id])}
                        className="flex items-center justify-between p-2 rounded-sm transition-all"
                        style={{
                          background: checked ? 'rgba(79,163,209,0.08)' : '#111B24',
                          border: `1px solid ${checked ? 'rgba(79,163,209,0.3)' : '#1a2430'}`,
                          cursor: 'pointer', opacity: 0.7,
                        }}
                      >
                        <div className="flex items-center gap-2">
                          {checked
                            ? <CheckSquare className="w-3.5 h-3.5" style={{ color: '#4FA3D1' }} />
                            : <Square     className="w-3.5 h-3.5" style={{ color: '#243442' }} />
                          }
                          <span className="text-[10px] font-mono" style={{ color: '#E8F0F5' }}>{r.unitId}</span>
                          <span className="text-[8px] font-mono" style={{ color: '#8EA2B2' }}>{r.type.toUpperCase()}</span>
                        </div>
                        <span className="text-[8px] font-mono" style={{ color: '#45B87A' }}>STANDBY</span>
                      </div>
                    );
                  })}
              </div>

              <button
                disabled={selectedUnits.length === 0 || isDispatching}
                onClick={handleDispatch}
                className="w-full py-2.5 rounded-sm text-[10px] font-mono font-bold tracking-widest uppercase transition-all flex items-center justify-center gap-2"
                style={{
                  background: selectedUnits.length > 0 && !isDispatching ? 'rgba(79,163,209,0.15)' : '#111B24',
                  border: `1px solid ${selectedUnits.length > 0 && !isDispatching ? '#4FA3D1' : '#243442'}`,
                  color: selectedUnits.length > 0 && !isDispatching ? '#4FA3D1' : '#243442',
                  cursor: selectedUnits.length > 0 && !isDispatching ? 'pointer' : 'not-allowed',
                }}
              >
                <Send className="w-3 h-3" />
                {isDispatching ? 'AUTHORIZING...' : `APPROVE DISPATCH (${selectedUnits.length} UNITS)`}
              </button>
            </div>
          )}

          {/* Resolve button */}
          {['DISPATCHED', 'EN_ROUTE', 'ARRIVED'].includes(selectedIncident.status) && (
            <button
              onClick={handleResolve}
              className="w-full py-2.5 rounded-sm text-[10px] font-mono font-bold tracking-widest uppercase transition-all flex items-center justify-center gap-2"
              style={{
                background: 'rgba(69,184,122,0.1)', border: '1px solid rgba(69,184,122,0.35)',
                color: '#45B87A', cursor: 'pointer',
              }}
            >
              <ChevronRight className="w-3 h-3" />
              MARK RESOLVED · RELEASE UNITS
            </button>
          )}
        </div>
      </div>
    );
  }

  /* ── Create Form ─────────────────────────────────── */
  return (
    <div className="hud-bracket" style={panelStyle}>
      <div className="flex items-center gap-2 mb-3">
        <span className="text-[9px] font-mono tracking-widest" style={{ color: '#8EA2B2' }}>00 //</span>
        <AlertTriangle className="w-3.5 h-3.5" style={{ color: '#E0A43A' }} />
        <span className="text-xs font-bold tracking-widest uppercase" style={{ color: '#E8F0F5' }}>
          Incident Reporting
        </span>
      </div>

      <hr className="hud-divider mb-4" />

      {/* Presets */}
      <div className="mb-4">
        <div className="text-[8px] font-mono uppercase mb-2" style={{ color: '#243442' }}>Load Test Scenario</div>
        <div className="flex gap-2 flex-wrap">
          {PRESETS.map((p, i) => (
            <button
              key={i}
              onClick={() => { setDescription(p.desc); setAddress(p.addr); setVictims(p.vics); }}
              className="text-[9px] font-mono px-2.5 py-1 rounded-sm transition-all"
              style={{ background: '#111B24', border: '1px solid #243442', color: '#8EA2B2' }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = '#4FA3D1'; e.currentTarget.style.color = '#4FA3D1'; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = '#243442'; e.currentTarget.style.color = '#8EA2B2'; }}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      <form onSubmit={handleCreate} className="flex flex-col gap-3 flex-1">
        {errorMsg && (
          <div
            className="text-[10px] font-mono p-2.5 rounded-sm"
            style={{ background: 'rgba(229,72,72,0.08)', border: '1px solid rgba(229,72,72,0.3)', color: '#E54848' }}
          >
            ERR: {errorMsg}
          </div>
        )}

        <div>
          <div className="text-[8px] font-mono uppercase mb-1.5" style={{ color: '#8EA2B2' }}>
            Incident Description
          </div>
          <textarea
            required
            rows={5}
            value={description}
            onChange={e => setDescription(e.target.value)}
            placeholder="Describe the incident in detail..."
            style={{ ...inputStyle, resize: 'none' }}
            onFocus={e => (e.target.style.borderColor = '#4FA3D1')}
            onBlur={e => (e.target.style.borderColor = '#243442')}
          />
        </div>

        <div className="grid grid-cols-3 gap-3">
          <div className="col-span-2">
            <div className="text-[8px] font-mono uppercase mb-1.5" style={{ color: '#8EA2B2' }}>Location / Address</div>
            <input
              type="text"
              required
              value={address}
              onChange={e => setAddress(e.target.value)}
              placeholder="e.g. Chemistry Hall, Room 102"
              style={inputStyle}
              onFocus={e => (e.target.style.borderColor = '#4FA3D1')}
              onBlur={e => (e.target.style.borderColor = '#243442')}
            />
          </div>
          <div>
            <div className="text-[8px] font-mono uppercase mb-1.5" style={{ color: '#8EA2B2' }}>Victims</div>
            <input
              type="number"
              min={0}
              value={victims}
              onChange={e => setVictims(parseInt(e.target.value) || 0)}
              style={inputStyle}
              onFocus={e => (e.target.style.borderColor = '#4FA3D1')}
              onBlur={e => (e.target.style.borderColor = '#243442')}
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full py-2.5 rounded-sm text-[10px] font-mono font-bold tracking-widest uppercase transition-all flex items-center justify-center gap-2"
          style={{
            background: isSubmitting ? '#111B24' : 'rgba(79,163,209,0.15)',
            border: `1px solid ${isSubmitting ? '#243442' : '#4FA3D1'}`,
            color: isSubmitting ? '#243442' : '#4FA3D1',
            cursor: isSubmitting ? 'not-allowed' : 'pointer',
          }}
        >
          <Send className="w-3 h-3" />
          {isSubmitting ? 'TRANSMITTING TO AI ENGINE...' : 'REPORT INCIDENT · SUBMIT TO AI DISPATCH'}
        </button>

        <div className="text-[9px] font-mono text-center mt-auto" style={{ color: '#243442' }}>
          AI ENGINE WILL CLASSIFY TYPE · PRIORITY · SCORE · RECOMMEND UNITS
        </div>
      </form>
    </div>
  );
};
