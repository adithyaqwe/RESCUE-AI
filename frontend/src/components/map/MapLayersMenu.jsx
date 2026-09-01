import React from 'react';
import {
  CheckSquare,
  Square,
  X,
  AlertCircle,
  Truck,
  Building2,
  Mountain,
  Hospital,
  Navigation,
  Palette,
  Check,
} from 'lucide-react';
import { MAP_THEMES } from './mapUtils';

export const MapLayersMenu = ({
  layers,
  onToggleLayer,
  currentThemeId = 'dark',
  onSelectTheme,
  onClose,
}) => {
  const layerDefs = [
    {
      key: 'incidents',
      label: 'Incidents',
      icon: <AlertCircle className="w-3.5 h-3.5 text-[#EF4444]" />,
    },
    {
      key: 'units',
      label: 'Fleet Apparatus',
      icon: <Truck className="w-3.5 h-3.5 text-[#60A5FA]" />,
    },
    {
      key: 'buildings',
      label: '3D Buildings',
      icon: <Building2 className="w-3.5 h-3.5 text-[#9CA3AF]" />,
    },
    {
      key: 'terrain',
      label: '3D Terrain DEM',
      icon: <Mountain className="w-3.5 h-3.5 text-[#34D399]" />,
    },
    {
      key: 'facilities',
      label: 'Medical & Fire HQ',
      icon: <Hospital className="w-3.5 h-3.5 text-[#60A5FA]" />,
    },
    {
      key: 'routes',
      label: 'Dispatch Routes',
      icon: <Navigation className="w-3.5 h-3.5 text-[#F0F1F2]" />,
    },
  ];

  return (
    <div className="absolute top-14 right-3 z-[1000] w-64 bg-[#191C1F] border border-[#2A2D31] rounded-lg shadow-xl p-3 text-[12px] select-none pointer-events-auto backdrop-blur-md">
      {/* Menu Header */}
      <div className="flex items-center justify-between border-b border-[#2A2D31] pb-2 mb-2.5">
        <div className="flex items-center gap-1.5 font-semibold text-[#F0F1F2] text-[12px]">
          <Palette className="w-3.5 h-3.5 text-[#38BDF8]" />
          <span>Map Theme & Layers</span>
        </div>
        <button
          onClick={onClose}
          className="text-[#6B7280] hover:text-[#F0F1F2] p-0.5 rounded cursor-pointer transition-colors"
          title="Close menu"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* ── SECTION 1: Map Color Themes ────────────────────────────── */}
      <div className="mb-3">
        <div className="text-[10.5px] font-bold text-[#9CA3AF] uppercase tracking-wider mb-1.5">
          Map Color Theme
        </div>
        <div className="grid grid-cols-2 gap-1.5">
          {MAP_THEMES.map(theme => {
            const isSelected = currentThemeId === theme.id;
            return (
              <button
                key={theme.id}
                onClick={() => onSelectTheme && onSelectTheme(theme.id)}
                className={`flex items-center gap-2 p-1.5 rounded border text-left transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-[#212730] border-[#38BDF8] text-[#F0F1F2] shadow-xs'
                    : 'bg-[#141618] border-[#2A2D31] text-[#9CA3AF] hover:text-[#F0F1F2] hover:bg-[#1C1F23]'
                }`}
                title={theme.description}
              >
                {/* Color Swatch Dot */}
                <div
                  className="w-4 h-4 rounded-full shrink-0 border border-white/20 flex items-center justify-center shadow-2xs"
                  style={{ backgroundColor: theme.colorBg }}
                >
                  {isSelected && <Check className="w-2.5 h-2.5 text-white stroke-[3]" />}
                </div>

                <div className="truncate">
                  <div className="font-semibold text-[11px] truncate leading-tight">
                    {theme.name}
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* ── SECTION 2: Map Data Layers ────────────────────────────── */}
      <div>
        <div className="text-[10.5px] font-bold text-[#9CA3AF] uppercase tracking-wider mb-1.5 border-t border-[#2A2D31] pt-2">
          Data Overlays
        </div>
        <div className="space-y-0.5">
          {layerDefs.map(l => {
            const isEnabled = layers[l.key];
            return (
              <div
                key={l.key}
                onClick={() => onToggleLayer(l.key)}
                className={`flex items-center gap-2 p-1.5 rounded cursor-pointer transition-colors hover:bg-[#212529] ${
                  isEnabled ? 'text-[#F0F1F2]' : 'text-[#6B7280]'
                }`}
              >
                <div className="shrink-0">
                  {isEnabled ? (
                    <CheckSquare className="w-3.5 h-3.5 text-[#38BDF8]" />
                  ) : (
                    <Square className="w-3.5 h-3.5 text-[#3A3D42]" />
                  )}
                </div>
                <div className="flex items-center gap-1.5 font-medium text-[11.5px]">
                  {l.icon}
                  <span>{l.label}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

