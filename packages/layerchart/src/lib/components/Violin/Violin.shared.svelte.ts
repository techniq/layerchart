import type { SVGAttributes } from 'svelte/elements';
import type { CurveFactory } from 'd3-shape';
import type { CommonStyleProps, CommonEvents, Without } from '$lib/utils/types.js';
import type { Accessor } from '$lib/utils/common.js';

export type ViolinPropsWithoutHTML = {
  data: Object;
  density?: Accessor;
  values?: Accessor;
  bandwidth?: number;
  /** @default 50 */
  thresholds?: number;
  width?: number;
  /** @default curveCardinal */
  curve?: CurveFactory;
  /** @default false */
  median?: boolean;
  /** @default false */
  box?: boolean | { width?: number };
  tooltip?: boolean;
} & CommonStyleProps;

export type ViolinProps = ViolinPropsWithoutHTML &
  Without<SVGAttributes<SVGPathElement>, ViolinPropsWithoutHTML> &
  CommonEvents;
