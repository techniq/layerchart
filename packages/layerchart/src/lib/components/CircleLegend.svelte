<script lang="ts" module>
  import type { Placement } from './types.js';
  import { asAny, type Without } from '$lib/utils/types.js';

  export type CircleLegendPropsWithoutHTML = {
    /**
     * The scale to use for the legend. Defaults to the chart's `rScale`.
     */
    scale?: AnyScale;

    /**
     * The title of the legend.
     *
     * @default ''
     */
    title?: string;

    /**
     * The number of ticks to show.
     *
     * @default 4
     */
    ticks?: number;

    /**
     * Explicit tick values to show. Overrides `ticks`.
     */
    tickValues?: number[];

    /**
     * Format for the tick labels.
     */
    tickFormat?: FormatType | FormatConfig;

    /**
     * The font size of the tick labels.
     *
     * @default 10
     */
    tickFontSize?: number;

    /**
     * The font size of the title.
     *
     * @default 10
     */
    titleFontSize?: number;

    /**
     * Width reserved for the tick labels next to the circles.
     *
     * @default 40
     */
    labelWidth?: number;

    /**
     * Gap between the top of each circle and the leader line/label.
     *
     * @default 4
     */
    labelGap?: number;

    /**
     * Where to render the tick labels.
     * - `'right'` / `'left'`: outside the circles with a leader line
     * - `'inline'`: centered inside each circle, near the top
     *
     * @default 'right'
     */
    labelPlacement?: 'left' | 'right' | 'inline';

    /**
     * The placement of the legend.
     */
    placement?: Placement;

    /**
     * The fill color of the circles.
     *
     * @default 'none'
     */
    fill?: string;

    /**
     * The stroke color of the circles and leader lines.
     *
     * @default 'currentColor'
     */
    stroke?: string;

    /**
     * The stroke width of the circles.
     *
     * @default 1
     */
    strokeWidth?: number;

    /**
     * Classes to apply to the elements.
     *
     * @default {}
     */
    classes?: {
      root?: string;
      title?: string;
      circle?: string;
      tick?: string;
      label?: string;
    };

    /**
     * A bindable reference to the wrapping `<div>` element.
     *
     * @bindable
     */
    ref?: HTMLElement;
  };

  export type CircleLegendProps = CircleLegendPropsWithoutHTML &
    Without<HTMLAttributes<HTMLElement>, CircleLegendPropsWithoutHTML>;
</script>

<script lang="ts">
  import type { HTMLAttributes } from 'svelte/elements';
  import { format, type FormatType, type FormatConfig } from '@layerstack/utils';

  import { cls } from '@layerstack/tailwind';
  import type { AnyScale } from '$lib/utils/scales.svelte.js';
  import { getChartContext } from '$lib/contexts/chart.js';

  let {
    scale: scaleProp,
    title = '',
    ticks = 4,
    tickValues: tickValuesProp,
    tickFormat: tickFormatProp,
    tickFontSize = 10,
    titleFontSize = 10,
    labelWidth = 40,
    labelGap = 4,
    labelPlacement = 'right',
    placement,
    fill = 'none',
    stroke = 'currentColor',
    strokeWidth = 1,
    classes = {},
    ref: refProp = $bindable(),
    class: className,
    ...restProps
  }: CircleLegendProps = $props();

  let ref = $state<HTMLElement>();
  $effect.pre(() => {
    refProp = ref;
  });

  const ctx = getChartContext();

  const scale = $derived(scaleProp ?? ctx.rScale);

  const tickValues = $derived.by(() => {
    if (tickValuesProp) return tickValuesProp;
    if (!scale) return [] as number[];

    // Prefer scale.ticks (continuous scales) and pick the largest `ticks` positive values
    if (typeof (scale as any).ticks === 'function') {
      const all = ((scale as any).ticks(ticks) as number[]).filter((v) => Number(scale(v)) > 0);
      if (all.length >= 2) {
        return all.slice(-ticks);
      }
    }

    // Fallback: derive evenly spaced values from the domain extent
    const domain = scale.domain() as number[];
    const min = Number(domain[0]);
    const max = Number(domain[domain.length - 1]);
    const n = Math.max(2, ticks);
    return Array.from({ length: n }, (_, i) => min + ((max - min) * (i + 1)) / n);
  });

  const items = $derived.by(() => {
    if (!scale) return [] as Array<{ value: number; radius: number }>;
    return tickValues
      .map((value) => ({ value, radius: Number(scale(value)) }))
      .filter((d) => Number.isFinite(d.radius) && d.radius > 0)
      .sort((a, b) => b.radius - a.radius);
  });

  const maxRadius = $derived(items[0]?.radius ?? 0);

  const padding = $derived(Math.ceil(strokeWidth / 2));
  const titleHeight = $derived(title ? titleFontSize + 6 : 0);
  const width = $derived(
    labelPlacement === 'inline'
      ? maxRadius * 2 + padding * 2
      : maxRadius * 2 + padding * 2 + labelGap + labelWidth
  );
  const svgHeight = $derived(maxRadius * 2 + padding * 2 + titleHeight);
  const cx = $derived(
    labelPlacement === 'left' ? labelWidth + labelGap + maxRadius + padding : maxRadius + padding
  );
  const baseY = $derived(maxRadius * 2 + padding + titleHeight);

  // Leader line / label x positions (only used for left/right placement)
  const labelLineX = $derived(
    labelPlacement === 'left' ? cx - maxRadius - labelGap : cx + maxRadius + labelGap
  );
  const labelTextX = $derived(
    labelPlacement === 'inline' ? cx : labelPlacement === 'left' ? labelLineX - 2 : labelLineX + 2
  );
  const labelTextAnchor = $derived(
    labelPlacement === 'inline' ? 'middle' : labelPlacement === 'left' ? 'end' : 'start'
  );
