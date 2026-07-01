import type { CurveFactory, CurveFactoryLineOnly } from 'd3-shape';
import type { Without } from '$lib/utils/types.js';
import type { PathProps } from '../../Path/Path.shared.svelte.js';

export type GeoSplinePropsWithoutHTML = {
  link: { source: [number, number]; target: [number, number] };
  /** @default 1.0 */
  loft?: number;
  /** @default curveNatural */
  curve?: CurveFactory | CurveFactoryLineOnly;
};

export type GeoSplineProps = GeoSplinePropsWithoutHTML &
  Without<PathProps, GeoSplinePropsWithoutHTML>;
