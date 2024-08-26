<script lang="ts" generics="TData">
  import { type ComponentProps } from 'svelte';
  import { scaleBand, scaleLinear } from 'd3-scale';
  import { format } from '@layerstack/utils';

  import Axis from '../Axis.svelte';
  import Bars from '../Bars.svelte';
  import Chart from '../Chart.svelte';
  import Highlight from '../Highlight.svelte';
  import Labels from '../Labels.svelte';
  import Svg from '../layout/Svg.svelte';
  import * as Tooltip from '../tooltip/index.js';

  import { accessor, type Accessor } from '../../utils/common.js';

  interface $$Props extends ComponentProps<Chart<TData>> {
    series?: typeof series;
    labels?: typeof labels;
    orientation?: typeof orientation;
    bandPadding?: typeof bandPadding;
    props?: typeof props;
  }

  export let data: $$Props['data'] = [];
  export let x: Accessor<TData> = undefined;
  export let y: Accessor<TData> = undefined;

  export let orientation: 'vertical' | 'horizontal' = 'vertical';
  $: isVertical = orientation === 'vertical';

  export let series: {
    label?: string;
    value: Accessor<TData>;
    color?: string;
    props?: Partial<ComponentProps<Bars>>;
  }[] = [{ value: orientation === 'vertical' ? y : x, color: 'hsl(var(--color-primary))' }];

  export let labels: ComponentProps<Labels> | boolean = false;
  export let bandPadding = 0.4;

  $: xScale = isVertical ? scaleBand().padding(bandPadding) : scaleLinear();
  $: xDomain = isVertical ? undefined : [0, null];

  $: yScale = isVertical ? scaleLinear() : scaleBand().padding(bandPadding);
  $: yDomain = isVertical ? [0, null] : undefined;

  export let props: {
    axisLeft?: Partial<ComponentProps<Axis>>;
    axisBottom?: Partial<ComponentProps<Axis>>;
    bars?: Partial<ComponentProps<Bars>>;
    highlight?: Partial<ComponentProps<Highlight>>;
    labels?: Partial<ComponentProps<Labels>>;
  } = {};
</script>

<Chart
  {data}
  x={x ?? series.map((s) => s.value)}
  {xScale}
  {xDomain}
  xNice={orientation === 'horizontal'}
  y={y ?? series.map((d) => d.value)}
  {yScale}
  {yDomain}
  yNice={orientation === 'vertical'}
  padding={{ left: 16, bottom: 16 }}
  tooltip={{ mode: 'band' }}
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
  {@const slotProps = { x, xScale, y, yScale, width, height, padding, tooltip }}
  <slot {...slotProps}>
    <Svg>
      <slot name="axis" {...slotProps}>
        <Axis
          placement="left"
          grid={isVertical}
          rule
          format={(value) => format(value, undefined, { variant: 'short' })}
          {...props.axisLeft}
        />
        <Axis
          placement="bottom"
          grid={!isVertical}
          rule
          format={(value) => format(value, undefined, { variant: 'short' })}
          {...props.axisBottom}
        />
      </slot>

      <slot name="before-marks" {...slotProps} />

      <slot name="marks" {...slotProps}>
        {#each series as s}
          <Bars
            x={isVertical ? undefined : s.value}
            y={isVertical ? s.value : undefined}
            radius={4}
            strokeWidth={1}
            fill={s.color}
            {...props.bars}
            {...s.props}
          />
        {/each}
      </slot>

      <slot name="after-marks" {...slotProps} />

      <slot name="highlight" {...slotProps}>
        <Highlight area {...props.highlight} />
      </slot>

      {#if labels}
        <Labels {...props.labels} {...typeof labels === 'object' ? labels : null} />
      {/if}
    </Svg>

    <slot name="tooltip" {...slotProps}>
      <Tooltip.Root let:data>
        <Tooltip.Header>{format(isVertical ? x(data) : y(data))}</Tooltip.Header>
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
