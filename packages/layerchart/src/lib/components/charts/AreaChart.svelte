<script lang="ts" generics="TData">
  import { type ComponentProps } from 'svelte';
  import { scaleLinear, scaleOrdinal, scaleTime } from 'd3-scale';
  import { stack, stackOffsetDiverging, stackOffsetExpand, stackOffsetNone } from 'd3-shape';
  import { sum } from 'd3-array';
  import { format } from '@layerstack/utils';

  import Area from '../Area.svelte';
  import Axis from '../Axis.svelte';
  import Chart from '../Chart.svelte';
  import Highlight from '../Highlight.svelte';
  import Labels from '../Labels.svelte';
  import Legend from '../Legend.svelte';
  import Line from '../Line.svelte';
  import Points from '../Points.svelte';
  import Rule from '../Rule.svelte';
  import Svg from '../layout/Svg.svelte';
  import * as Tooltip from '../tooltip/index.js';

  import { accessor, chartDataArray, type Accessor } from '../../utils/common.js';

  interface $$Props extends ComponentProps<Chart<TData>> {
    axis?: typeof axis;
    labels?: typeof labels;
    legend?: typeof legend;
    points?: typeof points;
    props?: typeof props;
    rule?: typeof rule;
    series?: typeof series;
    seriesLayout?: typeof seriesLayout;
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

  /** Determine how to layout series.  Overlap (default) or stack */
  export let seriesLayout: 'overlap' | 'stack' | 'stackExpand' | 'stackDiverging' = 'overlap';
  $: stackSeries = seriesLayout.startsWith('stack');

  export let axis: ComponentProps<Axis> | 'x' | 'y' | boolean = true;
  export let rule: ComponentProps<Rule> | boolean = true;
  export let labels: ComponentProps<Labels> | boolean = false;
  export let legend: ComponentProps<Legend> | boolean = false;
  export let points: ComponentProps<Points> | boolean = false;

  export let props: {
    xAxis?: Partial<ComponentProps<Axis>>;
    yAxis?: Partial<ComponentProps<Axis>>;
    rule?: Partial<ComponentProps<Rule>>;
    area?: Partial<ComponentProps<Area>>;
    line?: Partial<ComponentProps<Line>>;
    legend?: Partial<ComponentProps<Legend>>;
    points?: Partial<ComponentProps<Points>>;
    highlight?: Partial<ComponentProps<Highlight>>;
    labels?: Partial<ComponentProps<Labels>>;
  } = {};

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
  $: xScale = accessor(x)(chartData[0]) instanceof Date ? scaleTime() : scaleLinear();
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
  padding={radial || axis === false
    ? undefined
    : {
        left: axis === true || axis === 'y' ? 16 : 0,
        bottom: (axis === true || axis === 'x' ? 16 : 0) + (legend === true ? 32 : 0),
      }}
  tooltip={{ mode: 'bisect-x' }}
  {...$$restProps}
  let:x
  let:xScale
  let:y
  let:yScale
  let:width
  let:height
  let:padding
  let:tooltip
>
  {@const slotProps = { x, xScale, y, yScale, width, height, padding, tooltip, series }}
  <slot {...slotProps}>
    <Svg center={radial}>
      <slot name="axis" {...slotProps}>
        {#if axis}
          {#if axis !== 'x'}
            <Axis
              placement={radial ? 'radius' : 'left'}
              grid
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
              grid={radial}
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

      <slot name="below-marks" {...slotProps} />

      <slot name="marks" {...slotProps}>
        {#each series as s, i}
          {@const lineProps = {
            ...props.line,
            ...(typeof props.area?.line === 'object' ? props.area.line : null),
            ...(typeof s.props?.line === 'object' ? s.props.line : null),
          }}

          <Area
            data={s.data}
            y0={stackSeries
              ? (d) => d.stackData[i][0]
              : Array.isArray(s.value)
                ? s.value[0]
                : undefined}
            y1={stackSeries
              ? (d) => d.stackData[i][1]
              : Array.isArray(s.value)
                ? s.value[1]
                : (s.value ?? s.key)}
            fill={s.color}
            fill-opacity={0.3}
            {...props.area}
            {...s.props}
            line={{
              class: !('stroke-width' in lineProps) ? 'stroke-2' : '',
              stroke: s.color,
              ...lineProps,
            }}
          />
        {/each}
      </slot>

      <slot name="above-marks" {...slotProps} />

      {#if points}
        {#each series as s}
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
        {#each series as s, i}
          <Highlight
            y={stackSeries ? (d) => d.stackData[i][1] : (s.value ?? s.key)}
            points={{ fill: s.color }}
            lines={i == 0}
            {...props.highlight}
          />
        {/each}
      </slot>

      {#if labels}
        <Labels {...props.labels} {...typeof labels === 'object' ? labels : null} />
      {/if}
    </Svg>

    <slot name="legend" {...slotProps}>
      {#if legend}
        <Legend
          scale={scaleOrdinal(
            series.map((s) => s.key),
            series.map((s) => s.color)
          )}
          placement="bottom"
          variant="swatches"
          {...props.legend}
          {...typeof legend === 'object' ? legend : null}
        />
      {/if}
    </slot>

    <slot name="tooltip" {...slotProps}>
      <Tooltip.Root let:data>
        <Tooltip.Header>{format(x(data))}</Tooltip.Header>
        <Tooltip.List>
          <!-- Reverse series order so tooltip items match stacks -->
          {@const seriesItems = stackSeries ? [...series].reverse() : series}
          {#each seriesItems as s}
            {@const valueAccessor = accessor(s.value ?? s.key)}
            <Tooltip.Item
              label={s.label ?? (s.key !== 'default' ? s.key : 'value')}
              value={valueAccessor(data)}
              color={s.color}
              {format}
              valueAlign="right"
            />
          {/each}

          {#if stackSeries}
            <Tooltip.Separator />

            <Tooltip.Item
              label="total"
              value={sum(series, (s) => {
                const valueAccessor = accessor(s.value ?? s.key);
                return valueAccessor(data);
              })}
              format="integer"
              valueAlign="right"
            />
          {/if}
        </Tooltip.List>
      </Tooltip.Root>
    </slot>
  </slot>
</Chart>
