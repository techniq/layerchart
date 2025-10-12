<script lang="ts" module>
  export type PieChartExtraSnippetProps<TData> = {
    key: Accessor<TData>;
    label: Accessor<TData>;
    value: Accessor<TData>;
    visibleData: TData[];
    getGroupProps: () => ComponentProps<typeof Group>;
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
    | 'layer'
    | 'series'
    | 'tooltip'
    | 'tooltipContext'
    | 'cRange'
    | 'padding'
    | 'context'
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
    range?: [number, number];

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
     * Replace the default rendering of the `<Pie>` component internally with your own.
     *
     * Use the `props` snippet prop to access the default props.
     */
    pie?: SimplifiedChartSnippet<
      TData,
      typeof Arc,
      PieChartExtraSnippetProps<TData> & {
        /**
         * Default props to apply to the Pie component.
         */
        props: ComponentProps<typeof Pie>;
        /**
         * The index of the pie series currently being iterated over.
         */
        index: number;
      }
    >;

    /**
     * Replace the default rendering of the `<Arc>` component internally with your own.
     *
     * Use the `props` snippet prop to access the default props.
     */
    arc?: SimplifiedChartSnippet<
      TData,
      typeof Arc,
      PieChartExtraSnippetProps<TData> & {
        props: ComponentProps<typeof Arc>;
        /**
         * The index of the arc currently being iterated over
         */
        index: number;

        /**
         * The index of the series currently being iterated over.
         */
        seriesIndex: number;
      }
    >;

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
  import { format } from '@layerstack/utils';
  import type { PieArcDatum } from 'd3-shape';
  import { schemeObservable10 } from 'd3-scale-chromatic';
  import { getObjectOrNull } from '../../utils/common.js';

  import Arc from '../Arc.svelte';
  import Chart from '../Chart.svelte';
  import Group from '../Group.svelte';
  import Layer from '../layers/Layer.svelte';
  import Legend from '../Legend.svelte';
  import Pie from '../Pie.svelte';
  import * as Tooltip from '../tooltip/index.js';

  import { accessor, chartDataArray, type Accessor } from '../../utils/common.js';
  import { asAny } from '../../utils/types.js';
  import type {
    SeriesData,
    SimplifiedChartProps,
    SimplifiedChartPropsObject,
    SimplifiedChartSnippet,
  } from './types.js';
  import { SeriesState } from '$lib/states/series.svelte.js';
  import { createLegendProps } from './utils.svelte.js';
  import { setTooltipMetaContext } from '../tooltip/tooltipMetaContext.js';
  import { getSettings } from '$lib/contexts/settings.js';

  const settings = getSettings();

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
    layer: layerProp,
    profile = false,
    debug: debugProp,
    tooltip = true,
    children: childrenProp,
    aboveContext,
    belowContext,
    belowMarks,
    aboveMarks,
    marks,
    pie,
    arc,
    context = $bindable(),
    ...restProps
  }: PieChartProps<TData> = $props();

  const layer = $derived(layerProp ?? settings.layer);
  const debug = $derived(debugProp ?? settings.debug);

  const series = $derived(
    seriesProp === undefined ? [{ key: 'default', value: value }] : seriesProp
  );
  const seriesState = new SeriesState(() => series);

  const keyAccessor = $derived(accessor(key));
  const labelAccessor = $derived(accessor(label));
  const valueAccessor = $derived(accessor(value));
  const cAccessor = $derived(accessor(c));

  const chartData = $derived(
    seriesState.allSeriesData.length ? seriesState.allSeriesData : chartDataArray(data)
  ) as Array<TData>;

  const visibleData = $derived(
    chartData.filter((d) => {
      const dataKey = keyAccessor(d);
      return seriesState.selectedKeys.isEmpty() || seriesState.selectedKeys.isSelected(dataKey);
    })
  );

  function getLegendProps(): ComponentProps<typeof Legend> {
    return createLegendProps({
      seriesState,
      props: {
        tickFormat: (tick) => {
          // Use data label instead of series label
          const item = chartData.find((d) => keyAccessor(d) === tick);
          return item ? (labelAccessor(item) ?? tick) : tick;
        },
        ...props.legend,
        ...getObjectOrNull(legend),
      },
    });
  }

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
        seriesState.visibleSeries.length > 1 ? seriesIndex * (outerRadius ?? 0) : outerRadius,
      innerRadius,
      cornerRadius,
      padAngle,
      fill: context.cScale?.(context.c(arc.data)),
      data: arc.data,
      tooltipContext: context.tooltip,
      onclick: (e) => {
        onArcClick(e, { data: arc.data, series: s });
        // Workaround for `tooltip={{ mode: 'manual' }}
        onTooltipClick(e, { data: arc.data });
      },
      opacity: seriesState.isHighlighted(keyAccessor(arc.data), true) ? 1 : 0.5,
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

  setTooltipMetaContext({
    type: 'pie',
    get color() {
      return c;
    },
    get value() {
      return value;
    },
    get label() {
      return label;
    },
    get key() {
      return key;
    },
    get visibleSeries() {
      return seriesState.visibleSeries;
    },
  });
