import React from 'react';
import { X, Hospital, Building2 } from 'lucide-react';

export const MapLegend = ({ onClose }) => {
  return (
    <div className="absolute bottom-10 left-3 z-[1000] w-64 bg-[#FFFFFF] border border-[#E2E5DF] rounded-md shadow-md p-3 text-[12px] select-none pointer-events-auto">
      <div className="flex items-center justify-between border-b border-[#E2E5DF] pb-2 mb-2">
        <span className="font-semibold text-[#111417] text-[12.5px]">3D GIS Symbology</span>
        <button
          onClick={onClose}
          className="text-[#78828C] hover:text-[#111417] p-0.5 rounded cursor-pointer"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>

      <div className="space-y-2.5">
        {/* Incident Priority */}
        <div>
          <div className="text-[11px] font-semibold text-[#78828C] uppercase tracking-wide mb-1">
            Emergency Priority
          </div>
          <div className="grid grid-cols-2 gap-1.5 text-[11.5px]">
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-[#BA1A1A]" />
              <span className="text-[#111417]">Critical</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-[#B45309]" />
              <span className="text-[#111417]">High priority</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-[#1D4ED8]" />
              <span className="text-[#111417]">Standard</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-[#167A39]" />
              <span className="text-[#111417]">Low priority</span>
            </div>
          </div>
        </div>

        {/* Apparatus Fleet */}
        <div>
          <div className="text-[11px] font-semibold text-[#78828C] uppercase tracking-wide mb-1">
            Apparatus Fleet
          </div>
          <div className="grid grid-cols-2 gap-1.5 text-[11.5px]">
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-xs bg-[#0284C7]" />
              <span className="text-[#111417]">108 Ambulance</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-xs bg-[#BA1A1A]" />
              <span className="text-[#111417]">VMC Fire Tender</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-xs bg-[#334155]" />
              <span className="text-[#111417]">112 PCR Patrol</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-xs bg-[#19483A]" />
              <span className="text-[#111417]">Mobile Doctor</span>
            </div>
          </div>
        </div>

        {/* 3D Features & Facilities */}
        <div>
          <div className="text-[11px] font-semibold text-[#78828C] uppercase tracking-wide mb-1">
            3D Features & Infrastructure
          </div>
          <div className="space-y-1.5 text-[11.5px]">
            <div className="flex items-center gap-1.5">
              <Building2 className="w-3.5 h-3.5 text-[#78828C]" />
              <span className="text-[#111417]">3D Extruded Buildings</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Hospital className="w-3.5 h-3.5 text-[#0284C7]" />
              <span className="text-[#111417]">Hospitals & ER Facilities</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
