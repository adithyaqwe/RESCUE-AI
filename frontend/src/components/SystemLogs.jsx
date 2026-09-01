import React, { useEffect, useRef } from 'react';
import { Trash2, Radio } from 'lucide-react';

const categorize = (text) => {
  const t = (text || '').toUpperCase();
  if (t.startsWith('ERR') || t.includes('ERROR') || t.includes('FAIL')) {
    return { label: 'ERROR', color: '#C62828', bg: '#FFEBEE' };
  }
  if (t.startsWith('WARN') || t.includes('ALERT') || t.includes('DISCONNECT')) {
    return { label: 'ALERT', color: '#B8620A', bg: '#FFF3E0' };
  }
  if (t.startsWith('INTAKE') || t.includes('CASE')) {
    return { label: 'INTAKE', color: '#164E3D', bg: '#E8F0EC' };
  }
  if (t.includes('STATUS') || t.includes('UPDATE')) {
    return { label: 'STATUS', color: '#2864C7', bg: '#E8F0FE' };
  }
  if (t.includes('DISPATCH') || t.includes('EN_ROUTE')) {
    return { label: 'DISPATCH', color: '#2864C7', bg: '#E8F0FE' };
  }
  if (t.startsWith('LINK') || t.includes('CONNECT')) {
    return { label: 'NETWORK', color: '#237A4B', bg: '#E8F5E9' };
  }
  return { label: 'INFO', color: '#5D6862', bg: '#F0F2EF' };
};

export const SystemLogs = ({ logs = [], onClearLogs }) => {
  const ref = useRef(null);

  useEffect(() => {
    if (ref.current) ref.current.scrollTop = 0;
  }, [logs]);

  return (
    <div className="flex flex-col bg-[#FFFFFF] border border-[#DDE2DD] rounded-md h-full min-h-[500px] p-5 select-none shadow-2xs">
      {/* Header */}
      <div className="flex items-center justify-between mb-4 pb-3 border-b border-[#DDE2DD]">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-[17px] font-semibold text-[#17201C] m-0">
              Operational Event Stream
            </h3>
            <span className="flex items-center gap-1 text-[11px] font-medium text-[#237A4B] bg-[#E8F5E9] px-1.5 py-0.5 rounded border border-[#C8E6C9]">
              <Radio className="w-2.5 h-2.5 animate-pulse" />
              <span>LIVE</span>
            </span>
          </div>
          <div className="text-[12px] text-[#5D6862] mt-0.5">
            {logs.length} dispatch transactions and AVL updates recorded
          </div>
        </div>

        {onClearLogs && (
          <button
            onClick={onClearLogs}
            className="flex items-center gap-1.5 text-[12px] px-2.5 py-1 rounded bg-[#F5F6F3] border border-[#DDE2DD] text-[#5D6862] hover:text-[#C62828] hover:border-[#EF9A9A] transition-colors cursor-pointer"
          >
            <Trash2 className="w-3 h-3" />
            <span>Clear stream</span>
          </button>
        )}
      </div>

      {/* Log Feed */}
      <div ref={ref} className="flex-1 overflow-y-auto space-y-2 pr-1">
        {logs.length === 0 ? (
          <div className="h-40 flex items-center justify-center text-[13px] text-[#7B847F] italic">
            Awaiting live telemetry events...
          </div>
        ) : (
          logs.map((log, i) => {
            const cat = categorize(log.text);
            return (
              <div
                key={i}
                className="p-2.5 rounded bg-[#F5F6F3] border border-[#DDE2DD] text-[12.5px] flex items-start gap-2.5"
              >
                <span className="font-mono text-[#7B847F] text-[11.5px] shrink-0 pt-0.5">
                  {log.time}
                </span>

                <span
                  className="text-[10px] font-bold px-1.5 py-0.5 rounded shrink-0 uppercase tracking-wide"
                  style={{ background: cat.bg, color: cat.color }}
                >
                  {cat.label}
                </span>

                <span className="text-[#17201C] font-mono leading-relaxed flex-1 break-words">
                  {log.text}
                </span>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default SystemLogs;