</script>

<!-- svelte-ignore ownership_invalid_binding -->
<Chart
  bind:context
  data={visibleData}
  x={value}
  c={key}
  cDomain={chartData.map(keyAccessor)}
  cRange={seriesState.allSeriesColors.length
    ? seriesState.allSeriesColors
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
  {...restProps}
  tooltip={tooltip === false
    ? false
    : { ...props.tooltip?.context, ...(typeof tooltip === 'object' ? tooltip : null) }}
>
  {#snippet children({ context })}
    {@const snippetProps = {
      label: labelAccessor,
      key: keyAccessor,
      value: valueAccessor,
      color: cAccessor,
      context,
      series,
      visibleSeries: seriesState.visibleSeries,
      visibleData,
      highlightKey: seriesState.highlightKey.current,
      setHighlightKey: seriesState.highlightKey.set,
      getLegendProps,
      getGroupProps,
    }}
    {#if childrenProp}
      {@render childrenProp(snippetProps)}
    {:else}
      {@render belowContext?.(snippetProps)}

      <Layer
        type={layer}
        {...asAny(layer === 'canvas' ? props.canvas : props.svg)}
        {center}
        {debug}
      >
        {@render belowMarks?.(snippetProps)}

        {#if typeof marks === 'function'}
          {@render marks(snippetProps)}
        {:else}
          <Group {...getGroupProps()}>
            <!-- Use `series` instead of `visibleSeries` since data is filtered (legend) instead of series -->
            {#each series as s, seriesIdx (s.key)}
              {#if typeof pie === 'function'}
                {@render pie({
                  ...snippetProps,
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
                          props: arcProps,
                          index: arcIdx,
                          seriesIndex: seriesIdx,
                        })}
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

        {@render aboveMarks?.(snippetProps)}
      </Layer>

      {@render aboveContext?.(snippetProps)}

      {#if typeof legend === 'function'}
        {@render legend(snippetProps)}
      {:else if legend}
        <Legend {...getLegendProps()} />
      {/if}

      {#if typeof tooltip === 'function'}
        {@render tooltip(snippetProps)}
      {:else if tooltip}
        <Tooltip.Root {context} {...props.tooltip?.root}>
          {#snippet children({ data })}
            <Tooltip.List {...props.tooltip?.list}>
              <Tooltip.Item
                label={labelAccessor(data) || keyAccessor(data)}
                value={valueAccessor(data)}
                color={context.cScale?.(context.c(data))}
                {format}
                onpointerenter={() => (seriesState.highlightKey.current = keyAccessor(data))}
                onpointerleave={() => (seriesState.highlightKey.current = null)}
                {...props.tooltip?.item}
              />
            </Tooltip.List>
          {/snippet}
        </Tooltip.Root>
      {/if}
    {/if}
  {/snippet}
</Chart>
