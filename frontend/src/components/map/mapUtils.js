// Geospatial utilities and real 3D map provider configuration

// Vadodara Municipal Emergency Operations Centre (VMC EOC / Sayajigunj)
export const HQ_LNG_LAT = [73.181219, 22.307159]; // [Longitude, Latitude] for MapLibre / GeoJSON
export const HQ_COORDINATES = [22.307159, 73.181219]; // [Latitude, Longitude] for Leaflet fallback

// Authentic Vadodara Municipal Emergency Infrastructure POIs
export const MUNICIPAL_FACILITIES = [
  {
    id: 'FAC-SSG',
    name: 'SSG Civil Hospital & Trauma Centre',
    type: 'Hospital',
    lngLat: [73.1850, 22.3080],
    beds: 1500,
    emergency: '24/7 Level 1 Trauma',
    color: '#0284C7',
  },
  {
    id: 'FAC-GMERS',
    name: 'GMERS Medical College & Hospital Gotri',
    type: 'Hospital',
    lngLat: [73.1420, 22.3148],
    beds: 750,
    emergency: '24/7 Multi-Speciality ER',
    color: '#0284C7',
  },
  {
    id: 'FAC-VMC-FIR',
    name: 'VMC Central Fire Brigade Headquarters',
    type: 'Fire Station',
    lngLat: [73.1920, 22.3020],
    apparatus: 'Tenders, Aerial Ladder, Hazmat',
    emergency: 'City Central Station',
    color: '#BA1A1A',
  },
  {
    id: 'FAC-POL-HQ',
    name: 'Vadodara City Police Commissionerate',
    type: 'Police HQ',
    lngLat: [73.1812, 22.3103],
    patrols: '112 Control Room & PCR Fleet',
    emergency: 'Central Command',
    color: '#334155',
  },
  {
    id: 'FAC-GIDC-FIR',
    name: 'Makarpura GIDC Industrial Fire Substation',
    type: 'Fire Station',
    lngLat: [73.1948, 22.2482],
    apparatus: 'Chemical Foam Tender & Bowser',
    emergency: 'Industrial Hazmat Response',
    color: '#BA1A1A',
  },
];

export const SATELLITE_HYBRID_STYLE = {
  version: 8,
  name: 'Real World High-Res Satellite Hybrid',
  sources: {
    'esri-satellite': {
      type: 'raster',
      tiles: [
        'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
      ],
      tileSize: 256,
      maxzoom: 19,
    },
    'esri-transportation': {
      type: 'raster',
      tiles: [
        'https://server.arcgisonline.com/ArcGIS/rest/services/Reference/World_Transportation/MapServer/tile/{z}/{y}/{x}',
      ],
      tileSize: 256,
      maxzoom: 19,
    },
    'esri-places': {
      type: 'raster',
      tiles: [
        'https://server.arcgisonline.com/ArcGIS/rest/services/Reference/World_Boundaries_and_Places/MapServer/tile/{z}/{y}/{x}',
      ],
      tileSize: 256,
      maxzoom: 19,
    },
  },
  layers: [
    {
      id: 'satellite-base',
      type: 'raster',
      source: 'esri-satellite',
      minzoom: 0,
      maxzoom: 19,
    },
    {
      id: 'transportation-overlay',
      type: 'raster',
      source: 'esri-transportation',
      minzoom: 0,
      maxzoom: 19,
      paint: {
        'raster-opacity': 0.85,
      },
    },
    {
      id: 'places-overlay',
      type: 'raster',
      source: 'esri-places',
      minzoom: 0,
      maxzoom: 19,
      paint: {
        'raster-opacity': 0.9,
      },
    },
  ],
};

