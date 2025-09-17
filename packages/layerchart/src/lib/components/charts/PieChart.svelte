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
    | 'renderContext'
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
  import { onMount, type ComponentProps, type Snippet } from 'svelte';
  import { format } from '@layerstack/utils';
  import { cls } from '@layerstack/tailwind';
  import { SelectionState } from '@layerstack/svelte-state';
  import type { PieArcDatum } from 'd3-shape';

  import Arc from '../Arc.svelte';
  import Chart from '../Chart.svelte';
  import Group from '../Group.svelte';
  import Layer from '../layout/Layer.svelte';
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
  import { HighlightKey } from './utils.svelte.js';
  import { setTooltipMetaContext } from '../tooltip/tooltipMetaContext.js';

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
    renderContext = 'svg',
    profile = false,
    debug = false,
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

  const series = $derived(
    seriesProp === undefined ? [{ key: 'default', value: value }] : seriesProp
  );

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

  const highlightKey = new HighlightKey<TData, typeof Arc>();
  const selectedKeys = new SelectionState();
  const selectedSeries = new SelectionState();

  const visibleData = $derived(
    chartData.filter((d) => {
      const dataKey = keyAccessor(d);
      return selectedKeys.isEmpty() || selectedKeys.isSelected(dataKey);
    })
  );

  // TODO: note, I added this because it wasn't consistent with all the other charts
  // unsure if it is correct but will validate with Sean
  const visibleSeries = $derived(
    series.filter((s) => selectedSeries.isEmpty() || selectedSeries.isSelected(s.key))
  );

  function getLegendProps(): ComponentProps<typeof Legend> {
    return {
      tickFormat: (tick) => {
        const item = chartData.find((d) => keyAccessor(d) === tick);
        return item ? (labelAccessor(item) ?? tick) : tick;
      },
      placement: 'bottom',
      variant: 'swatches',
      onclick: (e, item) => {
        selectedKeys.toggle(item.value);
        // TODO: investigate
        // selectedSeries.toggle(item.value);
      },
      onpointerenter: (e, item) => (highlightKey.current = item.value),
      onpointerleave: (e) => (highlightKey.current = null),
      ...props.legend,
      ...(typeof legend === 'object' ? legend : null),
      classes: {
        item: (item) =>
          visibleData.length && !visibleData.some((d) => keyAccessor(d) === item.value)
            ? 'opacity-50'
            : '',
        ...props.legend?.classes,
        ...(typeof legend === 'object' ? legend.classes : null),
      },
    };
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
      outerRadius: visibleSeries.length > 1 ? seriesIndex * (outerRadius ?? 0) : outerRadius,
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
      class: cls(
        'transition-opacity',
        highlightKey.current && highlightKey.current !== keyAccessor(arc.data) && 'opacity-50'
      ),
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
      return visibleSeries;
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
  padding={{ bottom: legend ? 32 : 0 }}
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
      visibleSeries,
      visibleData,
      highlightKey: highlightKey.current,
      setHighlightKey: highlightKey.set,
      getLegendProps,
      getGroupProps,
    }}
    {#if childrenProp}
      {@render childrenProp(snippetProps)}
    {:else}
      {@render belowContext?.(snippetProps)}

      <Layer
        type={renderContext}
        {...asAny(renderContext === 'canvas' ? props.canvas : props.svg)}
        {center}
        {debug}
      >
        {@render belowMarks?.(snippetProps)}

        {#if typeof marks === 'function'}
          {@render marks(snippetProps)}
        {:else}
          <Group {...getGroupProps()}>
            {#each visibleSeries as s, seriesIdx (s.key)}
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
