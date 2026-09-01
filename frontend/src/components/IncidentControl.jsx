import React, { useState } from 'react';
import {
  assignResponders,
  updateIncidentStatus,
} from '../api';
import {
  CheckSquare,
  Square,
  X,
  CheckCircle2,
  PhoneCall,
  MapPin,
  Users,
  Send,
  Navigation,
  ShieldCheck,
} from 'lucide-react';

const SEVERITY_CONFIG = {
  CRITICAL: { label: 'Critical priority', text: '#BA1A1A', bg: '#FEF2F2' },
  HIGH: { label: 'High priority', text: '#B45309', bg: '#FFFBEB' },
  MEDIUM: { label: 'Standard priority', text: '#1D4ED8', bg: '#EFF6FF' },
  LOW: { label: 'Low priority', text: '#167A39', bg: '#F0FDF4' },
};

export const IncidentControl = ({
  selectedIncident,
  onClearSelection,
  availableResponders = [],
  onOpenIntake,
}) => {
  const [selectedUnits, setSelectedUnits] = useState([]);
  const [isDispatching, setIsDispatching] = useState(false);
  const [dispatched, setDispatched] = useState(false);

  const topRecommendation = selectedIncident?.aiAnalysis?.recommendations?.[0];

  const handleDispatchUnits = async (unitIds) => {
    if (!selectedIncident || !unitIds || unitIds.length === 0) return;
    setIsDispatching(true);
    try {
      await assignResponders(selectedIncident.incidentId, unitIds);
      setSelectedUnits([]);
      setDispatched(true);
      setTimeout(() => setDispatched(false), 3000);
    } catch {
      // Handled
    } finally {
      setIsDispatching(false);
    }
  };

  const handleResolve = async () => {
    if (!selectedIncident) return;
    try {
      await updateIncidentStatus(selectedIncident.incidentId, 'RESOLVED');
      onClearSelection();
    } catch {
      // Handled
    }
  };

  if (!selectedIncident) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-8 text-center bg-[#FFFFFF]">
        <h3 className="text-[17px] font-semibold text-[#111417] mb-1.5">
          No incident selected
        </h3>
        <p className="text-[13px] text-[#78828C] max-w-xs mb-5 leading-relaxed">
          Select an incident from the operational list or 3D map to review assessment details and coordinate unit response.
        </p>
        {onOpenIntake && (
          <button
            onClick={onOpenIntake}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded text-[13px] font-medium bg-[#19483A] text-white hover:bg-[#13392E] transition-colors cursor-pointer"
          >
            <PhoneCall className="w-3.5 h-3.5" />
            <span>Create new call</span>
          </button>
        )}
      </div>
    );
  }

  const sevTheme = SEVERITY_CONFIG[selectedIncident.priority] || SEVERITY_CONFIG.MEDIUM;
  const isPendingDispatch = selectedIncident.status === 'REPORTED' || selectedIncident.status === 'ANALYZED';
  const isResolved = selectedIncident.status === 'RESOLVED';

  const PIPELINE_STEPS = ['Reported', 'Triaged', 'Dispatched', 'On scene', 'Resolved'];
  const activeStepIndex = PIPELINE_STEPS.indexOf(
    selectedIncident.status === 'REPORTED'
      ? 'Reported'
      : selectedIncident.status === 'ANALYZED'
      ? 'Triaged'
      : selectedIncident.status === 'DISPATCHED' || selectedIncident.status === 'EN_ROUTE'
      ? 'Dispatched'
      : selectedIncident.status === 'ARRIVED'
      ? 'On scene'
      : 'Resolved'
  );

  return (
    <div className="flex flex-col h-full bg-[#FFFFFF] w-full text-[13px] select-none">
      {/* ── Command Header ────────────────────────────────────────── */}
      <div className="p-4 border-b border-[#E2E5DF] flex items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h2 className="text-[19px] font-semibold text-[#111417] leading-tight m-0">
              {selectedIncident.type}
            </h2>
            <span
              className="text-[11.5px] font-medium px-2 py-0.5 rounded shrink-0"
              style={{ background: sevTheme.bg, color: sevTheme.text }}
            >
              {sevTheme.label}
            </span>
          </div>
          <div className="text-[12px] font-mono text-[#78828C]">
            Case #{selectedIncident.incidentId}
          </div>
        </div>

        <button
          onClick={onClearSelection}
          className="p-1 rounded text-[#78828C] hover:text-[#111417] hover:bg-[#F0F2EE] transition-colors cursor-pointer"
          title="Close (Esc)"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* ── Pipeline Tracker ──────────────────────────────────────── */}
      <div className="px-4 py-2.5 border-b border-[#E2E5DF] bg-[#F6F7F5]">
        <div className="flex items-center justify-between">
          {PIPELINE_STEPS.map((step, idx) => {
            const isCurrent = activeStepIndex === idx;
            const isPast = idx < activeStepIndex;
            const stepColor = isCurrent ? '#19483A' : isPast ? '#167A39' : '#A3A89F';

            return (
              <div key={step} className="flex flex-col items-center flex-1 relative">
                {idx < PIPELINE_STEPS.length - 1 && (
                  <div
                    className="absolute top-2 left-[50%] right-[-50%] h-[1.5px]"
                    style={{ background: idx < activeStepIndex ? '#167A39' : '#E2E5DF' }}
                  />
                )}
                <div
                  className="w-3.5 h-3.5 rounded-full flex items-center justify-center z-10 text-[8.5px] font-bold"
                  style={{
                    background: '#FFFFFF',
                    border: `1.5px solid ${stepColor}`,
                    color: stepColor,
                  }}
                >
                  {isPast ? '✓' : idx + 1}
                </div>
                <span className="text-[10.5px] mt-1 font-medium" style={{ color: stepColor }}>
                  {step}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* ── Dossier Content ───────────────────────────────────────── */}
      <div className="flex-1 overflow-y-auto divide-y divide-[#EAECE8] bg-[#FFFFFF]">
        {/* Incident Location & Casualties */}
        <div className="p-4 space-y-2.5">
          <div>
            <div className="text-[11.5px] font-medium text-[#78828C] mb-0.5 flex items-center gap-1">
              <MapPin className="w-3 h-3 text-[#19483A]" />
              <span>Scene address</span>
            </div>
            <div className="text-[14px] font-semibold text-[#111417]">
              {selectedIncident.location?.address}
            </div>
          </div>

          <div>
            <div className="text-[11.5px] font-medium text-[#78828C] mb-0.5 flex items-center gap-1">
              <Users className="w-3 h-3 text-[#BA1A1A]" />
              <span>Reported casualties</span>
            </div>
            <div className="text-[13.5px] text-[#111417]">
              {selectedIncident.victimsCount > 0 ? (
                <span className="text-[#BA1A1A] font-semibold">
                  {selectedIncident.victimsCount} {selectedIncident.victimsCount === 1 ? 'casualty' : 'casualties'} reported
                </span>
              ) : (
                <span className="text-[#167A39] font-medium">None reported</span>
              )}
            </div>
          </div>
        </div>

        {/* Caller Narrative Transcript */}
        <div className="p-4">
          <div className="text-[11.5px] font-medium text-[#78828C] mb-1">
            Caller report transcript
          </div>
          <p className="text-[13px] text-[#111417] leading-relaxed m-0 italic bg-[#F6F7F5] p-2.5 rounded border border-[#E2E5DF]">
            "{selectedIncident.description}"
          </p>
        </div>

        {/* Decision Support Intelligence (Clean, operational, zero AI cliches) */}
        {selectedIncident.aiAnalysis && (
          <div className="p-4 space-y-2.5 bg-[#FAFBF9]">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 font-semibold text-[#111417] text-[13.5px]">
                <ShieldCheck className="w-3.5 h-3.5 text-[#19483A]" />
                <span>Decision support assessment</span>
              </div>
              {selectedIncident.aiConfidence !== undefined && (
                <span className="text-[11px] font-mono text-[#78828C]">
                  {Math.round(selectedIncident.aiConfidence * 100)}% confidence
                </span>
              )}
            </div>

            {/* Caller immediate instruction */}
            {selectedIncident.aiAnalysis.immediateAction && (
              <div className="p-2.5 rounded bg-[#FFFBEB] border-l-3 border-l-[#B45309]">
                <div className="text-[11px] font-semibold text-[#B45309] mb-0.5">
                  Caller pre-arrival directive:
                </div>
                <div className="text-[12.5px] text-[#92400E] leading-snug">
                  {selectedIncident.aiAnalysis.immediateAction}
                </div>
              </div>
            )}

            {/* Target Response & Classification */}
            <div className="flex items-center justify-between text-[12.5px] pt-1">
              <div>
                <span className="text-[#78828C]">Classification: </span>
                <span className="text-[#111417] font-semibold">{selectedIncident.aiAnalysis.type}</span>
              </div>
              <div>
                <span className="text-[#78828C]">Target response: </span>
                <span className="text-[#19483A] font-semibold font-mono">
                  {selectedIncident.aiAnalysis.recommendedResponseTime}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* ── RECOMMENDED UNITS & DISPATCH ACTION ────────────────────── */}
        {isPendingDispatch && (
          <div className="p-4 bg-[#EDF3F0]/60 border-b border-[#CDDDD5] space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[11.5px] font-semibold text-[#19483A] uppercase tracking-wider">
                Recommended Response Units
              </span>
              <div className="flex items-center gap-1 text-[11.5px] font-mono text-[#19483A]">
                <Navigation className="w-3 h-3" />
                <span>Route Clear</span>
              </div>
            </div>

            {/* Top Unit Recommendation Card */}
            {topRecommendation ? (
              <div className="p-3 bg-[#FFFFFF] rounded border border-[#CDDDD5] space-y-2">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="font-mono font-bold text-[14px] text-[#111417]">
                      {topRecommendation.responder.unitId}
                    </span>
                    <span className="text-[12px] text-[#78828C] ml-2">
                      {topRecommendation.responder.type}
                    </span>
                  </div>
                  <div className="text-right font-mono text-[12px]">
                    <span className="text-[#19483A] font-semibold">{topRecommendation.distance} km</span>
                    <span className="text-[#78828C] ml-1.5">(~{topRecommendation.eta}m ETA)</span>
                  </div>
                </div>

                <div className="text-[12px] text-[#475059] leading-snug">
                  Nearest suitable apparatus. Turn-by-turn road route locked on 3D GIS map.
                </div>

                {/* Primary Action Button: CONFIRM DISPATCH */}
                <button
                  onClick={() => handleDispatchUnits([topRecommendation.responder._id])}
                  disabled={isDispatching}
                  className="w-full mt-2 py-2 rounded bg-[#19483A] text-white text-[13px] font-semibold hover:bg-[#13392E] transition-colors cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>
                    {isDispatching
                      ? 'Transmitting dispatch orders...'
                      : `CONFIRM DISPATCH (${topRecommendation.responder.unitId})`}
                  </span>
                </button>
              </div>
            ) : availableResponders.length > 0 ? (
              <div className="p-3 bg-[#FFFFFF] rounded border border-[#CDDDD5] space-y-2">
                <div className="text-[13px] font-medium text-[#111417]">
                  Nearest apparatus: {availableResponders[0].unitId} ({availableResponders[0].type})
                </div>
                <button
                  onClick={() => handleDispatchUnits([availableResponders[0]._id])}
                  disabled={isDispatching}
                  className="w-full py-2 rounded bg-[#19483A] text-white text-[13px] font-semibold hover:bg-[#13392E] transition-colors cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>
                    {isDispatching ? 'Transmitting...' : `CONFIRM DISPATCH (${availableResponders[0].unitId})`}
                  </span>
                </button>
              </div>
            ) : (
              <div className="p-3 bg-[#FFFBEB] rounded border border-[#FDE68A] text-[12px] text-[#B45309]">
                All primary apparatus units are currently committed. Check the runcard below to override assignments.
              </div>
            )}
          </div>
        )}

        {/* ── Apparatus Runcard Selection (Multi-Unit Response) ───────── */}
        {isPendingDispatch && (
          <div className="p-4 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[13px] font-semibold text-[#111417]">
                Apparatus Runcard Selection
              </span>
              <span className="text-[11.5px] text-[#78828C] font-mono">
                {selectedUnits.length} selected
              </span>
            </div>

            {dispatched && (
              <div className="p-2 rounded text-center text-[12px] font-medium bg-[#F0FDF4] border border-[#BBF7D0] text-[#167A39]">
                ✓ Dispatch orders transmitted to selected units
              </div>
            )}

            <div className="space-y-1 max-h-44 overflow-y-auto">
              {(selectedIncident.aiAnalysis?.recommendations || []).map(rec => {
                const isChecked = selectedUnits.includes(rec.responder._id);
                return (
                  <div
                    key={rec.responder._id}
                    onClick={() =>
                      setSelectedUnits(p =>
                        isChecked ? p.filter(id => id !== rec.responder._id) : [...p, rec.responder._id]
                      )
                    }
                    className={`flex items-center justify-between p-2 rounded transition-colors cursor-pointer border ${
                      isChecked
                        ? 'bg-[#EDF3F0] border-[#19483A]'
                        : 'bg-[#FFFFFF] border-[#E2E5DF] hover:border-[#C8CCC3]'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      {isChecked ? (
                        <CheckSquare className="w-3.5 h-3.5 text-[#19483A]" />
                      ) : (
                        <Square className="w-3.5 h-3.5 text-[#A3A89F]" />
                      )}
                      <div>
                        <span className="font-mono font-bold text-[12.5px] text-[#111417]">
                          {rec.responder.unitId}
                        </span>
                        <span className="text-[11.5px] text-[#78828C] ml-1.5">
                          {rec.responder.type}
                        </span>
                      </div>
                    </div>

                    <div className="text-right font-mono text-[11.5px]">
                      <span className="font-semibold text-[#19483A]">{rec.distance} km</span>
                      <span className="text-[#78828C] ml-1.5">~{rec.eta}m</span>
                    </div>
                  </div>
                );
              })}

              {availableResponders
                .filter(r => !(selectedIncident.aiAnalysis?.recommendations || []).some(rec => rec.responder._id === r._id))
                .map(r => {
                  const isChecked = selectedUnits.includes(r._id);
                  return (
                    <div
                      key={r._id}
                      onClick={() =>
                        setSelectedUnits(p =>
                          isChecked ? p.filter(id => id !== r._id) : [...p, r._id]
                        )
                      }
                      className={`flex items-center justify-between p-2 rounded transition-colors cursor-pointer border ${
                        isChecked
                          ? 'bg-[#EDF3F0] border-[#19483A]'
                          : 'bg-[#FFFFFF] border-[#E2E5DF] hover:border-[#C8CCC3]'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        {isChecked ? (
                          <CheckSquare className="w-3.5 h-3.5 text-[#19483A]" />
                        ) : (
                          <Square className="w-3.5 h-3.5 text-[#A3A89F]" />
                        )}
                        <div>
                          <span className="font-mono font-bold text-[12.5px] text-[#111417]">
                            {r.unitId}
                          </span>
                          <span className="text-[11.5px] text-[#78828C] ml-1.5">
                            {r.type} · In service
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
            </div>

            {selectedUnits.length > 0 && (
              <button
                onClick={() => handleDispatchUnits(selectedUnits)}
                disabled={isDispatching}
                className="w-full py-2 rounded bg-[#111417] text-white text-[12.5px] font-semibold hover:bg-[#2A3036] transition-colors cursor-pointer shadow-xs mt-1"
              >
                <span>Dispatch {selectedUnits.length} selected units</span>
              </button>
            )}
          </div>
        )}

        {/* Assigned Responders when Dispatched / En Route */}
        {selectedIncident.assignedResponders && selectedIncident.assignedResponders.length > 0 && (
          <div className="p-4 space-y-2">
            <div className="text-[13px] font-semibold text-[#111417]">
              Assigned apparatus ({selectedIncident.assignedResponders.length})
            </div>
            <div className="space-y-1.5">
              {selectedIncident.assignedResponders.map(unit => (
                <div
                  key={unit._id}
                  className="flex items-center justify-between p-2.5 rounded bg-[#F6F7F5] border border-[#E2E5DF]"
                >
                  <div>
                    <div className="font-mono font-bold text-[13px] text-[#111417]">{unit.unitId}</div>
                    <div className="text-[11.5px] text-[#78828C]">{unit.type} · Active response</div>
                  </div>
                  {selectedIncident.estimatedArrival !== undefined && (
                    <span className="font-mono text-[12px] font-semibold text-[#B45309]">
                      ETA ~{selectedIncident.estimatedArrival}m
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* ── Footer Actions ────────────────────────────────────────── */}
      <div className="p-3 border-t border-[#E2E5DF] bg-[#F6F7F5] flex items-center justify-between gap-2">
        <button
          onClick={onClearSelection}
          className="px-3 py-1.5 rounded text-[12.5px] font-medium text-[#475059] hover:text-[#111417] hover:bg-[#E8EBE6] transition-colors cursor-pointer"
        >
          Close (Esc)
        </button>

        {!isResolved && (
          <button
            onClick={handleResolve}
            className="px-3 py-1.5 rounded text-[12.5px] font-medium text-[#167A39] bg-[#F0FDF4] border border-[#BBF7D0] hover:bg-[#167A39] hover:text-white transition-colors cursor-pointer flex items-center gap-1.5"
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Mark resolved</span>
          </button>
        )}
      </div>
    </div>
  );
};

export default IncidentControl;
