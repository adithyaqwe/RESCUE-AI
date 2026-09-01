import React, { useState } from 'react';
import { createIncident } from '../api';
import {
  CheckCircle2,
  AlertTriangle,
  Send,
} from 'lucide-react';

const PRESETS = [
  {
    category: 'Fire / Industrial',
    label: 'Industrial chemical fire & toxic vapour',
    desc: 'Solvent drum explosion inside processing unit. Dense chemical smoke filling factory floor. Two workers suffering inhalation distress.',
    addr: 'Makarpura GIDC Industrial Estate Phase II, Vadodara',
    vics: 2,
  },
  {
    category: 'MVA / Extrication',
    label: 'Highway collision with extrication',
    desc: 'Multi-vehicle collision involving container truck and two cars on NH 48 overpass. Driver pinned inside passenger cab.',
    addr: 'NH 48 Vadodara Bypass & Waghodia Junction, Vadodara',
    vics: 2,
  },
  {
    category: 'EMS / Critical',
    label: 'Adult cardiac arrest in progress',
    desc: 'Elderly individual collapsed on sidewalk outside shopping complex. Unresponsive with agonal breathing. CPR initiated.',
    addr: 'RC Dutt Road, Near Alkapuri Circle, Vadodara',
    vics: 1,
  },
  {
    category: 'Technical Rescue',
    label: 'Vishwamitri river overflow rescue',
    desc: 'Inspection worker slipped down masonry bank into swollen Vishwamitri river channel. Stranded on bridge footing.',
    addr: 'Vishwamitri Riverbank near Kala Ghoda Bridge, Vadodara',
    vics: 1,
  },
];

