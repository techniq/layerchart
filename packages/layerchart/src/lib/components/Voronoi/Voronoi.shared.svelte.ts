import type { Snippet } from 'svelte';
import type { Without } from '$lib/utils/types.js';
import type { Accessor } from '$lib/utils/common.js';
import type { GeoPermissibleObjects } from 'd3-geo';
import type { GroupProps } from '../Group/Group.shared.svelte.js';

/**
 * Computed geometry for a single Voronoi cell, provided to the `children` snippet
 * for custom rendering (e.g. placing labels within/around each cell).
 */
export type VoronoiCell = {
  /** Original datum the cell was generated from */
  data: any;
  /** Index of the datum within the source data */
  index: number;
  /** Site (data point) position in pixel space `[x, y]` */
  point: [number, number];
  /**
   * Cell polygon as an array of `[x, y]` pixel coordinates, or `null` for
   * degenerate cells (e.g. coincident/collinear points).
   */
  polygon: [number, number][] | null;
  /**
   * Centroid of the cell `[x, y]` in pixel space, or `null`. For geo charts this
   * is the projected spherical centroid (`geoCentroid`), which is stable across
   * the antimeridian.
   */
  centroid: [number, number] | null;
  /**
   * Size of the cell (always positive), or `0` for degenerate cells. Pixel² for
   * cartesian charts; spherical area in steradians (`geoArea`) for geo charts.
   */
  area: number;
};

export type VoronoiPropsWithoutHTML = {
  data?: any;
  x?: Accessor;
  y?: Accessor;
  /** Radius to clip voronoi cells. `0` or `undefined` to disables clipping */
  r?: number;
  classes?: {
    root?: string;
    path?: string;
  };
  /**
   * Render custom content within the Voronoi group using the computed cell
   * geometry. Useful for placing labels (see the "Labels" example).
   */
  children?: Snippet<[{ cells: VoronoiCell[] }]>;
  onclick?: (
    e: MouseEvent,
    details: { data: any; point?: [number, number]; feature?: GeoPermissibleObjects }
  ) => void;
  onpointerenter?: (
    e: PointerEvent,
    details: { data: any; point?: [number, number]; feature?: GeoPermissibleObjects }
  ) => void;
  onpointermove?: (
    e: PointerEvent,
    details: { data: any; point?: [number, number]; feature?: GeoPermissibleObjects }
  ) => void;
  onpointerdown?: (
    e: PointerEvent,
    details: { data: any; point?: [number, number]; feature?: GeoPermissibleObjects }
  ) => void;
};

export type VoronoiProps = VoronoiPropsWithoutHTML &
  Without<Omit<GroupProps, 'children'>, VoronoiPropsWithoutHTML>;

/**
 * `polygon` (convex, as a Voronoi cell is) cut to within `r` of `center`, the circle drawn as a
 * 48-gon.  For cells measured on screen, where a `CircleClipPath` on the floor would be an ellipse.
 */
export function clipToCircle(
  polygon: [number, number][],
  center: [number, number],
  r: number
): [number, number][] {
  const steps = 48;
  const circle = Array.from({ length: steps }, (_, i): [number, number] => {
    const a = (i / steps) * 2 * Math.PI;
    return [center[0] + r * Math.cos(a), center[1] + r * Math.sin(a)];
  });
  // Sutherland–Hodgman: keep the part of `polygon` inside each edge of the circle in turn
  let output = polygon;
  for (let i = 0; i < steps && output.length; i++) {
    const [ax, ay] = circle[i];
    const [bx, by] = circle[(i + 1) % steps];
    const inside = ([x, y]: [number, number]) => (bx - ax) * (y - ay) - (by - ay) * (x - ax) >= 0;
    const cross = (p: [number, number], q: [number, number]): [number, number] => {
      const [x1, y1] = p;
      const [x2, y2] = q;
      const d = (x1 - x2) * (ay - by) - (y1 - y2) * (ax - bx);
      const t = ((x1 - ax) * (ay - by) - (y1 - ay) * (ax - bx)) / d;
      return [x1 + t * (x2 - x1), y1 + t * (y2 - y1)];
    };
    const input = output;
    output = [];
    for (let j = 0; j < input.length; j++) {
      const current = input[j];
      const previous = input[(j + input.length - 1) % input.length];
      if (inside(current)) {
        if (!inside(previous)) output.push(cross(previous, current));
        output.push(current);
      } else if (inside(previous)) {
        output.push(cross(previous, current));
      }
    }
  }
  return output;
}
