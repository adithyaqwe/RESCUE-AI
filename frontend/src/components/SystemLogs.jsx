import React, { useEffect, useRef } from 'react';
import { Trash2, Radio } from 'lucide-react';

const categorize = (text) => {
  const t = (text || '').toUpperCase();
  if (t.startsWith('ERR') || t.includes('ERROR') || t.includes('FAIL')) {
    return { label: 'ERROR', color: '#BA1A1A', bg: '#FEF2F2' };
  }
  if (t.startsWith('WARN') || t.includes('ALERT') || t.includes('DISCONNECT')) {
    return { label: 'ALERT', color: '#B45309', bg: '#FFFBEB' };
  }
  if (t.startsWith('INTAKE') || t.includes('CASE')) {
    return { label: 'INTAKE', color: '#19483A', bg: '#EDF3F0' };
  }
  if (t.includes('STATUS') || t.includes('UPDATE')) {
    return { label: 'STATUS', color: '#1D4ED8', bg: '#EFF6FF' };
  }
  if (t.includes('DISPATCH') || t.includes('EN_ROUTE')) {
    return { label: 'DISPATCH', color: '#1D4ED8', bg: '#EFF6FF' };
  }
  if (t.startsWith('LINK') || t.includes('CONNECT')) {
    return { label: 'NETWORK', color: '#167A39', bg: '#F0FDF4' };
  }
  return { label: 'INFO', color: '#475059', bg: '#F0F2EE' };
};

export const SystemLogs = ({ logs = [], onClearLogs }) => {
  const ref = useRef(null);

  useEffect(() => {
    if (ref.current) ref.current.scrollTop = 0;
  }, [logs]);

  return (
    <div className="flex flex-col bg-[#FFFFFF] border border-[#E2E5DF] rounded-md h-full min-h-[500px] p-5 select-none shadow-2xs">
      {/* Header */}
      <div className="flex items-center justify-between mb-4 pb-3 border-b border-[#E2E5DF]">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-[17px] font-semibold text-[#111417] m-0">
              Operational Event Stream
            </h3>
            <span className="flex items-center gap-1 text-[11px] font-medium text-[#167A39] bg-[#F0FDF4] px-1.5 py-0.5 rounded border border-[#BBF7D0]">
              <Radio className="w-2.5 h-2.5 animate-pulse" />
              <span>LIVE</span>
            </span>
          </div>
          <div className="text-[12px] text-[#78828C] mt-0.5">
            {logs.length} dispatch transactions and AVL updates recorded
          </div>
        </div>

        <button
          onClick={onClearLogs}
          className="flex items-center gap-1.5 text-[12px] px-2.5 py-1 rounded bg-[#F6F7F5] border border-[#E2E5DF] text-[#475059] hover:text-[#BA1A1A] hover:border-[#FECACA] transition-colors cursor-pointer"
        >
          <Trash2 className="w-3 h-3" />
          <span>Clear stream</span>
        </button>
      </div>

      {/* Vertical Timeline Feed */}
      <div
        ref={ref}
        className="flex-1 overflow-y-auto divide-y divide-[#F0F2EE] font-mono text-[12px]"
      >
        {logs.length === 0 ? (
          <div className="h-44 flex items-center justify-center text-[13px] text-[#78828C] italic">
            Awaiting operational transactions...
          </div>
        ) : (
          logs.map((log, i) => {
            const cat = categorize(log.text);
            return (
              <div key={i} className="py-2.5 flex items-start gap-3 leading-snug hover:bg-[#F9FAF8] px-1 rounded transition-colors">
                <span className="text-[#78828C] shrink-0 text-[11.5px] font-medium">
                  {log.time}
                </span>
                <span
                  className="px-1.5 py-0.2 rounded text-[10px] font-semibold shrink-0"
                  style={{ color: cat.color, background: cat.bg }}
                >
                  {cat.label}
                </span>
                <span className="text-[#111417] break-words font-normal text-[12.5px]">
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
