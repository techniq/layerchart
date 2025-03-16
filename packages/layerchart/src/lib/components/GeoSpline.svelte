<script lang="ts" module>
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
    Without<SplineProps, GeoSplinePropsWithoutHTML>;
</script>

<script lang="ts">
  import { curveNatural, type CurveFactory, type CurveFactoryLineOnly } from 'd3-shape';
  import { geoOrthographic, geoInterpolate } from 'd3-geo';

  import Spline, { type SplineProps } from './Spline.svelte';
  import { getGeoContext } from './GeoContext.svelte';
  import type { Without } from 'layerchart/utils/types.js';

  let {
    link,
    loft = 1.0,
    curve = curveNatural,
    ref = $bindable(),
    ...restProps
  }: GeoSplineProps = $props();

  const geoCtx = getGeoContext();

  const loftedProjection = $derived(
    geoCtx.projection
      ? geoOrthographic()
          .translate(geoCtx.projection.translate())
          .rotate(geoCtx.projection.rotate())
          .scale(geoCtx.projection.scale() * loft)
      : undefined
  );

  const source = $derived(geoCtx.projection ? geoCtx.projection(link.source) : [0, 0]) as [
    number,
    number,
  ];
  const target = $derived(geoCtx.projection ? geoCtx.projection(link.target) : [0, 0]) as [
    number,
    number,
  ];
  const middle = $derived(
    geoCtx.projection ? loftedProjection!(geoInterpolate(link.source, link.target)(0.5)) : [0, 0]
  ) as [number, number];
</script>

<Spline
  bind:ref
  data={[source, middle, target]}
  x={(d) => d[0]}
  y={(d) => d[1]}
  {curve}
  {...restProps}
/>
