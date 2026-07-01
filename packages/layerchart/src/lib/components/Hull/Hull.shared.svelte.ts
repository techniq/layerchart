import type { Without, CommonStyleProps } from '$lib/utils/types.js';
import type { SVGAttributes } from 'svelte/elements';
import type { ComponentProps } from 'svelte';
import type { Delaunay } from 'd3-delaunay';
import type Spline from '../Spline/Spline.svelte';
import type { GroupProps } from '../Group/Group.shared.svelte.js';

export type HullPropsWithoutHTML = {
  data?: any;
  /** @default curveLinearClosed */
  curve?: ComponentProps<typeof Spline>['curve'];
  classes?: {
    root?: string;
    path?: string;
  };
  onpointermove?: (
    e: PointerEvent,
    details: { points: [number, number][]; polygon: Delaunay.Polygon }
  ) => void;
  onclick?: (
    e: MouseEvent,
    details: { points: [number, number][]; polygon: Delaunay.Polygon }
  ) => void;
  onpointerleave?: (e: PointerEvent) => void;
  /** @bindable */
  ref?: SVGGElement;
} & CommonStyleProps;

export type HullProps = HullPropsWithoutHTML & Without<GroupProps, HullPropsWithoutHTML>;
