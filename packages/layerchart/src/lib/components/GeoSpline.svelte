<script lang="ts">
  import { curveNatural, type CurveFactory, type CurveFactoryLineOnly } from 'd3-shape';
  import { geoOrthographic, geoInterpolate } from 'd3-geo';

  import { chartContext } from './ChartContext.svelte';
  import { geoContext } from './GeoContext.svelte';
  import Spline from './Spline.svelte';

  export let link: { source: [number, number]; target: [number, number] };

  /** Amount of loft to apply to the midle of the curve */
  export let loft = 1.0;

  /**
   * Curve of spline drawn. Imported via d3-shape.
   *
   * @example
   * import { curveNatural } from 'd3-shape';
   * <GeoSpline curve={curveNatrual} />
   *
   * @type {CurveFactory | CurveFactoryLineOnly | undefined}
   */
  export let curve: CurveFactory | CurveFactoryLineOnly | undefined = curveNatural;

  const { width, height } = chartContext();
  const geo = geoContext();

  $: loftedProjection = geoOrthographic()
    .translate($geo.translate())
    .rotate($geo.rotate())
    .scale($geo.scale() * loft);

  $: source = $geo(link.source);
  $: target = $geo(link.target);
  $: middle = loftedProjection(geoInterpolate(link.source, link.target)(0.5));
</script>

<Spline
  data={[source, middle, target]}
  x={(d) => d[0]}
  y={(d) => d[1]}
  defined={(d) => $geo.invert(d)}
  {curve}
  {...$$restProps}
/>
