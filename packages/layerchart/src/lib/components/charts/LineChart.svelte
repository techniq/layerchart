<script lang="ts" generics="TData">
  import Points from '../Points.svelte';

  import { type ComponentProps } from 'svelte';
  import { scaleLinear, scaleTime } from 'd3-scale';
  import { curveLinearClosed } from 'd3-shape';
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
    points?: typeof points;
    props?: typeof props;
  }

  export let data: $$Props['data'] = [];
  export let x: Accessor<TData> = undefined;
  export let y: Accessor<TData> = undefined;

  /** Use radial instead of cartesian coordinates, mapping `x` to `angle` and `y`` to radial.  Radial lines are positioned relative to the origin, use transform (ex. `<Group center>`) to change the origin */
  export let radial = false;

  export let series: {
    label?: string;
    value: Accessor<TData>;
    color?: string;
    props?: Partial<ComponentProps<Spline>>;
  }[] = [{ value: y, color: 'hsl(var(--color-primary))' }];

  export let labels: ComponentProps<Labels> | boolean = false;
  export let points: ComponentProps<Points> | boolean = false;

  // Default xScale based on first data's `x` value
  $: xScale = accessor(x)(chartDataArray(data)[0]) instanceof Date ? scaleTime() : scaleLinear();

  export let props: {
    xAxis?: Partial<ComponentProps<Axis>>;
    yAxis?: Partial<ComponentProps<Axis>>;
    spline?: Partial<ComponentProps<Spline>>;
    highlight?: Partial<ComponentProps<Highlight>>;
    labels?: Partial<ComponentProps<Labels>>;
    points?: Partial<ComponentProps<Points>>;
  } = {};
</script>

<Chart
  {data}
  {x}
  {xScale}
  xRange={$$props.xRange ?? (radial ? [0, 2 * Math.PI] : undefined)}
  y={y ?? series.map((d) => d.value)}
  yDomain={[0, null]}
  yRange={$$props.yRange ?? (radial ? ({ height }) => [0, height / 2] : undefined)}
  yNice
  {radial}
  padding={radial ? undefined : { left: 16, bottom: 16 }}
  tooltip={{ mode: radial ? 'voronoi' : 'bisect-x' }}
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
        {#each series as s}
          <Spline
            y={s.value}
            curve={radial ? curveLinearClosed : undefined}
            class="stroke-2"
            stroke={s.color}
            {...props.spline}
            {...s.props}
          />
        {/each}
      </slot>

      <slot name="above-marks" {...slotProps} />

      {#if points}
        {#each series as s, i}
          <Points
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
          <Highlight y={s.value} points={{ fill: s.color }} lines={i === 0} {...props.highlight} />
        {/each}
      </slot>
    </Svg>

    <slot name="tooltip" {...slotProps}>
      <Tooltip.Root let:data>
        <Tooltip.Header>{format(x(data))}</Tooltip.Header>
        <Tooltip.List>
          {#each series as s}
            {@const valueAccessor = accessor(s.value)}
            <Tooltip.Item
              label={s.label ?? 'value'}
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
