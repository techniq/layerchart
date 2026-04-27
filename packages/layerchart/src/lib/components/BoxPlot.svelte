<script lang="ts" module>
  import type { SVGAttributes } from 'svelte/elements';
  import type { CommonStyleProps, CommonEvents, Without } from '$lib/utils/types.js';
  import type { Accessor } from '$lib/utils/common.js';

  export type BoxPlotPropsWithoutHTML = {
    /** Data item containing box plot statistics */
    data: Object;

    /** Accessor for minimum value (whisker lower bound, excluding outliers) */
    min?: Accessor;
    /** Accessor for first quartile (Q1, 25th percentile) */
    q1?: Accessor;
    /** Accessor for median (Q2, 50th percentile) */
    median?: Accessor;
    /** Accessor for third quartile (Q3, 75th percentile) */
    q3?: Accessor;
    /** Accessor for maximum value (whisker upper bound, excluding outliers) */
    max?: Accessor;
    /** Accessor for outlier values (array of numbers) */
    outliers?: Accessor;

    /**
     * Raw values accessor. If provided, statistics (min, q1, median, q3, max, outliers)
     * are computed automatically using the Tukey method.
     */
    values?: Accessor;

    /** IQR multiplier for outlier detection when using `values`. @default 1.5 */
    iqrMultiplier?: number;

    /** Fixed width of the box in pixels. Defaults to 60% of band scale bandwidth, or 20px. */
    width?: number;

    /** Width of whisker caps as a fraction of box width (0-1). @default 0.5 */
    capWidth?: number;

    /** Corner radius of the box rectangle. @default 0 */
    radius?: number;

    /** Radius of outlier dots. @default 3 */
    outlierRadius?: number;

    /** Setup pointer events to show tooltip for this data item. */
    tooltip?: boolean;
  } & CommonStyleProps;

  export type BoxPlotProps = BoxPlotPropsWithoutHTML &
    Without<SVGAttributes<SVGElement>, BoxPlotPropsWithoutHTML> &
    CommonEvents;
</script>

