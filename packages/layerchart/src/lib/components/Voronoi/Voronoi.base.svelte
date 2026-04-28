<script lang="ts" module>
  import type { Component } from 'svelte';
  import type { VoronoiProps } from './Voronoi.shared.svelte.js';

  export type VoronoiBaseLayerComponents = {
    Group: Component<any>;
    Path: Component<any>;
    CircleClipPath: Component<any>;
  };

  export type VoronoiBaseProps = VoronoiProps & VoronoiBaseLayerComponents;
</script>

<script lang="ts">
  import { max } from 'd3-array';
  import { Delaunay } from 'd3-delaunay';
  // @ts-expect-error
  import { geoVoronoi } from 'd3-geo-voronoi';
  import { pointRadial } from 'd3-shape';
  import { cls } from '@layerstack/tailwind';

  // GeoPath lives in geo/ subpath; agnostic import (only used in geo charts).
  import GeoPath from '../geo/GeoPath.svelte';
  import { getChartContext } from '$lib/contexts/chart.js';
  import { getGeoContext } from '$lib/contexts/geo.js';
  import { accessor } from '$lib/utils/common.js';

  let {
    Group,
    Path,
    CircleClipPath,
    data,
    x: xProp,
    y: yProp,
    r,
    classes = {},
    onclick,
    onpointerenter,
    onpointerdown,
    onpointermove,
    class: className,
    ...restProps
  }: VoronoiBaseProps = $props();

  const ctx = getChartContext();
  const geo = getGeoContext();

  const xAccessorOverride = $derived(xProp != null ? accessor(xProp) : undefined);
  const yAccessorOverride = $derived(yProp != null ? accessor(yProp) : undefined);

  const points = $derived(
    (data ?? ctx.flatData).map((d: any) => {
      const xValue = xAccessorOverride
        ? geo.projection
          ? xAccessorOverride(d)
          : ctx.xScale(xAccessorOverride(d))
        : geo.projection
          ? ctx.x(d)
          : ctx.xGet(d);
      const yValue = yAccessorOverride
        ? geo.projection
          ? yAccessorOverride(d)
          : ctx.yScale(yAccessorOverride(d))
        : geo.projection
          ? ctx.y(d)
          : ctx.yGet(d);

      const x = Array.isArray(xValue) ? max(xValue) : xValue;
      const y = Array.isArray(yValue) ? max(yValue) : yValue;

      let point: [number, number];
      if (ctx.radial) {
        const radialPoint = pointRadial(x, y);
        point = [radialPoint[0] + ctx.width / 2, radialPoint[1] + ctx.height / 2];
      } else {
        point = [x, y];
      }
      // @ts-expect-error
      point.data = d;
      return point;
    })
  );

  const boundWidth = $derived(Math.max(ctx.width, 0));
  const boundHeight = $derived(Math.max(ctx.height, 0));

  const disableClip = $derived(r === 0 || r == null || r === Infinity);
</script>

<Group {...restProps} class={cls('lc-voronoi-g', classes.root, className)}>
  {#if geo.projection}
    {@const polygons = geoVoronoi().polygons(points)}
    {#each polygons.features as feature}
      {@const point = r ? geo.projection?.(feature.properties.sitecoordinates) : null}
      <CircleClipPath
        cx={point?.[0]}
        cy={point?.[1]}
        r={r ?? 0}
        disabled={point == null || disableClip}
      >
        <GeoPath
          geojson={feature}
          class={['lc-voronoi-geo-path', classes.path]}
          onclick={(e: MouseEvent) =>
            onclick?.(e, { data: feature.properties.site.data, feature })}
          onpointerenter={(e: PointerEvent) =>
            onpointerenter?.(e, { data: feature.properties.site.data, feature })}
          onpointermove={(e: PointerEvent) =>
            onpointermove?.(e, { data: feature.properties.site.data, feature })}
          onpointerdown={(e: PointerEvent) =>
            onpointerdown?.(e, { data: feature.properties.site.data, feature })}
          ontouchmove={(e: TouchEvent) => {
            e.preventDefault();
          }}
        />
      </CircleClipPath>
    {/each}
  {:else}
    {@const voronoi = Delaunay.from(points).voronoi([0, 0, boundWidth, boundHeight])}
    {#each points as point, i}
      {@const pathData = voronoi.renderCell(i)}
      {#if pathData}
        <CircleClipPath cx={point[0]} cy={point[1]} r={r ?? 0} disabled={disableClip}>
          <Path
            {pathData}
            class={['lc-voronoi-path', classes.path]}
            onclick={(e: MouseEvent) => onclick?.(e, { data: (point as any).data, point })}
            onpointerenter={(e: PointerEvent) =>
              onpointerenter?.(e, { data: (point as any).data, point })}
            onpointermove={(e: PointerEvent) =>
              onpointermove?.(e, { data: (point as any).data, point })}
            onpointerdown={(e: PointerEvent) =>
              onpointerdown?.(e, { data: (point as any).data, point })}
            ontouchmove={(e: TouchEvent) => {
              e.preventDefault();
            }}
          />
        </CircleClipPath>
      {/if}
    {/each}
  {/if}
</Group>

<style>
  @layer components {
    :global(:where(.lc-voronoi-path, .lc-voronoi-geo-path)) {
      fill: transparent;
      stroke: transparent;
    }
  }
</style>
