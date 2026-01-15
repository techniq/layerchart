<script lang="ts" module>
  import type { ComponentProps, Snippet } from 'svelte';
  import type { ChartProps, ChartPropsWithoutHTML } from '../Chart.svelte';
  import type { ChartState } from '$lib/contexts/chart.js';
  import type { ArcPropsWithoutHTML } from '../Arc.svelte';
  import type { Accessor } from '$lib/utils/common.js';
  import type { SeriesData, SimplifiedChartPropsObject } from './types.js';

  // Import components for use in type definitions (typeof Arc, typeof Group)
  import Arc from '../Arc.svelte';
  import Group from '../Group.svelte';

  export type ArcChartExtraSnippetProps<TData> = {
    key: Accessor<TData>;
    label: Accessor<TData>;
    value: Accessor<TData>;
    visibleData: TData[];
    getGroupProps: () => ComponentProps<typeof Group>;
    getArcProps: (s: SeriesData<TData, typeof Arc>, i: number) => ComponentProps<typeof Arc>;
  };
  export type ArcChartPropsObjProp = Pick<
    SimplifiedChartPropsObject,
    'pie' | 'group' | 'arc' | 'legend' | 'canvas' | 'svg' | 'tooltip'
  >;

  // Use explicit data prop for TData inference, with rest from ChartPropsWithoutHTML<any>
  export type ArcChartProps<TData> = {
    /**
     * The data for the chart
     */
    data?: TData[] | readonly TData[];
  } & Omit<
    ChartPropsWithoutHTML<any>,
    // Props that don't apply to ArcChart
    'data' | 'axis' | 'brush' | 'grid' | 'highlight' | 'labels' | 'points' | 'rule'
  > &
    Pick<
      ArcPropsWithoutHTML,
      | 'cornerRadius'
      | 'trackCornerRadius'
      | 'padAngle'
      | 'trackPadAngle'
      | 'trackStartAngle'
      | 'trackEndAngle'
      | 'trackInnerRadius'
      | 'trackOuterRadius'
      | 'innerRadius'
      | 'outerRadius'
      | 'range'
    > & {
      /**
       * The series data to be used for the chart.
       */
      series?: SeriesData<TData, typeof Arc>[];

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

      props?: ArcChartPropsObjProp;

      /**
       * Placement of the ArcChart
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

      arc?: Snippet<
        [
          { context: ChartState<TData> } & ArcChartExtraSnippetProps<TData> & {
              props: ComponentProps<typeof Arc>;
              /**
               * The index of the series currently being iterated over.
               */
              seriesIndex: number;
            },
        ]
      >;

      /**
       * Enable profiling to measure render time.
       * @default false
       */
      profile?: boolean;
    };
</script>

<script lang="ts" generics="TData">
  import { onMount } from 'svelte';
  import { sum } from 'd3-array';
  import { format } from '@layerstack/utils';
  import { cls } from '@layerstack/tailwind';

  import Chart from '../Chart.svelte';
  import * as Tooltip from '../tooltip/index.js';

  import { accessor, chartDataArray, getObjectOrNull } from '../../utils/common.js';
  import { SeriesState } from '$lib/states/series.svelte.js';
  import { getColorIfDefined } from '$lib/utils/color.js';

  let {
    data = [],
    key = 'key',
    label = 'label',
    value = 'value',
    range = [0, 360],
    c: cProp,
    innerRadius = 0,
    outerRadius = 0,
    cornerRadius = 0,
    padAngle = 0,
    placement = 'center',
    maxValue,
    center: centerProp,
    series: seriesProp,
    legend = false,
    onArcClick = () => {},
    // TODO: Not usable with manual tooltip / arc path.  Use `onArcClick`?
    /** Event dispatched with current tooltip data */
    onTooltipClick = () => {},
    props = {},
    profile = false,
    tooltipContext = true,
    marks,
    tooltip: tooltipProp,
    arc,
    context = $bindable(),
    trackCornerRadius,
    trackPadAngle,
    trackStartAngle,
    trackEndAngle,
    trackInnerRadius,
    trackOuterRadius,
    ...restProps
  }: ArcChartProps<TData> = $props();

  const center = $derived(centerProp ?? placement === 'center');

  const c = $derived(cProp ?? key);

  const keyAccessor = $derived(accessor(key));
  const labelAccessor = $derived(accessor(label));
  const valueAccessor = $derived(accessor(value));
  const cAccessor = $derived(accessor(c));

  const _series = $derived(
    seriesProp === undefined
      ? [
          {
            key: 'default',
            value: value,
          },
        ]
      : seriesProp
  );
  const isDefaultSeries = $derived(_series.length === 1 && _series[0].key === 'default');

  const series: SeriesData<TData, typeof Arc>[] = $derived.by(() => {
    if (!isDefaultSeries) return _series;
    // build series from data
    return chartDataArray(data).map((d) => {
      return {
        key: keyAccessor(d),
        value: valueAccessor(d),
        label: labelAccessor(d),
        color: getColorIfDefined(d),
        maxValue: maxValue,
        data: [d],
      };
    });
  });

  const seriesState = new SeriesState(() => series);

  const chartData = $derived(
    seriesState.allSeriesData.length ? seriesState.allSeriesData : chartDataArray(data)
  ) as Array<TData>;

  const visibleData = $derived(
    chartData.filter((d) => {
      const dataKey = keyAccessor(d);
      return seriesState.selectedKeys.isEmpty() || seriesState.selectedKeys.isSelected(dataKey);
    })
  );

  // Custom tickFormat for ArcChart legends - uses data labels instead of series labels
  const legendTickFormat = (tick: any) => {
    const item = chartData.find((d) => keyAccessor(d) === tick);
    return item ? (labelAccessor(item) ?? tick) : tick;
  };

  function getGroupProps(): ComponentProps<typeof Group> {
    if (!context) return {};
    return {
      x:
        placement === 'left'
          ? context.height / 2
          : placement === 'right'
            ? context.width - context.height / 2
            : undefined,
      center: ['left', 'right'].includes(placement) ? 'y' : undefined,
      ...props.group,
    };
  }

  function getArcProps(s: SeriesData<TData, typeof Arc>, i: number): ComponentProps<typeof Arc> {
    if (!context) return {};
    const d = s.data?.[0] || chartData[0];
    const multiSeries = chartDataArray(data).length > 1 || series.length > 1;
    return {
      value: valueAccessor(d),
      domain: [0, s.maxValue ?? maxValue ?? sum(chartData, valueAccessor)],
      range,
      innerRadius,
      outerRadius: multiSeries && (outerRadius ?? 0) < 0 ? i * (outerRadius ?? 0) : outerRadius,
      cornerRadius,
      padAngle,
      trackCornerRadius,
      trackPadAngle,
      trackStartAngle,
      trackEndAngle,
      trackInnerRadius,
      trackOuterRadius:
        multiSeries && (trackOuterRadius ?? 0) < 0 ? i * (trackOuterRadius ?? 0) : trackOuterRadius,
      fill: s.color ?? context.cScale?.(context.c(d)),
      track: { fill: s.color ?? context.cScale?.(context.c(d)), fillOpacity: 0.1 },
      opacity: seriesState.isHighlighted(keyAccessor(d), true) ? 1 : 0.1,
      tooltip: true,
      data: d,
      onclick: (e) => {
        onArcClick(e, { data: d, series: s });
        // Workaround for `tooltip={{ mode: 'manual' }}
        onTooltipClick(e, { data: d });
      },
      ...props.arc,
      ...s.props,
      class: cls(props.arc?.class, s.props?.class),
    };
  }

  if (profile) {
    console.time('ArcChart render');
    onMount(() => {
      console.timeEnd('ArcChart render');
    });
  }