export const CallIntake = ({ onIncidentCreated }) => {
  const [description, setDescription] = useState('');
  const [address, setAddress] = useState('');
  const [victims, setVictims] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!description.trim() || !address.trim()) {
      setErrorMsg('Please enter both the caller report narrative and the scene address.');
      return;
    }
    setErrorMsg('');
    setIsSubmitting(true);
    try {
      const res = await createIncident({
        description,
        locationAddress: address,
        victimsCount: victims,
      });
      setSuccessMsg(`Incident #${res.incidentId} successfully logged and queued for response.`);
      setTimeout(() => {
        onIncidentCreated(res.incidentId);
      }, 500);
    } catch (err) {
      setErrorMsg(err.response?.data?.error || 'Failed to submit emergency report.');
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6 select-none">
      {/* Page Title */}
      <div>
        <h1 className="text-[28px] font-semibold text-[#111417] tracking-tight m-0">
          Emergency Call Intake
        </h1>
        <p className="text-[13.5px] text-[#78828C] m-0 mt-1">
          Record caller narrative, verify scene cross streets, and submit to CAD triage queue.
        </p>
      </div>

      {/* Preset Dispatch Templates */}
      <div>
        <div className="text-[12.5px] font-medium text-[#475059] mb-2 uppercase tracking-wide">
          Standard incident presets:
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          {PRESETS.map((p, i) => (
            <button
              key={i}
              type="button"
              onClick={() => {
                setDescription(p.desc);
                setAddress(p.addr);
                setVictims(p.vics);
              }}
              className="text-left p-3 rounded-md bg-[#FFFFFF] border border-[#E2E5DF] hover:border-[#19483A] hover:bg-[#F9FAF8] transition-all cursor-pointer shadow-2xs group"
            >
              <div className="flex items-center justify-between mb-1">
                <span className="text-[11px] font-medium text-[#78828C] uppercase tracking-wider">
                  {p.category}
                </span>
                <span className="text-[11px] font-mono text-[#19483A] opacity-0 group-hover:opacity-100 transition-opacity">
                  Apply template →
                </span>
              </div>
              <div className="text-[13.5px] font-semibold text-[#111417] mb-1">
                {p.label}
              </div>
              <div className="text-[12px] text-[#78828C] line-clamp-2">
                {p.addr}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Intake Entry Form */}
      <form onSubmit={handleSubmit} className="bg-[#FFFFFF] border border-[#E2E5DF] rounded-md p-6 shadow-2xs space-y-5">
        {errorMsg && (
          <div className="p-3 rounded bg-[#FEF2F2] border border-[#FECACA] text-[#BA1A1A] text-[13px] flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {successMsg && (
          <div className="p-3 rounded bg-[#F0FDF4] border border-[#BBF7D0] text-[#167A39] text-[13px] flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* Narrative Input */}
        <div>
          <label className="block text-[13px] font-semibold text-[#111417] mb-1">
            Caller Report Narrative <span className="text-[#BA1A1A]">*</span>
          </label>
          <div className="text-[11.5px] text-[#78828C] mb-1.5">
            Describe hazards, trapped individuals, vehicle involvements, and chemical conditions.
          </div>
          <textarea
            value={description}
            onChange={e => setDescription(e.target.value)}
            rows={4}
            placeholder="e.g. Tanker collision on highway, two cars involved with fuel spill and driver trapped..."
            className="w-full p-3 rounded bg-[#F6F7F5] border border-[#E2E5DF] text-[#111417] text-[13.5px] outline-none focus:border-[#19483A] focus:bg-[#FFFFFF] transition-colors resize-none placeholder-[#9CA3AF]"
          />
        </div>

        {/* Address Input */}
        <div>
          <label className="block text-[13px] font-semibold text-[#111417] mb-1">
            Scene Cross Streets / Location <span className="text-[#BA1A1A]">*</span>
          </label>
          <div className="text-[11.5px] text-[#78828C] mb-1.5">
            Provide street name, landmark, or intersection in Vadodara metropolitan area.
          </div>
          <input
            type="text"
            value={address}
            onChange={e => setAddress(e.target.value)}
            placeholder="e.g. Waghodia Cross Road, NH 48 Bypass, Vadodara"
            className="w-full p-2.5 rounded bg-[#F6F7F5] border border-[#E2E5DF] text-[#111417] text-[13.5px] outline-none focus:border-[#19483A] focus:bg-[#FFFFFF] transition-colors placeholder-[#9CA3AF]"
          />
        </div>

        {/* Casualties Stepper */}
        <div>
          <label className="block text-[13px] font-semibold text-[#111417] mb-1">
            Estimated Casualties / Injured
          </label>
          <div className="flex items-center gap-3">
            <div className="flex items-center border border-[#E2E5DF] rounded bg-[#F6F7F5]">
              <button
                type="button"
                onClick={() => setVictims(Math.max(0, victims - 1))}
                className="w-9 h-9 flex items-center justify-center text-[#475059] hover:bg-[#E8EBE6] font-mono text-[16px] cursor-pointer"
              >
                -
              </button>
              <span className="w-12 text-center font-mono font-semibold text-[14px] text-[#111417]">
                {victims}
              </span>
              <button
                type="button"
                onClick={() => setVictims(victims + 1)}
                className="w-9 h-9 flex items-center justify-center text-[#475059] hover:bg-[#E8EBE6] font-mono text-[16px] cursor-pointer"
              >
                +
              </button>
            </div>
            <span className="text-[12.5px] text-[#78828C]">
              {victims === 0
                ? 'No immediate casualties reported'
                : victims === 1
                ? '1 person requires medical triage'
                : `${victims} persons require immediate EMS response`}
            </span>
          </div>
        </div>

        {/* Form Actions */}
        <div className="pt-2 flex items-center justify-end gap-3 border-t border-[#E2E5DF]">
          <button
            type="button"
            onClick={() => {
              setDescription('');
              setAddress('');
              setVictims(0);
              setErrorMsg('');
            }}
            className="px-4 py-2 rounded text-[13px] font-medium text-[#475059] hover:text-[#111417] hover:bg-[#F0F2EE] transition-colors cursor-pointer"
          >
            Clear Form
          </button>

          <button
            type="submit"
            disabled={isSubmitting}
            className="px-5 py-2.5 rounded bg-[#19483A] text-white text-[13.5px] font-semibold hover:bg-[#13392E] transition-colors cursor-pointer shadow-xs flex items-center gap-2 disabled:opacity-50"
          >
            <Send className="w-3.5 h-3.5" />
            <span>{isSubmitting ? 'Logging Emergency Call...' : 'Queue Emergency Call'}</span>
          </button>
        </div>
      </form>
    </div>
  );
};

export default CallIntake;
