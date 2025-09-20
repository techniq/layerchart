<script lang="ts" module>
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

  export type ArcChartProps<TData> = Pick<
    SimplifiedChartProps<TData, typeof Arc, ArcChartExtraSnippetProps<TData>>,
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
    | 'cRange'
    | 'padding'
    | 'context'
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

      arc?: SimplifiedChartSnippet<
        TData,
        typeof Arc,
        ArcChartExtraSnippetProps<TData> & {
          props: ComponentProps<typeof Arc>;
          /**
           * The index of the series currently being iterated over.
           */
          seriesIndex: number;
        }
      >;
    };
</script>

<script lang="ts" generics="TData">
  import { onMount, type ComponentProps } from 'svelte';
  import { sum } from 'd3-array';
  import { format } from '@layerstack/utils';
  import { cls } from '@layerstack/tailwind';

  import Arc, { type ArcPropsWithoutHTML } from '../Arc.svelte';
  import Chart from '../Chart.svelte';
  import Group from '../Group.svelte';
  import Layer from '../layout/Layer.svelte';
  import Legend from '../Legend.svelte';
  import * as Tooltip from '../tooltip/index.js';

  import {
    accessor,
    chartDataArray,
    getObjectOrNull,
    resolveMaybeFn,
    type Accessor,
  } from '../../utils/common.js';
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
    return data.map((d) => {
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

  const visibleSeries = $derived(
    series.filter(
      (s) => seriesState.selectedSeries.isEmpty() || seriesState.selectedSeries.isSelected(s.key)
    )
  );

  const allSeriesData = $derived(
    visibleSeries
      .flatMap((s) =>
        s.data?.map((d) => {
          return { seriesKey: s.key, ...d };
        })
      )
      .filter((d) => d) as Array<TData & { stackData?: any }>
  );

  const chartData = $derived(
    allSeriesData.length ? allSeriesData : chartDataArray(data)
  ) as Array<TData>;

  const seriesColors = $derived(series.map((s) => s.color).filter((d) => d != null));

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
        onclick: (e, item) => {
          // Select data keys instead of series value
          seriesState.selectedKeys.toggle(item.value);
        },
        ...props.legend,
        ...getObjectOrNull(legend),
        classes: {
          ...props.legend?.classes,
          ...getObjectOrNull(legend)?.classes,
          item: (item) => {
            const isVisible =
              visibleData.length && !visibleData.some((d) => keyAccessor(d) === item.value);
            return cls(
              resolveMaybeFn(props.legend?.classes?.item, item),
              resolveMaybeFn(getObjectOrNull(legend)?.classes?.item, item),
              isVisible && 'opacity-50'
            );
          },
        },
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

  function getArcProps(s: SeriesData<TData, typeof Arc>, i: number): ComponentProps<typeof Arc> {
    if (!context) return {};
    const d = s.data?.[0] || chartData[0];
    const multiSeries = data.length > 1 || series.length > 1;
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
      tooltipContext: context.tooltip,
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

  setTooltipMetaContext({
    type: 'arc',
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
      highlightKey: seriesState.highlightKey.current,
      setHighlightKey: seriesState.highlightKey.set,
      getLegendProps,
      getGroupProps,
      getArcProps,
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
            {#each series as s, i (s.key)}
              {#if typeof arc === 'function'}
                {@render arc({ ...snippetProps, seriesIndex: i, props: getArcProps(s, i) })}
              {:else}
                <Arc {...getArcProps(s, i)} />
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
