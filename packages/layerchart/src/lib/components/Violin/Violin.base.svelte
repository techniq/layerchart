<script lang="ts" module>
  import type { Component } from 'svelte';
  import type { ViolinProps } from './Violin.shared.svelte.js';

  export type ViolinBaseLayerComponents = {
    Group: Component<any>;
    Path: Component<any>;
    Rect: Component<any>;
    Line: Component<any>;
  };

  export type ViolinBaseProps = ViolinProps & ViolinBaseLayerComponents;
</script>

<script lang="ts">
  import type { PointerEventHandler } from 'svelte/elements';
  import { area as d3Area, curveCardinal } from 'd3-shape';
  import { quantile, ascending, deviation, max as d3Max } from 'd3-array';
  import { cls } from '@layerstack/tailwind';

  import { accessor } from '$lib/utils/common.js';
  import { getChartContext } from '$lib/contexts/chart.js';
  import { isScaleBand } from '$lib/utils/scales.svelte.js';

  const ctx = getChartContext();

  let {
    Group,
    Path,
    Rect,
    Line,
    data,
    density: densityProp,
    values: valuesProp,
    bandwidth: bandwidthProp,
    thresholds = 50,
    width: widthProp,
    curve = curveCardinal,
    median: showMedian = false,
    box: showBox = false,
    fill,
    fillOpacity = 0.3,
    stroke,
    strokeWidth = 1,
    opacity,
    tooltip,
    onpointerenter,
    onpointermove,
    onpointerleave,
    class: className,
    ...restProps
  }: ViolinBaseProps = $props();

  ctx.registerComponent({ name: 'Violin', kind: 'composite-mark' });

  const isVertical = $derived(ctx.valueAxis === 'y');

  const categoryPos = $derived.by(() => {
    const catAccessor = isVertical ? ctx.x : ctx.y;
    const catScale = isVertical ? ctx.xScale : ctx.yScale;
    const pos = catScale(catAccessor(data));
    const bandwidth = isScaleBand(catScale) ? catScale.bandwidth() : 0;
    return pos + bandwidth / 2;
  });

  const violinWidth = $derived.by(() => {
    if (widthProp != null) return widthProp;
    const catScale = isVertical ? ctx.xScale : ctx.yScale;
    return isScaleBand(catScale) ? catScale.bandwidth() * 0.8 : 40;
  });

  const valueScale = $derived(isVertical ? ctx.yScale : ctx.xScale);

  function epanechnikov(bw: number) {
    return (x: number) => {
      const u = x / bw;
      return Math.abs(u) <= 1 ? (0.75 * (1 - u * u)) / bw : 0;
    };
  }

  const densityData = $derived.by<[number, number][]>(() => {
    if (densityProp) {
      return accessor(densityProp)(data);
    }

    if (!valuesProp) return [];

    const valuesAccessor = accessor(valuesProp);
    const raw: number[] = valuesAccessor(data);
    if (!raw || !Array.isArray(raw) || raw.length === 0) return [];

    const sorted = [...raw].sort(ascending);
    const ext: [number, number] = [sorted[0], sorted[sorted.length - 1]];

    const bw = bandwidthProp ?? 1.06 * (deviation(sorted) ?? 1) * Math.pow(sorted.length, -1 / 5);

    const kernelFn = epanechnikov(bw);

    const n = Math.max(2, thresholds);
    const step = (ext[1] - ext[0]) / (n - 1);
    const ticks = Array.from({ length: n }, (_, i) => ext[0] + i * step);

    return ticks.map((t): [number, number] => {
      const density = raw.reduce((sum, v) => sum + kernelFn(t - v), 0) / raw.length;
      return [t, density];
    });
  });

  const stats = $derived.by(() => {
    if (!showMedian && !showBox) return null;
    if (!valuesProp) return null;

    const valuesAccessor = accessor(valuesProp);
    const raw: number[] = valuesAccessor(data);
    if (!raw || !Array.isArray(raw) || raw.length === 0) return null;

    const sorted = Float64Array.from(raw).sort();
    return {
      q1: quantile(sorted, 0.25)!,
      median: quantile(sorted, 0.5)!,
      q3: quantile(sorted, 0.75)!,
    };
  });

  const maxDensity = $derived(d3Max(densityData, (d) => d[1]) ?? 1);
  const densityToWidth = $derived.by(() => (d: number) => (d / maxDensity) * (violinWidth / 2));

  const pathData = $derived.by(() => {
    if (densityData.length === 0) return '';

    if (isVertical) {
      const areaGen = d3Area<[number, number]>()
        .x0((d) => categoryPos - densityToWidth(d[1]))
        .x1((d) => categoryPos + densityToWidth(d[1]))
        .y((d) => valueScale(d[0]))
        .curve(curve);

      return areaGen(densityData) ?? '';
    } else {
      const areaGen = d3Area<[number, number]>()
        .y0((d) => categoryPos - densityToWidth(d[1]))
        .y1((d) => categoryPos + densityToWidth(d[1]))
        .x((d) => valueScale(d[0]))
        .curve(curve);

      return areaGen(densityData) ?? '';
    }
  });

  const innerBoxWidth = $derived(
    typeof showBox === 'object' && showBox.width != null ? showBox.width : violinWidth * 0.15
  );

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

{#if pathData}
  <Group
    class="lc-violin"
    {opacity}
    onpointerenter={onPointerEnter}
    onpointermove={onPointerMove}
    onpointerleave={onPointerLeave}
  >
    <Path
      {pathData}
      {fill}
      {fillOpacity}
      {stroke}
      {strokeWidth}
      class={cls('lc-violin-area', className)}
    />

    {#if showBox && stats}
      {#if isVertical}
        <Rect
          x={categoryPos - innerBoxWidth / 2}
          y={Math.min(valueScale(stats.q1), valueScale(stats.q3))}
          width={innerBoxWidth}
          height={Math.abs(valueScale(stats.q3) - valueScale(stats.q1))}
          fill="currentColor"
          fillOpacity={0.3}
          stroke="none"
          class={cls('lc-violin-box', className)}
        />
      {:else}
        <Rect
          x={Math.min(valueScale(stats.q1), valueScale(stats.q3))}
          y={categoryPos - innerBoxWidth / 2}
          width={Math.abs(valueScale(stats.q3) - valueScale(stats.q1))}
          height={innerBoxWidth}
          fill="currentColor"
          fillOpacity={0.3}
          stroke="none"
          class={cls('lc-violin-box', className)}
        />
      {/if}
    {/if}

    {#if showMedian && stats}
      {#if isVertical}
        <Line
          x1={categoryPos - violinWidth * 0.15}
          y1={valueScale(stats.median)}
          x2={categoryPos + violinWidth * 0.15}
          y2={valueScale(stats.median)}
          stroke="currentColor"
          strokeWidth={2}
          class={cls('lc-violin-median', className)}
        />
      {:else}
        <Line
          x1={valueScale(stats.median)}
          y1={categoryPos - violinWidth * 0.15}
          x2={valueScale(stats.median)}
          y2={categoryPos + violinWidth * 0.15}
          stroke="currentColor"
          strokeWidth={2}
          class={cls('lc-violin-median', className)}
        />
      {/if}
    {/if}
  </Group>
{/if}

<style>
  @layer components {
    :global(:where(.lc-violin)) {
      --stroke-color: var(--color-surface-content, currentColor);
    }

    :global(:where(.lc-violin-area)) {
      --fill-color: color-mix(
        in oklab,
        var(--color-surface-content, currentColor) 20%,
        transparent
      );
      --stroke-color: var(--color-surface-content, currentColor);
    }
  }
</style>
