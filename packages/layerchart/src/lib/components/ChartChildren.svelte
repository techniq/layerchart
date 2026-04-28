<script lang="ts" module>
  import type { ComponentProps, Snippet } from 'svelte';
  import type TooltipContext from './tooltip/TooltipContext.svelte';
  import type Tooltip from './tooltip/Tooltip.svelte';
  import type TooltipHeader from './tooltip/TooltipHeader.svelte';
  import type TooltipList from './tooltip/TooltipList.svelte';
  import type TooltipItem from './tooltip/TooltipItem.svelte';
  import type TooltipSeparator from './tooltip/TooltipSeparator.svelte';

  // BaseChartProps
  export type ChartChildrenProps<
    TData,
    XScale extends AnyScale = AnyScale,
    YScale extends AnyScale = AnyScale,
    ChartSnippet = Snippet<[{ context: ChartState<TData, XScale, YScale> }]>,
  > = {
    /**
     * The axis to be used for the chart.
     *
     * @default true
     */
    axis?: ComponentProps<typeof Axis> | 'x' | 'y' | boolean | ChartSnippet;

    /**
     * The grid to be used for the chart.
     *
     * @default true
     */
    grid?: ComponentProps<typeof Grid> | boolean | ChartSnippet;

    /**
     * The labels to be used for the chart.
     *
     * @default false
     */
    labels?: ComponentProps<typeof Labels<TData>> | boolean | ChartSnippet;

    /**
     * The legend to be used for the chart.
     *
     * @default false
     */
    legend?: ComponentProps<typeof Legend> | boolean | ChartSnippet;

    /**
     * The points to be used for the chart.
     *
     * @default false
     */
    points?: ComponentProps<typeof Points> | boolean | ChartSnippet;

    /**
     * The rule to be used for the chart.
     *
     * @default true
     */
    rule?: ComponentProps<typeof Rule> | boolean | ChartSnippet;

    /**
     * The tooltip snippet to be used for the chart.
     */
    tooltip?: ChartSnippet;

    /**
     * Tooltip context to be used for the chart.
     */
    tooltipContext?: Partial<ComponentProps<typeof TooltipContext>> | boolean;

    highlight?: boolean | Partial<ComponentProps<typeof Highlight>> | ChartSnippet;

    /** Annotations to show on chart */
    annotations?: ChartAnnotationsType;

    /**
     * Callback when tooltip data is clicked.
     */
    onTooltipClick?: (e: MouseEvent, details: { data: any }) => void;

    /**
     * Additional props to be passed to the components rendered internally by Chart components.
     * This is useful for customizing the behavior of individual components, without having
     * to fully override them via snippets.
     */
    props?: Partial<{
      area: Partial<ComponentProps<typeof Area>>;
      arc: Partial<ComponentProps<typeof Arc>>;
      bars: Partial<ComponentProps<typeof Bars>>;
      brush: Partial<ComponentProps<typeof BrushContext>>;
      canvas: Partial<ComponentProps<typeof Canvas>>;
      grid: Partial<ComponentProps<typeof Grid>>;
      group: Partial<ComponentProps<typeof Group>>;
      highlight: Partial<ComponentProps<typeof Highlight>>;
      labels: Partial<ComponentProps<Labels<TData>>>;
      legend: Partial<ComponentProps<typeof Legend>>;
      line: Partial<ComponentProps<typeof Line>>;
      pie: Partial<ComponentProps<typeof Pie>>;
      spline: Partial<ComponentProps<typeof Spline>>;
      points: Partial<ComponentProps<typeof Points>>;
      rule: Partial<ComponentProps<typeof Rule>>;
      svg: Partial<ComponentProps<typeof Svg>>;
      tooltip: {
        context?: Partial<ComponentProps<typeof TooltipContext>>;
        root?: Omit<Partial<ComponentProps<typeof Tooltip>>, 'context'>;
        header?: Partial<ComponentProps<typeof TooltipHeader>>;
        list?: Partial<ComponentProps<typeof TooltipList>>;
        item?: Partial<ComponentProps<typeof TooltipItem>>;
        separator?: Partial<ComponentProps<typeof TooltipSeparator>>;
        hideTotal?: boolean;
      };
      xAxis: Partial<ComponentProps<typeof Axis>>;
      yAxis: Partial<ComponentProps<typeof Axis>>;
    }>;

    // Snippets
    children?: ChartSnippet;
    belowContext?: ChartSnippet;
    belowMarks?: ChartSnippet;
    marks?: ChartSnippet;
    aboveMarks?: ChartSnippet;
    aboveContext?: ChartSnippet;
  };
