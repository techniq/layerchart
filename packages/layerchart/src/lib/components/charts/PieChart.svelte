<script lang="ts" module>
  export type PieChartExtraSnippetProps<TData> = {
    key: Accessor<TData>;
    label: Accessor<TData>;
    value: Accessor<TData>;
    visibleData: TData[];
  };
  export type PieChartPropsObjProp = Pick<
    SimplifiedChartPropsObject,
    'pie' | 'group' | 'arc' | 'legend' | 'canvas' | 'svg' | 'tooltip'
  >;

  export type PieChartProps<TData> = Pick<
    SimplifiedChartProps<TData, typeof Arc, PieChartExtraSnippetProps<TData>>,
    | 'aboveContext'
    | 'aboveMarks'
    | 'belowContext'
    | 'belowMarks'
    | 'children'
    | 'data'
    | 'debug'
    | 'legend'
    | 'marks'
    | 'onTooltipClick'
    | 'profile'
    | 'renderContext'
    | 'series'
    | 'tooltip'
    | 'tooltipContext'
  > & {
    /**
     * Key accessor
     *
     * @default 'key'
     */
    key?: Accessor<TData>;

    /**
     * Label accessor
     *
     * @default 'label'
     */
    label?: Accessor<TData>;

    /**
     * Value accessor
     *
     * @default 'value'
     */
    value?: Accessor<TData>;

    /**
     * Color accessor
     *
     * @default key
     */
    c?: Accessor<TData>;

    /**
     * Maximum possible value, useful when `data` is single item
     */
    maxValue?: number;

    /**
     * Range [min, max] in degrees.
     *
     * See also `startAngle`/`endAngle`
     *
     * @default [0, 360]
     */
    range?: [number, number] | number[];

    props?: PieChartPropsObjProp;

    /**
     * Inner radius of the arc.
     *   value >= 1: discrete value
     *   value >  0: percent of `outerRadius`
     *   value <  0: offset of `outerRadius`
     */
    innerRadius?: number;

    /**
     * Outer radius of the arc.
     */
    outerRadius?: number;

    /**
     * Corner radius of the arc
     *
     * @default 0
     */
    cornerRadius?: number;

    /**
     * Angle between the arcs
     *
     * @default 0
     */
    padAngle?: number;

    /**
     * Placement of the PieChart
     *
     * @default 'center'
     */
    placement?: 'left' | 'center' | 'right';

    /**
     * Center the chart.
     *
     * Override and use `props.group` for more control.
     *
     * @default placement === 'center'
     */
    center?: boolean;

    /**
     * A callback function triggered when the arc is clicked.
     */
    onArcClick?: (
      e: MouseEvent,
      detail: { data: any; series: SeriesData<TData, typeof Arc> }
    ) => void;
  };
</script>

<script lang="ts" generics="TData">
  import { onMount, type ComponentProps } from 'svelte';
  import { sum } from 'd3-array';
  import { format } from '@layerstack/utils';
  import { cls } from '@layerstack/tailwind';
  import { selectionStore } from '@layerstack/svelte-stores';

  import Arc from '../Arc.svelte';
  import Canvas from '../layout/Canvas.svelte';
  import Chart from '../Chart-Next.svelte';
  import Group from '../Group.svelte';
  import Legend from '../Legend.svelte';
  import Pie from '../Pie.svelte';
  import Svg from '../layout/Svg.svelte';
  import * as Tooltip from '../tooltip/index.js';

  import { accessor, chartDataArray, type Accessor } from '../../utils/common.js';
  import { asAny } from '../../utils/types.js';
  import type { SeriesData, SimplifiedChartProps, SimplifiedChartPropsObject } from './types.js';
  import { createHighlightKey } from './utils.svelte.js';

  let {
    data = [],
    key = 'key',
    label = 'label',
    value = 'value',
    range = [0, 360],
    c = key,
    innerRadius,
    outerRadius,
    cornerRadius = 0,
    padAngle = 0,
    placement = 'center',
    maxValue,
    center = placement === 'center',
    series = [{ key: 'default', value: value }],
    legend = false,
    tooltipContext,
    onArcClick = () => {},
    // TODO: Not usable with manual tooltip / arc path.  Use `onArcClick`?
    /** Event dispatched with current tooltip data */
    onTooltipClick = () => {},
    props = {},
    renderContext = 'svg',
    profile = false,
    debug = false,
    tooltip,
    children: childrenProp,
    aboveContext,
    belowContext,
    belowMarks,
    aboveMarks,
    marks,
    ...restProps
  }: PieChartProps<TData> = $props();

  const keyAccessor = $derived(accessor(key));
  const labelAccessor = $derived(accessor(label));
  const valueAccessor = $derived(accessor(value));
  const cAccessor = $derived(accessor(c));

  const allSeriesData = $derived(
    series
      .flatMap((s) => s.data?.map((d) => ({ seriesKey: s.key, ...d })))
      .filter((d) => d) as Array<TData>
  );

  const chartData = $derived(
    allSeriesData.length ? allSeriesData : chartDataArray(data)
  ) as Array<TData>;

  const seriesColors = $derived(series.map((s) => s.color).filter((d) => d != null));

  const highlightKey = createHighlightKey<TData, typeof Arc>();
  const selectedKeys = selectionStore();

  const visibleData = $derived(
    chartData.filter((d) => {
      const dataKey = keyAccessor(d);
      return (
        // @ts-expect-error
        $selectedKeys.selected.length === 0 || $selectedKeys.isSelected(dataKey)
        // || highlightKey == dataKey
      );
    })
  );

  // TODO: note, I added this because it wasn't consistent with all the other charts
  // unsure if it is correct but will validate with Sean
  const visibleSeries = $derived(
    series.filter((s) => {
      return (
        // @ts-expect-error - we can fix this
        $selectedKeys.selected.length === 0 || $selectedKeys.isSelected(s.key)
      );
    })
  );

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
  {c}
  cDomain={chartData.map(keyAccessor)}
  cRange={seriesColors.length
    ? seriesColors
    : c !== key
      ? chartData.map((d) => cAccessor(d))
      : [
          'var(--color-primary)',
          'var(--color-secondary)',
          'var(--color-info)',
          'var(--color-success)',
          'var(--color-warning)',
          'var(--color-danger)',
        ]}
  padding={{ bottom: legend === true ? 32 : 0 }}
  {...restProps}
  tooltip={props.tooltip?.context}
  bind:tooltipContext
