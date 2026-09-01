import React, { useEffect, useRef, useState, useCallback } from 'react';
import L from 'leaflet';
import {
  HQ_COORDINATES,
  getTileConfig,
  getFallbackTileConfig,
  calculateDistanceKm,
  generateRealisticRoute,
  getSeverityColor,
  getUnitTypeColor,
} from './mapUtils';
import { MapControls } from './MapControls';
import { MapLegend } from './MapLegend';
import { AlertCircle, RefreshCw } from 'lucide-react';

export const GisMap2D = ({
  incidents,
  responders,
  selectedIncident,
  onSelectIncident,
  hasOpenDossier,
}) => {
  const containerRef = useRef(null);
  const mapRef = useRef(null);
  const markersLayerRef = useRef(null);
  const routeLayerRef = useRef(null);
  const tileLayerRef = useRef(null);

  const [mapError, setMapError] = useState(null);
  const [isMapReady, setIsMapReady] = useState(false);
  const [showUnits, setShowUnits] = useState(true);
  const [showLegend, setShowLegend] = useState(false);

  // Initialize Real Leaflet Map
  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    try {
      const map = L.map(containerRef.current, {
        center: HQ_COORDINATES,
        zoom: 13,
        zoomControl: false, // We use custom compact MapControls
        attributionControl: false, // Custom attribution added at bottom
      });

      // Add scale bar
      L.control
        .scale({
          metric: true,
          imperial: false,
          position: 'bottomleft',
        })
        .addTo(map);

      // Add Real Tile Layer (CartoDB Positron by default)
      const tileConfig = getTileConfig();
      const tiles = L.tileLayer(tileConfig.url, {
        subdomains: tileConfig.subdomains,
        maxZoom: tileConfig.maxZoom,
      });

      tiles.on('tileerror', () => {
        // Automatically switch to OSM fallback if primary tile provider fails
        if (tileLayerRef.current) {
          const fallbackConfig = getFallbackTileConfig();
          tileLayerRef.current.setUrl(fallbackConfig.url);
        }
      });

      tiles.addTo(map);
      tileLayerRef.current = tiles;

      // Layer groups for clean, high-performance updates
      const markersLayer = L.layerGroup().addTo(map);
      const routeLayer = L.layerGroup().addTo(map);

      markersLayerRef.current = markersLayer;
      routeLayerRef.current = routeLayer;
      mapRef.current = map;
      setIsMapReady(true);
      setMapError(null);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to initialize GIS map engine';
      setMapError(errorMessage);
    }

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, []);

  // Dynamic responsive layout & panel expansion handler
  useEffect(() => {
    if (!containerRef.current || !mapRef.current) return;

    const ro = new ResizeObserver(() => {
      if (mapRef.current) {
        mapRef.current.invalidateSize({ pan: false });
      }
    });

    ro.observe(containerRef.current);

    const onWinResize = () => {
      if (mapRef.current) {
        mapRef.current.invalidateSize({ pan: false });
      }
    };
    window.addEventListener('resize', onWinResize);

    return () => {
      ro.disconnect();
      window.removeEventListener('resize', onWinResize);
    };
  }, [isMapReady]);

  // Recalculate tile grid whenever dossier panel opens or closes
  useEffect(() => {
    if (!mapRef.current) return;
    mapRef.current.invalidateSize({ pan: false });
    const t1 = setTimeout(() => mapRef.current?.invalidateSize({ pan: false }), 60);
    const t2 = setTimeout(() => mapRef.current?.invalidateSize({ pan: false }), 200);
    const t3 = setTimeout(() => mapRef.current?.invalidateSize({ pan: false }), 500);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
    };
  }, [selectedIncident, hasOpenDossier]);

  // Recenter to HQ
  const handleRecenter = useCallback(() => {
    if (!mapRef.current) return;
    mapRef.current.invalidateSize({ pan: false });
    mapRef.current.flyTo(HQ_COORDINATES, 13, { duration: 0.8 });
  }, []);

  // Zoom controls
  const handleZoomIn = useCallback(() => {
    if (!mapRef.current) return;
    mapRef.current.zoomIn();
  }, []);

  const handleZoomOut = useCallback(() => {
    if (!mapRef.current) return;
    mapRef.current.zoomOut();
  }, []);

  // Smoothly focus map when selected incident changes
  useEffect(() => {
    if (!mapRef.current || !selectedIncident || !selectedIncident.location?.coordinates) return;
    const { lat, lng } = selectedIncident.location.coordinates;
    mapRef.current.invalidateSize({ pan: false });
    mapRef.current.flyTo([lat, lng], 15, { duration: 0.8 });
  }, [selectedIncident]);

  // Update Markers & Layers
  useEffect(() => {
    if (!isMapReady || !mapRef.current || !markersLayerRef.current || !routeLayerRef.current) return;

    const markersLayer = markersLayerRef.current;
    const routeLayer = routeLayerRef.current;

    markersLayer.clearLayers();
    routeLayer.clearLayers();

    // ── HQ Operations Center Marker ────────────────────────────────
    const hqIcon = L.divIcon({
      className: 'gis-marker-pin',
      html: `
        <div style="background:#19483A;color:#FFFFFF;padding:2px 6px;border-radius:4px;font-family:'JetBrains Mono',monospace;font-size:10px;font-weight:700;display:flex;align-items:center;gap:4px;box-shadow:0 2px 6px rgba(0,0,0,0.2);border:1.5px solid #FFFFFF;">
          <span>HQ</span>
        </div>
      `,
      iconSize: [36, 20],
      iconAnchor: [18, 10],
    });

    L.marker(HQ_COORDINATES, { icon: hqIcon })
      .bindTooltip('Vadodara Municipal Emergency Operations Centre (VMC EOC)', { direction: 'top', offset: [0, -10] })
      .addTo(markersLayer);

    // ── Active Incident Markers ─────────────────────────────────────
    (incidents || []).forEach(incident => {
      if (!incident.location?.coordinates) return;
      const { lat, lng } = incident.location.coordinates;
      const isSelected = selectedIncident?.incidentId === incident.incidentId;
      const isResolved = incident.status === 'RESOLVED';
      const sev = getSeverityColor(incident.priority);

      const markerHtml = `
        <div class="gis-marker-pin" style="position:relative;">
          ${isSelected ? `<div style="position:absolute;width:28px;height:28px;border-radius:50%;background:rgba(25,72,58,0.2);border:1.5px dashed #19483A;animation:pulse 2s infinite;"></div>` : ''}
          <div class="gis-incident-node" style="background:${isResolved ? '#5A646E' : sev.hex};color:#FFFFFF;border:1.5px solid #FFFFFF;${isSelected ? 'transform:scale(1.15);box-shadow:0 0 0 3px #19483A;' : ''}">
            <span>${incident.type}</span>
            <span style="opacity:0.85;font-size:9.5px;">#${incident.incidentId.replace('INC-', '')}</span>
          </div>
        </div>
      `;

      const incidentIcon = L.divIcon({
        className: 'gis-incident-marker',
        html: markerHtml,
        iconSize: [80, 24],
        iconAnchor: [40, 12],
      });

      const marker = L.marker([lat, lng], { icon: incidentIcon });

      // Click to select
      marker.on('click', () => {
        onSelectIncident(incident);
      });

      // Rich, compact GIS popup
      const popupHtml = `
        <div style="padding:12px;width:230px;font-family:'Plus Jakarta Sans',sans-serif;">
          <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:4px;">
            <span style="font-size:14px;font-weight:700;color:#111417;">${incident.type}</span>
            <span style="font-size:10px;font-weight:700;padding:1px 5px;border-radius:3px;background:${sev.bg};color:${sev.text};">${sev.label}</span>
          </div>
          <div style="font-size:11px;font-family:'JetBrains Mono',monospace;color:#78828C;margin-bottom:6px;">
            Case #${incident.incidentId}
          </div>
          <div style="font-size:12px;color:#475059;margin-bottom:6px;line-height:1.3;">
            ${incident.location.address}
          </div>
          <div style="font-size:11.5px;color:#111417;font-weight:500;margin-bottom:8px;">
            ${incident.victimsCount > 0 ? `<span style="color:#BA1A1A;font-weight:700;">${incident.victimsCount} casualty reported</span>` : 'No reported injuries'}
          </div>
          <div style="border-top:1px solid #E2E5DF;padding-top:8px;display:flex;justify-content:flex-end;">
            <button id="popup-view-${incident.incidentId}" style="background:#19483A;color:#FFFFFF;border:none;padding:4px 10px;border-radius:4px;font-size:11.5px;font-weight:600;cursor:pointer;">
              View dossier
            </button>
          </div>
        </div>
      `;

      marker.bindPopup(popupHtml, { closeButton: false, offset: [0, -12] });

      marker.on('popupopen', () => {
        const btn = document.getElementById(`popup-view-${incident.incidentId}`);
        if (btn) {
          btn.onclick = () => {
            onSelectIncident(incident);
            marker.closePopup();
          };
        }
      });

      marker.addTo(markersLayer);
    });

    // ── Responder Apparatus Markers ─────────────────────────────────
    if (showUnits) {
      (responders || []).forEach(responder => {
        if (!responder.currentLocation) return;
        const { lat, lng } = responder.currentLocation;
        const color = getUnitTypeColor(responder.type);
        const isEnRoute = responder.status === 'EN_ROUTE';
        const isOnScene = responder.status === 'ON_SCENE';

        const unitHtml = `
          <div class="gis-marker-pin">
            <div class="gis-unit-node" style="background:${color};color:#FFFFFF;border:1.2px solid #FFFFFF;">
              <span>${responder.unitId}</span>
              ${isEnRoute ? '<span style="font-size:8px;background:rgba(255,255,255,0.3);padding:0 2px;border-radius:2px;">EN ROUTE</span>' : ''}
              ${isOnScene ? '<span style="font-size:8px;background:rgba(255,255,255,0.3);padding:0 2px;border-radius:2px;">ON SCENE</span>' : ''}
            </div>
          </div>
        `;

        const unitIcon = L.divIcon({
          className: 'gis-unit-marker',
          html: unitHtml,
          iconSize: [50, 20],
          iconAnchor: [25, 10],
        });

        const marker = L.marker([lat, lng], { icon: unitIcon });
        marker.bindTooltip(
          `${responder.unitId} (${responder.type}) · ${(responder.status || '').replace('_', ' ')}`,
          { direction: 'top', offset: [0, -10] }
        );
        marker.addTo(markersLayer);
      });
    }

    // ── Active Response Route to Selected Incident ──────────────────
    if (selectedIncident && selectedIncident.location?.coordinates) {
      const { lat: incLat, lng: incLng } = selectedIncident.location.coordinates;

      // Identify the assigned responder or nearest available responder
      let respondingUnit = null;
      if (selectedIncident.assignedResponders && selectedIncident.assignedResponders.length > 0) {
        const assignedId = selectedIncident.assignedResponders[0]._id;
        respondingUnit = responders.find(r => r._id === assignedId) || null;
      }

      if (!respondingUnit && responders) {
        // Find nearest unit
        let minDist = Infinity;
        responders.forEach(r => {
          if (!r.currentLocation) return;
          const d = calculateDistanceKm(r.currentLocation.lat, r.currentLocation.lng, incLat, incLng);
          if (d < minDist) {
            minDist = d;
            respondingUnit = r;
          }
        });
      }

      if (respondingUnit && respondingUnit.currentLocation) {
        const unitCoord = [
          respondingUnit.currentLocation.lat,
          respondingUnit.currentLocation.lng,
        ];
        const incCoord = [incLat, incLng];

        const routeWaypoints = generateRealisticRoute(unitCoord, incCoord);
        const distKm = calculateDistanceKm(unitCoord[0], unitCoord[1], incCoord[0], incCoord[1]);
        const estimatedMinutes = Math.max(2, Math.round(distKm * 2.2));

        // Route Casing Line (High Contrast Base)
        L.polyline(routeWaypoints, {
          color: '#FFFFFF',
          weight: 6,
          opacity: 0.9,
          lineCap: 'round',
          lineJoin: 'round',
        }).addTo(routeLayer);

        // Core Route Vector Line (Brand Forest Green)
        L.polyline(routeWaypoints, {
          color: '#19483A',
          weight: 3.5,
          opacity: 0.95,
          dashArray: '8, 6',
          lineCap: 'round',
          lineJoin: 'round',
        }).addTo(routeLayer);

        // Midpoint Route ETA Badge
        const midIndex = Math.floor(routeWaypoints.length / 2);
        const midPoint = routeWaypoints[midIndex];

        const badgeIcon = L.divIcon({
          className: 'gis-route-badge-container',
          html: `
            <div class="gis-route-badge">
              <span>${respondingUnit.unitId} → ${distKm} km (~${estimatedMinutes}m ETA)</span>
            </div>
          `,
          iconSize: [160, 20],
          iconAnchor: [80, 10],
        });

        L.marker(midPoint, { icon: badgeIcon }).addTo(routeLayer);
      }
    }
  }, [isMapReady, incidents, responders, selectedIncident, showUnits, onSelectIncident]);

  // Graceful Fallback if Map Fails
  if (mapError) {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center bg-[#F6F7F5] p-6 text-center select-none">
        <div className="w-12 h-12 rounded-full bg-[#FEF2F2] border border-[#FECACA] flex items-center justify-center text-[#BA1A1A] mb-3">
          <AlertCircle className="w-6 h-6" />
        </div>
        <h3 className="text-[17px] font-semibold text-[#111417] mb-1">
          Map service temporarily unavailable
        </h3>
        <p className="text-[13px] text-[#78828C] max-w-sm mb-4 leading-relaxed">
          {mapError}. The incident queue and emergency response workflows remain fully active.
        </p>
        <button
          onClick={() => {
            setMapError(null);
            setIsMapReady(false);
          }}
          className="flex items-center gap-1.5 px-3.5 py-2 rounded bg-[#19483A] text-white text-[13px] font-medium hover:bg-[#13392E] transition-colors cursor-pointer"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Retry map connection</span>
        </button>
      </div>
    );
  }

  return (
    <div className="relative w-full h-full bg-[#EAECE7] overflow-hidden select-none">
      {/* Real Map Canvas */}
      <div ref={containerRef} className="w-full h-full z-0" />

      {/* Map Controls */}
      <MapControls
        onZoomIn={handleZoomIn}
        onZoomOut={handleZoomOut}
        onRecenter={handleRecenter}
        showUnits={showUnits}
        onToggleUnits={() => setShowUnits(p => !p)}
        showLegend={showLegend}
        onToggleLegend={() => setShowLegend(p => !p)}
        unitCount={responders?.length || 0}
      />

      {/* Map Legend */}
      {showLegend && <MapLegend onClose={() => setShowLegend(false)} />}

      {/* Subtle Map Status Attribution Badge */}
      <div className="absolute bottom-2 right-2 z-[400] text-[10.5px] text-[#78828C] bg-[#FFFFFF]/85 backdrop-blur-xs px-2 py-0.5 rounded border border-[#E2E5DF] pointer-events-auto">
        <span>Vadodara, Gujarat · &copy; OpenStreetMap contributors · WGS 84</span>
      </div>
    </div>
  );
};