<script lang="ts">
  import type { PointerEventHandler } from 'svelte/elements';
  import { cls } from '@layerstack/tailwind';
  import { quantile } from 'd3-array';

  import Group from './Group.svelte';
  import Rect from './Rect/Rect.svelte';
  import Line from './Line/Line.svelte';
  import Circle from './Circle/Circle.svelte';
  import { accessor } from '$lib/utils/common.js';
  import { getChartContext } from '$lib/contexts/chart.js';
  import { isScaleBand } from '$lib/utils/scales.svelte.js';

  const ctx = getChartContext();

  let {
    data,
    min: minProp,
    q1: q1Prop,
    median: medianProp,
    q3: q3Prop,
    max: maxProp,
    outliers: outliersProp,
    values: valuesProp,
    iqrMultiplier = 1.5,
    width: widthProp,
    capWidth = 0.5,
    radius = 0,
    outlierRadius = 3,
    fill,
    fillOpacity,
    stroke,
    strokeWidth = 1,
    opacity,
    tooltip,
    onpointerenter,
    onpointermove,
    onpointerleave,
    class: className,
    ...restProps
  }: BoxPlotProps = $props();

  // Register as composite mark (shields child marks from domain calculation)
  ctx.registerComponent({
    name: 'BoxPlot',
    kind: 'composite-mark',
  });

  // Auto-compute statistics from raw values if `values` prop is provided
  const computedStats = $derived.by(() => {
    if (!valuesProp) return null;

    const valuesAccessor = accessor(valuesProp);
    const raw: number[] = valuesAccessor(data);
    if (!raw || !Array.isArray(raw) || raw.length === 0) return null;

    const sorted = Float64Array.from(raw).sort();
    const q1 = quantile(sorted, 0.25)!;
    const q3 = quantile(sorted, 0.75)!;
    const med = quantile(sorted, 0.5)!;
    const iqr = q3 - q1;
    const lowerFence = q1 - iqrMultiplier * iqr;
    const upperFence = q3 + iqrMultiplier * iqr;

    const outliers: number[] = [];
    let min = Infinity;
    let max = -Infinity;

    for (const v of sorted) {
      if (v < lowerFence || v > upperFence) {
        outliers.push(v);
      } else {
        if (v < min) min = v;
        if (v > max) max = v;
      }
    }

    if (min === Infinity) min = q1;
    if (max === -Infinity) max = q3;

    return { min, q1, median: med, q3, max, outliers };
  });

  // Resolve final statistics: explicit props take priority over computed values
  const minVal = $derived(minProp != null ? accessor(minProp)(data) : computedStats?.min);
  const q1Val = $derived(q1Prop != null ? accessor(q1Prop)(data) : computedStats?.q1);
  const medianVal = $derived(
    medianProp != null ? accessor(medianProp)(data) : computedStats?.median
  );
  const q3Val = $derived(q3Prop != null ? accessor(q3Prop)(data) : computedStats?.q3);
  const maxVal = $derived(maxProp != null ? accessor(maxProp)(data) : computedStats?.max);
  const outliersVal = $derived<number[]>(
    outliersProp != null ? (accessor(outliersProp)(data) ?? []) : (computedStats?.outliers ?? [])
  );

  const isVertical = $derived(ctx.valueAxis === 'y');

  // Category position: center of the band for this data item
  const categoryPos = $derived.by(() => {
    const catAccessor = isVertical ? ctx.x : ctx.y;
    const catScale = isVertical ? ctx.xScale : ctx.yScale;
    const pos = catScale(catAccessor(data));
    const bandwidth = isScaleBand(catScale) ? catScale.bandwidth() : 0;
    return pos + bandwidth / 2;
  });

  // Box width: derived from band scale or explicit prop
  const boxWidth = $derived.by(() => {
    if (widthProp != null) return widthProp;
    const catScale = isVertical ? ctx.xScale : ctx.yScale;
    return isScaleBand(catScale) ? catScale.bandwidth() * 0.6 : 20;
  });

  const whiskerCapWidth = $derived(boxWidth * capWidth);

  // Value scale for mapping statistics to pixel positions
  const valueScale = $derived(isVertical ? ctx.yScale : ctx.xScale);

  // Scaled pixel positions
  const minPos = $derived(minVal != null ? valueScale(minVal) : 0);
  const q1Pos = $derived(q1Val != null ? valueScale(q1Val) : 0);
  const medianPos = $derived(medianVal != null ? valueScale(medianVal) : 0);
  const q3Pos = $derived(q3Val != null ? valueScale(q3Val) : 0);
  const maxPos = $derived(maxVal != null ? valueScale(maxVal) : 0);

  // Tooltip event handlers
  const onPointerEnter: PointerEventHandler<Element> = (e) => {
    onpointerenter?.(e);
    if (tooltip) ctx.tooltip.show(e, data);
  };
  const onPointerMove: PointerEventHandler<Element> = (e) => {
    onpointermove?.(e);
    if (tooltip) ctx.tooltip.show(e, data);
  };
  const onPointerLeave: PointerEventHandler<Element> = (e) => {
    onpointerleave?.(e);
    if (tooltip) ctx.tooltip.hide();
  };
</script>

