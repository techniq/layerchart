<script lang="ts">
  import { extent } from 'd3-array';
  import { cls } from 'svelte-ux';

  import { chartContext } from './ChartContext.svelte';
  import Line from './Line.svelte';

  const { xScale, yScale, xRange, yRange } = chartContext();

  $: [xRangeMin, xRangeMax] = extent($xRange);
  $: [yRangeMin, yRangeMax] = extent($yRange);

  /**
   * Create a vertical `x` line
   * - If true or 'left', will draw at chart left (xRange[0])
   * - If 'right', will draw at chart right (xRange[1])
   * - Use `0` for baseline (yScale(0))
   * - Use number | Date value for annotation (yScale(value))
   */
  export let x: number | Date | boolean | 'left' | 'right' = false;

  /**
   * Create a horizontal `y` line
   * - If true or 'bottom', will draw at chart bottom (yRange[0])
   * - If 'top', will draw at chart top (yRange[1])
   * - Use `0` for baseline (xScale(0))
   * - Use number | Date value for annotation (xScale(value))
   */
  export let y: number | Date | boolean | 'top' | 'bottom' = false;
</script>

<g class="rule">
  {#if x !== false}
    <Line
      x1={x === true || x === 'left' ? xRangeMin : x === 'right' ? xRangeMax : $xScale(x)}
      x2={x === true || x === 'left' ? xRangeMin : x === 'right' ? xRangeMax : $xScale(x)}
      y1={$yRange[0] || 0}
      y2={$yRange[1] || 0}
      {...$$restProps}
      class={cls('stroke-surface-content/50', $$props.class)}
    />
  {/if}

  {#if y !== false}
    <Line
      x1={$xRange[0] || 0}
      x2={$xRange[1] || 0}
      y1={y === true || y === 'bottom' ? yRangeMax : y === 'top' ? yRangeMin : $yScale(y)}
      y2={y === true || y === 'bottom' ? yRangeMax : y === 'top' ? yRangeMin : $yScale(y)}
      {...$$restProps}
      class={cls('stroke-surface-content/50', $$props.class)}
    />
  {/if}
</g>
