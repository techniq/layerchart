import type { SVGAttributes } from 'svelte/elements';
import type { CommonStyleProps, Without } from '$lib/utils/types.js';
import type { Accessor } from '$lib/utils/common.js';
import type { InterpolateMethod } from '$lib/utils/rasterInterpolate.js';

export type RasterPropsWithoutHTML = {
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
  /** @default 1 */
  pixelSize?: number;
  /** @default 0 */
  blur?: number;
  /** @default 'auto' */
  imageRendering?: 'auto' | 'pixelated' | 'crisp-edges';
} & Pick<CommonStyleProps, 'opacity'>;

export type RasterProps = RasterPropsWithoutHTML &
  Without<SVGAttributes<SVGImageElement>, RasterPropsWithoutHTML>;
