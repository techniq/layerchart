import { curveBumpX, curveBumpY, type CurveFactory } from 'd3-shape';
import type { MarkerOptions } from '../MarkerWrapper.svelte';
import type { Without } from '$lib/utils/types.js';
import type { MotionNoneOption, MotionTweenOption } from '$lib/utils/motion.svelte.js';
import type { LinkSweep, LinkType } from '$lib/utils/linkUtils.js';
import type { PathProps, PathPropsWithoutHTML } from '../Path/Path.shared.svelte.js';
import type { Accessor } from '$lib/utils/common.js';
import type { DataProp } from '$lib/utils/dataProp.js';

export type LinkPropsWithoutHTML = {
  x1?: Accessor;
  y1?: Accessor;
  x2?: Accessor;
  y2?: Accessor;
  /**
   * On an `isometric` chart, the height of the link's start: a data property or accessor of its
   * row (through zScale), or pixels.  Not with `radial`.
   *
   * @default 0
   */
  z1?: DataProp;
  /** The height of the link's end on an `isometric` chart (see `z1`).  @default 0 */
  z2?: DataProp;
  data?: any;
  /** @default false */
  sankey?: boolean;
  source?: (d: any) => any;
  target?: (d: any) => any;
  x?: (d: any) => any;
  y?: (d: any) => any;
  /** @default 'd3' */
  type?: LinkType;
  /** @default 20 */
  radius?: number;
  /** @default 22.5 */
  bend?: number;
  curve?: CurveFactory;
  sweep?: LinkSweep;
  orientation?: 'vertical' | 'horizontal';
  radial?: boolean;
  marker?: MarkerOptions;
  markerMid?: MarkerOptions;
  markerStart?: MarkerOptions;
  markerEnd?: MarkerOptions;
  motion?: MotionTweenOption | MotionNoneOption;
  class?: string | ((d: any) => string);
} & Omit<PathPropsWithoutHTML, 'class'>;

export type LinkProps = LinkPropsWithoutHTML & Without<PathProps, LinkPropsWithoutHTML>;

export const LINK_FALLBACK_COORDS = { x: 0, y: 0 };

export function isAccessorAccessor(value: Accessor | undefined): boolean {
  return typeof value === 'string' || typeof value === 'function';
}

export { curveBumpX, curveBumpY };
