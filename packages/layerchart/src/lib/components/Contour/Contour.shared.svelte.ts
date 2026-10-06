import type { SVGAttributes } from 'svelte/elements';
import type { CommonStyleProps, Without } from '$lib/utils/types.js';
import type { Accessor } from '$lib/utils/common.js';
import type { InterpolateMethod } from '$lib/utils/rasterInterpolate.js';
import type { DataProp } from '$lib/utils/dataProp.js';

export type ContourPropsWithoutHTML = {
  data?: number[] | Float64Array | any[];
  width?: number;
  height?: number;
  x1?: number;
  y1?: number;
  x2?: number;
  y2?: number;
  /** @default 'value' */
  value?: Accessor | ((x: number, y: number) => number);
  x?: Accessor;
  y?: Accessor;
  /** @default 'barycentric' */
  interpolate?: InterpolateMethod;
  /** @default 10 */
  thresholds?: number | number[];
  /** @default 0 */
  blur?: number;
  /** @default true */
  smooth?: boolean;
  /**
   * Height to raise each contour band off an `isometric` floor, from the band — its threshold is
   * `value`, so `z="value"` raises each to `zScale(value)`.
   * - `string`: band property name, resolved via zScale
   * - `function(band)`: accessor, result passed through zScale
   * - `number`: pixel height for every band
   *
   * Filled bands stand on the one below, as terraces with sides; unfilled ones (`fill="none"`)
   * float as lines.  No effect on a flat chart.
   */
  z?: DataProp;
} & CommonStyleProps;

export type ContourProps = ContourPropsWithoutHTML &
  Without<SVGAttributes<SVGGElement>, ContourPropsWithoutHTML>;