>
  {#snippet children({ brushContext, context, geoContext, tooltipContext, transformContext })}
    {@const slotProps = {
      label,
      key,
      value,
      context,
      tooltipContext,
      brushContext,
      geoContext,
      transformContext,
      series,
      visibleSeries,
      visibleData,
      highlightKey: highlightKey.current,
      setHighlightKey: highlightKey.set,
    }}
    {#if childrenProp}
      {@render childrenProp(slotProps)}
    {:else}
      {@render belowContext?.(slotProps)}
      {@const Component = renderContext === 'canvas' ? Canvas : Svg}

      <Component
        this={renderContext === 'canvas' ? Canvas : Svg}
        {...asAny(renderContext === 'canvas' ? props.canvas : props.svg)}
        {center}
        {debug}
      >
        {@render belowMarks?.(slotProps)}

        {#if typeof marks === 'function'}
          {@render marks(slotProps)}
        {:else}
          <Group
            x={placement === 'left'
              ? context.height / 2
              : placement === 'right'
                ? context.width - context.height / 2
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
                  fill={s.color ?? context.cScale?.(context.c(d))}
                  track={{ fill: s.color ?? context.cScale?.(context.c(d)), fillOpacity: 0.1 }}
                  {tooltipContext}
                  data={d}
                  onclick={(e) => {
                    onArcClick(e, { data: d, series: s });
                    // Workaround for `tooltip={{ mode: 'manual' }}
                    onTooltipClick(e, { data: d });
                  }}
                  {...props.arc}
                  {...s.props}
                  class={cls(
                    'transition-opacity',
                    highlightKey.current && highlightKey.current !== keyAccessor(d) && 'opacity-50',
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
                >
                  {#snippet children({ arcs })}
                    {#each arcs as arc}
                      <Arc
                        startAngle={arc.startAngle}
                        endAngle={arc.endAngle}
                        outerRadius={series.length > 1 ? i * (outerRadius ?? 0) : outerRadius}
                        {innerRadius}
                        {cornerRadius}
                        {padAngle}
                        fill={context.cScale?.(context.c(arc.data))}
                        data={arc.data}
                        {tooltipContext}
                        onclick={(e) => {
                          onArcClick(e, { data: arc.data, series: s });
                          // Workaround for `tooltip={{ mode: 'manual' }}
                          onTooltipClick(e, { data: arc.data });
                        }}
                        class={cls(
                          'transition-opacity',
                          highlightKey.current &&
                            highlightKey.current !== keyAccessor(arc.data) &&
                            'opacity-50'
                        )}
                        {...props.arc}
                        {...s.props}
                      />
                    {/each}
                  {/snippet}
                </Pie>
              {/if}
            {/each}
          </Group>
        {/if}

        {@render aboveMarks?.(slotProps)}
      </Component>

      {@render aboveContext?.(slotProps)}

      {#if typeof legend === 'function'}
        {@render legend(slotProps)}
      {:else if legend}
        <Legend
          tickFormat={(tick) => {
            const item = chartData.find((d) => keyAccessor(d) === tick);
            return item ? (labelAccessor(item) ?? tick) : tick;
          }}
          placement="bottom"
          variant="swatches"
          onclick={(e, item) => $selectedKeys.toggleSelected(item.value)}
          onpointerenter={(e, item) => (highlightKey.current = item.value)}
          onpointerleave={(e) => (highlightKey.current = null)}
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

      {#if typeof tooltip === 'function'}
        {@render tooltip(slotProps)}
      {:else if tooltip}
        <Tooltip.Root {...props.tooltip?.root}>
          {#snippet children({ data })}
            <Tooltip.List {...props.tooltip?.list}>
              <Tooltip.Item
                label={labelAccessor(data) || keyAccessor(data)}
                value={valueAccessor(data)}
                color={context.cScale?.(context.c(data))}
                {format}
                onpointerenter={() => (highlightKey.current = keyAccessor(data))}
                onpointerleave={() => (highlightKey.current = null)}
                {...props.tooltip?.item}
              />
            </Tooltip.List>
          {/snippet}
        </Tooltip.Root>
      {/if}
    {/if}
  {/snippet}
</Chart>
