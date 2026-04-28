<script lang="ts" module>
  import type { Component } from 'svelte';
  import type { HullProps } from './Hull.shared.svelte.js';

  export type HullBaseLayerComponents = {
    Group: Component<any>;
    Spline: Component<any>;
  };

  export type HullBaseProps = HullProps & HullBaseLayerComponents;
</script>

<script lang="ts">
  import { min } from 'd3-array';
  import { Delaunay } from 'd3-delaunay';
  // @ts-expect-error - no types available
  import { geoVoronoi } from 'd3-geo-voronoi';
  import { curveLinearClosed } from 'd3-shape';
  import { cls } from '@layerstack/tailwind';

  // GeoPath agnostic; only loaded when used inside a geo chart.
  import GeoPath from '../geo/GeoPath/GeoPath.svelte';
  import { getChartContext } from '$lib/contexts/chart.js';
  import { getGeoContext } from '$lib/contexts/geo.js';

  const ctx = getChartContext();
  const geo = getGeoContext();

  ctx.registerComponent({ name: 'Hull', kind: 'composite-mark' });

  let {
    Group,
    Spline,
    data,
    curve = curveLinearClosed,
    classes = {},
    onpointermove,
    onclick,
    onpointerleave,
    fill,
    fillOpacity,
    stroke,
    strokeOpacity,
    strokeWidth,
    opacity,
    class: className,
    ref: refProp = $bindable(),
    ...restProps
  }: HullBaseProps = $props();

  let ref = $state<SVGGElement>();

  $effect.pre(() => {
    refProp = ref;
  });

  const points = $derived(
    (data ?? ctx.flatData).map((d: any) => {
      const xValue = ctx.x(d);
      const yValue = ctx.y(d);

      const x = Array.isArray(xValue) ? min(xValue) : xValue;
      const y = Array.isArray(yValue) ? min(yValue) : yValue;

      const point = [x, y];
      // @ts-expect-error
      point.data = d;
      return point;
    })
  );
</script>

<Group {...restProps} class={cls('lc-hull-g', classes.root, className)} bind:ref>
  {#if geo.projection}
    {@const polygon = geoVoronoi().hull(points)}
    <GeoPath
      geojson={polygon}
      {curve}
      {fill}
      {fillOpacity}
      {stroke}
      {strokeOpacity}
      {strokeWidth}
      {opacity}
      class={['lc-hull-path', classes.path]}
      onclick={(e: MouseEvent) => onclick?.(e, { points, polygon })}
      onpointermove={(e: PointerEvent) => onpointermove?.(e, { points, polygon })}
      {onpointerleave}
    />
  {:else}
    {@const delaunay = Delaunay.from(points)}
    {@const polygon = delaunay.hullPolygon()}
    <Spline
      data={polygon}
      x={(d: any) => d[0]}
      y={(d: any) => d[1]}
      {curve}
      {fill}
      {fillOpacity}
      {stroke}
      {strokeOpacity}
      {strokeWidth}
      {opacity}
      class={['lc-hull-class', classes.path]}
      onclick={(e: MouseEvent) => onclick?.(e, { points, polygon })}
      onpointermove={(e: PointerEvent) => onpointermove?.(e, { points, polygon })}
      {onpointerleave}
    />
  {/if}
</Group>

<style>
  @layer components {
    :global(:where(.lc-hull-path, .lc-hull-geo-path)) {
      fill: transparent;
    }
  }
</style>
