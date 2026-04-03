<script lang="ts" module>
  import type { CurveFactory, CurveFactoryLineOnly, Line } from 'd3-shape';

  import { accessor, type Accessor } from '../utils/common.js';
  import type { MotionProp } from '$lib/utils/motion.svelte.js';
  import type { DataProp } from '$lib/utils/dataProp.js';
  import type { TrailCap } from '$lib/utils/trail.js';
  import type { PathProps } from './Path.svelte';

  export type TrailPropsWithoutHTML = {
    /**
     * Override data instead of using context
     */
    data?: any;

    /**
     * Override `x` accessor from Chart context
     */
    x?: Accessor;

    /**
     * Override `y` accessor from Chart context
     */
    y?: Accessor;

    /**
     * Series key to use for accessor. Only applicable if `<Chart>` uses `series` and `x`/`y` are not set.
     */
    seriesKey?: string;

    /**
     * Function to determine if a point is defined
     *
     * @example
     * <Trail defined={(d) => d.value !== null} />
     */
    defined?: Parameters<Line<any>['defined']>[0];

    /**
     * Width at each point. Falls back to Chart's `r` accessor if not set.
     * - `number`: pixel value (direct)
     * - `string`: data property name, resolved via rScale
     * - `function(d)`: accessor called per data item, result passed through rScale
     *
     * @default 4 (when Chart `r` is also not set)
     */
    r?: DataProp;

    /**
     * Curve interpolation applied to the trail centerline.
     * @example
     * import { curveNatural } from 'd3-shape';
     * <Trail curve={curveNatural} />
     */
    curve?: CurveFactory | CurveFactoryLineOnly;

    /**
     * Cap style for trail endpoints.
     * - 'round' (default): semicircular end caps
     * - 'butt': flat ends with polygon offset outline
     * @default 'round'
     */
    cap?: TrailCap;

    /**
     * Tension parameter for applicable curve factories (0–1).
     * Applied via curveCardinal.tension(), curveCatmullRom.alpha(), or curveBundle.beta().
     */
    tension?: number;

    /**
     * Number of interpolated samples per segment for curve resampling.
     * Auto-estimated when omitted.
     */
    resolution?: number;

    /**
     * Fill color
     */
    fill?: string;

    /**
     * Fill opacity
     */
    fillOpacity?: number;

    /**
     * Opacity
     */
    opacity?: number;

    /**
     * CSS class
     */
    class?: string;

    /**
     * Whether to animate the path using tweened interpolation.
     */
    motion?: MotionProp;
  };

  export type TrailProps = TrailPropsWithoutHTML &
    Omit<PathProps, keyof TrailPropsWithoutHTML | 'r'>;
</script>

<script lang="ts">
  import { max } from 'd3-array';
  import { interpolatePath } from 'd3-interpolate-path';
  import { cls } from '@layerstack/tailwind';

  import { isScaleBand } from '../utils/scales.svelte.js';
  import { resolveDataProp } from '$lib/utils/dataProp.js';
  import { getChartContext } from '$lib/contexts/chart.js';
  import { computeTrailPath } from '$lib/utils/trail.js';
  import { createMotion, extractTweenConfig } from '$lib/utils/motion.svelte.js';
  import Path from './Path.svelte';

  const ctx = getChartContext();

  let {
    data,
    x,
    y,
    seriesKey,
    defined,
    r,
    curve,
    cap,
    tension,
    resolution,
    fill,
    fillOpacity,
    opacity,
    motion,
    class: className,
    ...restProps
  }: TrailProps = $props();

  let series = $derived(ctx.series.series.find((s) => s.key === seriesKey));
  let seriesAccessor = $derived(series?.value ?? (series?.data ? undefined : series?.key));

  const xAccessor = $derived(
    accessor(x ?? (ctx.valueAxis === 'x' ? seriesAccessor : undefined) ?? ctx.x)
  );
  const yAccessor = $derived(
    accessor(y ?? (ctx.valueAxis === 'y' ? seriesAccessor : undefined) ?? ctx.y)
  );

  const xOffset = $derived(isScaleBand(ctx.xScale) ? ctx.xScale.bandwidth() / 2 : 0);
  const yOffset = $derived(isScaleBand(ctx.yScale) ? ctx.yScale.bandwidth() / 2 : 0);

  function getScaleValue(
    data: any,
    scale: typeof ctx.xScale | typeof ctx.yScale,
    accessor: Function
  ) {
    let value = accessor(data);

    if (Array.isArray(value)) {
      value = max(value);
    }

    if (scale.domain().length) {
      return scale(value);
    } else {
      return value;
    }
  }

  /** Resolve r per data point: prop > Chart r accessor > default 4 */
  const resolvedR = $derived(r ?? (ctx.config.r as DataProp | undefined));

  const trailPath = $derived.by(() => {
    const resolvedData = data ?? series?.data ?? ctx.data;
    const definedFn = defined ?? ((d: any) => xAccessor(d) != null && yAccessor(d) != null);

    const points = resolvedData
      .filter((d: any, i: number) => definedFn(d, i, resolvedData))
      .map((d: any) => ({
        x: getScaleValue(d, ctx.xScale, xAccessor) + xOffset,
        y: getScaleValue(d, ctx.yScale, yAccessor) + yOffset,
        r: resolvedR != null
          ? resolveDataProp(resolvedR, d, ctx.rScale, typeof resolvedR === 'number' ? resolvedR : 4)
          : 4,
      }));

    return computeTrailPath(points, { curve, cap, tension, resolution });
  });

  /**
   * Provide initial baseline trail so it animates up from y=0 on mount.
   * Computes a trail path with all y-values at baseline.
   */
  function defaultPathData() {
    // Skip baseline computation when motion is not initially enabled (faster initial render)
    if (!extractTweenConfig(motion)) return '';

    if (ctx.config.x) {
      const resolvedData = data ?? series?.data ?? ctx.data;
      const definedFn = defined ?? ((d: any) => xAccessor(d) != null && yAccessor(d) != null);
      const baseline = Math.min(ctx.yScale(0) ?? ctx.yRange[0], ctx.yRange[0]);

      const points = resolvedData
        .filter((d: any, i: number) => definedFn(d, i, resolvedData))
        .map((d: any) => ({
          x: getScaleValue(d, ctx.xScale, xAccessor) + xOffset,
          y: baseline,
          r: resolvedR != null
            ? resolveDataProp(resolvedR, d, ctx.rScale, typeof resolvedR === 'number' ? resolvedR : 4)
            : 4,
        }));

      return computeTrailPath(points, { curve, cap, tension, resolution });
    }

    return '';
  }

  // Always create tween motion so it's ready when motion is toggled on
  const tweenState = createMotion(defaultPathData(), () => trailPath, {
    type: 'tween',
    interpolate: interpolatePath,
  });

  /** Reactively check whether motion is enabled */
  const isTweened = $derived(extractTweenConfig(motion) != null);

  ctx.registerComponent({
    name: 'Trail',
    kind: 'mark',
    markInfo: () => ({ data, x, y, seriesKey, curve }),
  });
</script>

<Path
  pathData={isTweened ? tweenState.current : trailPath}
  {fill}
  fillOpacity={fillOpacity}
  {opacity}
  stroke="none"
  class={cls('lc-trail', className)}
  {...restProps}
/>

<style>
  @layer base {
    :global(:where(.lc-trail)) {
      --fill-color: var(--color-surface-content, currentColor);
    }

    :global(:where(.lc-layout-svg .lc-trail, svg.lc-trail):not([fill])) {
      fill: var(--fill-color);
    }
  }
</style>
