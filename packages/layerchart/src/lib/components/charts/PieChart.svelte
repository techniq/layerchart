<script lang="ts" module>
  import type { ComponentProps, Snippet } from 'svelte';
  import type { ChartProps } from "../Chart/Chart.svelte";
  import type { ChartState } from '$lib/contexts/chart.js';
  import type { Accessor } from '$lib/utils/common.js';
  import type { SeriesData } from './types.js';

  import Arc from '../Arc/Arc.svelte';
  import ArcLabel, { type ArcLabelConfig } from '../ArcLabel/ArcLabel.svelte';
  import Group from '../Group/Group.svelte';
  import Pie from '../Pie/Pie.svelte';

  export type PieChartExtraSnippetProps<TData> = {
    key: Accessor<TData>;
    label: Accessor<TData>;
    value: Accessor<TData>;
    visibleData: TData[];
    getGroupProps: () => ComponentProps<typeof Group>;
  };

  // Use explicit data prop for TData inference, with rest from ChartPropsWithoutHTML<any>
  export type PieChartProps<TData> = {
    /**
     * The data for the chart
     */
    data?: TData[] | readonly TData[];
  } & Omit<
    ChartProps<any>,
    // Props that don't apply to PieChart
    'data' | 'axis' | 'brush' | 'grid' | 'highlight' | 'labels' | 'points' | 'rule'
  > & {
      /**
       * Render text labels on each arc.
       *
       * Pass `true` to enable with default placement (`centroid`), or an object
       * to customize via `ArcLabel` props (placement, format, value accessor, etc).
       */
      labels?: boolean | (ArcLabelConfig & { value?: Accessor });
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

      /**
       * Range [min, max] in degrees.
       *
       * See also `startAngle`/`endAngle`
       *
       * @default [0, 360]
       */
      range?: [number, number];

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
       * Replace the default rendering of the `<Pie>` component internally with your own.
       *
       * Use the `props` snippet prop to access the default props.
       */
      pie?: Snippet<
        [
          { context: ChartState<TData> } & PieChartExtraSnippetProps<TData> & {
              /**
               * Default props to apply to the Pie component.
               */
              props: ComponentProps<typeof Pie>;
              /**
               * The index of the pie series currently being iterated over.
               */
              index: number;
            },
        ]
      >;

      /**
       * Replace the default rendering of the `<Arc>` component internally with your own.
       *
       * Use the `props` snippet prop to access the default props.
       */
      arc?: Snippet<
        [
          { context: ChartState<TData> } & PieChartExtraSnippetProps<TData> & {
              props: ComponentProps<typeof Arc>;
              /**
               * The index of the arc currently being iterated over
               */
              index: number;

              /**
               * The index of the series currently being iterated over.
               */
              seriesIndex: number;
            },
        ]
      >;

      /**
       * A callback function triggered when the arc is clicked.
       */
      onArcClick?: (
        e: MouseEvent,
        detail: { data: any; series: SeriesData<TData, typeof Arc> }
      ) => void;

      /**
       * Enable profiling to measure render time.
       * @default false
       */
      profile?: boolean;
    };
</script>

<script lang="ts" generics="TData">
  import { onMount } from 'svelte';
  import { format } from '@layerstack/utils';
  import type { PieArcDatum } from 'd3-shape';
  import { schemeObservable10 } from 'd3-scale-chromatic';

  import Chart from "../Chart/Chart.svelte";
  import * as Tooltip from '../tooltip/index.js';

  import { accessor, chartDataArray, getObjectOrNull } from '../../utils/common.js';

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
    pie,
    arc,
    labels = false,
    context = $bindable(),
    ...restProps
  }: PieChartProps<TData> = $props();

  const labelsConfig = $derived.by<(ArcLabelConfig & { value?: Accessor }) | null>(() => {
    if (labels === true) return { placement: 'callout' };
    if (labels) return { placement: 'callout', ...labels };
    return null;
  });

  const series = $derived(
    seriesProp === undefined ? [{ key: 'default', value: value }] : seriesProp
  );
  const keyAccessor = $derived(accessor(key));
  const labelAccessor = $derived(accessor(label));
  const valueAccessor = $derived(accessor(value));
  const cAccessor = $derived(accessor(c));

  // PieChart needs local chartData for visibleData filtering and cDomain calculation.
  // IMPORTANT: Compute locally from `series` and `data` — NOT from `context.series.allSeriesData`.
  // Reading context.series.allSeriesData here would create a derived_references_self cycle:
  //   SeriesState.#series → ChartState.props → data={visibleData} → chartData → context.series.allSeriesData → #series
  const chartData = $derived.by(() => {
    const seriesData = series.flatMap((s) => ('data' in s ? s.data : undefined) ?? []);
    return (seriesData.length > 0 ? seriesData : chartDataArray(data)) as Array<TData>;
  });

  const visibleData = $derived(
    chartData.filter((d) => {
      const dataKey = keyAccessor(d);
      const selectedKeys = context?.series.selectedKeys;
      return !selectedKeys || selectedKeys.isEmpty() || selectedKeys.isSelected(dataKey);
    })
  );

  // Compute series colors locally to avoid derived_references_self cycle through context.series.allSeriesColors
  const allSeriesColors = $derived(
    series.map((s) => ('color' in s ? s.color : undefined)).filter((c) => c != null) as string[]
  );

  // Custom tickFormat for PieChart legends - uses data labels instead of series labels
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

  function getPieProps(s: SeriesData<TData, typeof Arc>, i: number): ComponentProps<typeof Pie> {
    return {
      data: s.data,
      range,
      innerRadius,
      outerRadius,
      cornerRadius,
      padAngle,
      ...props.pie,
    };
  }

  function getArcProps(
    s: SeriesData<TData, typeof Arc>,
    seriesIndex: number,
    arc: PieArcDatum<any>,
    arcIndex: number
  ): ComponentProps<typeof Arc> {
    if (!context) return {};
    const arcDataProps =
      'props' in arc.data && typeof arc.data.props === 'object' ? arc.data.props : {};
    return {
      startAngle: arc.startAngle,
      endAngle: arc.endAngle,
      outerRadius:
        (context?.series.visibleSeries.length ?? 0) > 1
          ? seriesIndex * (outerRadius ?? 0)
          : outerRadius,
      innerRadius,
      cornerRadius,
      padAngle,
      fill: context.cScale?.(context.c(arc.data)),
      data: arc.data,
      tooltip: true,
      onclick: (e) => {
        onArcClick(e, { data: arc.data, series: s });
        // Workaround for `tooltip={{ mode: 'manual' }}
        onTooltipClick(e, { data: arc.data });
      },
      opacity: (context?.series.isHighlighted(keyAccessor(arc.data), true) ?? true) ? 1 : 0.5,
      ...props.arc,
      ...s.props,
      ...arcDataProps,
    };
  }

  if (profile) {
    console.time('PieChart render');
    onMount(() => {
      console.timeEnd('PieChart render');
    });
  }
