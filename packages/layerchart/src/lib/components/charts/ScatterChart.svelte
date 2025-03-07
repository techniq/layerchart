<script lang="ts" generics="TData">
  import { onMount, type ComponentProps } from 'svelte';
  import { scaleLinear, scaleOrdinal, scaleTime } from 'd3-scale';
  import { format } from '@layerstack/utils';
  import { cls } from '@layerstack/tailwind';
  import { selectionStore } from '@layerstack/svelte-stores';

  import Axis from '../Axis.svelte';
  import BrushContext from '../BrushContext.svelte';
  import Canvas from '../layout/Canvas.svelte';
  import Chart from '../Chart.svelte';
  import ChartClipPath from '../ChartClipPath.svelte';
  import Grid from '../Grid.svelte';
  import Highlight from '../Highlight.svelte';
  import Labels from '../Labels.svelte';
  import Legend from '../Legend.svelte';
  import Points from '../Points.svelte';
  import Rule from '../Rule.svelte';
  import Svg from '../layout/Svg.svelte';
  import * as Tooltip from '../tooltip/index.js';

  import {
    accessor,
    chartDataArray,
    defaultChartPadding,
    type Accessor,
  } from '../../utils/common.js';
  import { asAny } from '../../utils/types.js';

  interface $$Props extends ComponentProps<Chart<TData>> {
    axis?: typeof axis;
    brush?: typeof brush;
    grid?: typeof grid;
    labels?: typeof labels;
    legend?: typeof legend;
    profile?: typeof profile;
    props?: typeof props;
    series?: typeof series;
    renderContext?: typeof renderContext;
    ontooltipclick?: typeof ontooltipclick;
  }

  export let data: $$Props['data'] = [];
  export let x: Accessor<TData> = undefined;
  export let y: Accessor<TData> = undefined;

  /** Set xDomain.  Useful for external brush control */
  export let xDomain: ComponentProps<typeof BrushContext>['xDomain'] = undefined;
  /** Set yDomain.  Useful for external brush control */
  export let yDomain: ComponentProps<typeof BrushContext>['yDomain'] = undefined;

  export let series: {
    key: string;
    label?: string;
    data: TData[];
    color?: string;
    props?: Partial<ComponentProps<Points>>;
  }[] = [{ key: 'default', data: chartDataArray(data), color: 'hsl(var(--color-primary))' }];
  $: isDefaultSeries = series.length === 1 && series[0].key === 'default';

  export let axis: ComponentProps<Axis> | 'x' | 'y' | boolean = true;
  export let brush: ComponentProps<BrushContext> | boolean = false;
  export let grid: ComponentProps<Grid> | boolean = true;
  export let labels: ComponentProps<Labels> | boolean = false;
  export let legend: ComponentProps<Legend> | boolean = false;
  export let rule: ComponentProps<Rule> | boolean = true;

  /** Expose tooltip context for external access */
  export let tooltipContext: ComponentProps<Tooltip.Context>['tooltip'] = undefined;

  /** Event dispatched with current tooltip data */
  export let ontooltipclick: (e: MouseEvent, detail: { data: any }) => void = () => {};

  export let props: {
    brush?: Partial<ComponentProps<BrushContext>>;
    canvas?: Partial<ComponentProps<Canvas>>;
    debug?: typeof debug;
    grid?: Partial<ComponentProps<Grid>>;
    highlight?: Partial<ComponentProps<Highlight>>;
    labels?: Partial<ComponentProps<Labels>>;
    legend?: Partial<ComponentProps<Legend>>;
    points?: Partial<ComponentProps<Points>>;
    profile?: typeof profile;
    rule?: Partial<ComponentProps<Rule>>;
    svg?: Partial<ComponentProps<Svg>>;
    tooltip?: {
      context?: Partial<ComponentProps<Tooltip.Context>>;
      root?: Partial<ComponentProps<Tooltip.Root>>;
      header?: Partial<ComponentProps<Tooltip.Header>>;
      list?: Partial<ComponentProps<Tooltip.List>>;
      item?: Partial<ComponentProps<Tooltip.Item>>;
      separator?: Partial<ComponentProps<Tooltip.Separator>>;
    };
    xAxis?: Partial<ComponentProps<Axis>>;
    yAxis?: Partial<ComponentProps<Axis>>;
  } = {};

  export let renderContext: 'svg' | 'canvas' = 'svg';

  /** Log initial render performance using `console.time` */
  export let profile = false;

  /** Enable debug mode */
  export let debug = false;

  // Default xScale based on first data's `x` value
  $: xScale =
    $$props.xScale ??
    (accessor(x)(chartDataArray(data)[0]) instanceof Date ? scaleTime() : scaleLinear());

  // Default yScale based on first data's `y` value
  $: yScale =
    $$props.yScale ??
    (accessor(y)(chartDataArray(data)[0]) instanceof Date ? scaleTime() : scaleLinear());

  $: chartData = visibleSeries
    .flatMap((s) => s.data?.map((d) => ({ seriesKey: s.key, ...d })))
    .filter((d) => d) as Array<TData>;

  let highlightSeriesKey: (typeof series)[number]['key'] | null = null;

  function setHighlightSeriesKey(seriesKey: typeof highlightSeriesKey) {
    highlightSeriesKey = seriesKey ?? null;
  }

  $: getPointsProps = (s: (typeof series)[number], i: number) => {
    const pointsProps: ComponentProps<Points> = {
      data: s.data,
      stroke: s.color,
      fill: s.color,
      fillOpacity: 0.3,
      ...props.points,
      ...s.props,
      class: cls(
        'transition-opacity',
        highlightSeriesKey && highlightSeriesKey !== s.key && 'opacity-10',
        props.points?.class,
        s.props?.class
      ),
    };

    return pointsProps;
  };

  function getLabelsProps(s: (typeof series)[number], i: number) {
    const labelsProps: ComponentProps<Labels> = {
      data: s.data,
      ...props.labels,
      ...(typeof labels === 'object' ? labels : null),
      class: cls(
        'stroke-surface-200 transition-opacity',
        highlightSeriesKey && highlightSeriesKey !== s.key && 'opacity-10',
        props.labels?.class,
        typeof labels === 'object' && labels.class
      ),
    };

    return labelsProps;
  }

  const selectedSeries = selectionStore();
  $: visibleSeries = series.filter((s) => {
    return (
      // @ts-expect-error
      $selectedSeries.selected.length === 0 || $selectedSeries.isSelected(s.key)
      // || highlightSeriesKey == s.key
    );
  });

  $: brushProps = { ...(typeof brush === 'object' ? brush : null), ...props.brush };

  if (profile) {
    console.time('ScatterChart render');
    onMount(() => {
      console.timeEnd('ScatterChart render');
    });
  }
