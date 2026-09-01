import React, { useEffect, useRef, useState, useCallback } from 'react';
import maplibregl from 'maplibre-gl';
import {
  HQ_LNG_LAT,
  MUNICIPAL_FACILITIES,
  get3DMapStyleUrl,
  getTerrainDemUrl,
  fetchRealRoadRoute,
  getSeverityColor,
  getUnitTypeColor,
} from './mapUtils';
import { Map3DControls } from './Map3DControls';
import { MapLayersMenu } from './MapLayersMenu';
import { AlertCircle, RefreshCw } from 'lucide-react';

// ── Type abbreviation for compact unit badges ──
const UNIT_ABBR = {
  Ambulance: 'AMB',
  Fire: 'FIR',
  Police: 'POL',
  Medical: 'MED',
  'Water Rescue': 'WRT',
};

// ── Determine if responders should cluster (within 0.004° of each other) ──
function clusterRespodners(responders) {
  const clusters = [];
  const visited = new Set();

  responders.forEach((r, i) => {
    if (visited.has(i) || !r.currentLocation) return;
    const group = [r];
    visited.add(i);

    responders.forEach((other, j) => {
      if (visited.has(j) || !other.currentLocation) return;
      const dlat = Math.abs(r.currentLocation.lat - other.currentLocation.lat);
      const dlng = Math.abs(r.currentLocation.lng - other.currentLocation.lng);
      if (dlat < 0.003 && dlng < 0.003) {
        group.push(other);
        visited.add(j);
      }
    });

    clusters.push(group);
  });

  return clusters;
}

