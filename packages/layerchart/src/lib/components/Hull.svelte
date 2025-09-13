<script lang="ts" module>
  import type { Without } from '$lib/utils/types.js';
  import type { SVGAttributes } from 'svelte/elements';
  import type { ComponentProps } from 'svelte';

  export type HullPropsWithoutHTML = {
    /**
     * Override data instead of using context
     */
    data?: any;

    /**
     * The curve factory to use for the hull
     * @default curveLinearClosed
     */
    curve?: ComponentProps<typeof Spline>['curve'];

    /**
     * Classes to apply to the elements.
     */
    classes?: {
      root?: string;
      path?: string;
    };

    onpointermove?: (
      e: PointerEvent,
      details: {
        points: [number, number][];
        polygon: Delaunay.Polygon;
      }
    ) => void;

    onclick?: (
      e: MouseEvent,
      details: {
        points: [number, number][];
        polygon: Delaunay.Polygon;
      }
    ) => void;

    onpointerleave?: (e: PointerEvent) => void;

    /**
     * A bindable reference to the wrapping `<g>` element.
     *
     * @bindable
     */
    ref?: SVGGElement;
  };

  export type HullProps = HullPropsWithoutHTML & Without<GroupProps, HullPropsWithoutHTML>;
</script>

<script lang="ts">
  import { min } from 'd3-array';
  import { Delaunay } from 'd3-delaunay';
  // @ts-expect-error - no types available
  import { geoVoronoi } from 'd3-geo-voronoi';
  import { curveLinearClosed } from 'd3-shape';
  import { cls } from '@layerstack/tailwind';

  import GeoPath from './GeoPath.svelte';
  import Group, { type GroupProps } from './Group.svelte';
  import Spline from './Spline.svelte';
  import { getChartContext } from './Chart.svelte';
  import { getGeoContext } from './GeoContext.svelte';

  let {
    data,
    curve = curveLinearClosed,
    classes = {},
    onpointermove,
    onclick,
    onpointerleave,
    class: className,
    ref: refProp = $bindable(),
    ...restProps
  }: HullProps = $props();

  let ref = $state<SVGGElement>();

  $effect.pre(() => {
    refProp = ref;
  });

  const ctx = getChartContext();
  const geoCtx = getGeoContext();

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
  {#if geoCtx.projection}
    {@const polygon = geoVoronoi().hull(points)}
    <GeoPath
      geojson={polygon}
      {curve}
      class={cls('lc-hull-path', 'fill-transparent', classes.path)}
      onclick={(e) => onclick?.(e, { points, polygon })}
      onpointermove={(e) => onpointermove?.(e, { points, polygon })}
      {onpointerleave}
    />
  {:else}
    {@const delaunay = Delaunay.from(points)}
    {@const polygon = delaunay.hullPolygon()}
    <Spline
      data={polygon}
      x={(d) => d[0]}
      y={(d) => d[1]}
      {curve}
      class={cls('lc-hull-class', 'fill-transparent', classes.path)}
      onclick={(e) => onclick?.(e, { points, polygon })}
      onpointermove={(e) => onpointermove?.(e, { points, polygon })}
      {onpointerleave}
    />
  {/if}
</Group>
