<script lang="ts" module>
  import type { Without } from '$lib/utils/types.js';

  export type VoronoiPropsWithoutHTML = {
    /**
     * Override data instead of using context
     */
    data?: any;

    /** Radius to clip voronoi cells.  `0` or `undefined` to disables clipping */
    r?: number;

    /**
     * Classes to apply to the root and path elements
     *
     * @default = {}
     */
    classes?: {
      root?: string;
      path?: string;
    };

    onclick?: (
      e: MouseEvent,
      details: { data: any; point?: [number, number]; feature?: GeoPermissibleObjects }
    ) => void;

    onpointerenter?: (
      e: PointerEvent,
      details: {
        data: any;
        point?: [number, number];
        feature?: GeoPermissibleObjects;
      }
    ) => void;
    onpointermove?: (
      e: PointerEvent,
      details: {
        data: any;
        point?: [number, number];
        feature?: GeoPermissibleObjects;
      }
    ) => void;
    onpointerdown?: (
      e: PointerEvent,
      details: {
        data: any;
        point?: [number, number];
        feature?: GeoPermissibleObjects;
      }
    ) => void;
  };

  export type VoronoiProps = VoronoiPropsWithoutHTML &
    Without<Omit<GroupProps, 'children'>, VoronoiPropsWithoutHTML>;
</script>

<script lang="ts">
  import { min } from 'd3-array';
  import { Delaunay } from 'd3-delaunay';
  import { type GeoPermissibleObjects } from 'd3-geo';
  // @ts-expect-error
  import { geoVoronoi } from 'd3-geo-voronoi';
  import { pointRadial } from 'd3-shape';
  import { cls } from '@layerstack/tailwind';

  import GeoPath from './GeoPath.svelte';
  import Group, { type GroupProps } from './Group.svelte';
  import Spline from './Spline.svelte';
  import { getChartContext } from './Chart.svelte';
  import { getGeoContext } from './GeoContext.svelte';
  import CircleClipPath from './CircleClipPath.svelte';

  import { layerClass } from '$lib/utils/attributes.js';

  let {
    data,
    r,
    classes = {},
    onclick,
    onpointerenter,
    onpointerdown,
    onpointermove,
    class: className,
    ...restProps
  }: VoronoiProps = $props();

  const ctx = getChartContext();
  const geo = getGeoContext();

  const points = $derived(
    (data ?? ctx.flatData).map((d: any) => {
      // geo voronoi needs raw latitude/longitude, not mapped to range (chart dimensions)
      const xValue = geo.projection ? ctx.x(d) : ctx.xGet(d);
      const yValue = geo.projection ? ctx.y(d) : ctx.yGet(d);

      const x = Array.isArray(xValue) ? min(xValue) : xValue;
      const y = Array.isArray(yValue) ? min(yValue) : yValue;

      let point: [number, number];
      if (ctx.radial) {
        const radialPoint = pointRadial(x, y);
        // Assume radial is also centered
        point = [radialPoint[0] + ctx.width / 2, radialPoint[1] + ctx.height / 2];
      } else {
        point = [x, y];
      }
      // @ts-expect-error
      point.data = d;
      return point;
    })
  );

  // Width and/or height can sometimes be negative (when loading data remotely and updately)
  const boundWidth = $derived(Math.max(ctx.width, 0));
  const boundHeight = $derived(Math.max(ctx.height, 0));

  const disableClip = $derived(r === 0 || r == null || r === Infinity);
</script>

<Group {...restProps} class={cls(layerClass('voronoi-g'), classes.root, className)}>
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
          class={cls(
            layerClass('voronoi-geo-path'),
            'fill-transparent stroke-transparent',
            classes.path
          )}
          onclick={(e) => onclick?.(e, { data: feature.properties.site.data, feature })}
          onpointerenter={(e) =>
            onpointerenter?.(e, { data: feature.properties.site.data, feature })}
          onpointermove={(e) => onpointermove?.(e, { data: feature.properties.site.data, feature })}
          onpointerdown={(e) => onpointerdown?.(e, { data: feature.properties.site.data, feature })}
          {onpointerleave}
          ontouchmove={(e) => {
            // Prevent touch to not interfere with pointer
            e.preventDefault();
          }}
        />
      </CircleClipPath>
    {/each}
  {:else}
    {@const voronoi = Delaunay.from(points).voronoi([0, 0, boundWidth, boundHeight])}
    {#each points as point, i}
      {@const pathData = voronoi.renderCell(i)}
      <!-- Wait to render Spline until pathData is available to fix path artifacts from injected tweened points in Spline  -->
      {#if pathData}
        <CircleClipPath cx={point[0]} cy={point[1]} r={r ?? 0} disabled={disableClip}>
          <Spline
            {pathData}
            class={cls(
              layerClass('voronoi-path'),
              'fill-transparent stroke-transparent',
              classes.path
            )}
            onclick={(e) => onclick?.(e, { data: point.data, point })}
            onpointerenter={(e) => onpointerenter?.(e, { data: point.data, point })}
            onpointermove={(e) => onpointermove?.(e, { data: point.data, point })}
            {onpointerleave}
            onpointerdown={(e) => onpointerdown?.(e, { data: point.data, point })}
            ontouchmove={(e) => {
              // Prevent touch to not interfere with pointer
              e.preventDefault();
            }}
          />
        </CircleClipPath>
      {/if}
    {/each}
  {/if}
</Group>
