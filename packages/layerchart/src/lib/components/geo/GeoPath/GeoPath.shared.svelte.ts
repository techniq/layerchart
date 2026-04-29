import type { Snippet } from 'svelte';
import type { SVGAttributes } from 'svelte/elements';
import type {
  GeoIdentityTransform,
  GeoPermissibleObjects,
  GeoProjection,
  GeoTransformPrototype,
} from 'd3-geo';
import type { CurveFactory, CurveFactoryLineOnly } from 'd3-shape';
import type { CommonStyleProps, Without } from '$lib/utils/types.js';
import type { PathProps } from '../../Path/Path.shared.svelte.js';
import type { geoCurvePath } from '$lib/utils/geo.js';

export type GeoPathPropsWithoutHTML = {
  geojson?: GeoPermissibleObjects | null;
  tooltip?: boolean;
  onclick?:
    | ((e: MouseEvent, geoPath: ReturnType<typeof geoCurvePath> | undefined) => void)
    | undefined;
  /** @default curveLinearClosed */
  curve?: CurveFactory | CurveFactoryLineOnly;
  geoTransform?: (projection: GeoProjection | GeoIdentityTransform) => GeoTransformPrototype;
  /** @bindable */
  ref?: SVGPathElement;
  children?: Snippet<[{ geoPath: ReturnType<typeof geoCurvePath> | undefined }]>;
} & CommonStyleProps &
  Pick<
    PathProps,
    | 'motion'
    | 'draw'
    | 'marker'
    | 'markerStart'
    | 'markerMid'
    | 'markerEnd'
    | 'startContent'
    | 'endContent'
  >;

export type GeoPathProps = GeoPathPropsWithoutHTML &
  Without<SVGAttributes<SVGPathElement>, GeoPathPropsWithoutHTML>;
