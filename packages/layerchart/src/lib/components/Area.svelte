<script lang="ts">
  import { getContext, type ComponentProps } from 'svelte';
  import type { tweened as tweenedStore } from 'svelte/motion';
  import { type Area, area as d3Area, areaRadial } from 'd3-shape';
  import type { CurveFactory } from 'd3-shape';
  import { max } from 'd3-array';
  import { interpolatePath } from 'd3-interpolate-path';

  import { cls } from 'svelte-ux';

  import { motionStore } from '$lib/stores/motionStore';

  import Spline from './Spline.svelte';

  const { data: contextData, xGet, yGet, yRange } = getContext('LayerCake');

  /** Override data instead of using context */
  export let data: any = undefined;

  /** Pass `<path d={...} />` explicitly instead of calculating from data / context */
  export let pathData: string | undefined | null = undefined;

  /** Use radial instead of cartesian area generator, mapping `x` to `angle` and `y0`/`y1 to `innerRadius`/`outerRadius.  Radial lines are positioned relative to the origin, use transform (ex. `<Group center>`) to change the origin */
  export let radial = false;

  /** Override x accessor */
  export let x: any = undefined; // TODO: Update Type

  /** Override y0 accessor.  Defaults to max($yRange) */
  export let y0: any = undefined; // TODO: Update Type
  /** Override y1 accessor.  Defaults to y accessor */
  export let y1: any = undefined; // TODO: Update Type

  /** Interpolate path data using d3-interpolate-path */
  export let tweened: boolean | Parameters<typeof tweenedStore>[1] = undefined;

  export let clipPath: string | undefined = undefined;

  export let curve: CurveFactory | undefined = undefined;
  export let defined: Parameters<Area<any>['defined']>[0] | undefined = undefined;

  /** Enable showing line */
  export let line: boolean | Partial<ComponentProps<Spline>> = false;

  $: tweenedOptions = tweened ? { interpolate: interpolatePath, ...tweened } : false;
  $: tweened_d = motionStore('', { tweened: tweenedOptions });
  $: {
    const path = radial
      ? areaRadial()
          .angle(x ?? $xGet)
          .innerRadius(y0 ?? max($yRange))
          .outerRadius(y1 ?? $yGet)
      : d3Area()
          .x(x ?? $xGet)
          .y0(y0 ?? max($yRange))
          .y1(y1 ?? $yGet);
    if (curve) path.curve(curve);
    if (defined) path.defined(defined);

    const d = pathData ?? path(data ?? $contextData);
    tweened_d.set(d);
  }
</script>

{#if line}
  <Spline {data} {curve} {defined} {tweened} {...typeof line === 'object' ? line : null} />
{/if}

<path
  d={$tweened_d}
  clip-path={clipPath}
  {...$$restProps}
  class={cls('path-area', $$props.class)}
  on:click
  on:mousemove
  on:mouseleave
/>
