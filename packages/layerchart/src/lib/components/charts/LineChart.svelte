<script lang="ts" generics="TData">
  import { onMount, type ComponentProps } from 'svelte';
  import { scaleLinear, scaleOrdinal, scaleTime } from 'd3-scale';
  import { format } from '@layerstack/utils';
  import { cls } from '@layerstack/tailwind';
  import { selectionStore } from '@layerstack/svelte-stores';

  import Axis from '../Axis.svelte';
  import Canvas from '../layout/Canvas.svelte';
  import Chart from '../Chart.svelte';
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
    grid?: typeof grid;
    labels?: typeof labels;
    legend?: typeof legend;
    points?: typeof points;
    profile?: typeof profile;
    props?: typeof props;
    rule?: typeof rule;
    series?: typeof series;
    renderContext?: typeof renderContext;
    onPointClick?: typeof onPointClick;
    onTooltipClick?: typeof onTooltipClick;
  }

  export let data: $$Props['data'] = [];
  export let x: Accessor<TData> = undefined;
  export let y: Accessor<TData> = undefined;

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
  export let rule: ComponentProps<Rule> | boolean = true;
  export let grid: ComponentProps<Grid> | boolean = true;
  export let labels: ComponentProps<Labels> | boolean = false;
  export let legend: ComponentProps<Legend> | boolean = false;
  export let points: ComponentProps<Points> | boolean = false;

  /** Event dispatched with current tooltip data */
  export let onTooltipClick: (e: { data: any }) => void = () => {};

  /** Event dispatched when Highlight point is clicked (useful with multiple series) */
  export let onPointClick: (e: {
    data: HighlightPointData;
    series: (typeof series)[number];
  }) => void = () => {};

  export let props: {
    xAxis?: Partial<ComponentProps<Axis>>;
    yAxis?: Partial<ComponentProps<Axis>>;
    grid?: Partial<ComponentProps<Grid>>;
    rule?: Partial<ComponentProps<Rule>>;
    spline?: Partial<ComponentProps<Spline>>;
    legend?: Partial<ComponentProps<Legend>>;
    highlight?: Partial<ComponentProps<Highlight>>;
    labels?: Partial<ComponentProps<Labels>>;
    points?: Partial<ComponentProps<Points>>;
    tooltip?: {
      context?: Partial<ComponentProps<Tooltip.Context>>;
      root?: Partial<ComponentProps<Tooltip.Root>>;
      header?: Partial<ComponentProps<Tooltip.Header>>;
      list?: Partial<ComponentProps<Tooltip.List>>;
      item?: Partial<ComponentProps<Tooltip.Item>>;
      separator?: Partial<ComponentProps<Tooltip.Separator>>;
    };
  } = {};

  export let renderContext: 'svg' | 'canvas' = 'svg';

  /** Log initial render performance using `console.time` */
  export let profile = false;

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
    <svelte:component this={renderContext === 'canvas' ? Canvas : Svg} center={radial}>
      <slot name="grid" {...slotProps}>
        {#if grid}
          <Grid x={radial} y {...typeof grid === 'object' ? grid : null} {...props.grid} />
        {/if}
      </slot>

      <slot name="belowMarks" {...slotProps} />

      <slot name="marks" {...slotProps}>
        {#each visibleSeries as s, i (s.key)}
          <Spline {...getSplineProps(s, i)} />
        {/each}
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
            points={{ fill: s.color }}
            lines={i === 0}
            onPointClick={(e) => onPointClick({ ...e, series: s })}
            onPointEnter={() => (highlightSeriesKey = s.key)}
            onPointLeave={() => (highlightSeriesKey = null)}
            {...props.highlight}
          />
        {/each}
      </slot>
    </svelte:component>

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
