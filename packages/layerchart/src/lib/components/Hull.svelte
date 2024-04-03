<script lang="ts">
  import { createEventDispatcher, getContext } from 'svelte';
  import { cls } from 'svelte-ux';
  import { min } from 'd3-array';
  import { Delaunay } from 'd3-delaunay';
  import { geoVoronoi } from 'd3-geo-voronoi';

  import GeoPath from './GeoPath.svelte';
  import { geoContext } from './GeoContext.svelte';

  const { flatData, xGet, yGet, x: xContext, y: yContext } = getContext('LayerCake');
  const geo = geoContext();

  /** Override data instead of using context */
  export let data: any = undefined;

  export let classes: {
    root?: string;
    path?: string;
  } = {};

  const dispatch = createEventDispatcher<{
    click: { points: [number, number][]; polygon: Delaunay.Polygon };
    mousemove: {
      event: MouseEvent;
      points: [number, number][];
      polygon: Delaunay.Polygon;
    };
  }>();

  $: points = (data ?? $flatData).map((d) => {
    // geo voronoi needs raw latitude/longtude, not mapped to range (chart dimensions)
    const xValue = $geo ? $xContext(d) : $xGet(d);
    const yValue = $geo ? $yContext(d) : $yGet(d);

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
      class={cls('fill-transparent', classes.path)}
      on:mousemove={(e) => dispatch('mousemove', { event: e, points, polygon })}
      on:mouseleave
      on:click={(e) => dispatch('click', { points, polygon })}
    />
  {:else}
    {@const delaunay = Delaunay.from(points)}
    {@const polygon = delaunay.hullPolygon()}
    <path
      d={delaunay.renderHull()}
      class={cls('fill-transparent', classes.path)}
      on:mousemove={(e) => dispatch('mousemove', { event: e, points, polygon })}
      on:mouseleave
      on:click={(e) => dispatch('click', { points, polygon })}
    />
  {/if}
</g>
