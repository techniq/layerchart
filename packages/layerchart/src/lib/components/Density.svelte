<script lang="ts" module>
  import type { SVGAttributes } from 'svelte/elements';
  import type { CommonStyleProps, Without } from '$lib/utils/types.js';
  import type { Accessor } from '$lib/utils/common.js';

  export type DensityPropsWithoutHTML = {
    /** Override chart data. Defaults to chart context data. */
    data?: any[];
    /** X accessor. Defaults to chart context x accessor. */
    x?: Accessor;
    /** Y accessor. Defaults to chart context y accessor. */
    y?: Accessor;
    /** Weight accessor for weighted density estimation. */
    weight?: Accessor;
    /** KDE bandwidth in pixels. @default 20 */
    bandwidth?: number;
    /** Number of contour thresholds. @default 20 */
    thresholds?: number;
  } & CommonStyleProps;

  export type DensityProps = DensityPropsWithoutHTML &
    Without<SVGAttributes<SVGGElement>, DensityPropsWithoutHTML>;
</script>

<script lang="ts">
  import { contourDensity } from 'd3-contour';
  import { geoPath } from 'd3-geo';
  import { scaleSequential } from 'd3-scale';
  import { interpolateYlGnBu } from 'd3-scale-chromatic';
  import { max } from 'd3-array';

  import Group from './Group.svelte';
  import Path from './Path.svelte';
  import { accessor as resolveAccessor, chartDataArray } from '$lib/utils/common.js';
  import { getChartContext } from '$lib/contexts/chart.js';
  import { getGeoContext } from '$lib/contexts/geo.js';

  const ctx = getChartContext();
  const geo = getGeoContext();

  let {
    data: dataProp,
    x: xProp,
    y: yProp,
    weight: weightProp,
    bandwidth = 20,
    thresholds = 20,
    fill,
    fillOpacity,
    stroke,
    strokeWidth,
    opacity,
  }: DensityProps = $props();

  ctx.registerComponentNode({
    name: 'Density',
    kind: 'composite-mark',
  });

  const xAccessor = $derived(xProp ? resolveAccessor(xProp) : ctx.x);
  const yAccessor = $derived(yProp ? resolveAccessor(yProp) : ctx.y);
  const weightAccessor = $derived(weightProp ? resolveAccessor(weightProp) : null);

  const data = $derived(dataProp ?? chartDataArray(ctx.data));

  // Compute density contours in pixel space
  const contours = $derived.by(() => {
    if (!data || data.length === 0 || !ctx.width || !ctx.height) return [];

    const projection = geo.projection;

    const density = contourDensity()
      .x((d: any) => {
        if (projection) {
          const p = projection([xAccessor(d), yAccessor(d)]);
          return p ? p[0] : 0;
        }
        return ctx.xScale(xAccessor(d));
      })
      .y((d: any) => {
        if (projection) {
          const p = projection([xAccessor(d), yAccessor(d)]);
          return p ? p[1] : 0;
        }
        return ctx.yScale(yAccessor(d));
      })
      .size([ctx.width, ctx.height])
      .bandwidth(bandwidth)
      .thresholds(thresholds);

    if (weightAccessor) {
      density.weight((d: any) => weightAccessor(d));
    }

    // Filter out data that doesn't project (e.g. points outside projection bounds)
    const filteredData = projection
      ? data.filter((d: any) => projection([xAccessor(d), yAccessor(d)]) !== null)
      : data;

    return density(filteredData as any);
  });

  // Identity geoPath for pixel-coordinate contours
  const pathGenerator = $derived(geoPath());

  // Color scale: use chart's cScale (with auto-computed domain) or fall back to default
  const colorScale = $derived.by(() => {
    if (fill) return null;
    const maxValue = max(contours, (d) => d.value) ?? 1;
    if (ctx.cScale) {
      return ctx.cScale.copy().domain([0, maxValue]);
    }
    return scaleSequential([0, maxValue], interpolateYlGnBu);
  });

  function getContourFill(contour: { value: number }) {
    if (fill) return fill;
    return colorScale ? String(colorScale(contour.value)) : 'steelblue';
  }
</script>

{#if contours.length > 0}
  <Group class="lc-density" {opacity}>
    {#each contours as contour, i (i)}
      <Path
        pathData={pathGenerator(contour) ?? ''}
        fill={getContourFill(contour)}
        {fillOpacity}
        {stroke}
        {strokeWidth}
        class="lc-density-contour"
      />
    {/each}
  </Group>
{/if}

<style>
  @layer components {
    :global(:where(.lc-density-contour)) {
      --stroke-color: none;
    }
  }
</style>