{#if minVal != null && q1Val != null && medianVal != null && q3Val != null && maxVal != null}
  <Group
    class="lc-boxplot"
    {opacity}
    onpointerenter={onPointerEnter}
    onpointermove={onPointerMove}
    onpointerleave={onPointerLeave}
  >
    {#if isVertical}
      <!-- Lower whisker: min to q1 -->
      <Line
        x1={categoryPos}
        y1={minPos}
        x2={categoryPos}
        y2={q1Pos}
        {stroke}
        {strokeWidth}
        class={cls('lc-boxplot-whisker', className)}
      />

      <!-- Upper whisker: q3 to max -->
      <Line
        x1={categoryPos}
        y1={q3Pos}
        x2={categoryPos}
        y2={maxPos}
        {stroke}
        {strokeWidth}
        class={cls('lc-boxplot-whisker', className)}
      />

      <!-- Min cap -->
      <Line
        x1={categoryPos - whiskerCapWidth / 2}
        y1={minPos}
        x2={categoryPos + whiskerCapWidth / 2}
        y2={minPos}
        {stroke}
        {strokeWidth}
        class={cls('lc-boxplot-cap', className)}
      />

      <!-- Max cap -->
      <Line
        x1={categoryPos - whiskerCapWidth / 2}
        y1={maxPos}
        x2={categoryPos + whiskerCapWidth / 2}
        y2={maxPos}
        {stroke}
        {strokeWidth}
        class={cls('lc-boxplot-cap', className)}
      />

      <!-- Box (Q1 to Q3) -->
      <Rect
        x={categoryPos - boxWidth / 2}
        y={Math.min(q1Pos, q3Pos)}
        width={boxWidth}
        height={Math.abs(q3Pos - q1Pos)}
        {fill}
        {fillOpacity}
        {stroke}
        {strokeWidth}
        rx={radius}
        class={cls('lc-boxplot-box', className)}
      />

      <!-- Median line -->
      <Line
        x1={categoryPos - boxWidth / 2}
        y1={medianPos}
        x2={categoryPos + boxWidth / 2}
        y2={medianPos}
        {stroke}
        strokeWidth={strokeWidth * 2}
        class={cls('lc-boxplot-median', className)}
      />

      <!-- Outliers -->
      {#each outliersVal as outlier, i (i)}
        <Circle
          cx={categoryPos}
          cy={valueScale(outlier)}
          r={outlierRadius}
          {stroke}
          {strokeWidth}
          class={cls('lc-boxplot-outlier', className)}
        />
      {/each}
    {:else}
      <!-- Horizontal box plot -->

      <!-- Lower whisker: min to q1 -->
      <Line
        x1={minPos}
        y1={categoryPos}
        x2={q1Pos}
        y2={categoryPos}
        {stroke}
        {strokeWidth}
        class={cls('lc-boxplot-whisker', className)}
      />

      <!-- Upper whisker: q3 to max -->
      <Line
        x1={q3Pos}
        y1={categoryPos}
        x2={maxPos}
        y2={categoryPos}
        {stroke}
        {strokeWidth}
        class={cls('lc-boxplot-whisker', className)}
      />

      <!-- Min cap -->
      <Line
        x1={minPos}
        y1={categoryPos - whiskerCapWidth / 2}
        x2={minPos}
        y2={categoryPos + whiskerCapWidth / 2}
        {stroke}
        {strokeWidth}
        class={cls('lc-boxplot-cap', className)}
      />

      <!-- Max cap -->
      <Line
        x1={maxPos}
        y1={categoryPos - whiskerCapWidth / 2}
        x2={maxPos}
        y2={categoryPos + whiskerCapWidth / 2}
        {stroke}
        {strokeWidth}
        class={cls('lc-boxplot-cap', className)}
      />

      <!-- Box (Q1 to Q3) -->
      <Rect
        x={Math.min(q1Pos, q3Pos)}
        y={categoryPos - boxWidth / 2}
        width={Math.abs(q3Pos - q1Pos)}
        height={boxWidth}
        {fill}
        {fillOpacity}
        {stroke}
        {strokeWidth}
        rx={radius}
        class={cls('lc-boxplot-box', className)}
      />

      <!-- Median line -->
      <Line
        x1={medianPos}
        y1={categoryPos - boxWidth / 2}
        x2={medianPos}
        y2={categoryPos + boxWidth / 2}
        {stroke}
        strokeWidth={strokeWidth * 2}
        class={cls('lc-boxplot-median', className)}
      />

      <!-- Outliers -->
      {#each outliersVal as outlier, i (i)}
        <Circle
          cx={valueScale(outlier)}
          cy={categoryPos}
          r={outlierRadius}
          {stroke}
          {strokeWidth}
          class={cls('lc-boxplot-outlier', className)}
        />
      {/each}
    {/if}
  </Group>
{/if}

<style>
  @layer components {
    :global(:where(.lc-boxplot)) {
      --stroke-color: var(--color-surface-content, currentColor);
    }

    :global(:where(.lc-boxplot-box)) {
      --fill-color: color-mix(
        in oklab,
        var(--color-surface-content, currentColor) 15%,
        transparent
      );
      --stroke-color: var(--color-surface-content, currentColor);
    }

    :global(:where(.lc-boxplot-outlier)) {
      --fill-color: none;
      --stroke-color: var(--color-surface-content, currentColor);
    }
  }
</style>
