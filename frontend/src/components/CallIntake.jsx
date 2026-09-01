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
        <h1 className="text-[28px] font-semibold text-[#17201C] tracking-tight m-0">
          Emergency Call Intake
        </h1>
        <p className="text-[13.5px] text-[#5D6862] m-0 mt-1">
          Record caller narrative, verify scene cross streets, and submit to CAD triage queue.
        </p>
      </div>

      {/* Preset Dispatch Templates */}
      <div>
        <div className="text-[12.5px] font-medium text-[#5D6862] mb-2 uppercase tracking-wide">
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
              className="text-left p-3 rounded-md bg-[#FFFFFF] border border-[#DDE2DD] hover:border-[#164E3D] hover:bg-[#F5F6F3] transition-all cursor-pointer shadow-2xs group"
            >
              <div className="text-[11px] font-semibold text-[#164E3D] mb-0.5">
                {p.category}
              </div>
              <div className="text-[13.5px] font-semibold text-[#17201C] group-hover:text-[#164E3D] transition-colors mb-1">
                {p.label}
              </div>
              <div className="text-[12px] text-[#5D6862] line-clamp-2">
                {p.addr}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Primary Intake Form */}
      <form onSubmit={handleSubmit} className="bg-[#FFFFFF] border border-[#DDE2DD] rounded-md p-6 space-y-5 shadow-2xs">
        {errorMsg && (
          <div className="p-3 rounded bg-[#FFEBEE] border border-[#EF9A9A] text-[#C62828] text-[13px] flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {successMsg && (
          <div className="p-3 rounded bg-[#E8F5E9] border border-[#C8E6C9] text-[#237A4B] text-[13px] flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* Narrative Transcript Area */}
        <div>
          <label className="block text-[13px] font-semibold text-[#17201C] mb-1.5">
            Caller Report Narrative <span className="text-[#C62828]">*</span>
          </label>
          <textarea
            rows={4}
            value={description}
            onChange={e => setDescription(e.target.value)}
            placeholder="Type or paste caller transcript (e.g. 'Chemical solvent drum explosion in Makarpura GIDC Phase II with dense smoke...')"
            className="w-full p-3 rounded bg-[#F5F6F3] border border-[#DDE2DD] focus:border-[#164E3D] text-[13.5px] text-[#17201C] placeholder-[#7B847F] outline-none transition-colors leading-relaxed"
          />
        </div>

        {/* Scene Location Entry */}
        <div>
          <label className="block text-[13px] font-semibold text-[#17201C] mb-1.5">
            Scene Location / Cross Streets <span className="text-[#C62828]">*</span>
          </label>
          <input
            type="text"
            value={address}
            onChange={e => setAddress(e.target.value)}
            placeholder="e.g. Makarpura GIDC Industrial Estate Phase II, Vadodara"
            className="w-full p-2.5 rounded bg-[#F5F6F3] border border-[#DDE2DD] focus:border-[#164E3D] text-[13.5px] text-[#17201C] placeholder-[#7B847F] outline-none transition-colors"
          />
        </div>

        {/* Casualties Selector */}
        <div>
          <label className="block text-[13px] font-semibold text-[#17201C] mb-1.5">
            Reported Casualties / Victims
          </label>
          <div className="flex items-center gap-3">
            {[0, 1, 2, 3, 4, 5].map(n => (
              <button
                key={n}
                type="button"
                onClick={() => setVictims(n)}
                className={`w-10 h-9 rounded font-medium text-[13px] transition-colors cursor-pointer ${
                  victims === n
                    ? 'bg-[#164E3D] text-white font-bold'
                    : 'bg-[#F5F6F3] text-[#5D6862] hover:bg-[#E6EAE5]'
                }`}
              >
                {n}
              </button>
            ))}
          </div>
        </div>

        {/* Action Button */}
        <div className="pt-3 border-t border-[#DDE2DD] flex justify-end">
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-5 py-2.5 rounded bg-[#164E3D] text-white text-[13.5px] font-semibold hover:bg-[#0F392D] transition-colors cursor-pointer flex items-center gap-2 disabled:opacity-50"
          >
            <Send className="w-4 h-4" />
            <span>{isSubmitting ? 'Submitting Call Intake...' : 'Submit Call to CAD Triage Queue'}</span>
          </button>
        </div>
      </form>
    </div>
  );
};

export default CallIntake;
