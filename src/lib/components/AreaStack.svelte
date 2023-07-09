<script lang="ts">
  import { getContext, type ComponentProps } from 'svelte';
  import type { tweened as tweenedStore } from 'svelte/motion';
  import type { CurveFactory } from 'd3-shape';

  import Area from './Area.svelte';
  import LinePath from './LinePath.svelte';

  const { data, yScale, rGet } = getContext('LayerCake');

  // TODO: Add as generic
  type Datum = any;

  export let curve: CurveFactory | undefined = undefined;
  export let defined: ComponentProps<LinePath>['defined'] | undefined = undefined;
  export let opacity = 0.3;
  export let line: boolean | any = false;
  export let tweened: boolean | Parameters<typeof tweenedStore>[1] = undefined;

  // Render in reverse order so bottom stacks are rendered last (and stack above the upper stacks).  Fixes when upper stack has 0 value
  $: lineData = [...$data].reverse();
</script>

{#if line}
  <g class="line-group">
    {#each lineData as seriesData}
      <LinePath
        data={seriesData}
        y={(d) => $yScale(d[1])}
        stroke={$rGet(seriesData)}
        {curve}
        {defined}
        {tweened}
        {...line}
      />
    {/each}
  </g>
{/if}

<g class="area-group">
  {#each $data as seriesData}
    <Area
      data={seriesData}
      y0={(d) => $yScale(d[0])}
      y1={(d) => $yScale(d[1])}
      fill={$rGet(seriesData)}
      {curve}
      {defined}
      {opacity}
      {tweened}
    />
  {/each}
</g>
