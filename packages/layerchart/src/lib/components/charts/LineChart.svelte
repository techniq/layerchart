<script lang="ts" generics="TData">
  import Points from '../Points.svelte';

  import { type ComponentProps } from 'svelte';
  import { scaleLinear, scaleTime } from 'd3-scale';
  import { format } from '@layerstack/utils';

  import Axis from '../Axis.svelte';
  import Chart from '../Chart.svelte';
  import Highlight from '../Highlight.svelte';
  import Labels from '../Labels.svelte';
  import Spline from '../Spline.svelte';
  import Svg from '../layout/Svg.svelte';
  import * as Tooltip from '../tooltip/index.js';

  import { accessor, chartDataArray, type Accessor } from '../../utils/common.js';

  interface $$Props extends ComponentProps<Chart<TData>> {
    series?: typeof series;
    labels?: typeof labels;
    axis?: typeof axis;
    points?: typeof points;
    props?: typeof props;
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

  export let axis: ComponentProps<Axis> | boolean = true;
  export let labels: ComponentProps<Labels> | boolean = false;
  export let points: ComponentProps<Points> | boolean = false;

  export let props: {
    xAxis?: Partial<ComponentProps<Axis>>;
    yAxis?: Partial<ComponentProps<Axis>>;
    spline?: Partial<ComponentProps<Spline>>;
    highlight?: Partial<ComponentProps<Highlight>>;
    labels?: Partial<ComponentProps<Labels>>;
    points?: Partial<ComponentProps<Points>>;
  } = {};

  $: allSeriesData = series
    .flatMap((s) => s.data?.map((d) => ({ seriesKey: s.key, ...d })))
    .filter((d) => d) as Array<TData & { stackData?: any }>;

  $: chartData = (allSeriesData.length ? allSeriesData : chartDataArray(data)) as Array<
    TData & { stackData?: any }
  >;

  // Default xScale based on first data's `x` value
  $: xScale = accessor(x)(chartData[0]) instanceof Date ? scaleTime() : scaleLinear();
</script>

<Chart
  data={chartData}
  {x}
  {xScale}
  y={y ?? series.map((s) => s.value ?? s.key)}
  yBaseline={0}
  yNice
  {radial}
  padding={radial || axis === false ? undefined : { left: 16, bottom: 16 }}
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
          <Axis
            placement={radial ? 'radius' : 'left'}
            grid
            rule
            format={(value) => format(value, undefined, { variant: 'short' })}
            {...typeof axis === 'object' ? axis : null}
            {...props.yAxis}
          />
          <Axis
            placement={radial ? 'angle' : 'bottom'}
            grid={radial}
            rule
            format={(value) => format(value, undefined, { variant: 'short' })}
            {...typeof axis === 'object' ? axis : null}
            {...props.xAxis}
          />
        {/if}
      </slot>

      <slot name="below-marks" {...slotProps} />

      <slot name="marks" {...slotProps}>
        {#each series as s}
          <Spline
            data={s.data}
            y={s.value ?? (s.data ? undefined : s.key)}
            class="stroke-2"
            stroke={s.color}
            {...props.spline}
            {...s.props}
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

      {#if labels}
        <Labels {...props.labels} {...typeof labels === 'object' ? labels : null} />
      {/if}

      <slot name="highlight" {...slotProps}>
        {#each series as s, i}
          <Highlight
            data={s.data}
            y={s.value ?? s.key}
            points={{ fill: s.color }}
            lines={i === 0}
            {...props.highlight}
          />
        {/each}
      </slot>
    </Svg>

    <slot name="tooltip" {...slotProps}>
      <Tooltip.Root let:data>
        <Tooltip.Header>{format(x(data))}</Tooltip.Header>
        <Tooltip.List>
          {#each series as s}
            {@const valueAccessor = accessor(s.value ?? s.key)}
            <Tooltip.Item
              label={s.label ?? (s.key !== 'default' ? s.key : 'value')}
              value={valueAccessor(data)}
              color={s.color}
              {format}
            />
          {/each}
        </Tooltip.List>
      </Tooltip.Root>
    </slot>
  </slot>
</Chart>
