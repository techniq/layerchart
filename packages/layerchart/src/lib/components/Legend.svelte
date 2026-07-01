<script lang="ts" module>
  import type { Snippet } from 'svelte';
  import type { Placement } from './types.js';
  import { asAny, type Without } from '$lib/utils/types.js';

  export type LegendItem = {
    value: any;
    color: string;
  };

  export type LegendPropsWithoutHTML = {
    scale?: AnyScale;

    /**
     * The title of the legend.
     *
     * @default ''
     */
    title?: string;

    /**
     * The width of the legend.
     *
     * @default 320
     */
    width?: number;

    /**
     * The height of the legend.
     *
     * @default 10
     */
    height?: number;

    /**
     * The number of ticks to show on the scale.
     * @default width / 64
     */
    ticks?: number;
    tickFormat?: FormatType | FormatConfig;
    tickValues?: any[];
    /**
     * The font size of the tick labels.
     *
     * @default 10
     */
    tickFontSize?: number;

    /**
     * The length of the tick marks.
     *
     * @default 4
     */
    tickLength?: number;

    /**
     * The placement of the legend.
     */
    placement?: Placement;

    /**
     * The orientation of the legend.
     *
     * @default 'horizontal'
     */
    orientation?: 'horizontal' | 'vertical';

    /**
     * Determine display ramp (individual color swatches or continuous ramp)
     *
     * @default 'ramp'
     */
    variant?: 'ramp' | 'swatches';

    /**
     * An array of selected items. If provided, the legend fades unselected items.
     */
    selected?: string[];

    /**
     * Value to indicate on the ramp (e.g. the currently hovered data point).
     * When set, a downward-pointing arrow is drawn above the bar at this value's
     * position. Defaults to auto-detecting from `ctx.tooltip.data` via the
     * chart's color accessor (`ctx.c`).
     */
    value?: number | string | null;

    /**
     * Classes to apply to the elements.
     *
     * @default {}
     */
    classes?: {
      root?: string;
      title?: string;
      label?: string;
      tick?: string;
      items?: string;
      swatch?: string;
      item?: string | ((item: LegendItem) => string);
    };

    onclick?: (e: MouseEvent, detail: LegendItem) => any;
    onpointerenter?: (e: MouseEvent, detail: LegendItem) => any;
    onpointerleave?: (e: MouseEvent, detail: LegendItem) => any;

    /**
     * A bindable reference to the wrapping `<div>` element.
     *
     * @bindable
     */
    ref?: HTMLElement;

    children?: Snippet<
      [
        {
          values: any[];
          scale: AnyScale | null;
          seriesItems: Array<{ key: string; label: string; color: string }> | null;
        },
      ]
    >;
  };

  export type LegendProps = LegendPropsWithoutHTML &
    Without<HTMLAttributes<HTMLElement>, LegendPropsWithoutHTML>;
</script>

