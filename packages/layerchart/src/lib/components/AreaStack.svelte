<script lang="ts">
  import { type ComponentProps } from 'svelte';
  import type { tweened as tweenedStore } from 'svelte/motion';
  import type { CurveFactory } from 'd3-shape';

  import { chartContext } from './ChartContext.svelte';
  import Area from './Area.svelte';
  import Spline from './Spline.svelte';
  import { chartDataArray } from '../utils/common.js';

  const { data, rGet } = chartContext();

  export let curve: CurveFactory | undefined = undefined;
  export let defined: ComponentProps<Spline>['defined'] | undefined = undefined;
  export let opacity = 0.3;
  export let line: boolean | any = false;
  export let tweened: boolean | Parameters<typeof tweenedStore>[1] = undefined;

  // Render in reverse order so bottom stacks are rendered last (and stack above the upper stacks).  Fixes when upper stack has 0 value
  $: lineData = [...chartDataArray($data)].reverse();
</script>

{#if line}
  <g class="line-group">
    {#each lineData as seriesData}
      <Spline
        data={seriesData}
        y={(d) => d[1]}
        stroke={$rGet(seriesData)}
        {curve}
        {defined}
        {tweened}
        {...line}
      />
    {/each}
  </g>
{/if}

<slot data={$data}>
  <g class="area-group">
    {#each chartDataArray($data) as seriesData}
      <Area
        data={seriesData}
        y0={(d) => d[0]}
        y1={(d) => d[1]}
        fill={$rGet(seriesData)}
        {curve}
        {defined}
        {opacity}
        {tweened}
      />
    {/each}
  </g>
</slot>
