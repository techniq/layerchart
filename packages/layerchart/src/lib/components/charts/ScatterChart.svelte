<script lang="ts" generics="TData">
  import { onMount, type ComponentProps } from 'svelte';
  import { scaleLinear, scaleOrdinal, scaleTime } from 'd3-scale';
  import { format } from '@layerstack/utils';
  import { cls } from '@layerstack/tailwind';
  import { selectionStore } from '@layerstack/svelte-stores';

  import Axis from '../Axis.svelte';
  import Brush from '../Brush.svelte';
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
    onTooltipClick?: typeof onTooltipClick;
  }

  export let data: $$Props['data'] = [];
  export let x: Accessor<TData> = undefined;
  export let y: Accessor<TData> = undefined;

  /** Set xDomain.  Useful for external brush control */
  export let xDomain: ComponentProps<typeof Brush>['xDomain'] = undefined;
  /** Set yDomain.  Useful for external brush control */
  export let yDomain: ComponentProps<typeof Brush>['yDomain'] = undefined;

  export let series: {
    key: string;
    label?: string;
    data: TData[];
    color?: string;
    props?: Partial<ComponentProps<Points>>;
  }[] = [{ key: 'default', data: chartDataArray(data), color: 'hsl(var(--color-primary))' }];
  $: isDefaultSeries = series.length === 1 && series[0].key === 'default';

  export let axis: ComponentProps<Axis> | 'x' | 'y' | boolean = true;
  export let brush: ComponentProps<Brush> | boolean = false;
  export let grid: ComponentProps<Grid> | boolean = true;
  export let labels: ComponentProps<Labels> | boolean = false;
  export let legend: ComponentProps<Legend> | boolean = false;
  export let rule: ComponentProps<Rule> | boolean = true;

  /** Event dispatched with current tooltip data */
  export let onTooltipClick: (e: { data: any }) => void = () => {};

  export let props: {
    brush?: Partial<ComponentProps<Brush>>;
    grid?: Partial<ComponentProps<Grid>>;
    highlight?: Partial<ComponentProps<Highlight>>;
    labels?: Partial<ComponentProps<Labels>>;
    legend?: Partial<ComponentProps<Legend>>;
    points?: Partial<ComponentProps<Points>>;
    rule?: Partial<ComponentProps<Rule>>;
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

  function getPointsProps(s: (typeof series)[number], i: number) {
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
  }

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
        onClick: onTooltipClick,
        ...props.tooltip?.context,
        ...$$props.tooltip,
      }}
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
  }}
  {@const activeSeries = tooltip.data
    ? (series.find((s) => s.key === tooltip.data.seriesKey) ?? series[0])
    : null}

  <slot {...slotProps}>
    <svelte:component this={renderContext === 'canvas' ? Canvas : Svg}>
      <slot name="grid" {...slotProps}>
        {#if grid}
          <Grid x y {...typeof grid === 'object' ? grid : null} {...props.grid} />
        {/if}
      </slot>

      <slot name="belowMarks" {...slotProps} />

      <slot name="marks" {...slotProps}>
        <ChartClipPath disabled={!brush}>
          {#each visibleSeries as s, i (s.key)}
            <Points {...getPointsProps(s, i)} />
          {/each}
        </ChartClipPath>
      </slot>

      <slot name="aboveMarks" {...slotProps} />

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

      <slot name="highlight" {...slotProps}>
        <Highlight points={{ fill: activeSeries?.color }} lines axis="both" {...props.highlight} />
      </slot>

      {#if labels}
        {#each visibleSeries as s, i (s.key)}
          <Labels {...getLabelsProps(s, i)} />
        {/each}
      {/if}
    </svelte:component>

    <!-- TODO: Determine how to coordinate with `tooltip={{ mode: 'voronoi' }} -->
    {#if brush && (brush === true || brush.mode == undefined || brush.mode === 'integrated')}
      <Svg>
        {@const brushProps = { ...(typeof brush === 'object' ? brush : null), ...props.brush }}
        <Brush
          axis="both"
          resetOnEnd
          {xDomain}
          {yDomain}
          {...brushProps}
          onBrushEnd={(e) => {
            xDomain = e.xDomain;
            yDomain = e.yDomain;
            brushProps.onBrushEnd?.(e);
          }}
        />
      </Svg>
    {/if}

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
          onClick={(item) => $selectedSeries.toggleSelected(item.value)}
          onPointerEnter={(item) => (highlightSeriesKey = item.value)}
          onPointerLeave={(item) => (highlightSeriesKey = null)}
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
            {...props.tooltip?.item}
          />
          <Tooltip.Item
            label={typeof config.y === 'string' ? config.y : 'y'}
            value={y(data)}
            {format}
            {...props.tooltip?.item}
          />
          {#if config.r}
            <Tooltip.Item
              label={typeof config.r === 'string' ? config.r : 'r'}
              value={r(data)}
              {format}
              {...props.tooltip?.item}
            />
          {/if}
        </Tooltip.List>
      </Tooltip.Root>
    </slot>
  </slot>
</Chart>
