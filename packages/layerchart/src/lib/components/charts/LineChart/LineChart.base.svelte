<script lang="ts" module>
  import type { Component } from 'svelte';
  import type { LineChartProps } from './LineChart.shared.svelte.js';

  export type LineChartBaseLayerComponents = {
    Chart: Component<any>;
    Spline: Component<any>;
  };

  export type LineChartBaseProps<TData> = LineChartProps<TData> & LineChartBaseLayerComponents;
</script>

<script lang="ts" generics="TData">
  import { onMount } from 'svelte';

  import { getObjectOrNull } from '$lib/utils/common.js';
  import { isScaleTime } from '$lib/utils/scales.svelte.js';

  let {
    Chart,
    Spline,
    data = [],
    x: xProp,
    xScale,
    xDomain,
    y: yProp,
    yScale,
    radial = false,
    orientation = 'horizontal',
    valueAxis: valueAxisProp,
    series: seriesProp,
    axis = true,
    brush = false,
    highlight = { lines: true, points: true },
    legend = false,
    onPointClick,
    props = {},
    profile = false,
    tooltipContext = true,
    marks,
    context = $bindable(),
    ...restProps
  }: LineChartBaseProps<TData> = $props();

  const valueAxis = $derived(valueAxisProp ?? (orientation === 'horizontal' ? 'y' : 'x'));

  const series = $derived(
    seriesProp === undefined
      ? [
          {
            key: 'default',

            label:
              valueAxis == 'x'
                ? typeof xProp === 'string'
                  ? xProp
                  : 'value'
                : typeof yProp === 'string'
                  ? yProp
                  : 'value',
            value: valueAxis == 'x' ? xProp : yProp,
            color: 'var(--color-primary, currentColor)',
          },
        ]
      : seriesProp
  );
  const highlightWithPointClick = $derived(
    typeof highlight === 'function'
      ? highlight
      : onPointClick
        ? { ...getObjectOrNull(highlight), ...props.highlight, onPointClick }
        : highlight
  );

  if (profile) {
    console.time('LineChart render');
    onMount(() => {
      console.timeEnd('LineChart render');
    });
  }
</script>

<Chart
  bind:context
  {data}
  {xScale}
  x={xProp ?? (valueAxis === 'x' ? series.map((s) => s.value ?? s.key) : undefined)}
  {xDomain}
  xBaseline={valueAxis === 'y' || (xScale && isScaleTime(xScale)) ? undefined : 0}
  {yScale}
  y={yProp ?? (valueAxis === 'y' ? series.map((s) => s.value ?? s.key) : undefined)}
  yBaseline={valueAxis === 'x' || (yScale && isScaleTime(yScale)) ? undefined : 0}
  {radial}
  {valueAxis}
  {axis}
  {...restProps}
  tooltipContext={tooltipContext === false
    ? false
    : {
        mode: valueAxis === 'x' ? 'quadtree-y' : 'quadtree-x',
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
  highlight={highlightWithPointClick as any}
  {legend}
  {props}
>
  {#snippet marks({ context }: { context: any })}
    {#if typeof marks === 'function'}
      {@render marks({ context })}
    {:else}
      {#each context.series.visibleSeries as s, i (s.key)}
        <Spline seriesKey={s.key} {...props.spline} />
      {/each}
    {/if}
  {/snippet}
</Chart>
