import { backWalls, planeCircle, type AffineMatrix } from '$lib/utils/isometric.js';
import type { HighlightLineSegment } from './Highlight.shared.svelte.js';

type Point = { x: number; y: number };

/** Where a `Highlight` marks a row on an `isometric` floor (part of that view) */
export type HighlightIsometric = {
  /** The row on the flat plot, before it's raised */
  x: number;
  y: number;
  /** Its height, and the tallest the walls go, in pixels */
  height: number;
  depth: number;
  lift: Point;
  floor: { width: number; height: number };
  m: AffineMatrix;
};

const raise = (p: Point, lift: Point, h: number) => ({ x: p.x + lift.x * h, y: p.y + lift.y * h });

/**
 * The row traced on each back wall: across it at the row's height, and for `axis`, up it at the
 * row's `x` (a wall along x) or `y`
 */
export function highlightWallLines(
  { x, y, height, depth, lift, floor, m }: HighlightIsometric,
  axis: string
): HighlightLineSegment[] {
  const segment = (a: Point, b: Point) => ({ x1: a.x, y1: a.y, x2: b.x, y2: b.y });
  return backWalls(floor, m).flatMap((edge) => {
    const lines = [segment(raise(edge.from, lift, height), raise(edge.to, lift, height))];
    if ([edge.axis, 'both'].includes(axis)) {
      const foot = edge.axis === 'x' ? { x, y: edge.from.y } : { x: edge.from.x, y };
      lines.push(segment(foot, raise(foot, lift, depth)));
    }
    return lines;
  });
}

export type HighlightShadow = { pathData: string; c: Point; u: Point; v: Point; r: number };

/**
 * A circle of radius `r` on the floor beneath the row and on each back wall level with it, as path
 * data, and as its centre and plane (`u`, `v`) for a layer without paths
 */
export function highlightShadows(
  { x, y, height, lift, floor, m }: HighlightIsometric,
  r: number
): HighlightShadow[] {
  const shadow = (c: Point, u: Point, v: Point) => ({
    pathData: planeCircle(c, u, v, r),
    c,
    u,
    v,
    r,
  });
  return [
    shadow({ x, y }, { x: 1, y: 0 }, { x: 0, y: 1 }),
    ...backWalls(floor, m).map((edge) => {
      // On the wall at the row's x (a wall along x) or y (a wall along y)
      const foot = edge.axis === 'x' ? { x, y: edge.from.y } : { x: edge.from.x, y };
      const across = edge.axis === 'x' ? { x: 1, y: 0 } : { x: 0, y: 1 };
      return shadow(raise(foot, lift, height), across, lift);
    }),
  ];
}
