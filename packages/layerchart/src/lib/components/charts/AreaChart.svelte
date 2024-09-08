<script lang="ts" generics="TData">
  import { type ComponentProps } from 'svelte';
  import { scaleLinear, scaleTime } from 'd3-scale';
  import { stack } from 'd3-shape';
  import { sum } from 'd3-array';
  import { format } from '@layerstack/utils';

  import Area from '../Area.svelte';
  import Axis from '../Axis.svelte';
  import Chart from '../Chart.svelte';
  import Highlight from '../Highlight.svelte';
  import Labels from '../Labels.svelte';
  import Points from '../Points.svelte';
  import Svg from '../layout/Svg.svelte';
  import * as Tooltip from '../tooltip/index.js';

  import { accessor, chartDataArray, type Accessor } from '../../utils/common.js';

  interface $$Props extends ComponentProps<Chart<TData>> {
    series?: typeof series;
    labels?: typeof labels;
    points?: typeof points;
    props?: typeof props;
    stackSeries?: typeof stackSeries;
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
    data?: TData[];
    color?: string;
    props?: Partial<ComponentProps<Area>>;
  }[] = [{ key: 'default', value: y, color: 'hsl(var(--color-primary))' }];

  /** Stack instead of overlap series */
  export let stackSeries = false;

  export let labels: ComponentProps<Labels> | boolean = false;
  export let points: ComponentProps<Points> | boolean = false;

  export let props: {
    xAxis?: Partial<ComponentProps<Axis>>;
    yAxis?: Partial<ComponentProps<Axis>>;
    area?: Partial<ComponentProps<Area>>;
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

    const stackData = stack().keys(seriesKeys)(chartDataArray(data)) as any[];

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
  xRange={$$props.xRange ?? (radial ? [0, 2 * Math.PI] : undefined)}
  y={y ??
    (stackSeries
      ? (d) => series.map((s, i) => d.stackData[i][1])
      : series.map((s) => s.value ?? s.key))}
  yDomain={[0, null]}
  yRange={$$props.yRange ?? (radial ? ({ height }) => [0, height / 2] : undefined)}
  yNice
  {radial}
  padding={radial ? undefined : { left: 16, bottom: 16 }}
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
        <Axis
          placement={radial ? 'radius' : 'left'}
          grid
          rule
          format={(value) => format(value, undefined, { variant: 'short' })}
          {...props.yAxis}
        />
        <Axis
          placement={radial ? 'angle' : 'bottom'}
          grid={radial}
          rule
          format={(value) => format(value, undefined, { variant: 'short' })}
          {...props.xAxis}
        />
      </slot>

      <slot name="below-marks" {...slotProps} />

      <slot name="marks" {...slotProps}>
        {#each series as s, i}
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
            line={{ class: 'stroke-2', stroke: s.color }}
            fill={s.color}
            fill-opacity={0.3}
            {...props.area}
            {...s.props}
          />
        {/each}
      </slot>

      <slot name="above-marks" {...slotProps} />

      {#if points}
        {#each series as s, i}
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
