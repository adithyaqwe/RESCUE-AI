import React from 'react';
import { ZoomIn, ZoomOut, RotateCcw, Layers, Info } from 'lucide-react';

export const MapControls = ({
  onZoomIn,
  onZoomOut,
  onRecenter,
  showUnits,
  onToggleUnits,
  showLegend,
  onToggleLegend,
  unitCount,
}) => {
  return (
    <div className="absolute top-3 right-3 z-[1000] flex items-center gap-2 pointer-events-auto">
      {/* Zoom & Recenter Controls */}
      <div className="flex items-center bg-[#FFFFFF] border border-[#E2E5DF] rounded p-0.5 shadow-xs">
        <button
          onClick={onZoomIn}
          className="p-1.5 text-[#475059] hover:text-[#111417] hover:bg-[#F0F2EE] rounded transition-colors cursor-pointer"
          title="Zoom in"
          aria-label="Zoom in"
        >
          <ZoomIn className="w-3.5 h-3.5" />
        </button>
        <button
          onClick={onZoomOut}
          className="p-1.5 text-[#475059] hover:text-[#111417] hover:bg-[#F0F2EE] rounded transition-colors cursor-pointer"
          title="Zoom out"
          aria-label="Zoom out"
        >
          <ZoomOut className="w-3.5 h-3.5" />
        </button>
        <div className="w-[1px] h-3.5 bg-[#E2E5DF] mx-0.5" />
        <button
          onClick={onRecenter}
          className="p-1.5 text-[#475059] hover:text-[#19483A] hover:bg-[#F0F2EE] rounded transition-colors cursor-pointer"
          title="Recenter Metro Operations"
          aria-label="Recenter Metro Operations"
        >
          <RotateCcw className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Layer Toggles */}
      <div className="flex items-center bg-[#FFFFFF] border border-[#E2E5DF] rounded p-0.5 shadow-xs text-[12px]">
        <button
          onClick={onToggleUnits}
          className={`px-2.5 py-1 rounded font-medium transition-colors cursor-pointer flex items-center gap-1.5 ${
            showUnits ? 'bg-[#EDF3F0] text-[#19483A]' : 'text-[#78828C] hover:text-[#111417]'
          }`}
          title="Toggle fleet apparatus markers"
        >
          <Layers className="w-3 h-3" />
          <span>Apparatus ({unitCount})</span>
        </button>

        <div className="w-[1px] h-3.5 bg-[#E2E5DF] mx-0.5" />

        <button
          onClick={onToggleLegend}
          className={`p-1 rounded transition-colors cursor-pointer ${
            showLegend ? 'bg-[#EDF3F0] text-[#19483A]' : 'text-[#78828C] hover:text-[#111417]'
          }`}
          title="Toggle map legend"
          aria-label="Toggle map legend"
        >
          <Info className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};
