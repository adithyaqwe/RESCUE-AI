import React, { useEffect } from 'react';
import { AlertTriangle, ShieldAlert, X } from 'lucide-react';

export const ToastNotification = ({
  toasts,
  onClose,
  onAction,
}) => {
  return (
    <div className="fixed top-4 right-4 z-[9999] flex flex-col gap-2.5 max-w-sm w-full pointer-events-none">
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

const ToastItem = ({ toast, onClose, onAction }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose(toast.id);
    }, 6000);
    return () => clearTimeout(timer);
  }, [toast.id, onClose]);

  const isCritical = toast.priority === 'CRITICAL';

  return (
    <div
      className={`p-3.5 rounded bg-[#FFFFFF] border border-[#E2E5DF] shadow-md pointer-events-auto border-l-3 ${
        isCritical ? 'border-l-[#BA1A1A]' : 'border-l-[#B45309]'
      } flex gap-3 relative`}
    >
      <div className="shrink-0 mt-0.5">
        {isCritical ? (
          <ShieldAlert className="w-4 h-4 text-[#BA1A1A]" />
        ) : (
          <AlertTriangle className="w-4 h-4 text-[#B45309]" />
        )}
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-[13px] font-semibold text-[#111417]">
            {isCritical ? 'Critical call' : 'High priority call'}
          </span>
          <span className="text-[11.5px] font-mono text-[#78828C]">
            #{toast.id}
          </span>
        </div>

        <div className="text-[13.5px] font-semibold text-[#111417] truncate mb-0.5">
          {toast.type}
        </div>
        <div className="text-[12.5px] text-[#475059] truncate mb-2.5">
          {toast.address}
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => onAction(toast.id)}
            className="px-2.5 py-1 rounded text-[12px] font-medium bg-[#19483A] text-white hover:bg-[#13392E] transition-colors cursor-pointer"
          >
            Review incident
          </button>
          <button
            onClick={() => onClose(toast.id)}
            className="px-2.5 py-1 rounded text-[12px] font-medium text-[#78828C] hover:text-[#111417] hover:bg-[#F0F2EE] transition-colors cursor-pointer"
          >
            Dismiss
          </button>
        </div>
      </div>

      <button
        onClick={() => onClose(toast.id)}
        className="p-1 text-[#A3A89F] hover:text-[#111417] transition-colors cursor-pointer self-start"
      >
        <X className="w-3.5 h-3.5" />
      </button>
    </div>
  );
};
