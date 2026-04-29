<script lang="ts" module>
  import type { Component } from 'svelte';
  import type { DensityProps } from './Density.shared.svelte.js';

  export type DensityBaseLayerComponents = {
    Group: Component<any>;
    Path: Component<any>;
  };

  export type DensityBaseProps = DensityProps & DensityBaseLayerComponents;
</script>

<script lang="ts">
  import { cls } from '@layerstack/tailwind';
  import { contourDensity } from 'd3-contour';
  import { geoPath } from 'd3-geo';
  import { scaleSequential } from 'd3-scale';
  import { interpolateYlGnBu } from 'd3-scale-chromatic';
  import { max } from 'd3-array';

  import { accessor as resolveAccessor, chartDataArray } from '$lib/utils/common.js';
  import { getChartContext } from '$lib/contexts/chart.js';
  import { getGeoContext } from '$lib/contexts/geo.js';

  const ctx = getChartContext();
  const geo = getGeoContext();

  let {
    Group,
    Path,
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
    class: className,
    ...restProps
  }: DensityBaseProps = $props();

  ctx.registerComponent({ name: 'Density', kind: 'composite-mark' });

  const xAccessor = $derived(xProp ? resolveAccessor(xProp) : ctx.x);
  const yAccessor = $derived(yProp ? resolveAccessor(yProp) : ctx.y);
  const weightAccessor = $derived(weightProp ? resolveAccessor(weightProp) : null);

  const data = $derived(dataProp ?? chartDataArray(ctx.data));

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

    const filteredData = projection
      ? data.filter((d: any) => projection([xAccessor(d), yAccessor(d)]) !== null)
      : data;

    return density(filteredData as any);
  });

  const pathGenerator = $derived(geoPath());

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
        class={cls('lc-density-contour', className)}
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
