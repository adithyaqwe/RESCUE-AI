import React, { useEffect, useRef, useState } from 'react';

export const MouseLight = () => {
  const lightRef = useRef(null);
  const [enabled] = useState(() => {
    if (typeof window === 'undefined') return false;
    const isTouch = window.matchMedia('(pointer: coarse)').matches;
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    return !isTouch && !prefersReducedMotion;
  });

  useEffect(() => {
    if (!enabled) return;

    let mouseX = window.innerWidth / 2;
    let mouseY = window.innerHeight / 2;
    let currentX = mouseX;
    let currentY = mouseY;
    let isOverMap = false;
    let animFrameId;

    const handleMouseMove = (e) => {
      mouseX = e.clientX;
      mouseY = e.clientY;

      // Adapt light intensity: dim down over map to preserve geographic readability
      const target = e.target;
      if (target && target.closest('.maplibregl-map, .maplibregl-canvas, .leaflet-container')) {
        isOverMap = true;
      } else {
        isOverMap = false;
      }
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });

    const loop = () => {
      // Smooth lerp tracking
      currentX += (mouseX - currentX) * 0.18;
      currentY += (mouseY - currentY) * 0.18;

      if (lightRef.current) {
        // Radius: 320px (offset by 160px to center on pointer)
        lightRef.current.style.transform = `translate3d(${currentX - 160}px, ${currentY - 160}px, 0)`;
        lightRef.current.style.opacity = isOverMap ? '0.28' : '1.0';
      }

      animFrameId = requestAnimationFrame(loop);
    };

    animFrameId = requestAnimationFrame(loop);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      cancelAnimationFrame(animFrameId);
    };
  }, [enabled]);

  if (!enabled) return null;

  return (
    <div
      ref={lightRef}
      className="fixed top-0 left-0 w-[320px] h-[320px] pointer-events-none z-[2] will-change-transform transition-opacity duration-300"
      style={{
        background:
          'radial-gradient(circle, rgba(25, 72, 58, 0.15) 0%, rgba(25, 72, 58, 0.06) 40%, rgba(25, 72, 58, 0.02) 65%, transparent 80%)',
        filter: 'blur(4px)',
      }}
      aria-hidden="true"
    />
  );
};

export default MouseLight;