</script>

<script
  lang="ts"
  generics="TData = any, XScale extends AnyScale = AnyScale, YScale extends AnyScale = AnyScale"
>
  import Layer from './layers/Layer.svelte';

  import { getChartContext, type ChartState } from '../contexts/chart.js';
  import { getSettings } from '../contexts/settings.js';
  import type { AnyScale } from '../utils/scales.svelte.js';
  import { asAny } from '../utils/types.js';
  import { getObjectOrNull } from '../utils/common.js';

  import type Area from './Area.svelte';
  import type Arc from './Arc.svelte';
  import Axis from './Axis/Axis.svelte';
  import type Bars from './Bars.svelte';
  import type BrushContext from './BrushContext.svelte';
  import ChartClipPath from './ChartClipPath.svelte';
  // DefaultTooltip is lazy-loaded inline (only when `tooltipContext` is set
  // and no custom `tooltip` snippet is provided).
  import type DefaultTooltip from './charts/DefaultTooltip.svelte';
  import Grid from './Grid/Grid.svelte';
  import type Group from './Group/Group.svelte';
  import Highlight from './Highlight.svelte';
  import type Line from './Line/Line.svelte';
  import type Pie from './Pie.svelte';
  import Rule from './Rule/Rule.svelte';
  import type Spline from './Spline.svelte';
  import type { Canvas, Svg } from './index.js';
  import type { ChartAnnotations as ChartAnnotationsType } from './charts/types.js';

  // ChartAnnotations, Labels, Legend, and Points are dynamically imported
  // inline in the markup via `{#await import(...)}` so composed
  // `<Chart><Svg>...</Svg></Chart>` users (no auto-render props) don't pay
  // for them. The bundler turns each `import()` into a separate chunk. The
  // type-only imports below keep `ComponentProps<typeof X>` working in the
  // `props` prop type definition.
  // Note: lazy-only deps must be added to `vite.config.js`'s `optimizeDeps.include`
  // (e.g. `d3-interpolate` from Legend) so Vite doesn't reload mid-test in CI.
  import type Labels from './Labels.svelte';
  import type Legend from './Legend.svelte';
  import type Points from './Points.svelte';

  const context = getChartContext<TData, XScale, YScale>();
  const settings = getSettings();

  let {
    props = {},
    children: childrenProp,
    belowContext,
    grid = true,
    belowMarks,
    marks,
    aboveMarks,
    axis = true,
    rule = true,
    points = false,
    labels = false,
    highlight = true,
    aboveContext,
    legend,
    tooltip,
    tooltipContext,
    annotations = [],
  }: ChartChildrenProps<TData, XScale, YScale> = $props();

  let snippetProps = $derived({ context });
  let layer = $derived(settings.layer);
</script>