export const OSM_STANDARD_STYLE = {
  version: 8,
  name: 'Standard OpenStreetMap',
  sources: {
    'osm-standard': {
      type: 'raster',
      tiles: [
        'https://a.tile.openstreetmap.org/{z}/{x}/{y}.png',
        'https://b.tile.openstreetmap.org/{z}/{x}/{y}.png',
        'https://c.tile.openstreetmap.org/{z}/{x}/{y}.png',
      ],
      tileSize: 256,
      maxzoom: 19,
    },
  },
  layers: [
    {
      id: 'osm-base',
      type: 'raster',
      source: 'osm-standard',
      minzoom: 0,
      maxzoom: 19,
    },
  ],
};

export const ESRI_DARK_STYLE = {
  version: 8,
  name: 'Esri Dark GIS',
  sources: {
    'esri-dark': {
      type: 'raster',
      tiles: [
        'https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Dark_Gray_Base/MapServer/tile/{z}/{y}/{x}',
      ],
      tileSize: 256,
      maxzoom: 19,
      attribution: 'Esri, HERE, Garmin, USGS',
    },
    'esri-dark-reference': {
      type: 'raster',
      tiles: [
        'https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Dark_Gray_Reference/MapServer/tile/{z}/{y}/{x}',
      ],
      tileSize: 256,
      maxzoom: 19,
    },
  },
  layers: [
    {
      id: 'esri-dark-base',
      type: 'raster',
      source: 'esri-dark',
      minzoom: 0,
      maxzoom: 19,
    },
    {
      id: 'esri-dark-labels',
      type: 'raster',
      source: 'esri-dark-reference',
      minzoom: 0,
      maxzoom: 19,
      paint: {
        'raster-opacity': 0.85,
      },
    },
  ],
};

export const CARTO_DARK_STYLE = ESRI_DARK_STYLE;

// Professional Map Styles
export const VECTOR_MAP_STYLES = {
  dark: {
    name: 'Esri Dark GIS',
    style: ESRI_DARK_STYLE,
    demSource: 'https://demotiles.maplibre.org/terrain-tiles/tiles.json',
  },
  osm: {
    name: 'Standard OpenStreetMap',
    style: OSM_STANDARD_STYLE,
    demSource: 'https://demotiles.maplibre.org/terrain-tiles/tiles.json',
  },

  satellite: {
    name: 'Real High-Res Satellite Hybrid',
    style: SATELLITE_HYBRID_STYLE,
    demSource: 'https://demotiles.maplibre.org/terrain-tiles/tiles.json',
  },
  positron: {
    name: 'Positron 3D Light GIS',
    url: 'https://tiles.openfreemap.org/styles/positron',
    demSource: 'https://demotiles.maplibre.org/terrain-tiles/tiles.json',
  },
  liberty: {
    name: 'Liberty Topographic GIS',
    url: 'https://tiles.openfreemap.org/styles/liberty',
    demSource: 'https://demotiles.maplibre.org/terrain-tiles/tiles.json',
  },
};

export const getStyleObjectOrUrl = (key) => {
  const item = VECTOR_MAP_STYLES[key];
  if (!item) return CARTO_DARK_STYLE;
  return item.style || item.url;
};

export const get3DMapStyleUrl = () => {
  if (import.meta.env.VITE_3D_MAP_STYLE_URL) {
    return import.meta.env.VITE_3D_MAP_STYLE_URL;
  }
  return CARTO_DARK_STYLE;
};

export const getTerrainDemUrl = () => {
  return import.meta.env.VITE_TERRAIN_DEM_URL || VECTOR_MAP_STYLES.positron.demSource;
};


// 2D Leaflet Raster Fallback Providers
export const MAP_PROVIDERS = {
  osm_standard: {
    name: 'OpenStreetMap (Real-World High-Resolution GIS)',
    url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    subdomains: 'abc',
    maxZoom: 19,
  },
  osm_hot: {
    name: 'Humanitarian OpenStreetMap',
    url: 'https://{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png',
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    subdomains: 'abc',
    maxZoom: 19,
  },
};

export const getTileConfig = () => {
  const envUrl = import.meta.env.VITE_MAP_TILE_URL;
  if (envUrl) {
    return {
      url: envUrl,
      attribution: '&copy; OpenStreetMap contributors',
      subdomains: 'abc',
      maxZoom: 19,
    };
  }
  return MAP_PROVIDERS.osm_standard;
};

