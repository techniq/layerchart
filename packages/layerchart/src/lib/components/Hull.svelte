<script lang="ts">
  import { createEventDispatcher, type ComponentProps } from 'svelte';
  import { cls } from 'svelte-ux';
  import { min } from 'd3-array';
  import { Delaunay } from 'd3-delaunay';
  import { geoVoronoi } from 'd3-geo-voronoi';
  import { curveLinearClosed } from 'd3-shape';

  import { chartContext } from './ChartContext.svelte';
  import GeoPath from './GeoPath.svelte';
  import { geoContext } from './GeoContext.svelte';
  import Spline from './Spline.svelte';

  const { flatData, x: xContext, y: yContext } = chartContext();
  const geo = geoContext();

  /** Override data instead of using context */
  export let data: any = undefined;

  export let curve: ComponentProps<Spline>['curve'] = curveLinearClosed;

  export let classes: {
    root?: string;
    path?: string;
  } = {};

  const dispatch = createEventDispatcher<{
    click: { points: [number, number][]; polygon: Delaunay.Polygon };
    pointermove: {
      event: PointerEvent;
      points: [number, number][];
      polygon: Delaunay.Polygon;
    };
  }>();

  $: points = (data ?? $flatData).map((d) => {
    const xValue = $xContext(d);
    const yValue = $yContext(d);

    const x = Array.isArray(xValue) ? min(xValue) : xValue;
    const y = Array.isArray(yValue) ? min(yValue) : yValue;

    const point = [x, y];
    point.data = d;
    return point;
  });
</script>

<g {...$$restProps} class={cls(classes.root, $$props.class)}>
  {#if $geo}
    {@const polygon = geoVoronoi().hull(points)}
    <GeoPath
      geojson={polygon}
      {curve}
      class={cls('fill-transparent', classes.path)}
      on:pointermove={(e) => dispatch('pointermove', { event: e, points, polygon })}
      on:pointerleave
      on:click={(e) => dispatch('click', { points, polygon })}
    />
  {:else}
    {@const delaunay = Delaunay.from(points)}
    {@const polygon = delaunay.hullPolygon()}
    <Spline
      data={polygon}
      x={(d) => d[0]}
      y={(d) => d[1]}
      {curve}
      class={cls('fill-transparent', classes.path)}
      on:pointermove={(e) => dispatch('pointermove', { event: e, points, polygon })}
      on:pointerleave
      on:click={(e) => dispatch('click', { points, polygon })}
    />
  {/if}
</g>
