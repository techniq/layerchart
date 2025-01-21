<script lang="ts">
  import type { SVGAttributes } from 'svelte/elements';
  import { scaleBand, scaleLinear } from 'd3-scale';
  import { quantize, interpolate, interpolateRound } from 'd3-interpolate';
  import { quantile, range } from 'd3-array';
  import { format, type FormatType } from '@layerstack/utils';

  import { chartContext } from './ChartContext.svelte';
  import ColorRamp from './ColorRamp.svelte';
  import { cls } from '@layerstack/tailwind';

  const { cScale } = chartContext() ?? {};

  type AnyScale = any;
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

  export let scale: AnyScale = undefined;
  export let title = '';
  export let width = 320;
  export let height = 10;
  export let ticks = width / 64;
  export let tickFormat: FormatType | undefined = undefined;
  export let tickValues: any[] | undefined = undefined;
  export let tickFontSize = 10;
  export let tickLength = 4;
  export let placement: Placement | undefined = undefined;
  export let orientation: 'horizontal' | 'vertical' = 'horizontal';

  export let onClick: ((item: any) => any) | undefined = undefined;
  export let onPointerEnter: ((item: any) => any) | undefined = undefined;
  export let onPointerLeave: ((item: any) => any) | undefined = undefined;

  /** Determine display ramp (individual color swatches or continuous ramp)*/
  export let variant: 'ramp' | 'swatches' = 'ramp';

  export let classes: {
    root?: string;
    title?: string;
    label?: string;
    tick?: string;
    swatches?: string;
    swatch?: string;
    item?: (item: any) => string;
  } = {};

  $: _scale = scale ?? (cScale ? $cScale : null);

  let xScale: AnyScale;
  let interpolator: ((t: number) => string) | undefined;
  let swatches: SVGAttributes<SVGRectElement>[];
  let tickLabelOffset = 0;
  let tickLine = true;

  $: if (!_scale) {
    // do nothing
  } else if (_scale.interpolate) {
    // Continuous
    const n = Math.min(_scale.domain().length, _scale.range().length);
    xScale = _scale.copy().rangeRound(quantize(interpolate(0, width), n));
    interpolator = _scale.copy().domain(quantize(interpolate(0, 1), n));
    tickFormat = tickFormat ?? xScale.tickFormat?.();
  } else if (_scale.interpolator) {
    // Sequential
    xScale = Object.assign(_scale.copy().interpolator(interpolateRound(0, width)), {
      range() {
        return [0, width];
      },
    });
    interpolator = _scale.interpolator();

    // scaleSequentialQuantile doesn’t implement ticks or tickFormat.
    if (!xScale.ticks) {
      if (tickValues === undefined) {
        const n = Math.round(ticks + 1);
        tickValues = range(n).map((i) => quantile(_scale.domain(), i / (n - 1)));
      }
      // if (typeof tickFormat !== "function") {
      //   tickFormat = d3.format(tickFormat === undefined ? ",f" : tickFormat);
      // }
    }
    tickFormat = tickFormat ?? xScale.tickFormat?.();
  } else if (_scale.invertExtent) {
    // Threshold
    const thresholds = _scale.thresholds
      ? _scale.thresholds() // scaleQuantize
      : _scale.quantiles
        ? _scale.quantiles() // scaleQuantile
        : _scale.domain(); // scaleThreshold

    xScale = scaleLinear()
      .domain([-1, _scale.range().length - 1])
      .rangeRound([0, width]);

    swatches = _scale.range().map((d: any, i: number) => {
      return {
        x: xScale(i - 1),
        y: 0,
        width: xScale(i) - xScale(i - 1),
        height,
        fill: d,
      };
    });

    tickValues = range(thresholds.length);
    tickFormat = (i) => {
      const value = thresholds[i];
      return $$props.tickFormat ? format(value, $$props.tickFormat) : value;
    };
  } else {
    // Ordinal
    xScale = scaleBand().domain(_scale.domain()).rangeRound([0, width]);

    swatches = _scale.domain().map((d: any) => {
      return {
        x: xScale(d),
        y: 0,
        width: Math.max(0, xScale.bandwidth() - 1),
        height,
        fill: _scale(d),
      };
    });

    tickValues = _scale.domain();
    tickLabelOffset = xScale.bandwidth() / 2;
    tickLine = false;
    tickLength = 0;
  }
</script>

<div
  {...$$restProps}
  class={cls(
    'inline-block',
    'z-[1]', // stack above tooltip context layers (band rects, voronoi, ...)
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
    $$restProps.class,
    classes.root
  )}
>
  <div class={cls('text-[10px] font-semibold', classes.title)}>{title}</div>
  <slot values={tickValues ?? []} scale={_scale}>
    {#if variant === 'ramp'}
      <svg
        {width}
        height={height + tickLength + tickFontSize}
        viewBox="0 0 {width} {height + tickLength + tickFontSize}"
        class="overflow-visible"
      >
        <g>
          {#if interpolator}
            <ColorRamp {width} {height} {interpolator} />
          {:else if swatches}
            {#each swatches as swatch, i}
              <rect {...swatch} />
            {/each}
          {/if}
        </g>

        <g>
          {#each tickValues ?? xScale?.ticks?.(ticks) ?? [] as tick, i}
            <text
              text-anchor="middle"
              x={xScale(tick) + tickLabelOffset}
              y={height + tickLength + tickFontSize}
              style:font-size={tickFontSize}
              class={cls('text-[10px] fill-surface-content', classes.label)}
            >
              {tickFormat ? format(tick, tickFormat) : tick}
            </text>

            {#if tickLine}
              <line
                x1={xScale(tick)}
                y1={0}
                x2={xScale(tick)}
                y2={height + tickLength}
                class={cls('stroke-surface-content', classes.tick)}
              />
            {/if}
          {/each}
        </g>
      </svg>
    {:else if variant === 'swatches'}
      <div
        class={cls(
          'flex gap-x-4 gap-y-1',
          orientation === 'vertical' && 'flex-col',
          classes.swatches
        )}
      >
        {#each tickValues ?? xScale?.ticks?.(ticks) ?? [] as tick}
          {@const color = _scale(tick)}
          {@const item = { value: tick, color }}
          <button
            class={cls('flex gap-1', !onClick && 'cursor-auto', classes.item?.(item))}
            on:click={() => onClick?.(item)}
            on:pointerenter={() => onPointerEnter?.(item)}
            on:pointerleave={() => onPointerLeave?.(item)}
          >
            <div
              class={cls('h-4 w-4 rounded-full', classes.swatch)}
              style:background-color={color}
            ></div>
            <div class={cls('text-xs text-surface-content whitespace-nowrap', classes.label)}>
              {tickFormat ? format(tick, tickFormat) : tick}
            </div>
          </button>
        {/each}
      </div>
    {/if}
  </slot>
</div>