</script>

<Chart
  data={chartData}
  {x}
  {xDomain}
  {xScale}
  {y}
  {yDomain}
  {yScale}
  yNice
  padding={defaultChartPadding(axis, legend)}
  {...$$restProps}
  tooltip={$$props.tooltip === false
    ? false
    : {
        mode: 'voronoi',
        onclick: ontooltipclick,
        debug,
        ...props.tooltip?.context,
        ...$$props.tooltip,
      }}
  bind:tooltipContext
  brush={brush && (brush === true || brush.mode == undefined || brush.mode === 'integrated')
    ? {
        axis: 'both',
        resetOnEnd: true,
        xDomain,
        yDomain,
        ...brushProps,
        onbrushend: (e) => {
          xDomain = e.xDomain;
          yDomain = e.yDomain;
          brushProps.onbrushend?.(e);
        },
      }
    : false}
  let:x
  let:xScale
  let:y
  let:yScale
  let:c
  let:cScale
  let:r
  let:width
  let:height
  let:padding
  let:tooltip
  let:config
>
  {@const slotProps = {
    x,
    xScale,
    y,
    yScale,
    c,
    cScale,
    width,
    height,
    padding,
    tooltip,
    series,
    visibleSeries,
    getLabelsProps,
    getPointsProps,
    highlightSeriesKey,
    setHighlightSeriesKey,
  }}
  {@const activeSeries = tooltip.data
    ? (series.find((s) => s.key === tooltip.data.seriesKey) ?? series[0])
    : null}

  <slot {...slotProps}>
    <slot name="belowContext" {...slotProps} />

    <svelte:component
      this={renderContext === 'canvas' ? Canvas : Svg}
      {...asAny(renderContext === 'canvas' ? props.canvas : props.svg)}
      {debug}
    >
      <slot name="grid" {...slotProps}>
        {#if grid}
          <Grid x y {...typeof grid === 'object' ? grid : null} {...props.grid} />
        {/if}
      </slot>

      <ChartClipPath disabled={!brush}>
        <slot name="belowMarks" {...slotProps} />

        <slot name="marks" {...slotProps}>
          {#each visibleSeries as s, i (s.key)}
            <Points {...getPointsProps(s, i)} />
          {/each}
        </slot>

        <slot name="aboveMarks" {...slotProps} />
      </ChartClipPath>

      <slot name="axis" {...slotProps}>
        {#if axis}
          {#if axis !== 'x'}
            <Axis
              placement="left"
              format={(value) => format(value, undefined, { variant: 'short' })}
              {...typeof axis === 'object' ? axis : null}
              {...props.yAxis}
            />
          {/if}

          {#if axis !== 'y'}
            <Axis
              placement="bottom"
              format={(value) => format(value, undefined, { variant: 'short' })}
              {...typeof axis === 'object' ? axis : null}
              {...props.xAxis}
            />
          {/if}

          {#if rule}
            <Rule x={0} y={0} {...typeof rule === 'object' ? rule : null} {...props.rule} />
          {/if}
        {/if}
      </slot>

      <!-- Use `full` to allow labels on edge to not be cropped (bleed into padding) -->
      <ChartClipPath disabled={!brush} full>
        <slot name="highlight" {...slotProps}>
          <Highlight
            lines
            axis="both"
            {...props.highlight}
            points={{
              fill: activeSeries?.color,
              ...(typeof props.highlight?.points === 'object' ? props.highlight.points : null),
            }}
          />
        </slot>

        {#if labels}
          {#each visibleSeries as s, i (s.key)}
            <Labels {...getLabelsProps(s, i)} />
          {/each}
        {/if}
      </ChartClipPath>
    </svelte:component>

    <slot name="aboveContext" {...slotProps} />

    <slot name="legend" {...slotProps}>
      {#if legend}
        <Legend
          scale={isDefaultSeries
            ? undefined
            : scaleOrdinal(
                series.map((s) => s.key),
                series.map((s) => s.color)
              )}
          tickFormat={(key) => series.find((s) => s.key === key)?.label ?? key}
          placement="bottom"
          variant="swatches"
          onclick={(e, item) => $selectedSeries.toggleSelected(item.value)}
          onpointerenter={(e, item) => (highlightSeriesKey = item.value)}
          onpointerleave={(e) => (highlightSeriesKey = null)}
          {...props.legend}
          {...typeof legend === 'object' ? legend : null}
          classes={{
            item: (item) =>
              visibleSeries.length && !visibleSeries.some((s) => s.key === item.value)
                ? 'opacity-50'
                : '',
            ...props.legend?.classes,
            ...(typeof legend === 'object' ? legend.classes : null),
          }}
        />
      {/if}
    </slot>

    <slot name="tooltip" {...slotProps}>
      <Tooltip.Root {...props.tooltip?.root} let:data>
        {#if activeSeries?.key !== 'default'}
          <Tooltip.Header
            value={activeSeries?.label ?? activeSeries?.key}
            color={activeSeries?.color}
            {...props.tooltip?.header}
          />
        {/if}
        <Tooltip.List {...props.tooltip?.list}>
          <Tooltip.Item
            label={typeof config.x === 'string' ? config.x : 'x'}
            value={x(data)}
            {format}
            onpointerenter={() => (highlightSeriesKey = activeSeries?.key ?? null)}
            onpointerleave={() => (highlightSeriesKey = null)}
            {...props.tooltip?.item}
          />
          <Tooltip.Item
            label={typeof config.y === 'string' ? config.y : 'y'}
            value={y(data)}
            {format}
            onpointerenter={() => (highlightSeriesKey = activeSeries?.key ?? null)}
            onpointerleave={() => (highlightSeriesKey = null)}
            {...props.tooltip?.item}
          />
          {#if config.r}
            <Tooltip.Item
              label={typeof config.r === 'string' ? config.r : 'r'}
              value={r(data)}
              {format}
              onpointerenter={() => (highlightSeriesKey = activeSeries?.key ?? null)}
              onpointerleave={() => (highlightSeriesKey = null)}
              {...props.tooltip?.item}
            />
          {/if}
        </Tooltip.List>
      </Tooltip.Root>
    </slot>
  </slot>
</Chart>
