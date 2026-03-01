<script lang="ts" module>
  import type { ComponentProps, Snippet } from 'svelte';
  import TooltipContext from './tooltip/TooltipContext.svelte';
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

  import Area from './Area.svelte';
  import Arc from './Arc.svelte';
  import Axis from './Axis.svelte';
  import Bars from './Bars.svelte';
  import BrushContext from './BrushContext.svelte';
  import ChartAnnotations from './charts/ChartAnnotations.svelte';
  import ChartClipPath from './ChartClipPath.svelte';
  import DefaultTooltip from './charts/DefaultTooltip.svelte';
  import Grid from './Grid.svelte';
  import Group from './Group.svelte';
  import Highlight from './Highlight.svelte';
  import Points from './Points.svelte';
  import Labels from './Labels.svelte';
  import Legend from './Legend.svelte';
  import Line from './Line.svelte';
  import Pie from './Pie.svelte';
  import Rule from './Rule.svelte';
  import Spline from './Spline.svelte';
  import type { Canvas, Svg } from './index.js';
  import type { ChartAnnotations as ChartAnnotationsType } from './charts/types.js';

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
      <Grid x={context.radial} y {...getObjectOrNull(grid)} {...props.grid} />
    {/if}

    <ChartClipPath disabled={!context.props.brush && context.transformState?.mode !== 'domain'}>
      <ChartAnnotations {annotations} layer="below" />

      {@render belowMarks?.(snippetProps)}
      {@render marks?.(snippetProps)}
      {@render aboveMarks?.(snippetProps)}
    </ChartClipPath>

    {#if typeof axis === 'function'}
      {@render axis(snippetProps)}

      {#if typeof rule === 'function'}
        {@render rule(snippetProps)}
      {:else if rule}
        <Rule x={0} y={0} {...getObjectOrNull(rule)} {...props.rule} />
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
        <Rule x={0} y={0} {...getObjectOrNull(rule)} {...props.rule} />
      {/if}
    {/if}

    <!-- Use `full` to allow labels on edge to not be cropped (bleed into padding) -->
    <ChartClipPath disabled={!context.props.brush} full>
      {#if typeof points === 'function'}
        {@render points(snippetProps)}
      {:else if points}
        {#each context.series.visibleSeries as s, i (s.key)}
          <Points
            seriesKey={s.key}
            stroke="var(--color-surface-100, light-dark(white, black))"
            {...getObjectOrNull(points)}
            {...props.points}
          />
        {/each}
      {/if}

      {#if typeof labels === 'function'}
        {@render labels(snippetProps)}
      {:else if labels}
        {#each context.series.visibleSeries as s, i (s.key)}
          <Labels seriesKey={s.key} {...getObjectOrNull(labels)} {...props.labels} />
        {/each}
      {/if}

      {#if typeof highlight === 'function'}
        {@render highlight(snippetProps)}
      {:else if highlight}
        <Highlight {...typeof highlight === 'object' ? highlight : {}} {...props.highlight} />
      {/if}

      <ChartAnnotations {annotations} layer="above" />
    </ChartClipPath>
  </Layer>

  {@render aboveContext?.(snippetProps)}

  {#if typeof legend === 'function'}
    {@render legend(snippetProps)}
  {:else if legend}
    <Legend placement="bottom" {...getObjectOrNull(legend)} {...props.legend} />
  {/if}

  {#if typeof tooltip === 'function'}
    {@render tooltip(snippetProps)}
  {:else if tooltipContext}
    <DefaultTooltip tooltipProps={props.tooltip} canHaveTotal />
  {/if}
{/if}
