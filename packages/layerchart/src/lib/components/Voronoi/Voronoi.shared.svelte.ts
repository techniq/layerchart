import type { Without } from '$lib/utils/types.js';
import type { Accessor } from '$lib/utils/common.js';
import type { GeoPermissibleObjects } from 'd3-geo';
import type { GroupProps } from '../Group/Group.shared.svelte.js';

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
