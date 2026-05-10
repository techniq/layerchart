import type { SVGAttributes } from 'svelte/elements';
import type { CommonStyleProps, CommonEvents, Without } from '$lib/utils/types.js';
import type { Accessor } from '$lib/utils/common.js';

export type BoxPlotPropsWithoutHTML = {
  data: Object;
  min?: Accessor;
  q1?: Accessor;
  median?: Accessor;
  q3?: Accessor;
  max?: Accessor;
  outliers?: Accessor;
  values?: Accessor;
  /** @default 1.5 */
  iqrMultiplier?: number;
  width?: number;
  /** @default 0.5 */
  capWidth?: number;
  /** @default 0 */
  radius?: number;
  /** @default 3 */
  outlierRadius?: number;
  tooltip?: boolean;
} & CommonStyleProps;

export type BoxPlotProps = BoxPlotPropsWithoutHTML &
  Without<SVGAttributes<SVGElement>, BoxPlotPropsWithoutHTML> &
  CommonEvents;
