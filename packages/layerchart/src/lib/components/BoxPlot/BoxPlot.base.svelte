<script lang="ts" module>
  import type { Component } from 'svelte';
  import type { BoxPlotProps } from './BoxPlot.shared.svelte.js';

  export type BoxPlotBaseLayerComponents = {
    Group: Component<any>;
    Rect: Component<any>;
    Line: Component<any>;
    Circle: Component<any>;
  };

  export type BoxPlotBaseProps = BoxPlotProps & BoxPlotBaseLayerComponents;
</script>

<script lang="ts">
  import type { PointerEventHandler } from 'svelte/elements';
  import { cls } from '@layerstack/tailwind';
  import { quantile } from 'd3-array';

  import { accessor } from '$lib/utils/common.js';
  import { getChartContext } from '$lib/contexts/chart.js';
  import { isScaleBand } from '$lib/utils/scales.svelte.js';

  const ctx = getChartContext();

  let {
    Group,
    Rect,
    Line,
    Circle,
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
  }: BoxPlotBaseProps = $props();

  ctx.registerComponent({ name: 'BoxPlot', kind: 'composite-mark' });

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

  const minVal = $derived(minProp != null ? accessor(minProp)(data) : computedStats?.min);
  const q1Val = $derived(q1Prop != null ? accessor(q1Prop)(data) : computedStats?.q1);
  const medianVal = $derived(
    medianProp != null ? accessor(medianProp)(data) : computedStats?.median
  );
  const q3Val = $derived(q3Prop != null ? accessor(q3Prop)(data) : computedStats?.q3);
  const maxVal = $derived(maxProp != null ? accessor(maxProp)(data) : computedStats?.max);
  const outliersVal = $derived<number[]>(
    outliersProp != null ? accessor(outliersProp)(data) ?? [] : computedStats?.outliers ?? []
  );

  const isVertical = $derived(ctx.valueAxis === 'y');

  const categoryPos = $derived.by(() => {
    const catAccessor = isVertical ? ctx.x : ctx.y;
    const catScale = isVertical ? ctx.xScale : ctx.yScale;
    const pos = catScale(catAccessor(data));
    const bandwidth = isScaleBand(catScale) ? catScale.bandwidth() : 0;
    return pos + bandwidth / 2;
  });

  const boxWidth = $derived.by(() => {
    if (widthProp != null) return widthProp;
    const catScale = isVertical ? ctx.xScale : ctx.yScale;
    return isScaleBand(catScale) ? catScale.bandwidth() * 0.6 : 20;
  });

  const whiskerCapWidth = $derived(boxWidth * capWidth);
  const valueScale = $derived(isVertical ? ctx.yScale : ctx.xScale);

  const minPos = $derived(minVal != null ? valueScale(minVal) : 0);
  const q1Pos = $derived(q1Val != null ? valueScale(q1Val) : 0);
  const medianPos = $derived(medianVal != null ? valueScale(medianVal) : 0);
  const q3Pos = $derived(q3Val != null ? valueScale(q3Val) : 0);
  const maxPos = $derived(maxVal != null ? valueScale(maxVal) : 0);

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
      <Line x1={categoryPos} y1={minPos} x2={categoryPos} y2={q1Pos} {stroke} {strokeWidth} class={cls('lc-boxplot-whisker', className)} />
      <Line x1={categoryPos} y1={q3Pos} x2={categoryPos} y2={maxPos} {stroke} {strokeWidth} class={cls('lc-boxplot-whisker', className)} />
      <Line x1={categoryPos - whiskerCapWidth / 2} y1={minPos} x2={categoryPos + whiskerCapWidth / 2} y2={minPos} {stroke} {strokeWidth} class={cls('lc-boxplot-cap', className)} />
      <Line x1={categoryPos - whiskerCapWidth / 2} y1={maxPos} x2={categoryPos + whiskerCapWidth / 2} y2={maxPos} {stroke} {strokeWidth} class={cls('lc-boxplot-cap', className)} />
      <Rect x={categoryPos - boxWidth / 2} y={Math.min(q1Pos, q3Pos)} width={boxWidth} height={Math.abs(q3Pos - q1Pos)} {fill} {fillOpacity} {stroke} {strokeWidth} rx={radius} class={cls('lc-boxplot-box', className)} />
      <Line x1={categoryPos - boxWidth / 2} y1={medianPos} x2={categoryPos + boxWidth / 2} y2={medianPos} {stroke} strokeWidth={strokeWidth * 2} class={cls('lc-boxplot-median', className)} />
      {#each outliersVal as outlier, i (i)}
        <Circle cx={categoryPos} cy={valueScale(outlier)} r={outlierRadius} {stroke} {strokeWidth} class={cls('lc-boxplot-outlier', className)} />
      {/each}
    {:else}
      <Line x1={minPos} y1={categoryPos} x2={q1Pos} y2={categoryPos} {stroke} {strokeWidth} class={cls('lc-boxplot-whisker', className)} />
      <Line x1={q3Pos} y1={categoryPos} x2={maxPos} y2={categoryPos} {stroke} {strokeWidth} class={cls('lc-boxplot-whisker', className)} />
      <Line x1={minPos} y1={categoryPos - whiskerCapWidth / 2} x2={minPos} y2={categoryPos + whiskerCapWidth / 2} {stroke} {strokeWidth} class={cls('lc-boxplot-cap', className)} />
      <Line x1={maxPos} y1={categoryPos - whiskerCapWidth / 2} x2={maxPos} y2={categoryPos + whiskerCapWidth / 2} {stroke} {strokeWidth} class={cls('lc-boxplot-cap', className)} />
      <Rect x={Math.min(q1Pos, q3Pos)} y={categoryPos - boxWidth / 2} width={Math.abs(q3Pos - q1Pos)} height={boxWidth} {fill} {fillOpacity} {stroke} {strokeWidth} rx={radius} class={cls('lc-boxplot-box', className)} />
      <Line x1={medianPos} y1={categoryPos - boxWidth / 2} x2={medianPos} y2={categoryPos + boxWidth / 2} {stroke} strokeWidth={strokeWidth * 2} class={cls('lc-boxplot-median', className)} />
      {#each outliersVal as outlier, i (i)}
        <Circle cx={valueScale(outlier)} cy={categoryPos} r={outlierRadius} {stroke} {strokeWidth} class={cls('lc-boxplot-outlier', className)} />
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
