<script lang="ts" generics="TData">
  import { type ComponentProps } from 'svelte';
  import { scaleLinear, scaleOrdinal, scaleTime } from 'd3-scale';
  import { format } from '@layerstack/utils';

  import Axis from '../Axis.svelte';
  import Chart from '../Chart.svelte';
  import Grid from '../Grid.svelte';
  import Highlight from '../Highlight.svelte';
  import Labels from '../Labels.svelte';
  import Legend from '../Legend.svelte';
  import Points from '../Points.svelte';
  import Rule from '../Rule.svelte';
  import Svg from '../layout/Svg.svelte';
  import * as Tooltip from '../tooltip/index.js';

  import { accessor, chartDataArray, type Accessor } from '../../utils/common.js';

  interface $$Props extends ComponentProps<Chart<TData>> {
    axis?: typeof axis;
    grid?: typeof grid;
    labels?: typeof labels;
    legend?: typeof legend;
    props?: typeof props;
    series?: typeof series;
  }

  export let data: $$Props['data'] = [];
  export let x: Accessor<TData> = undefined;
  export let y: Accessor<TData> = undefined;

  export let series: {
    key: string;
    label?: string;
    data: TData[];
    color?: string;
    props?: Partial<ComponentProps<Points>>;
  }[] = [{ key: 'default', data: chartDataArray(data), color: 'hsl(var(--color-primary))' }];
  $: isDefaultSeries = series.length === 1 && series[0].key === 'default';

  export let axis: ComponentProps<Axis> | 'x' | 'y' | boolean = true;
  export let grid: ComponentProps<Grid> | boolean = true;
  export let labels: ComponentProps<Labels> | boolean = false;
  export let legend: ComponentProps<Legend> | boolean = false;
  export let rule: ComponentProps<Rule> | boolean = true;

  export let props: {
    xAxis?: Partial<ComponentProps<Axis>>;
    yAxis?: Partial<ComponentProps<Axis>>;
    grid?: Partial<ComponentProps<Grid>>;
    points?: Partial<ComponentProps<Points>>;
    highlight?: Partial<ComponentProps<Highlight>>;
    labels?: Partial<ComponentProps<Labels>>;
    legend?: Partial<ComponentProps<Legend>>;
    rule?: Partial<ComponentProps<Rule>>;
  } = {};

  // Default xScale based on first data's `x` value
  $: xScale = accessor(x)(chartDataArray(data)[0]) instanceof Date ? scaleTime() : scaleLinear();

  let chartData = series
    .flatMap((s) => s.data?.map((d) => ({ seriesKey: s.key, ...d })))
    .filter((d) => d) as Array<TData>;

  function getPointsProps(s: (typeof series)[number], i: number) {
    const pointsProps: ComponentProps<Points> = {
      data: s.data,
      stroke: s.color,
      fill: s.color,
      'fill-opacity': 0.3,
      ...props.points,
      ...s.props,
    };

    return pointsProps;
  }
</script>

<Chart
  data={chartData}
  {x}
  {xScale}
  {y}
  yNice
  padding={axis === false
    ? undefined
    : {
        left: axis === true || axis === 'y' ? 16 : 0,
        bottom: (axis === true || axis === 'x' ? 16 : 0) + (legend === true ? 32 : 0),
      }}
  tooltip={{ mode: 'voronoi' }}
  {...$$restProps}
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
  {@const slotProps = { x, xScale, y, yScale, c, cScale, width, height, padding, tooltip, series }}
  {@const activeSeries = tooltip.data
    ? (series.find((s) => s.key === tooltip.data.seriesKey) ?? series[0])
    : null}

  <slot {...slotProps}>
    <Svg>
      <slot name="grid" {...slotProps}>
        {#if grid}
          <Grid x y {...typeof grid === 'object' ? grid : null} {...props.grid} />
        {/if}
      </slot>

      <slot name="belowMarks" {...slotProps} />

      <slot name="marks" {...slotProps}>
        {#each series as s, i}
          <Points {...getPointsProps(s, i)} />
        {/each}
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
        <Labels
          format={(value) => format(value)}
          {...props.highlight}
          {...typeof labels === 'object' ? labels : null}
        />
      {/if}
    </Svg>

    <slot name="legend" {...slotProps}>
      {#if legend}
        <Legend
          scale={isDefaultSeries
            ? undefined
            : scaleOrdinal(
                series.map((s) => s.label ?? s.key),
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
        {#if activeSeries?.key !== 'default'}
          <Tooltip.Header color={activeSeries?.color}>
            {activeSeries?.label ?? activeSeries?.key}
          </Tooltip.Header>
        {/if}
        <Tooltip.List>
          <Tooltip.Item
            label={typeof config.x === 'string' ? config.x : 'x'}
            value={x(data)}
            {format}
          />
          <Tooltip.Item
            label={typeof config.y === 'string' ? config.y : 'y'}
            value={y(data)}
            {format}
          />
          {#if config.r}
            <Tooltip.Item
              label={typeof config.r === 'string' ? config.r : 'r'}
              value={r(data)}
              {format}
            />
          {/if}
        </Tooltip.List>
      </Tooltip.Root>
    </slot>
  </slot>
</Chart>
