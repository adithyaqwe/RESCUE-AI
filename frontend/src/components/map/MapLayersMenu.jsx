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
} from 'lucide-react';

export const MapLayersMenu = ({
  layers,
  onToggleLayer,
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
      label: 'Fleet',
      icon: <Truck className="w-3.5 h-3.5 text-[#60A5FA]" />,
    },
    {
      key: 'buildings',
      label: 'Buildings 3D',
      icon: <Building2 className="w-3.5 h-3.5 text-[#6B7280]" />,
    },
    {
      key: 'terrain',
      label: 'Terrain',
      icon: <Mountain className="w-3.5 h-3.5 text-[#34D399]" />,
    },
    {
      key: 'facilities',
      label: 'Facilities',
      icon: <Hospital className="w-3.5 h-3.5 text-[#60A5FA]" />,
    },
    {
      key: 'routes',
      label: 'Routes',
      icon: <Navigation className="w-3.5 h-3.5 text-[#F0F1F2]" />,
    },
  ];

  return (
    <div className="absolute top-14 right-3 z-[1000] w-48 bg-[#191C1F] border border-[#2A2D31] rounded shadow-lg p-2 text-[12px] select-none pointer-events-auto">
      <div className="flex items-center justify-between border-b border-[#2A2D31] pb-1.5 mb-1.5">
        <span className="font-semibold text-[#F0F1F2] text-[11.5px]">Map Layers</span>
        <button
          onClick={onClose}
          className="text-[#6B7280] hover:text-[#F0F1F2] p-0.5 rounded cursor-pointer"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>

      <div className="space-y-0.5">
        {layerDefs.map(l => {
          const isEnabled = layers[l.key];
          return (
            <div
              key={l.key}
              onClick={() => onToggleLayer(l.key)}
              className={`flex items-center gap-2 p-1.5 rounded cursor-pointer transition-colors hover:bg-[#212529] ${isEnabled ? 'text-[#F0F1F2]' : 'text-[#6B7280]'
                }`}
            >
              <div className="shrink-0">
                {isEnabled ? (
                  <CheckSquare className="w-3.5 h-3.5 text-[#9CA3AF]" />
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
  );
};
