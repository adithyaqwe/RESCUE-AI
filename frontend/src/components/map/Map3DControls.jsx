import React from 'react';
import { Plus, Minus, Layers, Compass, ChevronUp, ChevronDown, Home } from 'lucide-react';

/**
 * Compact, professional GIS control group.
 * Positioned top-right, single column, no scattered controls.
 */
export const Map3DControls = ({
  onZoomIn,
  onZoomOut,
  onTiltUp,
  onTiltDown,
  is3DMode,
  onToggle3D,
  bearing = 0,
  onResetNorth,
  onRecenter,
  showLayersMenu,
  onToggleLayersMenu,
  activeLayerCount = 4,
}) => {
  return (
    <div className="absolute top-3 right-3 z-[1000] flex flex-col items-end gap-1.5 pointer-events-auto select-none">

      {/* 2D | 3D Segmented Switch */}
      <div className="flex bg-[#191C1F] border border-[#2A2D31] rounded overflow-hidden shadow-sm text-[11px] font-semibold">
        <button
          onClick={() => is3DMode && onToggle3D()}
          className={`px-2.5 py-1 transition-colors cursor-pointer ${
            !is3DMode
              ? 'bg-[#F0F1F2] text-[#0A0B0C]'
              : 'text-[#6B7280] hover:text-[#F0F1F2] hover:bg-[#212529]'
          }`}
          title="2D planimetric view"
          aria-label="Switch to 2D view"
        >
          2D
        </button>
        <div className="w-[1px] bg-[#2A2D31]" />
        <button
          onClick={() => !is3DMode && onToggle3D()}
          className={`px-2.5 py-1 transition-colors cursor-pointer ${
            is3DMode
              ? 'bg-[#F0F1F2] text-[#0A0B0C]'
              : 'text-[#6B7280] hover:text-[#F0F1F2] hover:bg-[#212529]'
          }`}
          title="3D perspective view"
          aria-label="Switch to 3D view"
        >
          3D
        </button>
      </div>

      {/* Zoom + Tilt + Recenter + Compass stack */}
      <div className="flex flex-col bg-[#191C1F] border border-[#2A2D31] rounded shadow-sm overflow-hidden">

        {/* Zoom In */}
        <button
          onClick={onZoomIn}
          className="w-8 h-8 flex items-center justify-center text-[#6B7280] hover:text-[#F0F1F2] hover:bg-[#212529] transition-colors cursor-pointer border-b border-[#2A2D31]"
          title="Zoom in"
          aria-label="Zoom in"
        >
          <Plus className="w-3.5 h-3.5" />
        </button>

        {/* Zoom Out */}
        <button
          onClick={onZoomOut}
          className="w-8 h-8 flex items-center justify-center text-[#6B7280] hover:text-[#F0F1F2] hover:bg-[#212529] transition-colors cursor-pointer border-b border-[#2A2D31]"
          title="Zoom out"
          aria-label="Zoom out"
        >
          <Minus className="w-3.5 h-3.5" />
        </button>

        {/* Divider */}
        <div className="h-[1px] bg-[#2A2D31]" />

        {/* Tilt Up (only in 3D) */}
        {is3DMode && (
          <button
            onClick={onTiltUp}
            className="w-8 h-8 flex items-center justify-center text-[#6B7280] hover:text-[#F0F1F2] hover:bg-[#212529] transition-colors cursor-pointer border-b border-[#2A2D31]"
            title="Tilt up"
            aria-label="Tilt camera up"
          >
            <ChevronUp className="w-3.5 h-3.5" />
          </button>
        )}

        {/* Tilt Down (only in 3D) */}
        {is3DMode && (
          <button
            onClick={onTiltDown}
            className="w-8 h-8 flex items-center justify-center text-[#6B7280] hover:text-[#F0F1F2] hover:bg-[#212529] transition-colors cursor-pointer border-b border-[#2A2D31]"
            title="Tilt down"
            aria-label="Tilt camera down"
          >
            <ChevronDown className="w-3.5 h-3.5" />
          </button>
        )}

        {/* Interactive Compass / North Reset */}
        <button
          onClick={onResetNorth}
          className="w-8 h-8 flex items-center justify-center text-[#6B7280] hover:text-[#F0F1F2] hover:bg-[#212529] transition-colors cursor-pointer border-b border-[#2A2D31]"
          title={`Bearing ${Math.round(bearing)}° · Click to reset North`}
          aria-label="Reset North"
        >
          <div
            className="compass-ring"
            style={{ transform: `rotate(${-bearing}deg)` }}
          >
            <Compass className="w-3.5 h-3.5 text-[#9CA3AF]" />
          </div>
        </button>

        {/* Recenter EOC */}
        <button
          onClick={onRecenter}
          className="w-8 h-8 flex items-center justify-center text-[#6B7280] hover:text-[#F0F1F2] hover:bg-[#212529] transition-colors cursor-pointer"
          title="Recenter Vadodara EOC"
          aria-label="Recenter"
        >
          <Home className="w-3 h-3" />
        </button>
      </div>

      {/* Layers toggle */}
      <button
        onClick={onToggleLayersMenu}
        className={`w-8 h-8 flex items-center justify-center rounded border shadow-sm text-[11px] transition-colors cursor-pointer ${
          showLayersMenu
            ? 'bg-[#F0F1F2] text-[#0A0B0C] border-[#F0F1F2]'
            : 'bg-[#191C1F] text-[#6B7280] border-[#2A2D31] hover:text-[#F0F1F2] hover:bg-[#212529]'
        }`}
        title={`Map layers (${activeLayerCount} active)`}
        aria-label="Toggle layers menu"
      >
        <Layers className="w-3.5 h-3.5" />
      </button>
    </div>
  );
};

export default Map3DControls;
