import React from 'react';
import { Terminal, Trash2 } from 'lucide-react';
import { useEffect, useRef } from 'react';

interface SystemLogsProps {
  logs: { time: string; text: string }[];
  onClearLogs: () => void;
}

const categorize = (text: string) => {
  const t = text.toUpperCase();
  if (t.startsWith('ERR') || t.includes('ERROR') || t.includes('FAIL')) return { label: 'ERR ', color: '#E54848' };
  if (t.startsWith('WARN') || t.includes('ALERT') || t.includes('SEVERED')) return { label: 'WARN', color: '#E0A43A' };
  if (t.startsWith('INC ') || t.includes('INCIDENT')) return { label: 'INC ', color: '#E0A43A' };
  if (t.startsWith('UPD ') || t.includes('UPDATE')) return { label: 'UPD ', color: '#4FA3D1' };
  if (t.includes('DISPATCH') || t.includes('EN_ROUTE')) return { label: 'DISP', color: '#4FA3D1' };
  if (t.startsWith('LINK') || t.includes('ESTABLISH') || t.includes('SYNC')) return { label: 'LINK', color: '#45B87A' };
  return { label: 'SYS ', color: '#8EA2B2' };
};

export const SystemLogs: React.FC<SystemLogsProps> = ({ logs, onClearLogs }) => {
  const ref = useRef<HTMLDivElement>(null);

  // Logs are now newest-first from App.tsx so don't auto-scroll needed, but keep for safety
  useEffect(() => {
    if (ref.current) ref.current.scrollTop = 0;
  }, [logs]);

  return (
    <div
      className="flex flex-col hud-bracket"
      style={{
        background: '#0D141C',
        border: '1px solid #243442',
        borderRadius: '6px',
        height: '300px',
        padding: '14px',
      }}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="text-[9px] font-mono tracking-widest uppercase" style={{ color: '#8EA2B2' }}>
            01 //
          </div>
          <Terminal className="w-3.5 h-3.5" style={{ color: '#4FA3D1' }} />
          <span className="text-xs font-bold tracking-widest uppercase" style={{ color: '#E8F0F5' }}>
            Event Stream
          </span>
          <span
            className="text-[8px] font-mono px-1.5 py-0.5 rounded-sm"
            style={{ background: '#111B24', border: '1px solid #243442', color: '#8EA2B2' }}
          >
            {logs.length} EVENTS
          </span>
        </div>
        <button
          onClick={onClearLogs}
          className="flex items-center gap-1 text-[9px] font-mono px-2 py-1 rounded-sm transition-colors"
          style={{ background: '#111B24', border: '1px solid #243442', color: '#8EA2B2' }}
          onMouseEnter={e => (e.currentTarget.style.color = '#E54848')}
          onMouseLeave={e => (e.currentTarget.style.color = '#8EA2B2')}
        >
          <Trash2 className="w-2.5 h-2.5" />
          PURGE
        </button>
      </div>

      <hr className="hud-divider mb-3" />

      {/* Stream */}
      <div
        ref={ref}
        className="flex-1 overflow-y-auto space-y-1"
        style={{ fontFamily: "'JetBrains Mono', monospace" }}
      >
        {logs.length === 0 ? (
          <div className="text-[10px] italic" style={{ color: '#243442' }}>
            Awaiting system events...
          </div>
        ) : (
          logs.map((log, i) => {
            const cat = categorize(log.text);
            return (
              <div key={i} className="flex items-start gap-2 text-[10px] leading-snug">
                <span className="shrink-0 font-mono" style={{ color: '#243442' }}>{log.time}</span>
                <span className="shrink-0 font-mono font-bold w-9" style={{ color: cat.color }}>{cat.label}</span>
                <span style={{ color: '#8EA2B2' }}>{log.text}</span>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
