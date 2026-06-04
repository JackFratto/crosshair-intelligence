"use client";

import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

const FRAME_COUNT = 7;
const FRAMES = Array.from(
  { length: FRAME_COUNT },
  (_, i) => `/logo-anim/CrossHair_${i}.png`,
);
const FRAME_MS = 80;

/**
 * Reticle brand mark. Rests on frame 0; on hover it plays the hand-authored
 * sequence forward to the last frame, and on mouse-out it plays it back in
 * reverse to frame 0. (Rotation is baked into the frames, so no CSS spin.)
 */
export function CrosshairLogo({ className }: { className?: string }) {
  const [frame, setFrame] = useState(0);
  const frameRef = useRef(0);
  const targetRef = useRef(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    // Warm the cache so the first hover doesn't flicker on uncached frames.
    FRAMES.forEach((src) => {
      const img = new Image();
      img.src = src;
    });
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  function animateTo(target: number) {
    if (window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) return;
    targetRef.current = target;
    if (timerRef.current) return; // already stepping — it'll head to the new target
    timerRef.current = setInterval(() => {
      const cur = frameRef.current;
      const t = targetRef.current;
      if (cur === t) {
        if (timerRef.current) clearInterval(timerRef.current);
        timerRef.current = null;
        return;
      }
      const next = cur + (t > cur ? 1 : -1);
      frameRef.current = next;
      setFrame(next);
    }, FRAME_MS);
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={FRAMES[frame]}
      alt=""
      aria-hidden="true"
      draggable={false}
      onMouseEnter={() => animateTo(FRAME_COUNT - 1)}
      onMouseLeave={() => animateTo(0)}
      className={cn("object-contain select-none", className)}
    />
  );
}