export const getFallbackTileConfig = () => {
  return MAP_PROVIDERS.osm_hot;
};

// Haversine formula to compute ground distance in kilometers
export const calculateDistanceKm = (lat1, lon1, lat2, lon2) => {
  const R = 6371; // Radius of the Earth in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
    Math.cos((lat2 * Math.PI) / 180) *
    Math.sin(dLon / 2) *
    Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c * 10) / 10;
};

// Generate realistic street-following waypoints between two coordinates (Manhattan-style arterial grid)
export const generateRealisticRoute = (start, end) => {
  const [lat1, lng1] = start;
  const [lat2, lng2] = end;

  // Midpoint waypoint with street turn
  const cornerLat = lat1;
  const cornerLng = lng2;

  // Intermediate steps to create a natural, smooth multi-segment road route
  const waypoints = [
    [lat1, lng1],
    [lat1 + (cornerLat - lat1) * 0.5, lng1 + (cornerLng - lng1) * 0.1],
    [cornerLat, cornerLng],
    [cornerLat + (lat2 - cornerLat) * 0.5, cornerLng + (lng2 - cornerLng) * 0.2],
    [lat2, lng2],
  ];

  return waypoints;
};

// Real-World Road Route Fetching via OSRM (Driving Profile)
export const fetchRealRoadRoute = async (startLngLat, endLngLat) => {
  try {
    const [startLng, startLat] = startLngLat;
    const [endLng, endLat] = endLngLat;

    const url = `https://router.project-osrm.org/route/v1/driving/${startLng},${startLat};${endLng},${endLat}?overview=full&geometries=geojson`;
    const res = await fetch(url, { signal: AbortSignal.timeout(4000) });
    if (!res.ok) throw new Error(`OSRM HTTP error: ${res.status}`);

    const data = await res.json();
    if (data.routes && data.routes.length > 0) {
      const route = data.routes[0];
      return {
        coordinates: route.geometry.coordinates, // Array of [lng, lat]
        distanceKm: Math.round((route.distance / 1000) * 10) / 10,
        durationMins: Math.max(2, Math.round(route.duration / 60)),
        isRealRoad: true,
      };
    }
  } catch (err) {
    console.warn('[GIS Router] OSRM routing unavailable, falling back to arterial road geometry:', err);
  }

  // Graceful fallback to deterministic arterial waypoints:
  const fallback = generateRealisticRoute(
    [startLngLat[1], startLngLat[0]],
    [endLngLat[1], endLngLat[0]]
  ).map(([lat, lng]) => [lng, lat]);
  const dist = calculateDistanceKm(startLngLat[1], startLngLat[0], endLngLat[1], endLngLat[0]);
  return {
    coordinates: fallback,
    distanceKm: dist,
    durationMins: Math.max(2, Math.round(dist * 2.2)),
    isRealRoad: false,
  };
};

export const getSeverityColor = (priority) => {
  switch (priority) {
    case 'CRITICAL':
      return { hex: '#BA1A1A', bg: '#FDE8E8', text: '#BA1A1A', label: 'Critical' };
    case 'HIGH':
      return { hex: '#B45309', bg: '#FEF3C7', text: '#B45309', label: 'High' };
    case 'MEDIUM':
      return { hex: '#1D4ED8', bg: '#EFF6FF', text: '#1D4ED8', label: 'Standard' };
    case 'LOW':
      return { hex: '#167A39', bg: '#F0FDF4', text: '#167A39', label: 'Low' };
    default:
      return { hex: '#475059', bg: '#F0F2EE', text: '#475059', label: 'Normal' };
  }
};

export const getUnitTypeColor = (type) => {
  switch (type) {
    case 'Ambulance':
      return '#0284C7';
    case 'Fire':
      return '#BA1A1A';
    case 'Police':
      return '#334155';
    case 'Medical':
      return '#19483A';
    default:
      return '#0284C7';
  }
};
