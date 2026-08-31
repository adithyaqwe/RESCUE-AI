import React, { useEffect } from 'react';
import { AlertTriangle, ShieldAlert, X } from 'lucide-react';

export interface ToastMessage {
  id: string; // incidentId
  type: string;
  priority: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  address: string;
}

interface ToastNotificationProps {
  toasts: ToastMessage[];
  onClose: (id: string) => void;
  onAction: (id: string) => void;
}

export const ToastNotification: React.FC<ToastNotificationProps> = ({
  toasts,
  onClose,
  onAction,
}) => {
  return (
    <div className="fixed top-4 right-4 z-[9999] flex flex-col gap-3.5 max-w-sm w-full pointer-events-none">
      {toasts.map(toast => (
        <ToastItem
          key={toast.id}
          toast={toast}
          onClose={onClose}
          onAction={onAction}
        />
      ))}
    </div>
  );
};

const ToastItem: React.FC<{
  toast: ToastMessage;
  onClose: (id: string) => void;
  onAction: (id: string) => void;
}> = ({ toast, onClose, onAction }) => {
  // Auto close after 5 seconds
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose(toast.id);
    }, 5000);
    return () => clearTimeout(timer);
  }, [toast.id, onClose]);

  const pColor = toast.priority === 'CRITICAL' ? '#E54848' : '#E0A43A';

  return (
    <div
      className="p-3.5 rounded-sm shadow-2xl pointer-events-auto border animate-[slide-in-right_0.2s_ease-out] flex gap-3 relative"
      style={{
        background: '#0D141C',
        borderColor: pColor,
        borderLeftWidth: '4px',
        boxShadow: `0 8px 32px rgba(0,0,0,0.5), 0 0 16px ${pColor}1A`,
      }}
    >
      <div className="flex-shrink-0 mt-0.5 animate-pulse">
        {toast.priority === 'CRITICAL' ? (
          <ShieldAlert className="w-5 h-5" style={{ color: pColor }} />
        ) : (
          <AlertTriangle className="w-5 h-5" style={{ color: pColor }} />
        )}
      </div>

      <div className="flex-1 font-mono text-[10px]">
        <div className="flex items-center gap-2 mb-0.5">
          <span className="font-bold uppercase tracking-wider text-[#E8F0F5]">
            CRITICAL INCIDENT DETECTED
          </span>
          <span
            className="text-[8px] font-bold px-1 rounded-sm"
            style={{ background: pColor + '20', color: pColor }}
          >
            {toast.id}
          </span>
        </div>
        <div className="text-[11px] font-bold text-[#E8F0F5] mb-1">
          {toast.type.toUpperCase()} @ {toast.address}
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => onAction(toast.id)}
            className="px-2 py-1 rounded-sm text-[9px] font-bold bg-[#111B24] border border-[#243442] hover:border-[#4FA3D1] hover:text-[#4FA3D1] transition-all cursor-pointer"
            style={{ color: '#8EA2B2' }}
          >
            INTERCEPT CASE
          </button>
          <button
            onClick={() => onClose(toast.id)}
            className="px-2 py-1 text-[9px] hover:text-[#E8F0F5] transition-all cursor-pointer text-[#243442]"
          >
            DISMISS
          </button>
        </div>
      </div>

      <button
        onClick={() => onClose(toast.id)}
        className="absolute top-2 right-2 text-[#243442] hover:text-[#E8F0F5] transition-all cursor-pointer"
      >
        <X className="w-3.5 h-3.5" />
      </button>
    </div>
  );
};
