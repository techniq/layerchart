<script lang="ts">
  import { extent } from 'd3-array';
  import { pointRadial } from 'd3-shape';
  import { cls } from '@layerstack/tailwind';

  import { chartContext } from './ChartContext.svelte';
  import Circle from './Circle.svelte';
  import Line from './Line.svelte';

  const { xScale, yScale, xRange, yRange, radial } = chartContext();

  $: [xRangeMin, xRangeMax] = extent<number | Date>($xRange);
  $: [yRangeMin, yRangeMax] = extent<number | Date>($yRange);

  /**
   * Create a vertical `x` line
   * - If true or 'left', will draw at chart left (xRange[0])
   * - If 'right', will draw at chart right (xRange[1])
   * - Use `0` for baseline (yScale(0))
   * - Use number | Date value for annotation (yScale(value))
   */
  export let x: number | Date | boolean | 'left' | 'right' = false;

  /** Pixel offset to apply to `x` coordinate */
  export let xOffset = 0;

  /**
   * Create a horizontal `y` line
   * - If true or 'bottom', will draw at chart bottom (yRange[0])
   * - If 'top', will draw at chart top (yRange[1])
   * - Use `0` for baseline (xScale(0))
   * - Use number | Date value for annotation (xScale(value))
   */
  export let y: number | Date | boolean | 'top' | 'bottom' = false;

  /** Pixel offset to apply to `y` coordinate */
  export let yOffset = 0;

  $: showRule = (value: typeof x | typeof y, axis: 'x' | 'y') => {
    switch (typeof value) {
      case 'boolean':
        return value;
      case 'string':
        return true;
      default:
        if (axis === 'x') {
          return $xScale(value) >= xRangeMin! && $xScale(value) <= xRangeMax!;
        } else {
          return $yScale(value) >= yRangeMin! && $yScale(value) <= yRangeMax!;
        }
    }
  };
</script>

<g class="rule">
  {#if showRule(x, 'x')}
    {@const xCoord =
      x === true || x === 'left' ? xRangeMin : x === 'right' ? xRangeMax : $xScale(x) + xOffset}

    {#if $radial}
      {@const [x1, y1] = pointRadial(xCoord, Number(yRangeMin))}
      {@const [x2, y2] = pointRadial(xCoord, Number(yRangeMax))}

      <Line
        {x1}
        {y1}
        {x2}
        {y2}
        {...$$restProps}
        class={cls('test grid stroke-surface-content/10', $$props.class)}
      />
    {:else}
      <Line
        x1={xCoord}
        x2={xCoord}
        y1={$yRange[0] || 0}
        y2={$yRange[1] || 0}
        {...$$restProps}
        class={cls('stroke-surface-content/50', $$props.class)}
      />
    {/if}
  {/if}

  {#if showRule(y, 'y')}
    {#if $radial}
      <Circle
        r={y === true || y === 'bottom'
          ? yRangeMax
          : y === 'top'
            ? yRangeMin
            : $yScale(y) + yOffset}
        class={cls('fill-none stroke-surface-content/50', $$props.class)}
      />
    {:else}
      <Line
        x1={$xRange[0] || 0}
        x2={$xRange[1] || 0}
        y1={y === true || y === 'bottom'
          ? yRangeMax
          : y === 'top'
            ? yRangeMin
            : $yScale(y) + yOffset}
        y2={y === true || y === 'bottom'
          ? yRangeMax
          : y === 'top'
            ? yRangeMin
            : $yScale(y) + yOffset}
        {...$$restProps}
        class={cls('stroke-surface-content/50', $$props.class)}
      />
    {/if}
  {/if}
</g>
