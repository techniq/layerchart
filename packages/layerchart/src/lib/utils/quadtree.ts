import type { Quadtree } from 'd3-quadtree';

type Rect = { x: number; y: number; width: number; height: number };

/**
 * Transverse quadtree and generate rect dimensions
 */
export function quadtreeRects<T>(quadtree: Quadtree<T>, showLeaves = true) {
  const rects: Rect[] = [];

  quadtree.visit((node, x0, y0, x1, y1) => {
    if (showLeaves || Array.isArray(node)) {
      rects.push({ x: x0, y: y0, width: x1 - x0, height: y1 - y0 });
    }
  });
  return rects;
}
