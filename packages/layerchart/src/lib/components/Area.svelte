<script lang="ts">
  import { type ComponentProps } from 'svelte';
  import type { tweened as tweenedStore } from 'svelte/motion';
  import { type Area, area as d3Area, areaRadial } from 'd3-shape';
  import type { CurveFactory } from 'd3-shape';
  import { max } from 'd3-array';
  import { interpolatePath } from 'd3-interpolate-path';

  import { cls } from 'svelte-ux';

  import { motionStore } from '$lib/stores/motionStore.js';

  import { chartContext } from './ChartContext.svelte';
  import Spline from './Spline.svelte';
  import { accessor, type Accessor } from '../utils/common.js';
  import { isScaleBand } from '../utils/scales.js';

  const { data: contextData, xScale, yScale, xGet, yGet, yRange } = chartContext();

  /** Override data instead of using context */
  export let data: any = undefined;

  /** Pass `<path d={...} />` explicitly instead of calculating from data / context */
  export let pathData: string | undefined | null = undefined;

  /** Use radial instead of cartesian area generator, mapping `x` to `angle` and `y0`/`y1 to `innerRadius`/`outerRadius.  Radial lines are positioned relative to the origin, use transform (ex. `<Group center>`) to change the origin */
  export let radial = false;

  /** Override x accessor */
  export let x: Accessor = undefined;

  /** Override y0 accessor.  Defaults to max($yRange) */
  export let y0: Accessor = undefined;
  /** Override y1 accessor.  Defaults to y accessor */
  export let y1: Accessor = undefined;

  /** Interpolate path data using d3-interpolate-path */
  export let tweened: boolean | Parameters<typeof tweenedStore>[1] = undefined;

  export let clipPath: string | undefined = undefined;

  export let curve: CurveFactory | undefined = undefined;
  export let defined: Parameters<Area<any>['defined']>[0] | undefined = undefined;

  /** Enable showing line */
  export let line: boolean | Partial<ComponentProps<Spline>> = false;

  const _x = accessor(x);
  const _y0 = accessor(y0);
  const _y1 = accessor(y1);

  $: xOffset = isScaleBand($xScale) ? $xScale.bandwidth() / 2 : 0;
  $: yOffset = isScaleBand($yScale) ? $yScale.bandwidth() / 2 : 0;

  $: tweenedOptions = tweened
    ? { interpolate: interpolatePath, ...(typeof tweened === 'object' ? tweened : null) }
    : false;
  $: tweened_d = motionStore('', { tweened: tweenedOptions });
  $: {
    const path = radial
      ? areaRadial()
          .angle((d) => (x ? $xScale(_x(d)) : $xGet(d)))
          .innerRadius((d) => (y0 ? $yScale(_y0(d)) : max($yRange)))
          .outerRadius((d) => (y1 ? $yScale(_y1(d)) : $yGet(d)))
      : d3Area()
          .x((d) => (x ? $xScale(_x(d)) : $xGet(d)) + xOffset)
          .y0((d) => (y0 ? $yScale(_y0(d)) : max($yRange)) + yOffset)
          .y1((d) => (y1 ? $yScale(_y1(d)) : $yGet(d)) + yOffset);
    if (curve) path.curve(curve);
    if (defined) path.defined(defined);

    const d = pathData ?? path(data ?? $contextData);
    tweened_d.set(d ?? '');
  }
</script>

{#if line}
  <Spline {data} y={y1} {curve} {defined} {tweened} {...typeof line === 'object' ? line : null} />
{/if}

<!-- svelte-ignore a11y-no-static-element-interactions -->
<path
  d={$tweened_d}
  clip-path={clipPath}
  {...$$restProps}
  class={cls('path-area', $$props.class)}
  on:click
  on:pointermove
  on:pointerleave
/>
