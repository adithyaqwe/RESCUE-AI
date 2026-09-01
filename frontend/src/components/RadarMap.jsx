import React, { useState } from 'react';
import { GisMap3D } from './map/GisMap3D';
import { GisMap2D } from './map/GisMap2D';

function isWebGLSupported() {
  if (typeof window === 'undefined') return false;
  try {
    const canvas = document.createElement('canvas');
    return Boolean(
      window.WebGLRenderingContext &&
      (canvas.getContext('webgl') || canvas.getContext('experimental-webgl'))
    );
  } catch {
    return false;
  }
}

export const RadarMap = (props) => {
  const [use2DFallback, setUse2DFallback] = useState(() => !isWebGLSupported());
  const [mapTheme, setMapTheme] = useState(() => {
    try {
      return localStorage.getItem('rescue_ai_map_theme') || 'dark';
    } catch {
      return 'dark';
    }
  });

  const handleSelectTheme = (themeId) => {
    setMapTheme(themeId);
    try {
      localStorage.setItem('rescue_ai_map_theme', themeId);
    } catch {
      // Ignored if storage restricted
    }
  };

  if (use2DFallback) {
    return (
      <GisMap2D
        {...props}
        mapTheme={mapTheme}
        onSelectTheme={handleSelectTheme}
      />
    );
  }

  return (
    <GisMap3D
      {...props}
      mapTheme={mapTheme}
      onSelectTheme={handleSelectTheme}
      onFallbackTo2D={() => setUse2DFallback(true)}
    />
  );
};

export default RadarMap;