</script>

<div
  bind:this={ref}
  {...restProps}
  data-placement={placement}
  class={cls('lc-circle-legend-container', className, classes.root)}
>
  {#if items.length}
    <svg {width} height={svgHeight} viewBox="0 0 {width} {svgHeight}" class="lc-circle-legend-svg">
      {#if title}
        <text
          x={cx}
          y={titleFontSize}
          text-anchor="middle"
          style:font-size={titleFontSize}
          class={cls('lc-circle-legend-title', classes.title)}
        >
          {title}
        </text>
      {/if}
      <g class="lc-circle-legend-g">
        {#each items as item (item.value)}
          <circle
            {cx}
            cy={baseY - item.radius}
            r={item.radius}
            {fill}
            {stroke}
            stroke-width={strokeWidth}
            class={cls('lc-circle-legend-circle', classes.circle)}
          />
          {#if labelPlacement !== 'inline'}
            <line
              x1={cx}
              y1={baseY - item.radius * 2}
              x2={labelLineX}
              y2={baseY - item.radius * 2}
              {stroke}
              stroke-dasharray="2,2"
              class={cls('lc-circle-legend-tick', classes.tick)}
            />
          {/if}
          <text
            x={labelTextX}
            y={labelPlacement === 'inline'
              ? baseY - item.radius * 2 + tickFontSize
              : baseY - item.radius * 2}
            text-anchor={labelTextAnchor}
            dominant-baseline={labelPlacement === 'inline' ? 'auto' : 'middle'}
            style:font-size={tickFontSize}
            class={cls('lc-circle-legend-label', classes.label)}
          >
            {tickFormatProp ? format(item.value, asAny(tickFormatProp)) : item.value}
          </text>
        {/each}
      </g>
    </svg>
  {/if}
</div>

<style>
  @layer components {
    :where(.lc-circle-legend-container) {
      display: inline-block;
      z-index: 1;

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

    :where(.lc-circle-legend-title) {
      font-weight: 600;
      fill: var(--color-surface-content, currentColor);
    }

    :where(.lc-circle-legend-svg) {
      overflow: visible;
    }

    :where(.lc-circle-legend-label) {
      fill: var(--color-surface-content, currentColor);
    }

    :where(.lc-circle-legend-tick) {
      stroke: var(--color-surface-content, currentColor);
    }

    :where(.lc-circle-legend-circle) {
      stroke: var(--color-surface-content, currentColor);
    }
  }
</style>
