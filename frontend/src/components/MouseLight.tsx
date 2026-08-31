import React, { useEffect, useRef } from 'react';

export const MouseLight: React.FC = () => {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (window.matchMedia('(hover: none) and (pointer: coarse)').matches) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    let rafId: number;
    let cx = window.innerWidth / 2, cy = window.innerHeight / 2;
    let tx = cx, ty = cy;
    let onRadar = false, onScreen = true;

    const onMove = (e: MouseEvent) => {
      tx = e.clientX; ty = e.clientY; onScreen = true;
      onRadar = !!(e.target as HTMLElement).closest?.('.radar-container');
    };
    const onLeave = () => (onScreen = false);
    const onEnter = () => (onScreen = true);

    window.addEventListener('mousemove', onMove, { passive: true });
    document.addEventListener('mouseleave', onLeave);
    document.addEventListener('mouseenter', onEnter);

    const tick = () => {
      cx += (tx - cx) * 0.12;
      cy += (ty - cy) * 0.12;
      if (ref.current) {
        ref.current.style.transform = `translate3d(${cx - 350}px, ${cy - 350}px, 0)`;
        const target = onScreen ? (onRadar ? 0.15 : 1) : 0;
        const cur = parseFloat(ref.current.style.opacity || '0');
        ref.current.style.opacity = (cur + (target - cur) * 0.08).toFixed(3);
      }
      rafId = requestAnimationFrame(tick);
    };
    rafId = requestAnimationFrame(tick);

    return () => {
      window.removeEventListener('mousemove', onMove);
      document.removeEventListener('mouseleave', onLeave);
      document.removeEventListener('mouseenter', onEnter);
      cancelAnimationFrame(rafId);
    };
  }, []);

  return (
    <div
      ref={ref}
      style={{
        pointerEvents: 'none',
        position: 'fixed',
        top: 0, left: 0,
        width: '700px', height: '700px',
        zIndex: 9990,
        opacity: 0,
        willChange: 'transform, opacity',
        background: `
          radial-gradient(circle 5px at 350px 350px, rgba(232,240,245,0.7) 0%, transparent 100%),
          radial-gradient(circle 100px at 350px 350px, rgba(79,163,209,0.35) 0%, transparent 100%),
          radial-gradient(circle 350px at 350px 350px, rgba(79,163,209,0.18) 0%, rgba(79,163,209,0.06) 40%, transparent 70%)
        `
      }}
    />
  );
};