<script lang="ts">
  import type { HTMLAttributes, SVGAttributes } from 'svelte/elements';
  import { scaleBand, scaleLinear } from 'd3-scale';
  import { quantize, interpolate, interpolateRound } from 'd3-interpolate';
  import { quantile, range } from 'd3-array';
  import { format, type FormatType, type FormatConfig } from '@layerstack/utils';

  import ColorRamp from './ColorRamp.svelte';
  import { cls } from '@layerstack/tailwind';
  import type { AnyScale } from '$lib/utils/scales.svelte.js';
  import { getChartContext } from '$lib/contexts/chart.js';
  import { extractLayerProps } from '$lib/utils/attributes.js';
  import { resolveMaybeFn } from '$lib/utils/common.js';

  let {
    scale: scaleProp,
    title = '',
    width = 320,
    height = 10,
    ticks = width / 64,
    tickFormat: tickFormatProp,
    tickValues: tickValuesProp,
    tickFontSize = 10,
    tickLength: tickLengthProp = 4,
    placement,
    orientation = 'horizontal',
    onclick: onclickProp,
    onpointerenter: onpointerenterProp,
    onpointerleave: onpointerleaveProp,
    variant: variantProp,
    selected: selectedProp,
    value: valueProp,
    classes = {},
    ref: refProp = $bindable(),
    class: className,
    children,
    ...restProps
  }: LegendProps = $props();

  let ref = $state<HTMLElement>();
  $effect.pre(() => {
    refProp = ref;
  });

  const ctx = getChartContext();

  // Check if we should use series-based legend (multiple series with colors defined)
  const hasSeriesWithColors = $derived.by(() => {
    if (!ctx.series) return false;
    const allSeries = ctx.series.series ?? [];
    // Check if we have multiple series OR a non-default series with colors
    return allSeries.length > 0 && !ctx.series.isDefaultSeries && allSeries.some((s) => s.color);
  });

  // Use series-based legend if we have series with colors, otherwise use scale
  const scale = $derived(hasSeriesWithColors ? null : (scaleProp ?? ctx.cScale));

  // Create series items for series-based legend
  const seriesItems = $derived.by(() => {
    if (!hasSeriesWithColors || !ctx.series) return null;

    // Get ALL series (not just visible) so legend items remain visible when deselected
    const allSeries = ctx.series.series ?? [];
    if (allSeries.length === 0) return null;

    return allSeries
      .filter((s) => s && s.key) // Filter out any invalid series
      .map((s) => {
        // Get label - prefer explicit label, then key
        let label = s.label ?? s.key;

        // If label is somehow not a string, convert it to string or use key
        if (typeof label !== 'string') {
          label = String(s.key);
        }

        return {
          key: s.key,
          label,
          color: s.color ?? 'currentColor',
        };
      });
  });

  type ScaleConfig = {
    xScale: AnyScale | undefined;
    interpolator: ((t: number) => string) | undefined;
    swatches: SVGAttributes<SVGRectElement>[] | undefined;
    tickLabelOffset: number;
    tickLine: boolean;
    tickValues: any[] | undefined;
    tickLength: number;
  };

  const scaleConfig: ScaleConfig = $derived.by(() => {
    if (!scale) {
      return {
        xScale: undefined,
        interpolator: undefined,
        swatches: undefined,
        tickLabelOffset: 0,
        tickLine: true,
        tickLength: tickLengthProp,
        tickFormat: tickFormatProp,
        tickValues: tickValuesProp,
      };
    } else if (scale.interpolate) {
      // Continuous
      const n = Math.min(scale.domain().length, scale.range().length);
      const xScale = scale.copy().rangeRound?.(quantize(interpolate(0, width), n));
      const interpolator = scale.copy().domain(quantize(interpolate(0, 1), n));
      const _tickFormat = tickFormatProp ?? xScale?.tickFormat?.();

      return {
        xScale,
        interpolator,
        tickFormat: _tickFormat,
        tickLabelOffset: 0,
        tickLine: true,
        tickValues: tickValuesProp,
        tickLength: tickLengthProp,
        swatches: undefined,
      };
    } else if (scale.interpolator) {
      // Sequential
      const xScale = Object.assign(scale.copy().interpolator!(interpolateRound(0, width)), {
        range() {
          return [0, width];
        },
      });
      const interpolator = scale.interpolator();
      let tickValues: any[] | undefined = tickValuesProp;

      if (!xScale.ticks) {
        if (tickValues === undefined) {
          const n = Math.round(ticks + 1);
          tickValues = range(n).map((i) => quantile(scale.domain(), i / (n - 1)));
        }

        // if (typeof tickFormat !== "function") {
        //   tickFormat = d3.format(tickFormat === undefined ? ",f" : tickFormat);
        // }
      }

      const tickFormat = tickFormatProp ?? xScale.tickFormat?.();

      return {
        interpolator,
        tickValues: tickValues,
        tickFormat: tickFormat,
        swatches: undefined,
        tickLabelOffset: 0,
        tickLine: true,
        tickLength: tickLengthProp,
        xScale: xScale,
      };
    } else if (scale.invertExtent) {
      // Threshold
      const thresholds = scale.thresholds
        ? scale.thresholds() // scaleQuantize
        : scale.quantiles
          ? scale.quantiles() // scaleQuantile
          : scale.domain(); // scaleThreshold

      const xScale = scaleLinear()
        .domain([-1, scale.range().length - 1])
        .rangeRound([0, width]);
      const swatches = scale.range().map((d: any, i: number) => {
        return {
          x: xScale(i - 1),
          y: 0,
          width: xScale(i) - xScale(i - 1),
          height,
          fill: d,
        };
      });
      const tickValues = range(thresholds.length);
      const tickFormat = (i: number) => {
        const value = thresholds[i];
        // @ts-expect-error - improve types
        return tickFormatProp ? format(value, tickFormatProp) : value;
      };

      return {
        xScale,
        swatches,
        tickValues: tickValues,
        tickFormat: tickFormat,
        tickLabelOffset: 0,
        tickLine: true,
        tickLength: tickLengthProp,
        interpolator: undefined,
      };
    } else {
      // Ordinal

      const xScale = scaleBand().domain(scale.domain()).rangeRound([0, width]);

      const swatches = scale.domain().map((d: any) => {
        return {
          x: xScale(d),
          y: 0,
          width: Math.max(0, xScale.bandwidth() - 1),
          height,
          fill: scale(d),
        };
      });

      const tickValues = scale.domain();
      const tickLabelOffset = xScale.bandwidth() / 2;
      const tickLine = false;
      const tickLength = 0;
      return {
        xScale,
        tickFormat: tickFormatProp,
        tickLabelOffset,
        tickLine,
        tickLength,
        tickValues,
        swatches,
        interpolator: undefined,
      };
    }
  });

  const variant = $derived(variantProp ?? (seriesItems ? 'swatches' : 'ramp'));
  const selected = $derived(selectedProp ?? ctx.series?.selectedKeys?.current ?? []);

  // Position indicator for the currently hovered value on the ramp. If `value`
  // is explicitly provided, use it; otherwise fall back to `ctx.tooltip.data`
  // piped through the chart's color accessor (`ctx.c`).
  const indicatorX = $derived.by(() => {
    if (variant !== 'ramp' || !scale) return null;
    let value: any = valueProp;
    if (value == null) {
      const data = ctx.tooltip?.data;
      if (data == null) return null;
      value = ctx.c?.(data);
    }
    if (value == null) return null;

    // Threshold / quantize / quantile scales — scaleConfig.xScale maps swatch
    // *indices* to pixels, not the raw domain value. Find which bucket the
    // value falls into and center on that swatch.
    if ((scale as any).invertExtent) {
      const i = scale.range().indexOf(scale(value));
      if (i < 0) return null;
      const x0 = scaleConfig.xScale?.(i - 1);
      const x1 = scaleConfig.xScale?.(i);
      if (typeof x0 !== 'number' || typeof x1 !== 'number') return null;
      return (x0 + x1) / 2;
    }

    const x = scaleConfig.xScale?.(value);
    if (typeof x !== 'number' || !Number.isFinite(x)) return null;
    return x + scaleConfig.tickLabelOffset;
  });

  const swatchItems = $derived.by(() => {
    if (seriesItems) {
      // Series-based legend items
      return seriesItems.map((series) => ({
        value: series.key,
        label: series.label,
        color: series.color,
        onclick: (e: MouseEvent) => ctx.series?.selectedKeys?.toggle?.(series.key),
        onpointerenter: (e: MouseEvent) => {
          ctx.series!.highlightKey = series.key;
        },
        onpointerleave: (e: MouseEvent) => {
          ctx.series!.highlightKey = null;
        },
        selected: selected.length === 0 || selected.includes(series.key),
      }));
    } else {
      // Scale-based legend items
      const tickValues = scaleConfig.tickValues ?? scaleConfig.xScale?.ticks?.(ticks) ?? [];
      return tickValues.map((tick) => ({
        value: tick,
        label: tickFormatProp ? format(tick, asAny(tickFormatProp)) : tick,
        color: scale?.(tick) ?? '',
        onclick: (e: MouseEvent) => ctx.series?.selectedKeys?.toggle?.(tick),
        onpointerenter: (e: MouseEvent) => {
          ctx.series!.highlightKey = tick;
        },
        onpointerleave: (e: MouseEvent) => {
          ctx.series!.highlightKey = null;
        },
        selected: selected.length === 0 || selected.includes(tick),
      }));
    }
  });
