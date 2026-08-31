import { useEffect, useState, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';
import {
  fetchIncidents,
  fetchResponders,
  type Incident,
  type Responder
} from './api';
import { RadarMap } from './components/RadarMap';
import { IncidentControl } from './components/IncidentControl';
import { IncidentList } from './components/IncidentList';
import { ToastNotification, type ToastMessage } from './components/ToastNotification';
import { FleetMonitor } from './components/FleetMonitor';
import { AiAssistant } from './components/AiAssistant';
import { SystemLogs } from './components/SystemLogs';
import { MouseLight } from './components/MouseLight';
import { CustomCursor } from './components/CustomCursor';
import { Shield, AlertTriangle, Radio, Activity, Zap, Keyboard } from 'lucide-react';

/* ── Boot Sequence ───────────────────────────────────── */
const BOOT_STEPS = [
  'NETWORK LINK',
  'AI ENGINE',
  'DISPATCH ENGINE',
  'FLEET TELEMETRY',
  'RADAR ARRAY',
  'COMMAND INTELLIGENCE',
];

function BootScreen({ onComplete }: { onComplete: () => void }) {
  const [step, setStep] = useState(0);
  const [done, setDone] = useState(false);

  useEffect(() => {
    if (step < BOOT_STEPS.length) {
      const t = setTimeout(() => setStep(s => s + 1), 240);
      return () => clearTimeout(t);
    } else {
      const t = setTimeout(() => { setDone(true); setTimeout(onComplete, 400); }, 300);
      return () => clearTimeout(t);
    }
  }, [step, onComplete]);

  return (
    <div
      className="fixed inset-0 z-[9998] flex flex-col items-center justify-center hud-grid"
      style={{ background: '#070B10', transition: 'opacity 0.4s', opacity: done ? 0 : 1 }}
    >
      <div className="mb-8 text-center">
        <div className="flex items-center justify-center gap-3 mb-2">
          <Shield className="w-8 h-8" style={{ color: '#4FA3D1' }} />
          <span className="text-3xl font-black tracking-[0.25em] uppercase" style={{ color: '#E8F0F5' }}>
            RESCUEAI
          </span>
        </div>
        <div className="text-xs tracking-[0.35em] uppercase font-mono" style={{ color: '#8EA2B2' }}>
          Emergency Response Network
        </div>
      </div>

      <div className="w-72 space-y-2 font-mono text-xs">
        {BOOT_STEPS.map((s, i) => (
          <div
            key={s}
            className="flex items-center gap-3 boot-item"
            style={{ animationDelay: `${i * 230}ms`, color: i < step ? '#45B87A' : '#243442' }}
          >
            <span>{i < step ? '[✓]' : '[ ]'}</span>
            <span>{s}</span>
          </div>
        ))}
        {step >= BOOT_STEPS.length && (
          <div className="mt-4 text-center tracking-[0.3em] boot-item" style={{ color: '#4FA3D1' }}>
            SYSTEM READY
          </div>
        )}
      </div>
    </div>
  );
}

/* ── Live Clock ──────────────────────────────────────── */
function LiveClock() {
  const [time, setTime] = useState(new Date());
  useEffect(() => {
    const t = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(t);
  }, []);
  return (
    <span className="font-mono text-xs" style={{ color: '#4FA3D1' }}>
      {time.toLocaleTimeString('en-US', { hour12: false })}
    </span>
  );
}

/* ── App ─────────────────────────────────────────────── */
function App() {
  const [booting, setBooting] = useState(true);
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [responders, setResponders] = useState<Responder[]>([]);
  const [selectedIncidentId, setSelectedIncidentId] = useState<string | null>(null);
  const [logs, setLogs] = useState<{ time: string; text: string }[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const addLog = useCallback((text: string) => {
    const timeStr = new Date().toLocaleTimeString('en-US', { hour12: false });
    setLogs(prev => [{ time: timeStr, text }, ...prev].slice(0, 120));
  }, []);

  const loadInitialData = useCallback(async () => {
    try {
      const [inc, res] = await Promise.all([fetchIncidents(), fetchResponders()]);
      setIncidents(inc);
      setResponders(res);
    } catch {
      addLog('ERR  Failed to fetch initial state from server.');
    }
  }, [addLog]);

  useEffect(() => {
    const socket: Socket = io('http://localhost:5000');
    socket.on('connect', () => { setIsConnected(true); addLog('LINK  Secure link established with RescueAI Dispatch Node.'); loadInitialData(); });
    socket.on('disconnect', () => { setIsConnected(false); addLog('WARN  Secure link severed. Reconnecting...'); });
    socket.on('incident_created', (inc: Incident) => {
      setIncidents(p => [inc, ...p]);
      addLog(`INC   ${inc.incidentId} · ${inc.type} @ ${inc.location.address}`);
      if (inc.priority === 'CRITICAL' || inc.priority === 'HIGH') {
        setToasts(prev => [
          ...prev,
          {
            id: inc.incidentId,
            type: inc.type,
            priority: inc.priority,
            address: inc.location.address,
          },
        ]);
      }
    });
    socket.on('incident_updated', (upd: Incident) => {
      setIncidents(p => p.map(i => i.incidentId === upd.incidentId ? upd : i));
      addLog(`UPD   ${upd.incidentId} → ${upd.status}`);
    });
    socket.on('responders_updated', async () => {
      try { setResponders(await fetchResponders()); } catch {}
    });
    socket.on('system_log', addLog);
    return () => { socket.disconnect(); };
  }, [addLog, loadInitialData]);

  // Keyboard listeners for hotkeys (Esc = deselect, N = new incident)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setSelectedIncidentId(null);
      } else if (
        (e.key === 'N' || e.key === 'n') &&
        document.activeElement?.tagName !== 'INPUT' &&
        document.activeElement?.tagName !== 'TEXTAREA'
      ) {
        setSelectedIncidentId(null); // deselect to show new incident form
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const closeToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  const actionToast = useCallback((id: string) => {
    setSelectedIncidentId(id);
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  const currentSelectedIncident = incidents.find(i => i.incidentId === selectedIncidentId) || null;
  const activeIncidentsCount = incidents.filter(i => i.status !== 'RESOLVED').length;
  const activeRespondersEnRoute = responders.filter(r => r.status === 'EN_ROUTE').length;
  const respondersAvailableCount = responders.filter(r => r.status === 'AVAILABLE').length;
  const criticalCount = incidents.filter(i => i.priority === 'CRITICAL' && i.status !== 'RESOLVED').length;

  return (
    <>
      {booting && <BootScreen onComplete={() => setBooting(false)} />}
      <MouseLight />
      <CustomCursor />
      <ToastNotification toasts={toasts} onClose={closeToast} onAction={actionToast} />

      <div
        className="min-h-screen flex flex-col select-none hud-grid"
        style={{ background: '#070B10', color: '#E8F0F5', padding: '12px 16px' }}
      >
        {/* ── TOP NAV BAR ─────────────────────────────────── */}
        <header
          className="relative z-10 flex items-center justify-between mb-4 px-4 py-2.5 hud-bracket"
          style={{ background: '#0D141C', border: '1px solid #243442', borderRadius: '6px' }}
        >
          {/* Left – Branding */}
          <div className="flex items-center gap-3">
            <div className="relative flex items-center justify-center w-8 h-8">
              <Shield className="w-5 h-5" style={{ color: '#4FA3D1' }} />
              <span className="absolute inset-0 rounded-sm animate-ping" style={{ background: 'rgba(79,163,209,0.08)', animationDuration: '2.5s' }} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-base font-black tracking-[0.2em] uppercase" style={{ color: '#E8F0F5' }}>RESCUEAI</span>
                <span
                  className="text-[9px] font-mono font-bold tracking-widest px-1.5 py-0.5 rounded-sm"
                  style={{ background: 'rgba(79,163,209,0.12)', color: '#4FA3D1', border: '1px solid rgba(79,163,209,0.25)' }}
                >
                  EMERGENCY RESPONSE NETWORK
                </span>
              </div>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span className={`status-dot ${isConnected ? 'online' : 'offline'}`} />
                <span className="text-[10px] font-mono" style={{ color: '#8EA2B2' }}>
                  {isConnected ? 'NETWORK · ONLINE' : 'RECONNECTING...'}
                </span>
              </div>
            </div>
          </div>

          {/* Center – System time + hotkeys reminder */}
          <div className="hidden md:flex items-center gap-6">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-sm" style={{ background: '#111B24', border: '1px solid #243442' }}>
              <Keyboard className="w-3.5 h-3.5" style={{ color: '#8EA2B2' }} />
              <span className="text-[9px] font-mono" style={{ color: '#8EA2B2' }}>
                HOTKEYS: <kbd className="text-[#E8F0F5] px-1 bg-[#0D141C] border border-[#243442] rounded-sm">N</kbd> REPORT · <kbd className="text-[#E8F0F5] px-1 bg-[#0D141C] border border-[#243442] rounded-sm">ESC</kbd> DESELECT
              </span>
            </div>
            <div className="text-center">
              <div className="text-[9px] font-mono tracking-widest uppercase" style={{ color: '#8EA2B2' }}>LOCAL TIME</div>
              <LiveClock />
            </div>
            <div className="text-center">
              <div className="text-[9px] font-mono tracking-widest uppercase" style={{ color: '#8EA2B2' }}>SYSTEM</div>
              <span className="text-xs font-mono font-bold" style={{ color: '#45B87A' }}>ONLINE</span>
            </div>
          </div>

          {/* Right – KPIs */}
          <div className="flex gap-3 items-center">
            {criticalCount > 0 && (
              <div
                className="flex items-center gap-2 px-3 py-1.5 rounded-sm animate-pulse"
                style={{ background: 'rgba(229,72,72,0.12)', border: '1px solid rgba(229,72,72,0.35)' }}
              >
                <Zap className="w-3.5 h-3.5" style={{ color: '#E54848' }} />
                <span className="text-xs font-mono font-bold" style={{ color: '#E54848' }}>{criticalCount} CRITICAL</span>
              </div>
            )}
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-sm transition-all" style={{ background: '#111B24', border: '1px solid #243442' }}>
              <AlertTriangle className="w-3.5 h-3.5" style={{ color: '#E0A43A' }} />
              <div>
                <div className="text-[8px] font-mono uppercase" style={{ color: '#8EA2B2' }}>ACTIVE</div>
                <div className="text-sm font-black leading-none" style={{ color: '#E8F0F5' }}>{activeIncidentsCount}</div>
              </div>
            </div>
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-sm transition-all" style={{ background: '#111B24', border: '1px solid #243442' }}>
              <Radio className="w-3.5 h-3.5" style={{ color: '#4FA3D1' }} />
              <div>
                <div className="text-[8px] font-mono uppercase" style={{ color: '#8EA2B2' }}>EN ROUTE</div>
                <div className="text-sm font-black leading-none" style={{ color: '#E8F0F5' }}>{activeRespondersEnRoute}</div>
              </div>
            </div>
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-sm transition-all" style={{ background: '#111B24', border: '1px solid #243442' }}>
              <Activity className="w-3.5 h-3.5" style={{ color: '#45B87A' }} />
              <div>
                <div className="text-[8px] font-mono uppercase" style={{ color: '#8EA2B2' }}>STANDBY</div>
                <div className="text-sm font-black leading-none" style={{ color: '#E8F0F5' }}>{respondersAvailableCount}</div>
              </div>
            </div>
          </div>
        </header>

        {/* ── MAIN GRID ───────────────────────────────────── */}
        <main className="relative z-10 flex flex-col gap-4 flex-1">

          {/* Row 1 – List + Radar + Incident Intelligence */}
          <section className="grid grid-cols-1 lg:grid-cols-12 gap-4">
            <div className="lg:col-span-3">
              <IncidentList
                incidents={incidents}
                selectedIncidentId={selectedIncidentId}
                onSelectIncident={id => setSelectedIncidentId(id)}
              />
            </div>
            <div className="lg:col-span-4">
              <RadarMap
                incidents={incidents}
                responders={responders}
                selectedIncident={currentSelectedIncident}
                onSelectIncident={inc => setSelectedIncidentId(inc.incidentId)}
              />
            </div>
            <div className="lg:col-span-5">
              <IncidentControl
                selectedIncident={currentSelectedIncident}
                onClearSelection={() => setSelectedIncidentId(null)}
                availableResponders={responders.filter(r => r.status === 'AVAILABLE')}
              />
            </div>
          </section>

          {/* Row 2 – Event Stream + Command Intelligence */}
          <section className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <SystemLogs logs={logs} onClearLogs={() => setLogs([])} />
            <AiAssistant />
          </section>

          {/* Row 3 – Fleet Telemetry */}
          <section>
            <FleetMonitor responders={responders} />
          </section>

        </main>

        {/* ── FOOTER ──────────────────────────────────────── */}
        <footer className="mt-4 flex items-center justify-between text-[9px] font-mono" style={{ color: '#243442' }}>
          <span>RESCUEAI · EMERGENCY RESPONSE NETWORK · v2.0</span>
          <span>ALL OPERATIONS ARE MONITORED AND RECORDED · {new Date().getFullYear()}</span>
        </footer>
      </div>
    </>
  );
}

export default App;
