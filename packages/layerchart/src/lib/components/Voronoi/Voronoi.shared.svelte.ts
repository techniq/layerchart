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