</script>

<div
  bind:this={ref}
  {...restProps}
  data-placement={placement}
  class={cls('lc-legend-container', className, classes.root)}
>
  <div class={cls('lc-legend-title', classes.title)}>
    {title}
  </div>
  {#if children}
    {@render children({
      values: scaleConfig.tickValues ?? scaleConfig.xScale?.ticks?.(ticks) ?? [],
      scale,
      seriesItems,
    })}
  {:else if variant === 'ramp'}
    {@const indicatorSize = 6}
    {@const tickLabelY = height + tickLengthProp + tickFontSize}
    {@const svgHeight = tickLabelY}
    <svg
      {width}
      height={svgHeight}
      viewBox="0 0 {width} {svgHeight}"
      class={cls('lc-legend-ramp-svg')}
    >
      <g class="lc-legend-ramp-g">
        {#if scaleConfig.interpolator}
          <ColorRamp
            {width}
            {height}
            interpolator={scaleConfig.interpolator}
            class="lc-legend-color-ramp"
          />
        {:else if scaleConfig.swatches}
          {#each scaleConfig.swatches as swatch, i}
            <rect {...extractLayerProps(swatch, 'lc-legend-ramp-swatch')} />
          {/each}
        {/if}
      </g>

      <g class="lc-legend-tick-group">
        {#each tickValuesProp ?? scaleConfig.xScale?.ticks?.(ticks) ?? [] as tick, i}
          <text
            text-anchor="middle"
            x={scaleConfig.xScale?.(tick) + scaleConfig.tickLabelOffset}
            y={tickLabelY}
            style:font-size={tickFontSize}
            class={cls('lc-legend-tick-text', classes.label)}
          >
            <!-- @ts-expect-error - improve types -->
            {tickFormatProp ? format(tick, asAny(tickFormatProp)) : tick}
          </text>

          {#if scaleConfig.tickLine}
            <line
              x1={scaleConfig.xScale?.(tick)}
              y1={0}
              x2={scaleConfig.xScale?.(tick)}
              y2={height + tickLengthProp}
              class={cls('lc-legend-tick-line', classes.tick)}
            />
          {/if}
        {/each}
      </g>

      {#if indicatorX != null}
        <path
          d="M{indicatorX - 4},{height + indicatorSize + 1} L{indicatorX + 4},{height +
            indicatorSize +
            1} L{indicatorX},{height} Z"
          class={cls('lc-legend-indicator')}
        />
      {/if}
    </svg>
  {:else if variant === 'swatches'}
    <div class={cls('lc-legend-swatch-group', classes.items)} data-orientation={orientation}>
      {#each swatchItems as item}
        <button
          type="button"
          class={cls('lc-legend-swatch-button', resolveMaybeFn(classes?.item, item))}
          style:opacity={selected.length === 0 || selected.includes(item.value) ? 1 : 0.3}
          onclick={(e) => onclickProp?.(e, item) ?? item.onclick?.(e)}
          onpointerenter={(e) => onpointerenterProp?.(e, item) ?? item.onpointerenter?.(e)}
          onpointerleave={(e) => onpointerleaveProp?.(e, item) ?? item.onpointerleave?.(e)}
        >
          <div
            class={cls('lc-legend-swatch', classes.swatch)}
            style:background-color={item.color}
          ></div>
          <div class={cls('lc-legend-swatch-label', classes.label)}>
            {item.label}
          </div>
        </button>
      {/each}
    </div>
  {/if}
</div>

<style>
  @layer components {
    :where(.lc-legend-container) {
      display: inline-block;
      z-index: 1; /*stack above tooltip context layers (band rects, voronoi, ...) */

      &[data-placement] {
        position: absolute;
      }

      &[data-placement='top-left'] {
        top: 0;
        left: 0;
      }
      &[data-placement='top'] {
        top: 0;
        left: 50%;
        transform: translateX(-50%);
      }
      &[data-placement='top-right'] {
        top: 0;
        right: 0;
      }
      &[data-placement='left'] {
        top: 50%;
        left: 0;
        transform: translateY(-50%);
      }
      &[data-placement='center'] {
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
      }
      &[data-placement='right'] {
        top: 50%;
        right: 0;
        transform: translateY(-50%);
      }
      &[data-placement='bottom-left'] {
        bottom: 0;
        left: 0;
      }
      &[data-placement='bottom'] {
        bottom: 0;
        left: 50%;
        transform: translateX(-50%);
      }
      &[data-placement='bottom-right'] {
        bottom: 0;
        right: 0;
      }
    }

    :where(.lc-legend-title) {
      font-size: 10px;
      font-weight: 600;
    }

    :where(.lc-legend-ramp-svg) {
      overflow: visible;
    }

    :where(.lc-legend-tick-text) {
      font-size: 10px;
      fill: var(--color-surface-content, currentColor);
    }

    :where(.lc-legend-tick-line) {
      stroke: var(--color-surface-content, currentColor);
    }

    :where(.lc-legend-indicator) {
      fill: var(--color-surface-content, currentColor);
    }

    :where(.lc-legend-swatch-group) {
      display: flex;
      gap: 0.25rem 1rem;

      &[data-orientation='vertical'] {
        flex-direction: column;
      }
    }

    :where(.lc-legend-swatch-button) {
      display: flex;
      align-items: center;
      gap: 0.25rem;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    :where(.lc-legend-swatch) {
      width: 16px;
      height: 16px;
      flex-shrink: 0;
      border-radius: 9999px; /* full */
    }

    :where(.lc-legend-swatch-label) {
      font-size: 0.75rem; /* text-xs */
      line-height: calc(1 / 0.75);
      color: var(--color-surface-content, currentColor);
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
  }
</style>
