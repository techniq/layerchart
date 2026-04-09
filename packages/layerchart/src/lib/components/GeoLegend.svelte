<script lang="ts" module>
  import type { Placement } from './types.js';
  import { asAny, type Without } from '$lib/utils/types.js';

  export type GeoLegendUnits = 'km' | 'mi';

  export type GeoLegendVariant = 'bracket' | 'alternating';

  export type GeoLegendPropsWithoutHTML = {
    /**
     * Units to display.
     *
     * @default 'mi'
     */
    units?: GeoLegendUnits;

    /**
     * Visual style of the bar.
     * - `'bracket'`: top rule with downward brackets at each tick (default)
     * - `'alternating'`: alternating filled/unfilled segments between ticks
     *
     * @default 'bracket'
     */
    variant?: GeoLegendVariant;

    /**
     * Explicit distance to represent (in `units`). When omitted, a "nice" round
     * value is chosen so the bar covers roughly 25% of the chart width.
     */
    distance?: number;

    /**
     * Number of tick subdivisions of the bar.
     *
     * @default 4
     */
    ticks?: number;

    /**
     * Where to place the tick labels relative to the bar. Useful for stacking
     * two legends (e.g. kilometers + miles) tightly.
     *
     * @default 'bottom'
     */
    labelPlacement?: 'top' | 'bottom';

    /**
     * Format for the tick labels. Receives the distance in `units`.
     */
    tickFormat?: FormatType | FormatConfig | ((value: number) => string);

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
     * The thickness of the bar.
     *
     * @default 4
     */
    height?: number;

    /**
     * The title of the legend.
     *
     * @default ''
     */
    title?: string;

    /**
     * Reference point in chart pixel coordinates used to compute the
     * pixels-per-distance ratio. Defaults to the center of the chart's plot
     * area, which is generally a reasonable approximation away from the poles.
     */
    referencePoint?: [number, number];

    /**
     * Scale of the projection originally used to pre-project the data, for
     * charts that render pre-projected topologies via `geoIdentity`. For
     * example, the `us-atlas` `counties-albers-10m` / `states-albers-10m`
     * topologies are pre-projected with `geoAlbersUsa().scale(1300)`, so pass
     * `referenceScale={1300}`. When provided, pixels-per-distance is derived
     * directly from the chart's `geoIdentity` fit scale and this reference
     * scale, bypassing the `projection.invert` + `geoDistance` path which
     * does not work for pre-projected data.
     */
    referenceScale?: number;

    /**
     * The placement of the legend.
     */
    placement?: Placement;

    /**
     * The fill/stroke color of the bar.
     *
     * @default 'currentColor'
     */
    color?: string;

    /**
     * Classes to apply to the elements.
     *
     * @default {}
     */
    classes?: {
      root?: string;
      title?: string;
      bar?: string;
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

  export type GeoLegendProps = GeoLegendPropsWithoutHTML &
    Without<HTMLAttributes<HTMLElement>, GeoLegendPropsWithoutHTML>;
</script>

<script lang="ts">
  import type { HTMLAttributes } from 'svelte/elements';
  import { geoDistance } from 'd3-geo';
  import { format, type FormatType, type FormatConfig } from '@layerstack/utils';

  import { cls } from '@layerstack/tailwind';
  import { getChartContext } from '$lib/contexts/chart.js';

  let {
    units = 'mi',
    variant = 'bracket',
    distance: distanceProp,
    ticks = 4,
    labelPlacement = 'bottom',
    tickFormat: tickFormatProp,
    tickFontSize = 10,
    titleFontSize = 10,
    height = 4,
    title = '',
    referencePoint,
    referenceScale,
    placement,
    color = 'currentColor',
    classes = {},
    ref: refProp = $bindable(),
    class: className,
    ...restProps
  }: GeoLegendProps = $props();

  let ref = $state<HTMLElement>();
  $effect.pre(() => {
    refProp = ref;
  });

  const ctx = getChartContext();

  // Earth radius in the selected units
  const earthRadius = $derived(units === 'mi' ? 3958.8 : 6371);

  // Pixels per unit at the reference point on the current projection.
  // `null` if no projection or invert is unavailable (or numerically degenerate).
  const pixelsPerUnit = $derived.by(() => {
    const projection = ctx.geo?.projection;
    if (!projection) return null;

    let pxPerUnit: number;

    if (referenceScale != null) {
      // Pre-projected data path (e.g. `geoIdentity` + us-atlas
      // `counties-albers-10m`): `projection.invert` returns topology pixel
      // coordinates, not lon/lat, so `geoDistance` can't be used. Instead,
      // combine the chart's fit scale with the known base projection scale:
      //   topology units per chart px = 1 / fitScale
      //   radians per topology unit   = 1 / referenceScale
      //   units (mi/km) per radian    = earthRadius
      // => px per unit = (fitScale * referenceScale) / earthRadius
      const fitScale = typeof projection.scale === 'function' ? projection.scale() : null;
      if (fitScale == null || !Number.isFinite(fitScale) || fitScale === 0) return null;
      pxPerUnit = (fitScale * referenceScale) / earthRadius;
    } else {
      if (typeof projection.invert !== 'function') return null;

      const refPx: [number, number] = referencePoint ?? [ctx.width / 2, ctx.height / 2];
      const a = projection.invert(refPx);
      const b = projection.invert([refPx[0] + 1, refPx[1]]);
      if (!a || !b) return null;
      if (!Number.isFinite(a[0]) || !Number.isFinite(b[0])) return null;

      const radiansPerPx = geoDistance(a, b);
      if (!Number.isFinite(radiansPerPx) || radiansPerPx === 0) return null;

      const unitsPerPx = radiansPerPx * earthRadius;
      pxPerUnit = 1 / unitsPerPx;
    }

    // In `canvas` transform mode the projection itself is not re-scaled — the
    // rendered output is visually scaled by `ctx.transform.scale`, so we need
    // to multiply to keep the bar consistent with what the user sees.
    if (ctx.transform?.mode === 'canvas') {
      pxPerUnit *= ctx.transform.scale ?? 1;
    }

    return pxPerUnit;
  });

  function niceDistance(d: number) {
    if (!(d > 0)) return 0;
    const exp = Math.floor(Math.log10(d));
    const base = Math.pow(10, exp);
    const mantissa = d / base;
    let nice;
    if (mantissa < 1.5) nice = 1;
    else if (mantissa < 3) nice = 2;
    else if (mantissa < 7) nice = 5;
    else nice = 10;
    return nice * base;
  }

  const distance = $derived.by(() => {
    if (distanceProp != null) return distanceProp;
    if (pixelsPerUnit == null) return 0;
    const viewportUnits = ctx.width / pixelsPerUnit;
    return niceDistance(viewportUnits * 0.25);
  });

  const barWidth = $derived(pixelsPerUnit && distance > 0 ? distance * pixelsPerUnit : 0);

  const tickValues = $derived.by(() => {
    if (distance <= 0) return [] as number[];
    return Array.from({ length: ticks + 1 }, (_, i) => (distance * i) / ticks);
  });

  function formatTick(value: number) {
    if (typeof tickFormatProp === 'function') return tickFormatProp(value);
    if (tickFormatProp) return format(value, asAny(tickFormatProp));
    // Default: append unit on the last tick only
    return value === distance ? `${value} ${units}` : String(value);
  }

  const padding = 2;
  const titleHeight = $derived(title ? titleFontSize + 6 : 0);
  const tickLabelHeight = $derived(tickFontSize + 3);
  const width = $derived(Math.ceil(barWidth) + padding * 2);
  const svgHeight = $derived(titleHeight + height + tickLabelHeight + padding * 2 + 3);
  const barY = $derived(
    labelPlacement === 'top'
      ? titleHeight + padding + tickLabelHeight
      : titleHeight + padding
  );
  const tickLabelY = $derived(
    labelPlacement === 'top'
      ? titleHeight + padding + tickFontSize
      : barY + height + 3 + tickFontSize
  );

  // Single path for the `bracket` variant: outer bracket as one continuous
  // polyline (so corners join cleanly) plus interior ticks. The top rule sits
  // on the opposite side of the labels so the bracket "opens" toward them.
  const bracketPath = $derived.by(() => {
    if (barWidth <= 0) return '';
    const x0 = padding;
    const x1 = padding + barWidth;
    const yRule = labelPlacement === 'top' ? barY + height : barY;
    const yTicks = labelPlacement === 'top' ? barY : barY + height;
    let d = `M${x0},${yTicks}L${x0},${yRule}L${x1},${yRule}L${x1},${yTicks}`;
    for (let i = 1; i < ticks; i++) {
      const tx = padding + (barWidth * i) / ticks;
      d += `M${tx},${yRule}L${tx},${yTicks}`;
    }
    return d;
  });
</script>

<div
  bind:this={ref}
  {...restProps}
  data-placement={placement}
  class={cls('lc-geo-legend-container', className, classes.root)}
>
  {#if barWidth > 0}
    <svg {width} height={svgHeight} viewBox="0 0 {width} {svgHeight}" class="lc-geo-legend-svg">
      {#if title}
        <text
          x={padding}
          y={titleFontSize}
          style:font-size={titleFontSize}
          class={cls('lc-geo-legend-title', classes.title)}
        >
          {title}
        </text>
      {/if}
      {#if variant === 'bracket'}
        <path
          d={bracketPath}
          style:fill="none"
          stroke={color}
          stroke-linecap="round"
          stroke-linejoin="round"
          class={cls('lc-geo-legend-bar', classes.bar)}
        />
      {:else if variant === 'alternating'}
        <!-- Outline + alternating filled segments between consecutive ticks -->

        {#each Array.from({ length: ticks }) as _, i}
          {#if i % 2 === 0}
            {@const x1 = padding + (barWidth * i) / ticks}
            {@const x2 = padding + (barWidth * (i + 1)) / ticks}
            <rect
              x={x1}
              y={barY}
              width={x2 - x1}
              {height}
              fill={color}
              class={cls('lc-geo-legend-bar', classes.bar)}
            />
          {/if}
        {/each}
        <rect
          x={padding}
          y={barY}
          width={barWidth}
          {height}
          style:fill="none"
          stroke={color}
          class={cls('lc-geo-legend-bar', classes.bar)}
        />
      {/if}
      <g class="lc-geo-legend-ticks">
        {#each tickValues as value, i}
          {@const x = padding + (barWidth * i) / ticks}
          <text
            {x}
            y={tickLabelY}
            text-anchor="middle"
            style:font-size={tickFontSize}
            class={cls('lc-geo-legend-label', classes.label)}
          >
            {formatTick(value)}
          </text>
        {/each}
      </g>
    </svg>
  {/if}
</div>

<style>
  @layer components {
    :where(.lc-geo-legend-container) {
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

    :where(.lc-geo-legend-svg) {
      overflow: visible;
    }

    :where(.lc-geo-legend-title) {
      font-weight: 600;
      fill: var(--color-surface-content, currentColor);
    }

    :where(.lc-geo-legend-bar) {
      fill: var(--color-surface-content, currentColor);
    }

    :where(.lc-geo-legend-tick) {
      stroke: var(--color-surface-content, currentColor);
    }

    :where(.lc-geo-legend-label) {
      fill: var(--color-surface-content, currentColor);
    }
  }
</style>
