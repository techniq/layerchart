<script lang="ts">
  import { min, max } from 'd3-array';
  import { getContext } from 'svelte';
  import { cls } from 'svelte-ux';

  import { isScaleBand } from '$lib/utils/scales';

  const { xScale, yScale, xRange, yRange } = getContext('LayerCake');

  export let x = false;
  export let y = false;
</script>

<g class="baseline">
  {#if x}
    <line
      x1={0}
      x2={max($xRange) || 0}
      y1={isScaleBand($yScale) ? max($yRange) : $yScale(0) || 0}
      y2={isScaleBand($yScale) ? max($yRange) : $yScale(0) || 0}
      class={cls('stroke-gray-400', $$props.class)}
    />
  {/if}

  {#if y}
    <line
      x1={isScaleBand($xScale) ? min($xRange) : $xScale(0) || 0}
      x2={isScaleBand($xScale) ? min($xRange) : $xScale(0) || 0}
      y1={min($yRange) || 0}
      y2={max($yRange) || 0}
      class={cls('stroke-gray-400', $$props.class)}
    />
  {/if}
</g>
