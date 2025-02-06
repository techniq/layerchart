<script lang="ts" generics="TData">
  import { onMount, type ComponentProps } from 'svelte';
  import { sum } from 'd3-array';
  import { format } from '@layerstack/utils';
  import { cls } from '@layerstack/tailwind';
  import { selectionStore } from '@layerstack/svelte-stores';

  import Arc from '../Arc.svelte';
  import Canvas from '../layout/Canvas.svelte';
  import Chart from '../Chart.svelte';
  import Group from '../Group.svelte';
  import Legend from '../Legend.svelte';
  import Pie from '../Pie.svelte';
  import Svg from '../layout/Svg.svelte';
  import * as Tooltip from '../tooltip/index.js';

  import { accessor, chartDataArray, type Accessor } from '../../utils/common.js';

  interface $$Props extends ComponentProps<Chart<TData>> {
    cornerRadius?: typeof cornerRadius;
    innerRadius?: typeof innerRadius;
    key?: typeof key;
    label?: typeof label;
    legend?: typeof legend;
    maxValue?: typeof maxValue;
    outerRadius?: typeof outerRadius;
    padAngle?: typeof padAngle;
    center?: typeof center;
    placement?: typeof placement;
    profile?: typeof profile;
    debug?: typeof debug;
    props?: typeof props;
    range?: typeof range;
    series?: typeof series;
    value?: typeof value;
    renderContext?: typeof renderContext;
    onarcclick?: typeof onarcclick;
    ontooltipclick?: typeof ontooltipclick;
  }

  export let data: $$Props['data'] = [];

  /** Key accessor */
  export let key: Accessor<TData> = 'key';
  $: keyAccessor = accessor(key);

  /** Label accessor */
  export let label: Accessor<TData> = 'label';
  $: labelAccessor = accessor(label);

  /** Value accessor */
  export let value: Accessor<TData> = 'value';
  $: valueAccessor = accessor(value);

  /** Maximum possible value, useful when `data` is single item */
  export let maxValue: number | undefined = undefined;

  export let series: {
    key: string | number;
    label?: string;
    value?: Accessor<TData>;
    /** Provider series data, else uses chart data (with value/key accessor) */
    data?: TData[];
    /** Maximum possible value, useful when `data` is single item */
    maxValue?: number;
    color?: string;
    props?: Partial<ComponentProps<Arc>>;
  }[] = [{ key: 'default', value: value /*, color: 'hsl(var(--color-primary))'*/ }];

  export let legend: ComponentProps<Legend> | boolean = false;

  /**
   * Range [min,max] in degrees.  See also startAngle/endAngle
   */
  export let range = [0, 360];

  /**
   * Define innerRadius.
   *   value >= 1: discrete value
   *   value >  0: percent of `outerRadius`
   *   value <  0: offset of `outerRadius`
   *   default: yRange min
   */
  export let innerRadius: number | undefined = undefined;

  /**
   * Define outerRadius.  Defaults to yRange max/2 (ie. chart height / 2)
   */
  export let outerRadius: number | undefined = undefined;

  export let cornerRadius = 0;
  export let padAngle = 0;

  /** Placement of PieChart (default: 'center') */
  export let placement: 'left' | 'center' | 'right' = 'center';

  /** Center chart.  Override and use `props.group` for more control */
  export let center = placement === 'center';

  // TODO: Not usable with manual tooltip / arc path.  Use `onarcclick`?
  /** Event dispatched with current tooltip data */
  export let ontooltipclick: (e: MouseEvent, detail: { data: any }) => void = () => {};

  /** Event dispatched when individual Arc is clicked  (useful with multiple series) */
  export let onarcclick: (
    e: MouseEvent,
    detail: { data: any; series: (typeof series)[number] }
  ) => void = () => {};

  export let props: {
    pie?: Partial<ComponentProps<Pie>>;
    group?: Partial<ComponentProps<Group>>;
    arc?: Partial<ComponentProps<Arc>>;
    legend?: Partial<ComponentProps<Legend>>;
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

  /** Enable debug mode */
  export let debug = false;

  $: allSeriesData = series
    .flatMap((s) => s.data?.map((d) => ({ seriesKey: s.key, ...d })))
    .filter((d) => d) as Array<TData>;

  $: chartData = (allSeriesData.length ? allSeriesData : chartDataArray(data)) as Array<TData>;

  $: seriesColors = series.map((s) => s.color).filter((d) => d != null);

  let highlightKey: (typeof series)[number]['key'] | null = null;

  const selectedKeys = selectionStore();
  $: visibleData = chartData.filter((d) => {
    const dataKey = keyAccessor(d);
    return (
      // @ts-expect-error
      $selectedKeys.selected.length === 0 || $selectedKeys.isSelected(dataKey)
      // || highlightKey == dataKey
    );
  });

  if (profile) {
    console.time('PieChart render');
    onMount(() => {
      console.timeEnd('PieChart render');
    });
  }
</script>

<Chart
  data={visibleData}
  x={value}
  y={key}
  c={key}
  cDomain={chartData.map(keyAccessor)}
  cRange={seriesColors.length
    ? seriesColors
    : [
        'hsl(var(--color-primary))',
        'hsl(var(--color-secondary))',
        'hsl(var(--color-info))',
        'hsl(var(--color-success))',
        'hsl(var(--color-warning))',
        'hsl(var(--color-danger))',
      ]}
  padding={{ bottom: legend === true ? 32 : 0 }}
  {...$$restProps}
  tooltip={props.tooltip?.context}
  let:x
  let:xScale
  let:y
  let:c
  let:cScale
  let:yScale
  let:width
  let:height
  let:padding
  let:tooltip
>
  {@const slotProps = {
    key,
    label,
    value,
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
    visibleData,
  }}
  <slot {...slotProps}>
    <svelte:component this={renderContext === 'canvas' ? Canvas : Svg} {center} {debug}>
      <slot name="belowMarks" {...slotProps} />

      <slot name="marks" {...slotProps}>
        <Group
          x={placement === 'left'
            ? height / 2
            : placement === 'right'
              ? width - height / 2
              : undefined}
          center={['left', 'right'].includes(placement) ? 'y' : undefined}
          {...props.group}
        >
          {#each series as s, i (s.key)}
            {@const singleArc = s.data?.length === 1 || chartData.length === 1}
            {#if singleArc}
              {@const d = s.data?.[0] || chartData[0]}
              <Arc
                value={valueAccessor(d)}
                domain={[0, s.maxValue ?? maxValue ?? sum(chartData, valueAccessor)]}
                {range}
                {innerRadius}
                outerRadius={(outerRadius ?? 0) < 0 ? i * (outerRadius ?? 0) : outerRadius}
                {cornerRadius}
                {padAngle}
                fill={s.color ?? cScale?.(c(d))}
                track={{ fill: s.color ?? cScale?.(c(d)), 'fill-opacity': 0.1 }}
                {tooltip}
                data={d}
                onclick={(e) => {
                  onarcclick(e, { data: d, series: s });
                  // Workaround for `tooltip={{ mode: 'manual' }}
                  ontooltipclick(e, { data: d });
                }}
                {...props.arc}
                {...s.props}
                class={cls(
                  'transition-opacity',
                  highlightKey && highlightKey !== keyAccessor(d) && 'opacity-50',
                  props.arc?.class,
                  s.props?.class
                )}
              />
            {:else}
              <Pie
                data={s.data}
                {range}
                {innerRadius}
                {outerRadius}
                {cornerRadius}
                {padAngle}
                {...props.pie}
                let:arcs
              >
                {#each arcs as arc}
                  <Arc
                    startAngle={arc.startAngle}
                    endAngle={arc.endAngle}
                    outerRadius={series.length > 1 ? i * (outerRadius ?? 0) : outerRadius}
                    {innerRadius}
                    {cornerRadius}
                    {padAngle}
                    fill={cScale?.(c(arc.data))}
                    data={arc.data}
                    {tooltip}
                    onclick={(e) => {
                      onarcclick(e, { data: arc.data, series: s });
                      // Workaround for `tooltip={{ mode: 'manual' }}
                      ontooltipclick(e, { data: arc.data });
                    }}
                    class={cls(
                      'transition-opacity',
                      highlightKey && highlightKey !== keyAccessor(arc.data) && 'opacity-50'
                    )}
                    {...props.arc}
                    {...s.props}
                  />
                {/each}
              </Pie>
            {/if}
          {/each}
        </Group>
      </slot>

      <slot name="aboveMarks" {...slotProps} />
    </svelte:component>

    <slot name="legend" {...slotProps}>
      {#if legend}
        <Legend
          tickFormat={(tick) => {
            const item = chartData.find((d) => keyAccessor(d) === tick);
            return item ? (labelAccessor(item) ?? tick) : tick;
          }}
          placement="bottom"
          variant="swatches"
          onclick={(e, item) => $selectedKeys.toggleSelected(item.value)}
          onpointerenter={(e, item) => (highlightKey = item.value)}
          onpointerleave={(e) => (highlightKey = null)}
          {...props.legend}
          {...typeof legend === 'object' ? legend : null}
          classes={{
            item: (item) =>
              visibleData.length && !visibleData.some((d) => keyAccessor(d) === item.value)
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
        <Tooltip.List {...props.tooltip?.list}>
          <Tooltip.Item
            label={labelAccessor(data) || keyAccessor(data)}
            value={valueAccessor(data)}
            color={cScale?.(c(data))}
            {format}
            {...props.tooltip?.item}
          />
        </Tooltip.List>
      </Tooltip.Root>
    </slot>
  </slot>
</Chart>
