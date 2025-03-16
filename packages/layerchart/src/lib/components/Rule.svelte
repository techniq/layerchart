<script lang="ts" module>
  import type { Without } from 'layerchart/utils/types.js';
  import type { SVGAttributes } from 'svelte/elements';

  export type BaseRulePropsWithoutHTML = {
    /**
     * Create a vertical `x` line
     * - If true or 'left', will draw at chart left (xRange[0])
     * - If 'right', will draw at chart right (xRange[1])
     * - Use `0` for baseline (yScale(0))
     * - Use number | Date value for annotation (yScale(value))
     *
     * @default false
     */
    x?: number | Date | boolean | 'left' | 'right';

    /**
     * Pixel offset to apply to `x` coordinate
     *
     * @default 0
     */
    xOffset?: number;

    /**
     * Create a horizontal `y` line
     * - If true or 'bottom', will draw at chart bottom (yRange[0])
     * - If 'top', will draw at chart top (yRange[1])
     * - Use `0` for baseline (xScale(0))
     * - Use number | Date value for annotation (xScale(value))
     *
     * @default false
     */
    y?: number | Date | boolean | 'top' | 'bottom';

    /**
     * Pixel offset to apply to `y` coordinate
     * @default 0
     */
    yOffset?: number;
  };

  export type RulePropsWithoutHTML = BaseRulePropsWithoutHTML &
    Without<Partial<LinePropsWithoutHTML>, BaseRulePropsWithoutHTML>;

  export type RuleProps = RulePropsWithoutHTML &
    Without<SVGAttributes<SVGLineElement>, RulePropsWithoutHTML>;
</script>

<script lang="ts">
  import { extent } from 'd3-array';
  import { pointRadial } from 'd3-shape';
  import { cls } from '@layerstack/tailwind';

  import Circle from './Circle.svelte';
  import Line, { type LinePropsWithoutHTML } from './Line.svelte';
  import { getChartContext } from './Chart-Next.svelte';

  let {
    x = false,
    xOffset = 0,
    y = false,
    yOffset = 0,
    class: className,
    ...restProps
  }: RuleProps = $props();

  const ctx = getChartContext();

  const xRangeMinMax = $derived(extent<number | Date>(ctx.xRange));
  const yRangeMinMax = $derived(extent<number | Date>(ctx.yRange));

  function showRule(value: typeof x | typeof y, axis: 'x' | 'y') {
    switch (typeof value) {
      case 'boolean':
        return value;
      case 'string':
        return true;
      default:
        if (axis === 'x') {
          return ctx.xScale(value) >= xRangeMinMax[0]! && ctx.xScale(value) <= xRangeMinMax[1]!;
        } else {
          return ctx.yScale(value) >= yRangeMinMax[0]! && ctx.yScale(value) <= yRangeMinMax[1]!;
        }
    }
  }
</script>

<g class="rule">
  {#if showRule(x, 'x')}
    {@const xCoord =
      x === true || x === 'left'
        ? xRangeMinMax[0]
        : x === 'right'
          ? xRangeMinMax[1]
          : ctx.xScale(x) + xOffset}

    {#if ctx.radial}
      {@const [x1, y1] = pointRadial(xCoord, Number(yRangeMinMax[0]))}
      {@const [x2, y2] = pointRadial(xCoord, Number(yRangeMinMax[1]))}

      <Line
        {...restProps}
        {x1}
        {y1}
        {x2}
        {y2}
        class={cls('stroke-surface-content/10', className)}
      />
    {:else}
      <Line
        {...restProps}
        x1={xCoord}
        x2={xCoord}
        y1={ctx.yRange[0] || 0}
        y2={ctx.yRange[1] || 0}
        class={cls('stroke-surface-content/50', className)}
      />
    {/if}
  {/if}

  {#if showRule(y, 'y')}
    {#if ctx.radial}
      <Circle
        r={y === true || y === 'bottom'
          ? yRangeMinMax[1]
          : y === 'top'
            ? yRangeMinMax[0]
            : ctx.yScale(y) + yOffset}
        class={cls('fill-none stroke-surface-content/50', className)}
      />
    {:else}
      <Line
        {...restProps}
        x1={ctx.xRange[0] || 0}
        x2={ctx.xRange[1] || 0}
        y1={y === true || y === 'bottom'
          ? yRangeMinMax[1]
          : y === 'top'
            ? yRangeMinMax[0]
            : ctx.yScale(y) + yOffset}
        y2={y === true || y === 'bottom'
          ? yRangeMinMax[1]
          : y === 'top'
            ? yRangeMinMax[0]
            : ctx.yScale(y) + yOffset}
        class={cls('stroke-surface-content/50', className)}
      />
    {/if}
  {/if}
</g>
