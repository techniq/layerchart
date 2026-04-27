<script lang="ts" module>
  import { curveNatural, type CurveFactory, type CurveFactoryLineOnly } from 'd3-shape';
  import type { Without } from '$lib/utils/types.js';
  import type { PathProps } from '../Path/Path.svelte';

  export type GeoSplinePropsWithoutHTML = {
    /**
     * Link between two points on the globe.
     */
    link: { source: [number, number]; target: [number, number] };

    /**
     * The amount of loft to apply to the middle of the curve.
     *
     * @default 1.0
     */
    loft?: number;

    /**
     * Curve of spline drawn. Imported via d3-shape.
     *
     * @example
     * import { curveNatural } from 'd3-shape';
     * <GeoSpline curve={curveNatural} />
     *
     * @default curveNatural
     */
    curve?: CurveFactory | CurveFactoryLineOnly;
  };

  export type GeoSplineProps = GeoSplinePropsWithoutHTML &
    Without<PathProps, GeoSplinePropsWithoutHTML>;
</script>

<script lang="ts">
  import { geoOrthographic, geoInterpolate } from 'd3-geo';
  import { line as d3Line } from 'd3-shape';

  import { getGeoContext } from '$lib/contexts/geo.js';
  import { extractLayerProps } from '$lib/utils/attributes.js';
  import Path from '../Path/Path.svelte';

  let { link, loft = 1.0, curve = curveNatural, ...restProps }: GeoSplineProps = $props();

  const geo = getGeoContext();

  const loftedProjection = $derived(
    geo.projection
      ? geoOrthographic()
          .translate(geo.projection.translate())
          .rotate(geo.projection.rotate())
          .scale(geo.projection.scale() * loft)
      : undefined
  );

  const source = $derived(geo.projection ? geo.projection(link.source) : [0, 0]) as [
    number,
    number,
  ];
  const target = $derived(geo.projection ? geo.projection(link.target) : [0, 0]) as [
    number,
    number,
  ];
  const middle = $derived(
    geo.projection ? loftedProjection!(geoInterpolate(link.source, link.target)(0.5)) : [0, 0]
  ) as [number, number];

  // Build SVG path directly since coordinates are already projected to screen space.
  // Using Spline would double-project via its geo mode.
  const d = $derived(
    d3Line<[number, number]>()
      .x((d) => d[0])
      .y((d) => d[1])
      .curve(curve)([source, middle, target]) ?? ''
  );
</script>

<Path pathData={d} {...extractLayerProps(restProps, 'lc-geo-spline')} />
