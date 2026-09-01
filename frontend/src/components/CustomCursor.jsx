import React, { useEffect, useRef } from 'react';

export const CustomCursor = () => {
  const cursorRef = useRef(null);

  useEffect(() => {
    if (window.matchMedia('(hover: none) and (pointer: coarse)').matches) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    let rafId;
    let targetX = -100;
    let targetY = -100;
    let currentX = -100;
    let currentY = -100;
    let state = 'default';

    const onMove = (e) => {
      targetX = e.clientX;
      targetY = e.clientY;
      const t = e.target;
      if (!t) return;
      if (t.closest('input, textarea, [contenteditable]')) {
        state = 'text';
      } else if (
        t.closest('button, a, [role="button"], select, .cursor-pointer') ||
        window.getComputedStyle(t).cursor === 'pointer'
      ) {
        state = 'hover';
      } else {
        state = 'default';
      }
    };

    window.addEventListener('mousemove', onMove, { passive: true });

    const tick = () => {
      // Direct tracking for dot, smooth interpolation
      currentX += (targetX - currentX) * 0.75;
      currentY += (targetY - currentY) * 0.75;

      if (cursorRef.current) {
        cursorRef.current.style.transform = `translate3d(${currentX}px, ${currentY}px, 0)`;
        cursorRef.current.dataset.state = state;
      }
      rafId = requestAnimationFrame(tick);
    };

    rafId = requestAnimationFrame(tick);

    return () => {
      window.removeEventListener('mousemove', onMove);
      cancelAnimationFrame(rafId);
    };
  }, []);

  return (
    <div
      ref={cursorRef}
      className="custom-cursor"
      style={{ pointerEvents: 'none', position: 'fixed', top: 0, left: 0, zIndex: 9999, willChange: 'transform' }}
    >
      <div className="cursor-dot" />
      <div className="cursor-ring" />
    </div>
  );
};
