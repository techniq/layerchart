<script lang="ts" generics="TData">
  import { type ComponentProps } from 'svelte';
  import { scaleLinear, scaleOrdinal, scaleTime } from 'd3-scale';
  import { stack, stackOffsetDiverging, stackOffsetExpand, stackOffsetNone } from 'd3-shape';
  import { sum } from 'd3-array';
  import { format } from '@layerstack/utils';
  import { cls } from '@layerstack/tailwind';
  import { selectionStore } from '@layerstack/svelte-stores';

  import Area from '../Area.svelte';
  import Axis from '../Axis.svelte';
  import Canvas from '../layout/Canvas.svelte';
  import Chart from '../Chart.svelte';
  import Grid from '../Grid.svelte';
  import Highlight, { type HighlightPointData } from '../Highlight.svelte';
  import Labels from '../Labels.svelte';
  import Legend from '../Legend.svelte';
  import Line from '../Line.svelte';
  import Points from '../Points.svelte';
  import Rule from '../Rule.svelte';
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
    props?: typeof props;
    rule?: typeof rule;
    series?: typeof series;
    seriesLayout?: typeof seriesLayout;
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
    key: string;
    label?: string;
    value?: Accessor<TData>;
    /** Provider series data, else uses chart data (with value/key accessor) */
    data?: TData[];
    color?: string;
    props?: Partial<ComponentProps<Area>>;
  }[] = [{ key: 'default', value: y, color: 'hsl(var(--color-primary))' }];
  $: isDefaultSeries = series.length === 1 && series[0].key === 'default';

  /** Determine how to layout series.  Overlap (default) or stack */
  export let seriesLayout: 'overlap' | 'stack' | 'stackExpand' | 'stackDiverging' = 'overlap';
  $: stackSeries = seriesLayout.startsWith('stack');

  export let axis: ComponentProps<Axis> | 'x' | 'y' | boolean = true;
  export let grid: ComponentProps<Grid> | boolean = true;
  export let rule: ComponentProps<Rule> | boolean = true;
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
    area?: Partial<ComponentProps<Area>>;
    line?: Partial<ComponentProps<Line>>;
    legend?: Partial<ComponentProps<Legend>>;
    points?: Partial<ComponentProps<Points>>;
    highlight?: Partial<ComponentProps<Highlight>>;
    labels?: Partial<ComponentProps<Labels>>;
    tooltip?: {
      root?: Partial<ComponentProps<Tooltip.Root>>;
      header?: Partial<ComponentProps<Tooltip.Header>>;
      list?: Partial<ComponentProps<Tooltip.List>>;
      item?: Partial<ComponentProps<Tooltip.Item>>;
      separator?: Partial<ComponentProps<Tooltip.Separator>>;
    };
  } = {};

  export let renderContext: 'svg' | 'canvas' = 'svg';

  $: allSeriesData = series
    .flatMap((s) => s.data?.map((d) => ({ seriesKey: s.key, ...d })))
    .filter((d) => d) as Array<TData & { stackData?: any }>;

  $: chartData = (allSeriesData.length ? allSeriesData : chartDataArray(data)) as Array<
    TData & { stackData?: any }
  >;

  $: if (stackSeries) {
    const seriesKeys = series.map((s) => s.key);
    const offset =
      seriesLayout === 'stackExpand'
        ? stackOffsetExpand
        : seriesLayout === 'stackDiverging'
          ? stackOffsetDiverging
          : stackOffsetNone;
    const stackData = stack()
      .keys(seriesKeys)
      .value((d, key) => {
        const s = series.find((d) => d.key === key)!;
        return accessor(s.value ?? s.key)(d as any);
      })
      .offset(offset)(chartDataArray(data)) as any[];

    chartData = chartData.map((d, i) => {
      return {
        ...d,
        stackData: stackData.map((sd) => sd[i]),
      };
    });
  }

  // Default xScale based on first data's `x` value
  $: xScale =
    $$props.xScale ?? (accessor(x)(chartData[0]) instanceof Date ? scaleTime() : scaleLinear());

  let highlightSeriesKey: (typeof series)[number]['key'] | null = null;

  function getAreaProps(s: (typeof series)[number], i: number) {
    const lineProps = {
      ...props.line,
      ...(typeof props.area?.line === 'object' ? props.area.line : null),
      ...(typeof s.props?.line === 'object' ? s.props.line : null),
    };

    const areaProps: ComponentProps<Area> = {
      data: s.data,
      y0: stackSeries ? (d) => d.stackData[i][0] : Array.isArray(s.value) ? s.value[0] : undefined,
      y1: stackSeries
        ? (d) => d.stackData[i][1]
        : Array.isArray(s.value)
          ? s.value[1]
          : (s.value ?? (s.data ? undefined : s.key)),
      fill: s.color,
      fillOpacity: 0.3,
      class: cls(highlightSeriesKey && highlightSeriesKey !== s.key && 'opacity-20 saturate-0'),
      ...props.area,
      ...s.props,
      line: {
        class: cls(
          !('stroke-width' in lineProps) && 'stroke-2',
          highlightSeriesKey && highlightSeriesKey !== s.key && 'opacity-20 saturate-0'
        ),
        stroke: s.color,
        ...lineProps,
      },
    };

    return areaProps;
  }

  const selectedSeries = selectionStore();
  $: visibleSeries = series.filter((s) => {
    /*
      Show if:
        - none are selected
        - series is selected
        - series is highlighted
    */
    return (
      // @ts-expect-error
      $selectedSeries.selected.length === 0 ||
      $selectedSeries.isSelected(s.key) ||
      highlightSeriesKey == s.key
    );
  });
