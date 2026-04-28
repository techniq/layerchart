import type { SVGAttributes } from 'svelte/elements';
import type { CommonStyleProps, Without } from '$lib/utils/types.js';
import type { Accessor } from '$lib/utils/common.js';

export type DensityPropsWithoutHTML = {
  data?: any[];
  x?: Accessor;
  y?: Accessor;
  weight?: Accessor;
  /** @default 20 */
  bandwidth?: number;
  /** @default 20 */
  thresholds?: number;
} & CommonStyleProps;

export type DensityProps = DensityPropsWithoutHTML &
  Without<SVGAttributes<SVGGElement>, DensityPropsWithoutHTML>;
