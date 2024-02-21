<script lang="ts">
  import { createEventDispatcher, getContext } from 'svelte';
  import { draw as _drawTransition } from 'svelte/transition';

  import { Delaunay } from 'd3-delaunay';

  import { min } from 'd3-array';
  import { cls } from 'svelte-ux';

  const { flatData, xGet, yGet, width, height } = getContext('LayerCake');

  /** Override data instead of using context */
  export let data: any = undefined;

  export let classes: {
    root?: string;
    path?: string;
  } = {};

  const dispatch = createEventDispatcher<{
    click: { point: { data: any } };
    mousemove: { point: { data: any }; event: MouseEvent };
  }>();

  $: points = (data ?? $flatData).map((d) => {
    const xValue = $xGet(d);
    const yValue = $yGet(d);

    const x = Array.isArray(xValue) ? min(xValue) : xValue;
    const y = Array.isArray(yValue) ? min(yValue) : yValue;

    const point = [x, y];
    point.data = d;
    return point;
  });

  $: voronoi = Delaunay.from(points).voronoi([0, 0, Math.max($width, 0), Math.max($height, 0)]); // width and/or height can sometimes be negative (when loading data remotely and updately)
</script>

<g {...$$restProps} class={cls(classes.root, $$props.class)}>
  {#each points as point, i}
    <path
      d={voronoi.renderCell(i)}
      class={cls('fill-transparent', classes.path)}
      on:mousemove={(e) => dispatch('mousemove', { point, event: e })}
      on:mouseleave
      on:click={(e) => dispatch('click', { point })}
    />
  {/each}
</g>
