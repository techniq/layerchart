<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  import { min } from 'd3-array';
  import { Delaunay } from 'd3-delaunay';
  import type { GeoPermissibleObjects } from 'd3-geo';
  // @ts-expect-error
  import { geoVoronoi } from 'd3-geo-voronoi';
  import { pointRadial } from 'd3-shape';
  import { cls } from '@layerstack/tailwind';

  import { chartContext } from './ChartContext.svelte';
  import GeoPath from './GeoPath.svelte';
  import { geoContext, type GeoContext } from './GeoContext.svelte';

  const { flatData, xGet, yGet, x: xContext, y: yContext, width, height, radial } = chartContext();
  const geo = geoContext() as GeoContext | undefined;

  /** Override data instead of using context */
  export let data: any = undefined;

  export let classes: {
    root?: string;
    path?: string;
  } = {};

  const dispatch = createEventDispatcher<{
    click: { data: any; point?: [number, number]; feature?: GeoPermissibleObjects };
    pointerenter: {
      event: PointerEvent;
      data: any;
      point?: [number, number];
      feature?: GeoPermissibleObjects;
    };
    pointermove: {
      event: PointerEvent;
      data: any;
      point?: [number, number];
      feature?: GeoPermissibleObjects;
    };
  }>();

  $: points = (data ?? $flatData).map((d: any) => {
    // geo voronoi needs raw latitude/longtude, not mapped to range (chart dimensions)
    const xValue = $geo ? $xContext(d) : $xGet(d);
    const yValue = $geo ? $yContext(d) : $yGet(d);

    const x = Array.isArray(xValue) ? min(xValue) : xValue;
    const y = Array.isArray(yValue) ? min(yValue) : yValue;

    let point: [number, number];
    if ($radial) {
      const radialPoint = pointRadial(x, y);
      // Assume radial is also centered
      point = [radialPoint[0] + $width / 2, radialPoint[1] + $height / 2];
    } else {
      point = [x, y];
    }
    // @ts-expect-error
    point.data = d;
    return point;
  });

  // Width and/or height can sometimes be negative (when loading data remotely and updately)
  $: boundWidth = Math.max($width, 0);
  $: boundHeight = Math.max($height, 0);
</script>

<g {...$$restProps} class={cls(classes.root, $$props.class)}>
  {#if $geo}
    {@const polygons = geoVoronoi().polygons(points)}
    {#each polygons.features as feature}
      <GeoPath
        geojson={feature}
        class={cls('fill-transparent', classes.path)}
        on:pointerenter={(e) =>
          dispatch('pointerenter', { event: e, data: feature.properties.site.data, feature })}
        on:pointermove={(e) =>
          dispatch('pointermove', { event: e, data: feature.properties.site.data, feature })}
        on:pointerleave
        on:touchmove={(e) => {
          // Prevent touch to not interfer with pointer
          e.preventDefault();
        }}
        on:pointerdown
        on:click={(e) => dispatch('click', { data: feature.properties.site.data, feature })}
      />
    {/each}
  {:else}
    {@const voronoi = Delaunay.from(points).voronoi([0, 0, boundWidth, boundHeight])}
    {#each points as point, i}
      <!-- svelte-ignore a11y-click-events-have-key-events -->
      <!-- svelte-ignore a11y-no-static-element-interactions -->
      <path
        d={voronoi.renderCell(i)}
        class={cls('fill-transparent', classes.path)}
        on:pointerenter={(e) => dispatch('pointerenter', { event: e, data: point.data, point })}
        on:pointermove={(e) => dispatch('pointermove', { event: e, data: point.data, point })}
        on:pointerleave
        on:touchmove={(e) => {
          // Prevent touch to not interfer with pointer
          e.preventDefault();
        }}
        on:pointerdown
        on:click={(e) => dispatch('click', { data: point.data, point })}
      />
    {/each}
  {/if}
</g>
