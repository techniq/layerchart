<script lang="ts">
  import { type ComponentProps } from 'svelte';
  import type { tweened as tweenedStore } from 'svelte/motion';
  import { type Area, area as d3Area, areaRadial } from 'd3-shape';
  import type { CurveFactory } from 'd3-shape';
  import { max, min } from 'd3-array';
  import { interpolatePath } from 'd3-interpolate-path';

  import { cls } from '@layerstack/tailwind';

  import { motionStore } from '$lib/stores/motionStore.js';

  import { chartContext } from './ChartContext.svelte';
  import Spline from './Spline.svelte';
  import { accessor, type Accessor } from '../utils/common.js';
  import { isScaleBand } from '../utils/scales.js';

  const {
    data: contextData,
    xScale,
    yScale,
    x: contextX,
    y,
    yDomain,
    yRange,
    config,
    radial,
  } = chartContext();

  /** Override data instead of using context */
  export let data: any = undefined;

  /** Pass `<path d={...} />` explicitly instead of calculating from data / context */
  export let pathData: string | undefined | null = undefined;

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

  const xAccessor = x ? accessor(x) : $contextX;
  const y0Accessor = y0 ? accessor(y0) : (d: any) => min($yDomain);
  const y1Accessor = y1 ? accessor(y1) : $y;

  $: xOffset = isScaleBand($xScale) ? $xScale.bandwidth() / 2 : 0;
  $: yOffset = isScaleBand($yScale) ? $yScale.bandwidth() / 2 : 0;

  $: tweenedOptions = tweened
    ? { interpolate: interpolatePath, ...(typeof tweened === 'object' ? tweened : null) }
    : false;
  $: tweened_d = motionStore('', { tweened: tweenedOptions });
  $: {
    const path = $radial
      ? areaRadial()
          .angle((d) => $xScale(xAccessor(d)))
          .innerRadius((d) => $yScale(y0Accessor(d)))
          .outerRadius((d) => $yScale(y1Accessor(d)))
      : d3Area()
          .x((d) => $xScale(xAccessor(d)) + xOffset)
          .y0((d) => {
            let value = max<number>($yRange)!;
            if (y0) {
              value = $yScale(y0Accessor(d));
            } else if (Array.isArray($config.y) && $config.y[0] === 0) {
              // Use first value if `y` defined as an array (ex. `<Chart y={[0,1]}>`)
              // TODO: Would be nice if this also handled multi-series (<Chart y={['apples', 'bananas', 'oranges']}>) as well as delta values (<Chart y={['baseline', 'value']}>)
              value = $yScale($y(d)[0]);
            }

            return value + yOffset;
          })
          .y1((d) => {
            let value = max<number>($yRange)!;
            if (y1) {
              value = $yScale(y1Accessor(d));
            } else if (Array.isArray($config.y) && $config.y[1] === 1) {
              // Use second value if `y` defined as an array (ex. `<Chart y={[0,1]}>`)
              // TODO: Would be nice if this also handled multi-series (<Chart y={['apples', 'bananas', 'oranges']}>) as well as delta values (<Chart y={['baseline', 'value']}>)
              value = $yScale($y(d)[1]);
            } else {
              // Expect single value defined for `y` (ex. `<Chart y="value">`)
              value = $yScale($y(d));
            }

            return value + yOffset;
          });

    path.defined(defined ?? ((d) => xAccessor(d) != null && y1Accessor(d) != null));

    if (curve) path.curve(curve);

    const d = pathData ?? path(data ?? $contextData);
    tweened_d.set(d ?? '');
  }
</script>

{#if line}
  <Spline
    {data}
    {x}
    y={y1}
    {curve}
    {defined}
    {tweened}
    {...typeof line === 'object' ? line : null}
  />
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
