import { useEffect, useState, useCallback } from 'react';
import { io } from 'socket.io-client';
import {
  fetchIncidents,
  fetchResponders,
} from './api';
import { RadarMap } from './components/RadarMap';
import { IncidentControl } from './components/IncidentControl';
import { IncidentList } from './components/IncidentList';
import { CallIntake } from './components/CallIntake';
import { ToastNotification } from './components/ToastNotification';
import { FleetMonitor } from './components/FleetMonitor';
import { AiAssistant } from './components/AiAssistant';
import { SystemLogs } from './components/SystemLogs';
import { StatusBar } from './components/StatusBar';
import { MouseLight } from './components/MouseLight';
import { CustomCursor } from './components/CustomCursor';

/* ── Live Dual Clocks (IST / UTC) ────────────────────── */
function DualClock() {
  const [time, setTime] = useState(new Date());
  useEffect(() => {
    const t = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  return (
    <div className="text-[12px] flex items-center gap-3 text-[#6B7280] select-none">
      <div>
        <span className="text-[#F0F1F2] font-semibold font-mono">
          {time.toLocaleTimeString('en-IN', { timeZone: 'Asia/Kolkata', hour12: false })}
        </span>
        <span className="text-[#6B7280] text-[11px] ml-1">IST</span>
      </div>
      <div className="border-l border-[#2A2D31] pl-3 hidden sm:block">
        <span className="font-mono text-[#6B7280]">
          {time.toISOString().substring(11, 19)}Z
        </span>
      </div>
    </div>
  );
}

/* ── Main Application Component ──────────────────────── */
export function App() {
  const [activeView, setActiveView] = useState('hud');
  const [incidents, setIncidents] = useState([]);
  const [responders, setResponders] = useState([]);
  const [selectedIncidentId, setSelectedIncidentId] = useState(null);
  const [logs, setLogs] = useState([]);
  const [isConnected, setIsConnected] = useState(false);
  const [toasts, setToasts] = useState([]);

  const addLog = useCallback((text) => {
    const timeStr = new Date().toLocaleTimeString('en-US', { hour12: false });
    setLogs(prev => [{ time: timeStr, text }, ...prev].slice(0, 150));
  }, []);

  const loadInitialData = useCallback(async () => {
    try {
      const [inc, res] = await Promise.all([fetchIncidents(), fetchResponders()]);
      setIncidents(inc || []);
      setResponders(res || []);
    } catch {
      addLog('ERR  Failed to connect with dispatch database.');
    }
  }, [addLog]);

  useEffect(() => {
    const socketUrl = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000';
    const socket = io(socketUrl, {
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionAttempts: 10,
    });

    socket.on('connect', () => {
      setIsConnected(true);
      addLog('LINK  CAD server connected. Real-time Socket data link active.');
      loadInitialData();
    });

    socket.on('disconnect', () => {
      setIsConnected(false);
      addLog('WARN  CAD server disconnected. Retrying link...');
    });

    socket.on('connect_error', () => {
      setIsConnected(false);
    });

    socket.on('incident_created', (inc) => {
      setIncidents(p => [inc, ...p]);
      addLog(`INTAKE  Case #${inc.incidentId} · ${inc.type} @ ${inc.location?.address}`);
      if (inc.priority === 'CRITICAL' || inc.priority === 'HIGH') {
        setToasts(prev => [
          ...prev,
          {
            id: inc.incidentId,
            type: inc.type,
            priority: inc.priority,
            address: inc.location?.address,
          },
        ]);
      }
    });

    socket.on('incident_updated', (upd) => {
      setIncidents(p => p.map(i => (i.incidentId === upd.incidentId ? upd : i)));
      addLog(`STATUS  Case #${upd.incidentId} updated to ${upd.status}`);
    });

    socket.on('responder_location_update', (upd) => {
      setResponders(p => p.map(r => (r.unitId === upd.unitId ? { ...r, ...upd } : r)));
    });

    socket.on('responders_updated', async () => {
      try {
        setResponders(await fetchResponders());
      } catch {
        // Handled
      }
    });

    socket.on('system_log', addLog);

    return () => {
      socket.disconnect();
    };
  }, [addLog, loadInitialData]);


  // Keyboard Shortcuts
  useEffect(() => {
    const handleKeyDown = (e) => {
      const target = document.activeElement;
      const isInput = target?.tagName === 'INPUT' || target?.tagName === 'TEXTAREA';
      if (isInput) return;

      if (e.key === 'Escape') {
        setSelectedIncidentId(null);
      } else if (e.key === 'N' || e.key === 'n') {
        setSelectedIncidentId(null);
        setActiveView('intake');
      } else if (e.key === '1') {
        setActiveView('hud');
      } else if (e.key === '2') {
        setActiveView('intake');
      } else if (e.key === '3') {
        setActiveView('fleet');
      } else if (e.key === '4') {
        setActiveView('archive');
      } else if (e.key === '5') {
        setActiveView('comms');
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const closeToast = useCallback((id) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  const actionToast = useCallback((id) => {
    setSelectedIncidentId(id);
    setActiveView('hud');
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  const currentSelectedIncident = incidents.find(i => i.incidentId === selectedIncidentId) || null;
  const criticalCount = incidents.filter(i => i.status !== 'RESOLVED' && i.priority === 'CRITICAL').length;
  const activeFleetCount = responders.length;

  return (
    <>
      <MouseLight />
      <CustomCursor />
      <ToastNotification toasts={toasts} onClose={closeToast} onAction={actionToast} />

      <div className="h-screen w-screen flex flex-col bg-[#F5F6F3] text-[#17201C] overflow-hidden select-none">
        {/* ── HEADER ─────────────────────────────────────────────── */}
        <header className="h-14 px-5 bg-[#FFFFFF] border-b border-[#DDE2DD] flex items-center justify-between shrink-0 z-30 select-none shadow-2xs">
          {/* Left: Brand Wordmark + Navigation */}
          <div className="flex items-center gap-6 h-full">
            <div className="flex items-center gap-2">
              <span className="text-[20px] font-bold tracking-tight text-[#164E3D]">
                RESCUEAI
              </span>
              <span className="text-[11px] font-medium text-[#7B847F] uppercase tracking-wider pl-2 border-l border-[#DDE2DD]">
                EOC CAD
              </span>
            </div>

            <nav className="flex items-center gap-0.5 h-full">
              <button
                onClick={() => setActiveView('hud')}
                className={`nav-tab cursor-pointer flex items-center gap-1.5 h-full ${activeView === 'hud' ? 'active' : ''
                  }`}
              >
                <span>Operations</span>
              </button>

              <button
                onClick={() => {
                  setSelectedIncidentId(null);
                  setActiveView('intake');
                }}
                className={`nav-tab cursor-pointer flex items-center gap-1.5 h-full ${activeView === 'intake' ? 'active' : ''
                  }`}
              >
                <span>New Call</span>
              </button>

              <button
                onClick={() => setActiveView('fleet')}
                className={`nav-tab cursor-pointer flex items-center gap-1.5 h-full ${activeView === 'fleet' ? 'active' : ''
                  }`}
              >
                <span>Fleet Roster</span>
              </button>

              <button
                onClick={() => setActiveView('archive')}
                className={`nav-tab cursor-pointer flex items-center gap-1.5 h-full ${activeView === 'archive' ? 'active' : ''
                  }`}
              >
                <span>Call Archive</span>
              </button>

              <button
                onClick={() => setActiveView('comms')}
                className={`nav-tab cursor-pointer flex items-center gap-1.5 h-full ${activeView === 'comms' ? 'active' : ''
                  }`}
              >
                <span>Assistant & Logs</span>
              </button>
            </nav>
          </div>

          {/* Right: Operational Status Metrics + Dual Clocks */}
          <div className="flex items-center gap-3.5 shrink-0">
            {/* Live Critical Indicator */}
            {criticalCount > 0 && (
              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-[#FFEBEE] border border-[#EF9A9A] text-[#C62828] text-[11.5px] font-semibold">
                <span className="w-1.5 h-1.5 rounded-full bg-[#C62828]" style={{ animation: 'slow-pulse 1.8s ease-in-out infinite' }} />
                <span>{criticalCount} Critical</span>
              </div>
            )}

            {/* Active Fleet AVL Badge */}
            <div className="hidden lg:flex items-center gap-1.5 text-[12px] text-[#5D6862]">
              <span className="w-1.5 h-1.5 rounded-full bg-[#237A4B]" />
              <span className="font-mono font-semibold text-[#17201C]">{activeFleetCount}</span>
              <span className="text-[#5D6862]">Units AVL</span>
            </div>

            <div className="h-4 w-[1px] bg-[#DDE2DD] hidden sm:block" />

            {/* Clocks */}
            <DualClock />

            <div className="h-4 w-[1px] bg-[#DDE2DD]" />

            {/* CAD Live Link */}
            <div className="flex items-center gap-1.5">
              <span className={`status-dot ${isConnected ? 'online' : 'offline'}`} />
              <span className="text-[12px] text-[#5D6862] font-medium whitespace-nowrap">
                {isConnected ? 'CAD Live' : 'Disconnected'}
              </span>
            </div>

            {/* Station Label */}
            <div className="hidden xl:block pl-3 border-l border-[#DDE2DD] text-[12px] text-[#5D6862] whitespace-nowrap">
              <span className="text-[#17201C] font-semibold">Vadodara Municipal EOC</span>
              <span> · Stn 04</span>
            </div>
          </div>
        </header>

        {/* ── MAIN WORKSPACE ─────────────────────────────────────────────── */}
        <div className="flex-1 flex min-h-0 relative overflow-hidden bg-[#F5F6F3]">

          {/* VIEW 1: OPERATIONS CONSOLE (Queue + 3D Map + Right Command Dossier) */}
          {activeView === 'hud' && (
            <div className="flex-1 flex min-h-0 w-full">
              {/* Left: Incident Queue */}
              <div className="w-[360px] xl:w-[400px] shrink-0 h-full">
                <IncidentList
                  incidents={incidents}
                  selectedIncidentId={selectedIncidentId}
                  onSelectIncident={id => setSelectedIncidentId(id)}
                  onNewIncident={() => setActiveView('intake')}
                />
              </div>

              {/* Center Panel: True Municipal 3D GIS Cartography Workspace */}
              <div className="flex-1 h-full min-w-0 relative p-2 bg-[#0A0B0C]">
                <RadarMap
                  incidents={incidents}
                  responders={responders}
                  selectedIncident={currentSelectedIncident}
                  onSelectIncident={inc => setSelectedIncidentId(inc.incidentId)}
                  onOpenDispatch={inc => setSelectedIncidentId(inc.incidentId)}
                  hasOpenDossier={Boolean(currentSelectedIncident)}
                />
              </div>

              {/* Right: Dispatch Dossier */}
              {currentSelectedIncident && (
                <aside className="w-[400px] xl:w-[440px] shrink-0 h-full z-20 border-l border-[#2A2D31]">
                  <IncidentControl
                    selectedIncident={currentSelectedIncident}
                    onClearSelection={() => setSelectedIncidentId(null)}
                    availableResponders={responders.filter(r => r.status === 'AVAILABLE')}
                    onOpenIntake={() => setActiveView('intake')}
                  />
                </aside>
              )}
            </div>
          )}

          {/* VIEW 2: NEW CALL INTAKE */}
          {activeView === 'intake' && (
            <div className="flex-1 p-8 pb-16 overflow-y-auto bg-[#0A0B0C]">
              <CallIntake
                onIncidentCreated={incidentId => {
                  setSelectedIncidentId(incidentId);
                  setActiveView('hud');
                }}
              />
            </div>
          )}

          {/* VIEW 3: APPARATUS FLEET ROSTER */}
          {activeView === 'fleet' && (
            <div className="flex-1 p-6 pb-16 overflow-y-auto bg-[#0A0B0C]">
              <FleetMonitor responders={responders} />
            </div>
          )}

          {/* VIEW 4: INCIDENT ARCHIVE */}
          {activeView === 'archive' && (
            <div className="flex-1 p-6 pb-16 overflow-y-auto bg-[#0A0B0C]">
              <div className="max-w-6xl mx-auto bg-[#111316] border border-[#2A2D31] rounded p-6">
                <div className="flex items-center justify-between mb-5 pb-3 border-b border-[#E2E5DF]">
                  <div>
                    <h2 className="text-[20px] font-semibold text-[#111417] m-0">
                      Emergency Call Archive
                    </h2>
                    <p className="text-[13px] text-[#78828C] m-0 mt-0.5">
                      Historical log of all dispatched and resolved municipal incidents
                    </p>
                  </div>
                  <span className="text-[12px] font-medium px-2.5 py-0.5 rounded bg-[#F0F2EE] text-[#475059]">
                    {incidents.length} logged
                  </span>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-[13px] border-collapse">
                    <thead>
                      <tr className="border-b border-[#E2E5DF] text-[11.5px] text-[#78828C] font-semibold uppercase tracking-wider">
                        <th className="py-2.5 px-3">Case</th>
                        <th className="py-2.5 px-3">Type</th>
                        <th className="py-2.5 px-3">Priority</th>
                        <th className="py-2.5 px-3">Status</th>
                        <th className="py-2.5 px-3">Location</th>
                        <th className="py-2.5 px-3">Casualties</th>
                        <th className="py-2.5 px-3">Response time</th>
                        <th className="py-2.5 px-3">Logged</th>
                        <th className="py-2.5 px-3">Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {incidents.map(inc => (
                        <tr key={inc._id} className="border-b border-[#EAECE8] hover:bg-[#F9FAF8] transition-colors">
                          <td className="py-2.5 px-3 font-mono font-semibold text-[#111417]">#{inc.incidentId}</td>
                          <td className="py-2.5 px-3 text-[#111417] font-medium">{inc.type}</td>
                          <td className="py-2.5 px-3">
                            <div className="flex items-center gap-1.5">
                              <span
                                className="w-2 h-2 rounded-full"
                                style={{
                                  background: inc.priority === 'CRITICAL' ? '#BA1A1A' : inc.priority === 'HIGH' ? '#B45309' : '#1D4ED8',
                                }}
                              />
                              <span className="text-[#475059] font-medium text-[12px]">
                                {inc.priority === 'CRITICAL' ? 'Critical' : inc.priority === 'HIGH' ? 'High' : 'Standard'}
                              </span>
                            </div>
                          </td>
                          <td className="py-2.5 px-3 text-[#475059]">{inc.status}</td>
                          <td className="py-2.5 px-3 text-[#475059] max-w-xs truncate">{inc.location?.address}</td>
                          <td className="py-2.5 px-3">
                            {inc.victimsCount > 0 ? (
                              <span className="text-[#BA1A1A] font-semibold">{inc.victimsCount} casualties</span>
                            ) : (
                              <span className="text-[#167A39]">None</span>
                            )}
                          </td>
                          <td className="py-2.5 px-3">
                            {inc.status === 'RESOLVED' && inc.responseTimeMs ? (
                              <span className="text-[#167A39] font-semibold font-mono">
                                {(inc.responseTimeMs / 60000).toFixed(1)}m
                              </span>
                            ) : inc.estimatedArrival ? (
                              <span className="text-[#B45309] font-mono font-medium">ETA ~{inc.estimatedArrival}m</span>
                            ) : (
                              <span className="text-[#78828C]">Pending</span>
                            )}
                          </td>
                          <td className="py-2.5 px-3 text-[#78828C] font-mono text-[11.5px]">
                            {new Date(inc.createdAt).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}
                          </td>
                          <td className="py-2.5 px-3">
                            <button
                              onClick={() => {
                                setSelectedIncidentId(inc.incidentId);
                                setActiveView('hud');
                              }}
                              className="px-2.5 py-1 rounded text-[12px] font-medium text-[#19483A] bg-[#EDF3F0] hover:bg-[#19483A] hover:text-white transition-colors cursor-pointer"
                            >
                              Inspect
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* VIEW 5: DISPATCH ASSISTANT & LOGS */}
          {activeView === 'comms' && (
            <div className="flex-1 p-5 grid grid-cols-1 lg:grid-cols-2 gap-4 bg-[#0A0B0C] min-h-0 overflow-hidden">
              <SystemLogs logs={logs} onClearLogs={() => setLogs([])} />
              <AiAssistant />
            </div>
          )}
        </div>
      </div>
    </>
  );
}

export default App;
