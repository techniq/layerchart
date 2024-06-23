<script lang="ts">
  import { scaleBand, scaleLinear } from 'd3-scale';
  import { quantize, interpolate, interpolateRound } from 'd3-interpolate';
  import { quantile, range } from 'd3-array';
  import { format, type FormatType } from 'svelte-ux';
  import type { SVGAttributes } from 'svelte/elements';

  import { chartContext } from './ChartContext.svelte';
  import ColorRamp from './ColorRamp.svelte';
  import { cls } from 'svelte-ux';

  const { rScale } = chartContext() ?? {};

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
  export let tickFormat: FormatType = undefined;
  export let tickValues: any[] | undefined = undefined;
  export let tickFontSize = 10;
  export let tickLength = 4;
  export let placement: Placement | undefined = undefined;

  export let classes: {
    root?: string;
    title?: string;
    label?: string;
    tick?: string;
  } = {};

  $: if (scale == null && rScale) {
    // Read scale from chart context
    scale = $rScale;
  }

  let xScale: AnyScale;
  let interpolator: ((t: number) => string) | undefined;
  let swatches: SVGAttributes<SVGRectElement>[];
  let tickLabelOffset = 0;
  let tickLine = true;

  $: if (!scale) {
    // do nothing
  } else if (scale.interpolate) {
    // Continuous
    const n = Math.min(scale.domain().length, scale.range().length);
    xScale = scale.copy().rangeRound(quantize(interpolate(0, width), n));
    interpolator = scale.copy().domain(quantize(interpolate(0, 1), n));
    tickFormat = tickFormat ?? xScale.tickFormat?.();
  } else if (scale.interpolator) {
    // Sequential
    xScale = Object.assign(scale.copy().interpolator(interpolateRound(0, width)), {
      range() {
        return [0, width];
      },
    });
    interpolator = scale.interpolator();

    // scaleSequentialQuantile doesn’t implement ticks or tickFormat.
    if (!xScale.ticks) {
      if (tickValues === undefined) {
        const n = Math.round(ticks + 1);
        tickValues = range(n).map((i) => quantile(scale.domain(), i / (n - 1)));
      }
      // if (typeof tickFormat !== "function") {
      //   tickFormat = d3.format(tickFormat === undefined ? ",f" : tickFormat);
      // }
    }
    tickFormat = tickFormat ?? xScale.tickFormat?.();
  } else if (scale.invertExtent) {
    // Threshold
    const thresholds = scale.thresholds
      ? scale.thresholds() // scaleQuantize
      : scale.quantiles
        ? scale.quantiles() // scaleQuantile
        : scale.domain(); // scaleThreshold

    xScale = scaleLinear()
      .domain([-1, scale.range().length - 1])
      .rangeRound([0, width]);

    swatches = scale.range().map((d, i) => {
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
    xScale = scaleBand().domain(scale.domain()).rangeRound([0, width]);

    swatches = scale.domain().map((d: any) => {
      return {
        x: xScale(d),
        y: 0,
        width: Math.max(0, xScale.bandwidth() - 1),
        height,
        fill: scale(d),
      };
    });

    tickValues = scale.domain();
    tickLabelOffset = xScale.bandwidth() / 2;
    tickLine = false;
    tickLength = 0;
  }
</script>

<div
  {...$$restProps}
  class={cls(
    'inline-block',
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
  <slot values={tickValues} {scale}>
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
            class={cls('fill-surface-content text-[10px]', classes.label)}
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
  </slot>
</div>