export const GisMap3D = ({
  incidents = [],
  responders = [],
  selectedIncident,
  onSelectIncident,
  hasOpenDossier,
  onFallbackTo2D,
}) => {
  const containerRef = useRef(null);
  const mapRef = useRef(null);
  const incidentMarkersRef = useRef(new Map());
  const responderMarkersRef = useRef(new Map()); // keyed by cluster representative id
  const facilityMarkersRef = useRef(new Map());
  const routeEtaMarkerRef = useRef(null);

  const [isMapReady, setIsMapReady] = useState(false);
  const [mapError, setMapError] = useState(null);
  const [is3DMode, setIs3DMode] = useState(true);
  const [bearing, setBearing] = useState(-18);
  const [showLayersMenu, setShowLayersMenu] = useState(false);
  const [currentZoom, setCurrentZoom] = useState(13.4);

  const [layers, setLayers] = useState({
    incidents: true,
    units: true,
    buildings: true,
    terrain: false,
    facilities: true,
    routes: true,
  });

  const activeLayerCount = Object.values(layers).filter(Boolean).length;

  // ── 1. Initialize MapLibre ──────────────────────────────────────
  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    try {
      const styleUrl = get3DMapStyleUrl();

      const map = new maplibregl.Map({
        container: containerRef.current,
        style: styleUrl,
        center: HQ_LNG_LAT,
        zoom: 13.4,
        pitch: 42,
        bearing: -18,
        attributionControl: false,
        maxPitch: 65,
        minZoom: 10,
        maxZoom: 19,
        scrollZoom: true,
        dragPan: true,
        dragRotate: true,
        pitchWithRotate: true,
        trackResize: true,
        fadeDuration: 0,
        antialias: true,
      });

      // Metric scale (compact, bottom-left)
      map.addControl(
        new maplibregl.ScaleControl({ maxWidth: 80, unit: 'metric' }),
        'bottom-left'
      );

      // Listen on gesture completion (end) to avoid 60fps React state thrashing
      map.on('rotateend', () => setBearing(map.getBearing()));
      map.on('zoomend', () => setCurrentZoom(map.getZoom()));

      map.on('load', () => {
        // ── Natural daylight sun for Liberty topographic style ───────
        try {
          map.setLight({
            anchor: 'map',
            color: '#FFFFFF',
            intensity: 0.75,
            position: [1.15, 200, 35],
          });
        } catch {
          // Older MapLibre versions may not support setLight
        }

        // ── 3D Building Extrusion — Architectural Neutral Gray ────────
        try {
          const mapStyle = map.getStyle();
          const layersList = mapStyle?.layers || [];
          let labelLayerId;
          for (const lyr of layersList) {
            if (lyr.type === 'symbol' && lyr.layout?.['text-field']) {
              labelLayerId = lyr.id;
              break;
            }
          }

          if (map.getSource('openmaptiles') && !map.getLayer('3d-buildings')) {
            map.addLayer(
              {
                id: '3d-buildings',
                source: 'openmaptiles',
                'source-layer': 'building',
                filter: ['!=', ['get', 'hide_3d'], true],
                type: 'fill-extrusion',
                minzoom: 13,
                paint: {
                  'fill-extrusion-color': [
                    'interpolate',
                    ['linear'],
                    ['get', 'render_height'],
                    0, '#E4E7E1',   // ground level
                    15, '#D5D9D1',   // medium
                    50, '#C7CCC2',   // tall
                  ],
                  'fill-extrusion-height': [
                    'interpolate',
                    ['linear'],
                    ['zoom'],
                    13, 0,
                    14.5, ['coalesce', ['get', 'render_height'], ['get', 'height'], 8],
                  ],
                  'fill-extrusion-base': [
                    'coalesce',
                    ['get', 'render_min_height'],
                    ['get', 'min_height'],
                    0,
                  ],
                  'fill-extrusion-opacity': 0.85,
                  // Disable strong vertical gradient so sides don't go near-black
                  'fill-extrusion-vertical-gradient': false,
                },
              },
              labelLayerId
            );
          }
        } catch (bErr) {
          console.warn('[GIS] Building layer note:', bErr);
        }

        // ── Terrain DEM ─────────────────────────────────────────────
        try {
          const demUrl = getTerrainDemUrl();
          if (!map.getSource('terrain-source')) {
            map.addSource('terrain-source', {
              type: 'raster-dem',
              url: demUrl,
              tileSize: 256,
            });
            map.setTerrain({ source: 'terrain-source', exaggeration: 1.1 });
          }
        } catch (tErr) {
          console.warn('[GIS] Terrain DEM note:', tErr);
        }

        // ── Road Route Layers ──────────────────────────────────────
        if (!map.getSource('active-dispatch-route')) {
          map.addSource('active-dispatch-route', {
            type: 'geojson',
            data: { type: 'FeatureCollection', features: [] },
          });

          // White casing for contrast over buildings
          map.addLayer({
            id: 'route-casing',
            type: 'line',
            source: 'active-dispatch-route',
            layout: { 'line-cap': 'round', 'line-join': 'round' },
            paint: {
              'line-color': '#FFFFFF',
              'line-width': 7,
              'line-opacity': 0.9,
            },
          });

          // Core route: forest green, solid clean line
          map.addLayer({
            id: 'route-core',
            type: 'line',
            source: 'active-dispatch-route',
            layout: { 'line-cap': 'round', 'line-join': 'round' },
            paint: {
              'line-color': '#1A4A3C',
              'line-width': 4,
              'line-opacity': 1,
            },
          });

          // Directional chevrons (subtle dashes that imply direction)
          map.addLayer({
            id: 'route-chevrons',
            type: 'line',
            source: 'active-dispatch-route',
            layout: {
              'line-cap': 'butt',
              'line-join': 'miter',
            },
            paint: {
              'line-color': 'rgba(255,255,255,0.6)',
              'line-width': 1.5,
              'line-dasharray': [0.5, 6],
            },
          });
        }

        setIsMapReady(true);
      });

      map.on('error', (e) => {
        if (e.error?.message?.includes('WebGL')) {
          setMapError('WebGL 3D graphics not available on this device');
        }
      });

      mapRef.current = map;
    } catch (err) {
      setMapError(err instanceof Error ? err.message : 'Failed to initialize 3D GIS');
    }

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, []);

  // ── 2. Resize on container/dossier change ──────────────────────
  useEffect(() => {
    if (!containerRef.current || !mapRef.current) return;
    const ro = new ResizeObserver(() => { mapRef.current?.resize(); });
    ro.observe(containerRef.current);
    const onWin = () => { mapRef.current?.resize(); };
    window.addEventListener('resize', onWin);
    return () => { ro.disconnect(); window.removeEventListener('resize', onWin); };
  }, [isMapReady]);

  useEffect(() => {
    if (!mapRef.current) return;
    mapRef.current.resize();
    const t1 = setTimeout(() => mapRef.current?.resize(), 80);
    const t2 = setTimeout(() => mapRef.current?.resize(), 300);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, [selectedIncident, hasOpenDossier]);

  // ── 3. Layer visibility ────────────────────────────────────────
  useEffect(() => {
    if (!isMapReady || !mapRef.current) return;
    const map = mapRef.current;

    if (map.getLayer('3d-buildings')) {
      map.setLayoutProperty('3d-buildings', 'visibility', layers.buildings ? 'visible' : 'none');
    }

    try {
      if (map.getSource('terrain-source')) {
        if (layers.terrain) {
          map.setTerrain({ source: 'terrain-source', exaggeration: 1.1 });
        } else {
          map.setTerrain(null);
        }
      }
    } catch { /* Ignored */ }

    for (const id of ['route-core', 'route-casing', 'route-chevrons']) {
      if (map.getLayer(id)) {
        map.setLayoutProperty(id, 'visibility', layers.routes ? 'visible' : 'none');
      }
    }
  }, [isMapReady, layers]);

  // ── 4. Camera controls ────────────────────────────────────────
  const handleToggle3D = useCallback(() => {
    if (!mapRef.current) return;
    const next = !is3DMode;
    setIs3DMode(next);
    mapRef.current.easeTo({
      pitch: next ? 42 : 0,
      bearing: next ? -18 : 0,
      duration: 800,
    });
  }, [is3DMode]);

  const handleTiltUp = useCallback(() => {
    if (!mapRef.current) return;
    mapRef.current.easeTo({ pitch: Math.min(68, mapRef.current.getPitch() + 10), duration: 350 });
  }, []);

  const handleTiltDown = useCallback(() => {
    if (!mapRef.current) return;
    mapRef.current.easeTo({ pitch: Math.max(0, mapRef.current.getPitch() - 10), duration: 350 });
  }, []);

  const handleZoomIn = useCallback(() => { mapRef.current?.zoomIn(); }, []);
  const handleZoomOut = useCallback(() => { mapRef.current?.zoomOut(); }, []);

  const handleResetNorth = useCallback(() => {
    mapRef.current?.easeTo({ bearing: 0, duration: 500 });
  }, []);

  const handleRecenter = useCallback(() => {
    mapRef.current?.flyTo({
      center: HQ_LNG_LAT,
      zoom: 13.4,
      pitch: is3DMode ? 42 : 0,
      bearing: is3DMode ? -18 : 0,
      duration: 800,
    });
  }, [is3DMode]);

  // ── 5. Camera follows selected incident ───────────────────────
  useEffect(() => {
    if (!mapRef.current || !selectedIncident?.location?.coordinates) return;
    const { lat, lng } = selectedIncident.location.coordinates;
    mapRef.current.flyTo({
      center: [lng, lat],
      zoom: Math.max(mapRef.current.getZoom(), 15),
      pitch: is3DMode ? 45 : 0,
      bearing: is3DMode ? -12 : 0,
      duration: 900,
    });
  }, [selectedIncident?.incidentId, is3DMode]); // only fly when selection changes

  // ── 6. Incident Markers (progressive: compact → expanded when selected) ──
  useEffect(() => {
    if (!isMapReady || !mapRef.current) return;
    const map = mapRef.current;
    const markers = incidentMarkersRef.current;

    if (!layers.incidents) {
      markers.forEach(m => m.remove());
      markers.clear();
      return;
    }

    // Remove stale markers
    const currentIds = new Set(incidents.map(i => i.incidentId));
    markers.forEach((m, id) => {
      if (!currentIds.has(id)) { m.remove(); markers.delete(id); }
    });

    incidents.forEach(incident => {
      if (!incident.location?.coordinates) return;
      const { lat, lng } = incident.location.coordinates;
      const isSelected = selectedIncident?.incidentId === incident.incidentId;
      const isResolved = incident.status === 'RESOLVED';
      const sev = getSeverityColor(incident.priority);
      const color = isResolved ? '#798290' : sev.hex;

      let marker = markers.get(incident.incidentId);

      if (!marker) {
        const el = document.createElement('div');
        el.className = 'maplibre-marker-container';
        marker = new maplibregl.Marker({ element: el, anchor: 'center' })
          .setLngLat([lng, lat])
          .addTo(map);
        el.addEventListener('click', (e) => {
          e.stopPropagation();
          onSelectIncident(incident);
        });
        markers.set(incident.incidentId, marker);
      }

      marker.setLngLat([lng, lat]);
      const el = marker.getElement();

      const typeIcon =
        incident.type?.toLowerCase().includes('fire') ? '🔥' :
          incident.type?.toLowerCase().includes('medical') || incident.type?.toLowerCase().includes('cardiac') ? '🚑' :
            incident.type?.toLowerCase().includes('hazmat') || incident.type?.toLowerCase().includes('chemical') ? '☣️' :
              incident.type?.toLowerCase().includes('police') || incident.type?.toLowerCase().includes('crime') ? '🚨' : '⚠️';

      if (isSelected) {
        // Selected Incident: clean circle + radius ring + compact white tooltip
        el.innerHTML = `
          <div class="gis-incident-selected-clean">
            <div class="gis-incident-selected-ring"></div>
            <div class="gis-incident-marker-clean" style="background:#C62828;width:24px;height:24px;box-shadow:0 0 0 3px rgba(198,40,40,0.3);">
              <span>${typeIcon}</span>
            </div>
            <div class="gis-incident-selected-badge" style="margin-top:4px;">
              <span style="font-[#17201C];font-weight:700;font-size:11.5px;">${incident.type}</span>
              <span style="color:#7B847F;font-size:10px;font-family:monospace;">#${incident.incidentId}</span>
            </div>
          </div>
        `;
      } else {
        // Default Incident: small clean 22px circle symbol
        el.innerHTML = `
          <div class="gis-incident-marker-clean" style="background:${color};" title="${incident.type} #${incident.incidentId}">
            <span>${typeIcon}</span>
          </div>
        `;
      }
    });
  }, [isMapReady, incidents, selectedIncident?.incidentId, layers.incidents, onSelectIncident]);

  // ── 7. Responder Markers (small clean symbols + progressive disclosure) ──
  useEffect(() => {
    if (!isMapReady || !mapRef.current) return;
    const map = mapRef.current;
    const markers = responderMarkersRef.current;

    if (!layers.units) {
      markers.forEach(m => m.remove());
      markers.clear();
      return;
    }

    markers.forEach(m => m.remove());
    markers.clear();

    const recommendedUnitId = selectedIncident?.aiAnalysis?.recommendations?.[0]?.responder?.unitId;
    const assignedIds = new Set(
      (selectedIncident?.assignedResponders || []).map(r => r.unitId || r._id)
    );

    const clusters = clusterRespodners(responders);
    const showCallsigns = currentZoom >= 14.5;

    clusters.forEach((group, ci) => {
      const primary = group[0];
      if (!primary.currentLocation) return;
      const { lat, lng } = primary.currentLocation;

      const el = document.createElement('div');
      el.className = 'maplibre-marker-container';

      const marker = new maplibregl.Marker({ element: el, anchor: 'center' })
        .setLngLat([lng, lat])
        .addTo(map);

      markers.set(`cluster-${ci}`, marker);

      if (group.length > 1 && !showCallsigns) {
        // Cluster badge when zoomed out
        el.innerHTML = `
          <div className="gis-unit-badge-clean" style="background:#17201C;color:#FFFFFF;border-color:#17201C;padding:2px 6px;">
            <span style="font-weight:700;">${group.length} Units</span>
          </div>
        `;
        el.addEventListener('click', () => {
          mapRef.current?.flyTo({ center: [lng, lat], zoom: 15.2, duration: 700 });
        });
      } else {
        group.forEach((r, si) => {
          const color =
            r.type === 'Ambulance' ? '#2864C7' :
            r.type === 'Fire' ? '#C62828' :
            r.type === 'Police' ? '#17201C' : '#237A4B';

          const unitIcon =
            r.type === 'Ambulance' ? '🚑' :
            r.type === 'Fire' ? '🚒' :
            r.type === 'Police' ? '🚔' : '🩺';

          const isRecommended = r.unitId === recommendedUnitId;
          const isAssigned = assignedIds.has(r.unitId) || assignedIds.has(r._id);
          const shouldShowLabel = showCallsigns || isRecommended || isAssigned;

          const targetEl = si === 0 ? el : document.createElement('div');
          if (si > 0) {
            targetEl.className = 'maplibre-marker-container';
            const subMarker = new maplibregl.Marker({ element: targetEl, anchor: 'center' })
              .setLngLat([lng + si * 0.0003, lat + si * 0.0003])
              .addTo(map);
            markers.set(`responder-${ci}-${si}`, subMarker);
          }

          if (shouldShowLabel) {
            // Expanded compact badge: Vehicle icon + Unit ID + Status accent dot
            targetEl.innerHTML = `
              <div class="gis-unit-badge-clean" style="${isAssigned || isRecommended ? 'border-color:' + color + ';box-shadow:0 2px 8px rgba(0,0,0,0.15);' : ''}">
                <span style="font-size:12px;">${unitIcon}</span>
                <span style="font-weight:700;color:#17201C;">${r.unitId}</span>
                <span class="unit-status-dot" style="background:${r.status === 'AVAILABLE' ? '#237A4B' : r.status === 'EN_ROUTE' ? '#2864C7' : '#B8620A'};"></span>
              </div>
            `;
          } else {
            // Compact 24px circular GIS symbol
            targetEl.innerHTML = `
              <div style="width:24px;height:24px;border-radius:50%;background:${color};border:2px solid #FFFFFF;box-shadow:0 1px 4px rgba(0,0,0,0.2);display:flex;align-items:center;justify-content:center;font-size:11px;color:#FFFFFF;cursor:pointer;" title="${r.unitId} (${r.type}) - ${r.status}">
                <span>${unitIcon}</span>
              </div>
            `;
          }
        });
      }
    });
  }, [isMapReady, responders, selectedIncident?.incidentId, layers.units, currentZoom]);



  // ── 8. Municipal Facility Markers ─────────────────────────────
  useEffect(() => {
    if (!isMapReady || !mapRef.current) return;
    const map = mapRef.current;
    const fMarkers = facilityMarkersRef.current;

    if (!layers.facilities) {
      fMarkers.forEach(m => m.remove());
      fMarkers.clear();
      return;
    }

    if (fMarkers.size === 0) {
      MUNICIPAL_FACILITIES.forEach(fac => {
        const el = document.createElement('div');
        el.className = 'maplibre-marker-container';

        const icon =
          fac.type === 'Hospital' ? '✚' :
            fac.type === 'Fire Station' ? '▲' : '●';
        const iconColor =
          fac.type === 'Hospital' ? '#1D4ED8' :
            fac.type === 'Fire Station' ? '#B91C1C' : '#4A5260';

        el.innerHTML = `
          <div class="gis-facility-node">
            <span style="color:${iconColor};font-size:9px;">${icon}</span>
            <span>${fac.name.split(' ')[0]}</span>
          </div>
        `;

        const popup = new maplibregl.Popup({ offset: 10, closeButton: false, maxWidth: '220px' })
          .setHTML(`
            <div style="padding:8px 12px;font-family:'Inter',sans-serif;">
              <div style="font-weight:600;font-size:12.5px;color:#111316;margin-bottom:2px;">${fac.name}</div>
              <div style="font-size:11px;color:#798290;margin-bottom:3px;">${fac.type}</div>
              <div style="font-size:11px;color:#1A4A3C;font-weight:600;">${fac.emergency}</div>
            </div>
          `);

        const m = new maplibregl.Marker({ element: el, anchor: 'bottom' })
          .setLngLat(fac.lngLat)
          .setPopup(popup)
          .addTo(map);

        fMarkers.set(fac.id, m);
      });
    } else {
      // Facilities already rendered — just toggle visibility
      fMarkers.forEach(m => {
        const el = m.getElement();
        if (el) el.style.display = 'flex';
      });
    }
  }, [isMapReady, layers.facilities]);

  // ── 9. OSRM Road Route ────────────────────────────────────────
  useEffect(() => {
    if (!isMapReady || !mapRef.current) return;
    const map = mapRef.current;
    const source = map.getSource('active-dispatch-route');
    if (!source) return;

    if (!selectedIncident?.location?.coordinates || !layers.routes) {
      source.setData({ type: 'FeatureCollection', features: [] });
      routeEtaMarkerRef.current?.remove();
      routeEtaMarkerRef.current = null;
      return;
    }

    const { lat: incLat, lng: incLng } = selectedIncident.location.coordinates;

    // Find assigned or nearest responder
    let unit = null;
    if (selectedIncident.assignedResponders?.length > 0) {
      const aid = selectedIncident.assignedResponders[0]._id;
      unit = responders.find(r => r._id === aid) || null;
    }
    if (!unit && responders.length > 0) {
      let minD = Infinity;
      responders.forEach(r => {
        if (!r.currentLocation) return;
        const d = Math.hypot(r.currentLocation.lat - incLat, r.currentLocation.lng - incLng);
        if (d < minD) { minD = d; unit = r; }
      });
    }
    if (!unit?.currentLocation) return;

    const unitLngLat = [unit.currentLocation.lng, unit.currentLocation.lat];
    const incLngLat = [incLng, incLat];
    let alive = true;

    fetchRealRoadRoute(unitLngLat, incLngLat).then(result => {
      if (!alive || !mapRef.current) return;

      const src = mapRef.current.getSource('active-dispatch-route');
      if (src) {
        src.setData({
          type: 'Feature',
          geometry: { type: 'LineString', coordinates: result.coordinates },
        });
      }

      // ETA badge at route midpoint
      const midCoord = result.coordinates[Math.floor(result.coordinates.length / 2)] || unitLngLat;
      routeEtaMarkerRef.current?.remove();

      const badge = document.createElement('div');
      badge.className = 'gis-route-badge';
      badge.innerHTML = `ETA ${result.durationMins}m · ${result.distanceKm} km`;

      routeEtaMarkerRef.current = new maplibregl.Marker({ element: badge, anchor: 'center' })
        .setLngLat(midCoord)
        .addTo(mapRef.current);
    }).catch(() => {/* silently fail */ });

    return () => { alive = false; };
  }, [isMapReady, selectedIncident?.incidentId, responders, layers.routes]);

  // ── Loading / Error States ─────────────────────────────────────
  if (mapError) {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center bg-[#0A0B0C] p-8 text-center">
        <div className="w-10 h-10 rounded-full bg-[#1A0808] border border-[#7F1D1D] flex items-center justify-center text-[#EF4444] mb-3">
          <AlertCircle className="w-5 h-5" />
        </div>
        <h3 className="text-[15px] font-semibold text-[#F0F1F2] mb-1">3D GIS engine unavailable</h3>
        <p className="text-[12.5px] text-[#6B7280] max-w-xs mb-4 leading-relaxed">
          {mapError}. Incident workflows and dispatch remain active.
        </p>
        <div className="flex items-center gap-2">
          <button
            onClick={() => { setMapError(null); setIsMapReady(false); }}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-[#F0F1F2] text-[#0A0B0C] text-[12.5px] font-medium hover:bg-[#FFFFFF] transition-colors cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Retry 3D connection</span>
          </button>
          {onFallbackTo2D && (
            <button
              onClick={onFallbackTo2D}
              className="px-3 py-1.5 rounded border border-[#2A2D31] bg-[#191C1F] text-[#9CA3AF] text-[12.5px] font-medium hover:bg-[#212529] transition-colors cursor-pointer"
            >
              Switch to 2D
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-full h-full bg-[#121214] rounded-2xl overflow-hidden border border-[#242429] shadow-lg">
      {/* MapLibre WebGL canvas */}
      <div ref={containerRef} className="w-full h-full z-0" />

      {/* Map loading overlay */}
      {!isMapReady && (
        <div className="absolute inset-0 flex items-center justify-center bg-[#0A0B0C]/80 z-10">
          <div className="text-[13px] text-[#6B7280] font-medium">Loading Vadodara GIS map...</div>
        </div>
      )}

      {/* Compact GIS controls */}
      <Map3DControls
        onZoomIn={handleZoomIn}
        onZoomOut={handleZoomOut}
        onTiltUp={handleTiltUp}
        onTiltDown={handleTiltDown}
        is3DMode={is3DMode}
        onToggle3D={handleToggle3D}
        bearing={bearing}
        onResetNorth={handleResetNorth}
        onRecenter={handleRecenter}
        showLayersMenu={showLayersMenu}
        onToggleLayersMenu={() => setShowLayersMenu(p => !p)}
        activeLayerCount={activeLayerCount}
      />

      {/* Layers dropdown */}
      {showLayersMenu && (
        <MapLayersMenu
          layers={layers}
          onToggleLayer={key => setLayers(p => ({ ...p, [key]: !p[key] }))}
          onClose={() => setShowLayersMenu(false)}
        />
      )}
    </div>
  );
};

export default GisMap3D;
