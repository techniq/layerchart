<script lang="ts" module>
  import type { Component } from 'svelte';
  import type { BarChartProps } from './BarChart.shared.svelte.js';

  export type BarChartBaseLayerComponents = {
    Chart: Component<any>;
    Bars: Component<any>;
  };

  export type BarChartBaseProps<TData> = BarChartProps<TData> & BarChartBaseLayerComponents;
</script>

<script lang="ts" generics="TData">
  import { onMount } from 'svelte';

  let {
    Chart,
    Bars,
    data = [],
    x: xProp,
    y: yProp,
    xDomain,
    radial = false,
    orientation = 'vertical',
    series: seriesProp,
    seriesLayout = 'overlap',
    axis = true,
    brush = false,
    grid = true,
    highlight = { area: true },
    legend = false,
    rule = true,
    onBarClick = () => {},
    props = {},
    profile = false,
    bandPadding = radial ? 0 : 0.4,
    groupPadding = 0,
    stackPadding = 0,
    xInterval,
    yInterval,
    tooltipContext = true,
    marks,
    context = $bindable(),
    ...restProps
  }: BarChartBaseProps<TData> = $props();

  const valueAxis = $derived(orientation === 'horizontal' ? 'x' : 'y');

  const series = $derived(
    seriesProp === undefined
      ? [
          {
            key: 'default',
            label:
              valueAxis === 'y'
                ? typeof yProp === 'string'
                  ? yProp
                  : 'value'
                : typeof xProp === 'string'
                  ? xProp
                  : 'value',
            value: valueAxis === 'y' ? yProp : xProp,
          },
        ]
      : seriesProp
  );

  const isGroupSeries = $derived(seriesLayout === 'group');

  if (profile) {
    console.time('BarChart render');
    onMount(() => {
      console.timeEnd('BarChart render');
    });
  }
</script>

<Chart
  bind:context
  {data}
  x={xProp}
  {xDomain}
  {xInterval}
  y={yProp}
  {yInterval}
  c={valueAxis === 'y' ? yProp : xProp}
  cRange={['var(--color-primary, currentColor)']}
  {radial}
  {valueAxis}
  {bandPadding}
  {groupPadding}
  {...restProps}
  tooltipContext={tooltipContext === false
    ? false
    : {
        mode: 'band',
        ...props.tooltip?.context,
        ...(typeof tooltipContext === 'object' ? tooltipContext : null),
      }}
  brush={brush
    ? {
        axis: 'x',
        zoomOnBrush: true,
        ...(typeof brush === 'object' ? brush : null),
        ...props.brush,
      }
    : false}
  {series}
  {seriesLayout}
  {axis}
  {grid}
  {rule}
  {legend}
  highlight={highlight as any}
  {props}
>
  {#snippet marks({ context }: { context: any })}
    {#if typeof marks === 'function'}
      {@render marks({ context })}
    {:else}
      {#each context.series.visibleSeries as s, i (s.key)}
        <Bars
          seriesKey={s.key}
          x1={valueAxis === 'y' && isGroupSeries ? (d: any) => s.value ?? s.key : undefined}
          y1={valueAxis === 'x' && isGroupSeries ? (d: any) => s.value ?? s.key : undefined}
          rounded={context.series.divergingEdgeKeys
            ? context.series.divergingEdgeKeys.has(s.key)
              ? 'edge'
              : 'none'
            : context.series.isStacked && i !== context.series.visibleSeries.length - 1
              ? 'none'
              : Array.isArray(xProp) || Array.isArray(yProp)
                ? 'all'
                : 'edge'}
          radius={4}
          strokeWidth={1}
          {stackPadding}
          opacity={context.series.isHighlighted(s.key, true) ? 1 : 0.1}
          onBarClick={(e: MouseEvent, detail: any) => onBarClick(e, { ...detail, series: s })}
          {...props.bars}
          {...s.props}
        />
      {/each}
    {/if}
  {/snippet}
</Chart>