</script>

<!-- svelte-ignore ownership_invalid_binding -->
<Chart
  bind:context
  data={visibleData}
  x={value}
  {c}
  cDomain={chartData.map(keyAccessor)}
  cRange={seriesState.allSeriesColors.length
    ? seriesState.allSeriesColors
    : c !== key
      ? chartData.map((d) => cAccessor(d))
      : [
          'var(--color-primary, currentColor)',
          'var(--color-secondary, currentColor)',
          'var(--color-info, currentColor)',
          'var(--color-success, currentColor)',
          'var(--color-warning, currentColor)',
          'var(--color-danger, currentColor)',
        ]}
  padding={{
    bottom: legend === true || getObjectOrNull(legend)?.placement?.includes('bottom') ? 32 : 0,
  }}
  axis={false}
  {...restProps as Partial<ChartProps<TData>>}
  tooltipContext={tooltipContext === false
    ? false
    : {
        onclick: onTooltipClick,
        ...props.tooltip?.context,
        ...(typeof tooltipContext === 'object' ? tooltipContext : null),
      }}
  {seriesState}
  legend={typeof legend === 'function'
    ? (legend as any)
    : legend
      ? {
          variant: 'swatches',
          placement: 'bottom',
          tickFormat: legendTickFormat,
          ...(typeof legend === 'object' ? legend : null),
        }
      : false}
  props={{
    ...props,
    svg: { center, ...props.svg },
    canvas: { center, ...props.canvas },
  }}
>
  {#snippet marks(snippetProps)}
    {#if typeof marks === 'function'}
      {@render marks(snippetProps)}
    {:else}
      <Group {...getGroupProps()}>
        {#each series as s, i (s.key)}
          {#if typeof arc === 'function'}
            {@render arc({
              ...snippetProps,
              label: labelAccessor,
              key: keyAccessor,
              value: valueAccessor,
              visibleData,
              getGroupProps,
              getArcProps,
              seriesIndex: i,
              props: getArcProps(s, i),
            })}
          {:else}
            <Arc {...getArcProps(s, i)} />
          {/if}
        {/each}
      </Group>
    {/if}
  {/snippet}

  {#snippet tooltip(snippetProps)}
    {#if typeof tooltipProp === 'function'}
      {@render tooltipProp(snippetProps as any)}
    {:else if tooltipContext}
      <Tooltip.Root context={snippetProps.context} {...props.tooltip?.root}>
        {#snippet children({ data })}
          <Tooltip.List {...props.tooltip?.list}>
            <Tooltip.Item
              label={labelAccessor(data) || keyAccessor(data)}
              value={valueAccessor(data)}
              color={snippetProps.context.cScale?.(snippetProps.context.c(data))}
              {format}
              onpointerenter={() => (seriesState.highlightKey = keyAccessor(data))}
              onpointerleave={() => (seriesState.highlightKey = null)}
              {...props.tooltip?.item}
            />
          </Tooltip.List>
        {/snippet}
      </Tooltip.Root>
    {/if}
  {/snippet}
</Chart>