</script>

<Chart
  data={chartData}
  {x}
  {xScale}
  y={y ??
    (stackSeries
      ? (d) => series.flatMap((s, i) => d.stackData[i])
      : series.map((s) => s.value ?? s.key))}
  yBaseline={0}
  yNice
  {radial}
  padding={radial ? undefined : defaultChartPadding(axis, legend)}
  tooltip={{ mode: 'bisect-x', onClick: onTooltipClick }}
  {...$$restProps}
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
    getAreaProps,
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
          <Area {...getAreaProps(s, i)} />
        {/each}
      </slot>

      <slot name="aboveMarks" {...slotProps} />

      <slot name="axis" {...slotProps}>
        {#if axis}
          {#if axis !== 'x'}
            <Axis
              placement={radial ? 'radius' : 'left'}
              format={(value) => {
                if (seriesLayout === 'stackExpand') {
                  return format(value, 'percentRound');
                } else {
                  return format(value, undefined, { variant: 'short' });
                }
              }}
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
        {#each visibleSeries as s}
          <Points
            data={s.data}
            fill={s.color}
            class="stroke-surface-200"
            {...props.points}
            {...typeof points === 'object' ? points : null}
          />
        {/each}
      {/if}

      <slot name="highlight" {...slotProps}>
        {#each visibleSeries as s, i (s.key)}
          {@const seriesTooltipData =
            s.data && tooltip.data ? findRelatedData(s.data, tooltip.data, x) : null}

          <Highlight
            data={seriesTooltipData}
            y={stackSeries ? (d) => d.stackData[i][1] : (s.value ?? (s.data ? undefined : s.key))}
            points={{ fill: s.color }}
            lines={i == 0}
            onPointClick={(e) => onPointClick({ ...e, series: s })}
            onPointEnter={() => (highlightSeriesKey = s.key)}
            onPointLeave={() => (highlightSeriesKey = null)}
            {...props.highlight}
          />
        {/each}
      </slot>

      {#if labels}
        <Labels {...props.labels} {...typeof labels === 'object' ? labels : null} />
      {/if}
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
          classes={{
            item: (item) =>
              visibleSeries.length && !visibleSeries.some((s) => s.key === item.value)
                ? 'opacity-50'
                : '',
          }}
          {...props.legend}
          {...typeof legend === 'object' ? legend : null}
        />
      {/if}
    </slot>

    <slot name="tooltip" {...slotProps}>
      <Tooltip.Root {...props.tooltip?.root} let:data>
        <Tooltip.Header {...props.tooltip?.header}>{format(x(data))}</Tooltip.Header>
        <Tooltip.List {...props.tooltip?.list}>
          <!-- Reverse series order so tooltip items match stacks -->
          {@const seriesItems = stackSeries ? [...visibleSeries].reverse() : visibleSeries}
          {#each seriesItems as s}
            {@const seriesTooltipData = s.data ? findRelatedData(s.data, data, x) : data}
            {@const valueAccessor = accessor(s.value ?? (s.data ? asAny(y) : s.key))}

            <Tooltip.Item
              label={s.label ?? (s.key !== 'default' ? s.key : 'value')}
              value={seriesTooltipData ? valueAccessor(seriesTooltipData) : null}
              color={s.color}
              {format}
              valueAlign="right"
              {...props.tooltip?.item}
            />
          {/each}

          {#if stackSeries}
            <Tooltip.Separator {...props.tooltip?.separator} />

            <Tooltip.Item
              label="total"
              value={sum(series, (s) => {
                const seriesTooltipData = s.data ? s.data.find((d) => x(d) === x(data)) : data;
                const valueAccessor = accessor(s.value ?? (s.data ? asAny(y) : s.key));

                return valueAccessor(seriesTooltipData);
              })}
              format="integer"
              valueAlign="right"
              {...props.tooltip?.root}
            />
          {/if}
        </Tooltip.List>
      </Tooltip.Root>
    </slot>
  </slot>
</Chart>
