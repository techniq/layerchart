<script lang="ts" module>
  import type { Without } from '$lib/utils/types.js';
  import type { SVGAttributes } from 'svelte/elements';

  export type BaseRulePropsWithoutHTML = {
    /**
     * Override the data from the context.
     */
    data?: any;

    /**
     * Create a vertical `x` line
     * - If true or 'left', will draw at chart left (xRange[0])
     * - If 'right', will draw at chart right (xRange[1])
     * - Use `0` for baseline (yScale(0))
     * - Use number | Date value for annotation (yScale(value))
     *
     * @default false
     */
    x?: number | Date | boolean | '$left' | '$right' | Accessor;

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
    y?: number | Date | boolean | '$top' | '$bottom' | Accessor;

    /**
     * Pixel offset to apply to `y` coordinate
     * @default 0
     */
    yOffset?: number;
  };

  export type RulePropsWithoutHTML = BaseRulePropsWithoutHTML &
    Without<Partial<LinePropsWithoutHTML>, BaseRulePropsWithoutHTML>;

  export type RuleProps = RulePropsWithoutHTML &
    Without<SVGAttributes<SVGElement>, RulePropsWithoutHTML>;
</script>

<script lang="ts">
  import { extent } from 'd3-array';
  import { pointRadial } from 'd3-shape';
  import { cls } from '@layerstack/tailwind';

  import Circle from './Circle.svelte';
  import Group from './Group.svelte';
  import Line, { type LinePropsWithoutHTML } from './Line.svelte';
  import { getChartContext } from './Chart.svelte';
  import { accessor, chartDataArray, type Accessor } from '../utils/common.js';
  import { layerClass } from '$lib/utils/attributes.js';
  import { isScaleBand } from '$lib/utils/scales.svelte.js';

  let {
    data: dataProp,
    x = false,
    xOffset = 0,
    y = false,
    yOffset = 0,
    stroke: strokeProp,
    class: className,
    children,
    ...restProps
  }: RuleProps = $props();

  const ctx = getChartContext();

  const data = $derived(chartDataArray(dataProp ?? ctx.data));

  const singleX = $derived(
    typeof x === 'number' ||
      x instanceof Date ||
      x === true ||
      x === '$left' ||
      x === '$right' ||
      (isScaleBand(ctx.xScale) && ctx.xDomain.includes(x as any))
  );
  const singleY = $derived(
    typeof y === 'number' ||
      y instanceof Date ||
      y === true ||
      y === '$bottom' ||
      y === '$top' ||
      (isScaleBand(ctx.yScale) && ctx.yDomain.includes(y as any))
  );

  const xRangeMinMax = $derived(extent<number>(ctx.xRange));
  const yRangeMinMax = $derived(extent<number>(ctx.yRange));

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

  const lines = $derived.by(() => {
    const result: {
      x1: number;
      y1: number;
      x2: number;
      y2: number;
      axis: 'x' | 'y';
      stroke?: string;
    }[] = [];

    // Single x line
    if (singleX) {
      const _x =
        x === true || x === '$left'
          ? xRangeMinMax[0]!
          : x === '$right'
            ? xRangeMinMax[1]!
            : ctx.xScale(x) + xOffset;

      result.push({
        x1: _x,
        y1: ctx.yRange[0] || 0,
        x2: _x,
        y2: ctx.yRange[1] || 0,
        axis: 'x',
      });
    }

    // Single y line
    if (singleY) {
      const _y =
        y === true || y === '$bottom'
          ? yRangeMinMax[1]!
          : y === '$top'
            ? yRangeMinMax[0]!
            : ctx.yScale(y) + yOffset;

      result.push({
        x1: ctx.xRange[0] || 0,
        y1: _y,
        x2: ctx.xRange[1] || 0,
        y2: _y,
        axis: 'y',
      });
    }

    if (!singleX && !singleY) {
      // Data driven
      const xAccessor = x !== false ? accessor(x as Accessor) : ctx.x;
      const yAccessor = y !== false ? accessor(y as Accessor) : ctx.y;

      for (const d of data) {
        const xValue = xAccessor(d);
        const yValue = yAccessor(d);

        result.push({
          x1: ctx.xScale(Array.isArray(xValue) ? xValue[0] : xValue) + xOffset,
          y1: ctx.yScale(Array.isArray(yValue) ? yValue[0] : yValue) + yOffset,
          x2: ctx.xScale(Array.isArray(xValue) ? xValue[1] : xValue) + xOffset,
          y2: ctx.yScale(Array.isArray(yValue) ? yValue[1] : yValue) + yOffset,
          axis: Array.isArray(xValue) ? 'x' : 'y', // TODO: what about single prop like lollipop?
          stroke: (strokeProp ?? ctx.config.c) ? ctx.cGet(d) : null, // use color scale, if available
        });
      }
    }

    // TODO: Remove if out of range (showRule)
    return result;
  });

  // $inspect({ lines });
</script>

<Group class={layerClass('rule-g')}>
  {#each lines as line}
    {@const stroke = line.stroke}

    {#if ctx.radial}
      {#if line.axis === 'x'}
        {@const [x1, y1] = pointRadial(line.x1, line.y1)}
        {@const [x2, y2] = pointRadial(line.x2, line.y2)}
        <Line
          {...restProps}
          {x1}
          {y1}
          {x2}
          {y2}
          {stroke}
          class={cls(
            layerClass('rule-x-radial-line'),
            !stroke && 'stroke-surface-content/10',
            className
          )}
        />
      {:else if line.axis === 'y'}
        <Circle
          r={line.y1}
          {stroke}
          class={cls(
            layerClass('rule-y-radial-circle'),
            !stroke && 'stroke-surface-content/50',
            'fill-none',
            className
          )}
        />
      {/if}
    {:else}
      <Line
        {...restProps}
        x1={line.x1}
        y1={line.y1}
        x2={line.x2}
        y2={line.y2}
        {stroke}
        class={cls(
          layerClass(line.axis === 'x' ? 'rule-x-line' : 'rule-y-line'),
          !stroke && 'stroke-surface-content/50',
          className
        )}
      />
    {/if}
  {/each}
</Group>
