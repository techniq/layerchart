import type { Without } from '$lib/utils/types.js';
import type { GeoPathProps } from '../GeoPath/GeoPath.shared.svelte.js';

export type GeoCirclePropsWithoutHTML = {
  /** @default 90 */
  radius?: number;
  /** @default [0, 0] */
  center?: [number, number];
  /** @default 6 */
  precision?: number;
};

export type GeoCircleProps = GeoCirclePropsWithoutHTML &
  Without<GeoPathProps, GeoCirclePropsWithoutHTML>;
