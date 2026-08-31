import React, { useEffect, useRef } from 'react';

export const CustomCursor: React.FC = () => {
  const cursorRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (window.matchMedia('(hover: none) and (pointer: coarse)').matches) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    let rafId: number;
    let x = -100, y = -100;
    let state = 'default';

    const onMove = (e: MouseEvent) => {
      x = e.clientX;
      y = e.clientY;
      const t = e.target as HTMLElement;
      if (t.closest('input, textarea, [contenteditable]')) state = 'text';
      else if (t.closest('.radar-container')) state = 'radar';
      else if (t.closest('button, a, [role="button"]') || window.getComputedStyle(t).cursor === 'pointer') state = 'hover';
      else state = 'default';
    };

    window.addEventListener('mousemove', onMove, { passive: true });

    const tick = () => {
      if (cursorRef.current) {
        cursorRef.current.style.transform = `translate3d(${x}px, ${y}px, 0)`;
        cursorRef.current.dataset.state = state;
      }
      rafId = requestAnimationFrame(tick);
    };
    rafId = requestAnimationFrame(tick);
    return () => { window.removeEventListener('mousemove', onMove); cancelAnimationFrame(rafId); };
  }, []);

  return (
    <div ref={cursorRef} className="custom-cursor" style={{ pointerEvents: 'none', position: 'fixed', top: 0, left: 0, zIndex: 9999, willChange: 'transform' }}>
      <div className="cursor-dot" />
      <div className="cursor-ring" />
      <div className="cursor-crosshair" />
    </div>
  );
};
