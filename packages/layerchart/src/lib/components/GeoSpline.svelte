<script lang="ts" module>
  import Spline, { type SplineProps } from './Spline.svelte';
  import { curveNatural, type CurveFactory, type CurveFactoryLineOnly } from 'd3-shape';
  import type { Without } from '$lib/utils/types.js';

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
  import { geoOrthographic, geoInterpolate } from 'd3-geo';

  import { getChartContext } from '$lib/contexts/chart.js';
  import { extractLayerProps } from '$lib/utils/attributes.js';

  let {
    link,
    loft = 1.0,
    curve = curveNatural,
    pathRef: pathRefProp = $bindable(),
    ...restProps
  }: GeoSplineProps = $props();

  let pathRef = $state<SVGPathElement>();
  $effect.pre(() => {
    pathRefProp = pathRef;
  });

  const ctx = getChartContext();

  const loftedProjection = $derived(
    ctx.geo.projection
      ? geoOrthographic()
          .translate(ctx.geo.projection.translate())
          .rotate(ctx.geo.projection.rotate())
          .scale(ctx.geo.projection.scale() * loft)
      : undefined
  );

  const source = $derived(ctx.geo.projection ? ctx.geo.projection(link.source) : [0, 0]) as [
    number,
    number,
  ];
  const target = $derived(ctx.geo.projection ? ctx.geo.projection(link.target) : [0, 0]) as [
    number,
    number,
  ];
  const middle = $derived(
    ctx.geo.projection ? loftedProjection!(geoInterpolate(link.source, link.target)(0.5)) : [0, 0]
  ) as [number, number];
</script>

<Spline
  bind:pathRef
  data={[source, middle, target]}
  x={(d) => d[0]}
  y={(d) => d[1]}
  {curve}
  {...extractLayerProps(restProps, 'lc-geo-spline')}
/>
