<script lang="ts" module>
  import type { Component } from 'svelte';
  import type { AnyScale } from '$lib/utils/scales.svelte.js';
  import type { ChartChildrenProps } from './ChartChildren.shared.svelte.js';

  /**
   * Per-layer primitives a `<ChartChildren.base>` consumer must inject.
   *
   * `Layer` is the layer wrapper (Svg / Canvas / Html, or the agnostic
   * `Layer` dispatcher). `Axis` / `Grid` / `Rule` / `Highlight` /
   * `ChartClipPath` are the per-layer compound mark variants (or the
   * agnostic dispatchers).
   */
  export type ChartChildrenBaseLayerComponents = {
    Layer: Component<any>;
    Axis: Component<any>;
    Grid: Component<any>;
    Rule: Component<any>;
    Highlight: Component<any>;
    ChartClipPath: Component<any>;
  };

  export type ChartChildrenBaseProps<
    TData,
    XScale extends AnyScale = AnyScale,
    YScale extends AnyScale = AnyScale,
  > = ChartChildrenProps<TData, XScale, YScale> & ChartChildrenBaseLayerComponents;
</script>

<script
  lang="ts"
  generics="TData = any, XScale extends AnyScale = AnyScale, YScale extends AnyScale = AnyScale"
>
  import { getChartContext } from '$lib/contexts/chart.js';
  import { getSettings } from '$lib/contexts/settings.js';
  import { asAny } from '$lib/utils/types.js';
  import { getObjectOrNull } from '$lib/utils/common.js';

  const context = getChartContext<TData, XScale, YScale>();
  const settings = getSettings();

  let {
    Layer,
    Axis,
    Grid,
    Rule,
    Highlight,
    ChartClipPath,
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
  }: ChartChildrenBaseProps<TData, XScale, YScale> = $props();

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
        {#await import('../charts/ChartAnnotations.svelte') then { default: ChartAnnotations }}
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
        {#await import('../Points/Points.svelte') then { default: Points }}
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
        {#await import('../Labels/Labels.svelte') then { default: Labels }}
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
        {#await import('../charts/ChartAnnotations.svelte') then { default: ChartAnnotations }}
          <ChartAnnotations {annotations} layer="above" />
        {/await}
      {/if}
    </ChartClipPath>
  </Layer>

  {@render aboveContext?.(snippetProps)}

  {#if typeof legend === 'function'}
    {@render legend(snippetProps)}
  {:else if legend}
    {#await import('../Legend.svelte') then { default: Legend }}
      <Legend placement="bottom" {...getObjectOrNull(legend)} {...props.legend} />
    {/await}
  {/if}

  {#if typeof tooltip === 'function'}
    {@render tooltip(snippetProps)}
  {:else if tooltipContext}
    {#await import('../charts/DefaultTooltip.svelte') then { default: DefaultTooltip }}
      <DefaultTooltip tooltipProps={props.tooltip} canHaveTotal />
    {/await}
  {/if}
{/if}
