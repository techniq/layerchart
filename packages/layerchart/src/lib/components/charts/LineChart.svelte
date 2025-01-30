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
  import Highlight, { type HighlightPointData } from '../Highlight.svelte';
  import Labels from '../Labels.svelte';
  import Legend from '../Legend.svelte';
  import Points from '../Points.svelte';
  import Rule from '../Rule.svelte';
  import Spline from '../Spline.svelte';
  import Svg from '../layout/Svg.svelte';
  import * as Tooltip from '../tooltip/index.js';

  import {
    accessor,
    chartDataArray,
    defaultChartPadding,
    findRelatedData,
    type Accessor,
  } from '../../utils/common.js';
  import { asAny } from '../../utils/types.js';

  interface $$Props extends ComponentProps<Chart<TData>> {
    axis?: typeof axis;
    brush?: typeof brush;
    debug?: typeof debug;
    grid?: typeof grid;
    labels?: typeof labels;
    legend?: typeof legend;
    points?: typeof points;
    profile?: typeof profile;
    props?: typeof props;
    rule?: typeof rule;
    series?: typeof series;
    renderContext?: typeof renderContext;
    onpointclick?: typeof onpointclick;
    ontooltipclick?: typeof ontooltipclick;
  }

  export let data: $$Props['data'] = [];
  export let x: Accessor<TData> = undefined;
  export let y: Accessor<TData> = undefined;

  /** Set xDomain.  Useful for external brush control */
  export let xDomain: ComponentProps<typeof Brush>['xDomain'] = undefined;

  /** Use radial instead of cartesian coordinates, mapping `x` to `angle` and `y`` to radial.  Radial lines are positioned relative to the origin, use transform (ex. `<Group center>`) to change the origin */
  export let radial = false;

  export let series: {
    key: string | number;
    label?: string;
    value?: Accessor<TData>;
    /** Provider series data, else uses chart data (with value/key accessor) */
    data?: TData[];
    color?: string;
    props?: Partial<ComponentProps<Spline>>;
  }[] = [{ key: 'default', value: y, color: 'hsl(var(--color-primary))' }];
  $: isDefaultSeries = series.length === 1 && series[0].key === 'default';

  export let axis: ComponentProps<Axis> | 'x' | 'y' | boolean = true;
  export let brush: ComponentProps<Brush> | boolean = false;
  export let grid: ComponentProps<Grid> | boolean = true;
  export let labels: ComponentProps<Labels> | boolean = false;
  export let legend: ComponentProps<Legend> | boolean = false;
  export let points: ComponentProps<Points> | boolean = false;
  export let rule: ComponentProps<Rule> | boolean = true;

  /** Event dispatched with current tooltip data */
  export let ontooltipclick: (e: MouseEvent, details: { data: any }) => void = () => {};

  /** Event dispatched when Highlight point is clicked (useful with multiple series) */
  export let onpointclick: (
    e: MouseEvent,
    details: {
      data: HighlightPointData;
      series: (typeof series)[number];
    }
  ) => void = () => {};

  export let props: {
    brush?: Partial<ComponentProps<Brush>>;
    grid?: Partial<ComponentProps<Grid>>;
    highlight?: Partial<ComponentProps<Highlight>>;
    labels?: Partial<ComponentProps<Labels>>;
    legend?: Partial<ComponentProps<Legend>>;
    points?: Partial<ComponentProps<Points>>;
    rule?: Partial<ComponentProps<Rule>>;
    spline?: Partial<ComponentProps<Spline>>;
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

  $: allSeriesData = series
    .flatMap((s) => s.data?.map((d) => ({ seriesKey: s.key, ...d })))
    .filter((d) => d) as Array<TData & { stackData?: any }>;

  $: chartData = (allSeriesData.length ? allSeriesData : chartDataArray(data)) as Array<
    TData & { stackData?: any }
  >;

  // Default xScale based on first data's `x` value
  $: xScale =
    $$props.xScale ?? (accessor(x)(chartData[0]) instanceof Date ? scaleTime() : scaleLinear());

  let highlightSeriesKey: (typeof series)[number]['key'] | null = null;

  function getSplineProps(s: (typeof series)[number], i: number) {
    const splineProps: ComponentProps<Spline> = {
      data: s.data,
      y: s.value ?? (s.data ? undefined : s.key),
      stroke: s.color,
      ...props.spline,
      ...s.props,
      class: cls(
        'transition-opacity',
        highlightSeriesKey && highlightSeriesKey !== s.key && 'opacity-10',
        props.spline?.class,
        s.props?.class
      ),
    };

    return splineProps;
  }

  function getPointsProps(s: (typeof series)[number], i: number) {
    const pointsProps: ComponentProps<Points> = {
      data: s.data,
      y: s.value ?? (s.data ? undefined : s.key),
      fill: s.color,
      ...props.points,
      ...(typeof points === 'object' ? points : null),
      class: cls(
        'stroke-surface-200 transition-opacity',
        highlightSeriesKey && highlightSeriesKey !== s.key && 'opacity-10',
        props.points?.class,
        typeof points === 'object' && points.class
      ),
    };

    return pointsProps;
  }

  function getLabelsProps(s: (typeof series)[number], i: number) {
    const labelsProps: ComponentProps<Labels> = {
      data: s.data,
      y: s.value ?? (s.data ? undefined : s.key),
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
    console.time('LineChart render');
    onMount(() => {
      console.timeEnd('LineChart render');
    });
  }
</script>

<Chart
  data={chartData}
  {x}
  {xDomain}
  {xScale}
  y={y ?? series.map((s) => s.value ?? s.key)}
  yBaseline={0}
  yNice
  {radial}
  padding={radial ? undefined : defaultChartPadding(axis, legend)}
  {...$$restProps}
  tooltip={$$props.tooltip === false
    ? false
    : {
        mode: 'bisect-x',
        onclick: ontooltipclick,
        debug,
        ...props.tooltip?.context,
        ...$$props.tooltip,
      }}
  let:x
  let:xScale
  let:y
  let:yScale
  let:c
  let:cScale
  let:width
  let:height
  let:padding
  let:tooltip
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
    getSplineProps,
  }}
  <slot {...slotProps}>
    <svelte:component this={renderContext === 'canvas' ? Canvas : Svg} center={radial} {debug}>
      <slot name="grid" {...slotProps}>
        {#if grid}
          <Grid x={radial} y {...typeof grid === 'object' ? grid : null} {...props.grid} />
        {/if}
      </slot>

      <slot name="belowMarks" {...slotProps} />

      <slot name="marks" {...slotProps}>
        <ChartClipPath disabled={!brush}>
          {#each visibleSeries as s, i (s.key)}
            <Spline {...getSplineProps(s, i)} />
          {/each}
        </ChartClipPath>
      </slot>

      <slot name="aboveMarks" {...slotProps} />

      <slot name="axis" {...slotProps}>
        {#if axis}
          {#if axis !== 'x'}
            <Axis
              placement={radial ? 'radius' : 'left'}
              format={(value) => format(value, undefined, { variant: 'short' })}
              {...typeof axis === 'object' ? axis : null}
              {...props.yAxis}
            />
          {/if}

          {#if axis !== 'y'}
            <Axis
              placement={radial ? 'angle' : 'bottom'}
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

      {#if points}
        {#each visibleSeries as s, i (s.key)}
          <Points {...getPointsProps(s, i)} />
        {/each}
      {/if}

      {#if labels}
        {#each visibleSeries as s, i (s.key)}
          <Labels {...getLabelsProps(s, i)} />
        {/each}
      {/if}

      <slot name="highlight" {...slotProps}>
        {#each visibleSeries as s, i (s.key)}
          {@const seriesTooltipData =
            s.data && tooltip.data ? findRelatedData(s.data, tooltip.data, x) : null}
          <Highlight
            data={seriesTooltipData}
            y={s.value ?? (s.data ? undefined : s.key)}
            points={{
              fill: s.color,
              class: cls(
                'transition-opacity',
                highlightSeriesKey && highlightSeriesKey !== s.key && 'opacity-10'
              ),
            }}
            lines={i === 0}
            onpointclick={(e, detail) => onpointclick(e, { ...detail, series: s })}
            onpointenter={() => (highlightSeriesKey = s.key)}
            onpointleave={() => (highlightSeriesKey = null)}
            {...props.highlight}
          />
        {/each}
      </slot>
    </svelte:component>

    {#if brush && (brush === true || brush.mode == undefined || brush.mode === 'integrated')}
      <Svg>
        {@const brushProps = { ...(typeof brush === 'object' ? brush : null), ...props.brush }}
        <Brush
          axis="x"
          resetOnEnd
          {xDomain}
          {...brushProps}
          onbrushend={(e) => {
            xDomain = e.xDomain;
            brushProps.onbrushend?.(e);
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
        <Tooltip.Header value={x(data)} {format} {...props.tooltip?.header} />
        <Tooltip.List {...props.tooltip?.list}>
          {#each visibleSeries as s}
            {@const seriesTooltipData = s.data ? findRelatedData(s.data, data, x) : data}
            {@const valueAccessor = accessor(s.value ?? (s.data ? asAny(y) : s.key))}

            <Tooltip.Item
              label={s.label ?? (s.key !== 'default' ? s.key : 'value')}
              value={seriesTooltipData ? valueAccessor(seriesTooltipData) : null}
              color={s.color}
              {format}
              {...props.tooltip?.item}
            />
          {/each}
        </Tooltip.List>
      </Tooltip.Root>
    </slot>
  </slot>
</Chart>
