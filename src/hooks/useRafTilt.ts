import { useEffect, useRef } from "react";

/**
 * Attach a rAF-throttled pointer parallax to an element.
 * - One listener per element, coalesced into a single frame.
 * - Skipped on coarse pointers and when prefers-reduced-motion is set.
 * - Sets CSS vars --px / --py in pixels (range ±intensity).
 */
export function useRafTilt<T extends HTMLElement>(
  intensity = 20,
  opts: { global?: boolean } = {},
) {
  const ref = useRef<T | null>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const mqReduce = window.matchMedia("(prefers-reduced-motion: reduce)");
    const mqFine = window.matchMedia("(pointer: fine)");
    if (mqReduce.matches || !mqFine.matches) return;

    let rafId = 0;
    let nx = 0, ny = 0;
    let pending = false;

    const flush = () => {
      pending = false;
      el.style.setProperty("--px", `${nx}px`);
      el.style.setProperty("--py", `${ny}px`);
    };

    const onMove = (e: PointerEvent) => {
      const r = el.getBoundingClientRect();
      if (r.width === 0) return;
      const x = (e.clientX - r.left) / r.width - 0.5;
      const y = (e.clientY - r.top) / r.height - 0.5;
      nx = x * intensity;
      ny = y * intensity;
      if (!pending) {
        pending = true;
        rafId = requestAnimationFrame(flush);
      }
    };

    const onLeave = () => {
      nx = 0; ny = 0;
      if (!pending) {
        pending = true;
        rafId = requestAnimationFrame(flush);
      }
    };

    const target: EventTarget = opts.global ? window : el;
    target.addEventListener("pointermove", onMove as EventListener, { passive: true });
    (opts.global ? window : el).addEventListener("pointerleave", onLeave as EventListener, { passive: true });

    return () => {
      target.removeEventListener("pointermove", onMove as EventListener);
      (opts.global ? window : el).removeEventListener("pointerleave", onLeave as EventListener);
      cancelAnimationFrame(rafId);
    };
  }, [intensity, opts.global]);

  return ref;
}