{#if childrenProp}
  {@render childrenProp(snippetProps)}
{:else}
  {@render belowContext?.(snippetProps)}

  <Layer
    type={layer}
    center={context.radial}
    {...asAny(layer === 'canvas' ? props.canvas : props.svg)}
    debug={settings.debug}
  >
    {#if typeof grid === 'function'}
      {@render grid(snippetProps)}
    {:else if grid}
      <Grid
        x={context.valueAxis === 'x' || context.radial}
        y={context.valueAxis === 'y' || context.radial}
        {...getObjectOrNull(grid)}
        {...props.grid}
      />
    {/if}

    <ChartClipPath disabled={!context.props.brush && context.transformState?.mode !== 'domain'}>
      {#if annotations.length > 0}
        {#await import('./charts/ChartAnnotations.svelte') then { default: ChartAnnotations }}
          <ChartAnnotations {annotations} layer="below" />
        {/await}
      {/if}

      {@render belowMarks?.(snippetProps)}
      {@render marks?.(snippetProps)}
      {@render aboveMarks?.(snippetProps)}
    </ChartClipPath>

    {#if typeof axis === 'function'}
      {@render axis(snippetProps)}

      {#if typeof rule === 'function'}
        {@render rule(snippetProps)}
      {:else if rule}
        <Rule
          x={context.valueAxis === 'x' ? 0 : false}
          y={context.valueAxis === 'y' ? 0 : false}
          {...getObjectOrNull(rule)}
          {...props.rule}
        />
      {/if}
    {:else if axis}
      {#if axis !== 'x'}
        <!-- y-axis -->
        <Axis
          placement={context.radial ? 'radius' : 'left'}
          {...getObjectOrNull(axis)}
          {...props.yAxis}
        />
      {/if}

      {#if axis !== 'y'}
        <!-- x-axis -->
        <Axis
          placement={context.radial ? 'angle' : 'bottom'}
          {...getObjectOrNull(axis)}
          {...props.xAxis}
        />
      {/if}

      {#if typeof rule === 'function'}
        {@render rule(snippetProps)}
      {:else if rule}
        <Rule
          x={context.valueAxis === 'x' ? 0 : false}
          y={context.valueAxis === 'y' ? 0 : false}
          {...getObjectOrNull(rule)}
          {...props.rule}
        />
      {/if}
    {/if}

    <!-- Use `full` to allow labels on edge to not be cropped (bleed into padding) -->
    <ChartClipPath
      disabled={!context.props.brush && context.transformState?.mode !== 'domain'}
      full
    >
      {#if typeof points === 'function'}
        {@render points(snippetProps)}
      {:else if points}
        {#await import('./Points.svelte') then { default: Points }}
          {#each context.series.visibleSeries as s, i (s.key)}
            <Points
              seriesKey={s.key}
              stroke="var(--color-surface-100, light-dark(white, black))"
              {...getObjectOrNull(points)}
              {...props.points}
            />
          {/each}
        {/await}
      {/if}

      {#if typeof labels === 'function'}
        {@render labels(snippetProps)}
      {:else if labels}
        {#await import('./Labels.svelte') then { default: Labels }}
          {@const labelSeriesKey = typeof labels === 'object' ? labels.seriesKey : undefined}
          {#each context.series.visibleSeries.filter((s) => !labelSeriesKey || s.key === labelSeriesKey) as s, i (s.key)}
            <Labels seriesKey={s.key} {...getObjectOrNull(labels)} {...props.labels} />
          {/each}
        {/await}
      {/if}

      {#if typeof highlight === 'function'}
        {@render highlight(snippetProps)}
      {:else if highlight}
        <Highlight {...typeof highlight === 'object' ? highlight : {}} {...props.highlight} />
      {/if}

      {#if annotations.length > 0}
        {#await import('./charts/ChartAnnotations.svelte') then { default: ChartAnnotations }}
          <ChartAnnotations {annotations} layer="above" />
        {/await}
      {/if}
    </ChartClipPath>
  </Layer>

  {@render aboveContext?.(snippetProps)}

  {#if typeof legend === 'function'}
    {@render legend(snippetProps)}
  {:else if legend}
    {#await import('./Legend.svelte') then { default: Legend }}
      <Legend placement="bottom" {...getObjectOrNull(legend)} {...props.legend} />
    {/await}
  {/if}

  {#if typeof tooltip === 'function'}
    {@render tooltip(snippetProps)}
  {:else if tooltipContext}
    {#await import('./charts/DefaultTooltip.svelte') then { default: DefaultTooltip }}
      <DefaultTooltip tooltipProps={props.tooltip} canHaveTotal />
    {/await}
  {/if}
{/if}
