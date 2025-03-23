<script lang="ts" module>
  import type { Without } from '$lib/utils/types.js';
  import type { Snippet } from 'svelte';

  type Placement =
    | 'top-left'
    | 'top'
    | 'top-right'
    | 'left'
    | 'center'
    | 'right'
    | 'bottom-left'
    | 'bottom'
    | 'bottom-right';

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
    tickFormat?: FormatType;
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

    onclick?: (e: MouseEvent, detail: any) => any;
    onpointerenter?: (e: MouseEvent, detail: any) => any;
    onpointerleave?: (e: MouseEvent, detail: any) => any;

    /**
     * Determine display ramp (individual color swatches or continuous ramp)
     *
     * @default 'ramp'
     */
    variant?: 'ramp' | 'swatches';

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
      swatches?: string;
      swatch?: string;
      item?: (item: any) => string;
    };

    /**
     * A bindable reference to the wrapping `<div>` element.
     *
     * @bindable
     */
    ref?: HTMLElement;

    children?: Snippet<[{ values: any[]; scale: AnyScale | null }]>;
  };

  export type LegendProps = LegendPropsWithoutHTML &
    Without<HTMLAttributes<HTMLElement>, LegendPropsWithoutHTML>;
</script>

<script lang="ts">
  import type { HTMLAttributes, SVGAttributes } from 'svelte/elements';
  import { scaleBand, scaleLinear } from 'd3-scale';
  import { quantize, interpolate, interpolateRound } from 'd3-interpolate';
  import { quantile, range } from 'd3-array';
  import { format, type FormatType } from '@layerstack/utils';

  import ColorRamp from './ColorRamp.svelte';
  import { cls } from '@layerstack/tailwind';
  import type { AnyScale } from '$lib/utils/scales.svelte.js';
  import { getChartContext } from './Chart.svelte';
  import { extractLayerProps, layerClass } from '$lib/utils/attributes.js';

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
    onclick,
    onpointerenter,
    onpointerleave,
    variant = 'ramp',
    classes = {},
    ref = $bindable(),
    class: className,
    children,
    ...restProps
  }: LegendProps = $props();

  const ctx = getChartContext();

  const scale = $derived(scaleProp ?? ctx.cScale);

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
</script>

<div
  bind:this={ref}
  {...restProps}
  data-placement={placement}
  class={cls(
    layerClass('legend-container'),
    'inline-block',
    'z-1', // stack above tooltip context layers (band rects, voronoi, ...)
    placement && [
      'absolute',
      {
        'top-left': 'top-0 left-0',
        top: 'top-0 left-1/2 -translate-x-1/2',
        'top-right': 'top-0 right-0',
        left: 'top-1/2 left-0 -translate-y-1/2',
        center: 'top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2',
        right: 'top-1/2 right-0 -translate-y-1/2',
        'bottom-left': 'bottom-0 left-0',
        bottom: 'bottom-0 left-1/2 -translate-x-1/2',
        'bottom-right': 'bottom-0 right-0',
      }[placement],
    ],
    className,
    classes.root
  )}
>
  <div class={cls(layerClass('legend-title'), 'text-[10px] font-semibold', classes.title)}>
    {title}
  </div>
  {#if children}
    {@render children({ values: tickValuesProp ?? [], scale })}
  {:else if variant === 'ramp'}
    <svg
      {width}
      height={height + tickLengthProp + tickFontSize}
      viewBox="0 0 {width} {height + tickLengthProp + tickFontSize}"
      class={cls(layerClass('legend-ramp-svg'), 'overflow-visible')}
    >
      <g class={layerClass('legend-ramp-g')}>
        {#if scaleConfig.interpolator}
          <ColorRamp
            {width}
            {height}
            interpolator={scaleConfig.interpolator}
            class={layerClass('legend-color-ramp')}
          />
        {:else if scaleConfig.swatches}
          {#each scaleConfig.swatches as swatch, i}
            <rect {...extractLayerProps(swatch, 'legend-swatch')} />
          {/each}
        {/if}
      </g>

      <g class={layerClass('legend-tick-group')}>
        {#each tickValuesProp ?? scaleConfig.xScale?.ticks?.(ticks) ?? [] as tick, i}
          <text
            text-anchor="middle"
            x={scaleConfig.xScale?.(tick) + scaleConfig.tickLabelOffset}
            y={height + tickLengthProp + tickFontSize}
            style:font-size={tickFontSize}
            class={cls(
              layerClass('legend-tick-text'),
              'text-[10px] fill-surface-content',
              classes.label
            )}
          >
            {tickFormatProp ? format(tick, tickFormatProp) : tick}
          </text>

          {#if scaleConfig.tickLine}
            <line
              x1={scaleConfig.xScale?.(tick)}
              y1={0}
              x2={scaleConfig.xScale?.(tick)}
              y2={height + tickLengthProp}
              class={cls(layerClass('legend-tick-line'), 'stroke-surface-content', classes.tick)}
            />
          {/if}
        {/each}
      </g>
    </svg>
  {:else if variant === 'swatches'}
    <div
      class={cls(
        layerClass('legend-swatch-group'),
        'flex gap-x-4 gap-y-1',
        orientation === 'vertical' && 'flex-col',
        classes.swatches
      )}
    >
      {#each scaleConfig.tickValues ?? scaleConfig.xScale?.ticks?.(ticks) ?? [] as tick}
        {@const color = scale?.(tick)}
        {@const item = { value: tick, color }}
        <button
          class={cls(
            layerClass('legend-swatch-button'),
            'flex gap-1',
            !onclick && 'cursor-auto',
            classes.item?.(item)
          )}
          onclick={(e) => onclick?.(e, item)}
          onpointerenter={(e) => onpointerenter?.(e, item)}
          onpointerleave={(e) => onpointerleave?.(e, item)}
        >
          <div
            class={cls(layerClass('legend-swatch'), 'h-4 w-4 rounded-full', classes.swatch)}
            style:background-color={color}
          ></div>
          <div
            class={cls(
              layerClass('legend-swatch-label'),
              'text-xs text-surface-content whitespace-nowrap',
              classes.label
            )}
          >
            {tickFormatProp ? format(tick, tickFormatProp) : tick}
          </div>
        </button>
      {/each}
    </div>
  {/if}
</div>
