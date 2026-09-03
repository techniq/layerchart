import { sortFunc } from '@layerstack/utils';

/** Axis-aligned bounding box in pixel space. */
export type OcclusionRect = { x: number; y: number; width: number; height: number };

/**
 * Axis-aligned box enclosing `rect` after rotating it `degrees` about (`originX`, `originY`) —
 * the same rotation SVG's `rotate(deg, x, y)` applies.
 *
 * `occlude()` tests axis-aligned boxes, so a rotated label has to be widened to the box that
 * contains it.  Angled tick labels are the common case: at 45° a long label takes far less
 * horizontal room than it does flat, and measuring it unrotated would drop neighbours that
 * actually fit.
 */
export function rotateRect(
  rect: OcclusionRect,
  degrees: number,
  originX: number,
  originY: number
): OcclusionRect {
  if (!degrees) return rect;

  const radians = (degrees * Math.PI) / 180;
  const cos = Math.cos(radians);
  const sin = Math.sin(radians);

  const corners = [
    [rect.x, rect.y],
    [rect.x + rect.width, rect.y],
    [rect.x, rect.y + rect.height],
    [rect.x + rect.width, rect.y + rect.height],
  ].map(([cx, cy]) => {
    const dx = cx - originX;
    const dy = cy - originY;
    return [originX + dx * cos - dy * sin, originY + dx * sin + dy * cos];
  });

  const xs = corners.map(([cx]) => cx);
  const ys = corners.map(([, cy]) => cy);
  const minX = Math.min(...xs);
  const minY = Math.min(...ys);

  return { x: minX, y: minY, width: Math.max(...xs) - minX, height: Math.max(...ys) - minY };
}

export type OcclusionOptions<T> = {
  /**
   * Priority accessor — higher-priority items are placed first and win ties
   * against overlapping lower-priority items. Defaults to input order.
   */
  priority?: (item: T) => number;
  /** Minimum gap (in pixels) required between kept boxes. */
  padding?: number;
};

/**
 * Greedy label occlusion (à la https://observablehq.com/@d3/occlusion): sort by
 * priority, then keep each item only if its box doesn't overlap an already-kept
 * one — dropping the rest. Returns the kept items (in priority order).
 *
 * Brute-force `O(n·k)` overlap testing, where `k` is the (bounded) number kept —
 * effectively linear for realistic label counts, so no spatial index is needed.
 */
export function occlude<T>(
  items: T[],
  bounds: (item: T) => OcclusionRect,
  options: OcclusionOptions<T> = {}
): T[] {
  const { priority, padding = 0 } = options;

  // Highest priority first; equal priorities keep input order (stable sort).
  const ordered = priority ? [...items].sort(sortFunc(priority, 'desc')) : items;

  const kept: T[] = [];
  const keptRects: OcclusionRect[] = [];

  for (const item of ordered) {
    const r = bounds(item);
    let occluded = false;
    for (const k of keptRects) {
      if (
        r.x - padding < k.x + k.width &&
        r.x + r.width + padding > k.x &&
        r.y - padding < k.y + k.height &&
        r.y + r.height + padding > k.y
      ) {
        occluded = true;
        break;
      }
    }
    if (!occluded) {
      kept.push(item);
      keptRects.push(r);
    }
  }

  return kept;
}
