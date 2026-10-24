/** Pixels of movement ignored before a note row claims the gesture. */
export const SWIPE_SLOP = 10;

/**
 * Horizontal movement must exceed vertical by this factor.
 * A diagonal drag stays a scroll so the list does not stick mid-flick.
 */
export const SWIPE_HORIZONTAL_BIAS = 1.75;

export type SwipeLock = "h" | "v";

/** `null` while the finger is still inside the slop. Vertical wins ties. */
export function lockSwipe(dx: number, dy: number): SwipeLock | null {
  const ax = Math.abs(dx);
  const ay = Math.abs(dy);
  if (ax < SWIPE_SLOP && ay < SWIPE_SLOP) return null;
  return ax > ay * SWIPE_HORIZONTAL_BIAS ? "h" : "v";
}