</script>

<Chart
  bind:context
  data={visibleData}
  x={value}
  c={key}
  cDomain={chartData.map(keyAccessor)}
  cRange={allSeriesColors.length > 0
    ? allSeriesColors
    : c !== key
      ? chartData.map((d) => cAccessor(d))
      : [
          `var(--color-primary, ${schemeObservable10[0]})`,
          `var(--color-secondary, ${schemeObservable10[1]})`,
          `var(--color-info, ${schemeObservable10[2]})`,
          `var(--color-success, ${schemeObservable10[3]})`,
          `var(--color-warning, ${schemeObservable10[4]})`,
          `var(--color-danger, ${schemeObservable10[5]})`,
        ]}
  padding={{
    bottom: legend === true || getObjectOrNull(legend)?.placement?.includes('bottom') ? 32 : 0,
  }}
  axis={false}
  {...restProps}
  tooltipContext={tooltipContext === false
    ? false
    : {
        onclick: onTooltipClick,
        ...props.tooltip?.context,
        ...(typeof tooltipContext === 'object' ? tooltipContext : null),
      }}
  {series}
  legend={typeof legend === 'function'
    ? legend
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
        <!-- Use `series` instead of `visibleSeries` since data is filtered (legend) instead of series -->
        {#each series as s, seriesIdx (s.key)}
          {#if typeof pie === 'function'}
            {@render pie({
              ...snippetProps,
              label: labelAccessor,
              key: keyAccessor,
              value: valueAccessor,
              visibleData,
              getGroupProps,
              props: getPieProps(s, seriesIdx),
              index: seriesIdx,
            })}
          {:else}
            <Pie {...getPieProps(s, seriesIdx)}>
              {#snippet children({ arcs })}
                {#each arcs as arcData, arcIdx (`${seriesIdx}-${arcIdx}`)}
                  {@const arcProps = getArcProps(s, seriesIdx, arcData, arcIdx)}
                  {#if typeof arc === 'function'}
                    {@render arc({
                      ...snippetProps,
                      label: labelAccessor,
                      key: keyAccessor,
                      value: valueAccessor,
                      visibleData,
                      getGroupProps,
                      props: arcProps,
                      index: arcIdx,
                      seriesIndex: seriesIdx,
                    })}
                  {:else if labelsConfig}
                    <Arc {...arcProps}>
                      {#snippet children({
                        centroid,
                        startAngle,
                        endAngle,
                        innerRadius: arcInnerRadius,
                        outerRadius: arcOuterRadius,
                        getArcTextProps,
                      })}
                        {@const { value: labelValue, ...labelRest } = labelsConfig}
                        <ArcLabel
                          {centroid}
                          {startAngle}
                          {endAngle}
                          innerRadius={arcInnerRadius}
                          outerRadius={arcOuterRadius}
                          {getArcTextProps}
                          value={accessor(labelValue ?? value)(arcData.data)}
                          {...labelRest}
                        />
                      {/snippet}
                    </Arc>
                  {:else}
                    <Arc {...arcProps} />
                  {/if}
                {/each}
              {/snippet}
            </Pie>
          {/if}
        {/each}
      </Group>
    {/if}
  {/snippet}

  {#snippet tooltip(snippetProps)}
    {#if typeof tooltipProp === 'function'}
      {@render tooltipProp(snippetProps)}
    {:else if tooltipContext}
      <Tooltip.Root context={snippetProps.context} {...props.tooltip?.root}>
        {#snippet children({ data })}
          <Tooltip.List {...props.tooltip?.list}>
            <Tooltip.Item
              label={labelAccessor(data) || keyAccessor(data)}
              value={valueAccessor(data)}
              color={snippetProps.context.cScale?.(snippetProps.context.c(data))}
              {format}
              onpointerenter={() => {
                if (snippetProps.context)
                  snippetProps.context.series.highlightKey = keyAccessor(data);
              }}
              onpointerleave={() => {
                if (snippetProps.context) snippetProps.context.series.highlightKey = null;
              }}
              {...props.tooltip?.item}
            />
          </Tooltip.List>
        {/snippet}
      </Tooltip.Root>
    {/if}
  {/snippet}
</Chart>
