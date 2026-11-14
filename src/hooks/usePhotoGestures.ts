import { useEffect, useRef, type MouseEvent, type PointerEvent } from "react";

export function usePhotoGestures<T extends HTMLElement>(
  onMove: (step: number) => void,
  enabled: boolean
) {
  const ref = useRef<T>(null);
  const moveRef = useRef(onMove);
  const start = useRef<{ x: number; y: number } | null>(null);
  const suppressClick = useRef(false);
  moveRef.current = onMove;

  useEffect(() => {
    const node = ref.current;
    if (!node || !enabled) return;
    let distance = 0;
    let lastEvent = 0;
    let switched = false;
    const handleWheel = (event: WheelEvent) => {
      const dx = event.deltaX || (event.shiftKey ? event.deltaY : 0);
      const dy = event.shiftKey ? 0 : event.deltaY;
      if (event.ctrlKey || Math.abs(dx) <= Math.abs(dy)) return;
      event.preventDefault();
      const now = performance.now();
      if (now - lastEvent > 180 || Math.sign(dx) !== Math.sign(distance)) {
        distance = 0;
        switched = false;
      }
      lastEvent = now;
      if (switched) return;
      const unit =
        event.deltaMode === 1
          ? 16
          : event.deltaMode === 2
          ? node.clientWidth
          : 1;
      distance += dx * unit;
      if (Math.abs(distance) >= 50) {
        moveRef.current(distance > 0 ? 1 : -1);
        switched = true;
      }
    };
    // A non-passive listener consumes horizontal gestures without blocking page scrolling.
    node.addEventListener("wheel", handleWheel, { passive: false });
    return () => node.removeEventListener("wheel", handleWheel);
  }, [enabled]);

  return {
    ref,
    onPointerDown: (event: PointerEvent<T>) => {
      if (!enabled || event.pointerType !== "mouse" || event.button !== 0)
        return;
      if (
        event.currentTarget.tagName !== "BUTTON" &&
        (event.target as Element).closest("button")
      )
        return;
      start.current = { x: event.clientX, y: event.clientY };
      suppressClick.current = false;
      event.currentTarget.setPointerCapture?.(event.pointerId);
    },
    onPointerUp: (event: PointerEvent<T>) => {
      const origin = start.current;
      start.current = null;
      if (!origin) return;
      const dx = event.clientX - origin.x;
      const dy = event.clientY - origin.y;
      if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy) * 1.25) {
        suppressClick.current = true;
        moveRef.current(dx < 0 ? 1 : -1);
        setTimeout(() => {
          suppressClick.current = false;
        }, 0);
      }
    },
    onPointerCancel: () => {
      start.current = null;
    },
    onClickCapture: (event: MouseEvent<T>) => {
      if (!suppressClick.current) return;
      suppressClick.current = false;
      event.preventDefault();
      event.stopPropagation();
    },
  };
}
