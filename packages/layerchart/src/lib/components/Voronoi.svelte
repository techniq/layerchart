<script lang="ts">
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
  import Spline from './Spline.svelte';

  const { flatData, xGet, yGet, x: xContext, y: yContext, width, height, radial } = chartContext();
  const geo = geoContext() as GeoContext | undefined;

  /** Override data instead of using context */
  export let data: any = undefined;

  export let classes: {
    root?: string;
    path?: string;
  } = {};

  export let onclick:
    | ((
        e: MouseEvent,
        details: { data: any; point?: [number, number]; feature?: GeoPermissibleObjects }
      ) => void)
    | undefined = undefined;
  export let onpointerenter:
    | ((
        e: PointerEvent,
        details: {
          data: any;
          point?: [number, number];
          feature?: GeoPermissibleObjects;
        }
      ) => void)
    | undefined = undefined;
  export let onpointermove:
    | ((
        e: PointerEvent,
        details: {
          data: any;
          point?: [number, number];
          feature?: GeoPermissibleObjects;
        }
      ) => void)
    | undefined = undefined;
  export let onpointerleave: ((e: PointerEvent) => void) | undefined = undefined;
  export let onpointerdown:
    | ((
        e: PointerEvent,
        details: {
          data: any;
          point?: [number, number];
          feature?: GeoPermissibleObjects;
        }
      ) => void)
    | undefined = undefined;

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
        class={cls('fill-transparent stroke-transparent', classes.path)}
        onclick={(e) => onclick?.(e, { data: feature.properties.site.data, feature })}
        onpointerenter={(e) => onpointerenter?.(e, { data: feature.properties.site.data, feature })}
        onpointermove={(e) => onpointermove?.(e, { data: feature.properties.site.data, feature })}
        onpointerdown={(e) => onpointerdown?.(e, { data: feature.properties.site.data, feature })}
        {onpointerleave}
        ontouchmove={(e) => {
          // Prevent touch to not interfer with pointer
          e.preventDefault();
        }}
      />
    {/each}
  {:else}
    {@const voronoi = Delaunay.from(points).voronoi([0, 0, boundWidth, boundHeight])}
    {#each points as point, i}
      {@const pathData = voronoi.renderCell(i)}
      <!-- Wait to render Spline until pathData is available to fix path artifacts from injected tweened points in Spline  -->
      {#if pathData}
        <Spline
          {pathData}
          class={cls('fill-transparent stroke-transparent', classes.path)}
          onclick={(e) => onclick?.(e, { data: point.data, point })}
          onpointerenter={(e) => onpointerenter?.(e, { data: point.data, point })}
          onpointermove={(e) => onpointermove?.(e, { data: point.data, point })}
          {onpointerleave}
          onpointerdown={(e) => onpointerdown?.(e, { data: point.data, point })}
          ontouchmove={(e) => {
            // Prevent touch to not interfer with pointer
            e.preventDefault();
          }}
        />
      {/if}
    {/each}
  {/if}
</g>
