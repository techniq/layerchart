<script lang="ts" module>
  import type { Without } from '$lib/utils/types.js';
  import type { SVGAttributes } from 'svelte/elements';
  import type { CurveFactory, CurveFactoryLineOnly, Line } from 'd3-shape';

  import { accessor, type Accessor } from '../utils/common.js';
  import type { MotionProp } from '$lib/utils/motion.svelte.js';
  import type { ColorProp, StyleProp } from '$lib/utils/dataProp.js';

  export type SplinePropsWithoutHTML = {
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
     * Series key to use for accessor.  Only applicable if `<Chart>` uses `series` and `x`/`y` are not set.
     */
    seriesKey?: string;

    /**
     * Function to determine if a point is defined
     *
     * @example
     * <Spline defined={(d) => d.value !== null} />
     */
    defined?: Parameters<Line<any>['defined']>[0];

    /**
     * Curve of path drawn. Imported via d3-shape.
     *
     * @example
     * import { curveNatural } from 'd3-shape';
     * <Path curve={curveNatural} />
     *
     * @type {CurveFactory | CurveFactoryLineOnly | undefined}
     */
    curve?: CurveFactory | CurveFactoryLineOnly;

    /**
     * Stroke color or function returning stroke per data point.
     * When a function, consecutive points with the same value are grouped
     * into separate path segments, enabling per-segment styling.
     */
    stroke?: ColorProp;

    /**
     * Fill color or function returning fill per data point.
     * When a function, acts as a grouping channel like `stroke`.
     */
    fill?: ColorProp;

    /**
     * Opacity or function returning opacity per data point.
     * When a function, acts as a grouping channel like `stroke`.
     */
    opacity?: StyleProp<number | undefined>;

    /**
     * Whether to animate the path using tweened interpolation.
     * When set, the line will animate from the baseline (y=0) on mount.
     */
    motion?: MotionProp;
  } & Omit<PathProps, 'x' | 'y' | 'motion' | 'stroke' | 'fill' | 'opacity'>;

  export type SplineProps = SplinePropsWithoutHTML &
    Without<SVGAttributes<SVGPathElement>, SplinePropsWithoutHTML>;
</script>

<script lang="ts">
  import { draw as _drawTransition } from 'svelte/transition';

  import { geoPath as d3GeoPath } from 'd3-geo';
  import { line as d3Line, lineRadial } from 'd3-shape';
  import { max } from 'd3-array';
  import { interpolatePath } from 'd3-interpolate-path';

  import { isScaleBand } from '../utils/scales.svelte.js';
  import { getChartContext } from '$lib/contexts/chart.js';
  import { getGeoContext } from '$lib/contexts/geo.js';
  import { resolveColorProp, resolveStyleProp } from '$lib/utils/dataProp.js';
  import Path, { type PathProps } from './Path.svelte';
  import { createMotion, extractTweenConfig } from '$lib/utils/motion.svelte.js';

  const ctx = getChartContext();
  const geo = getGeoContext();

  let {
    data,
    x,
    y,
    seriesKey,
    defined,
    curve,
    stroke,
    fill,
    opacity,
    motion,
    ...restProps
  }: SplineProps = $props();

  ctx.registerComponent({
    name: 'Spline',
    kind: 'mark',
    markInfo: () => ({
      data,
      x,
      y,
      seriesKey,
      color: typeof stroke === 'string' ? stroke : undefined,
    }),
  });

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
      // If scale is defined with domain, map value
      return scale(value);
    } else {
      // Use raw value
      return value;
    }
  }

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

  function buildPath(resolvedData: any[]) {
    const path = ctx.radial
      ? lineRadial()
          .angle((d) => getScaleValue(d, ctx.xScale, xAccessor) + 0) // Never apply xOffset (LineChart radar, BarChart radial, ...)?
          .radius((d) => getScaleValue(d, ctx.yScale, yAccessor) + yOffset)
      : d3Line()
          .x((d) => getScaleValue(d, ctx.xScale, xAccessor) + xOffset)
          .y((d) => getScaleValue(d, ctx.yScale, yAccessor) + yOffset);

    path.defined(defined ?? ((d) => xAccessor(d) != null && yAccessor(d) != null));
    if (curve) path.curve(curve);

    return path(resolvedData) ?? '';
  }

  const d = $derived.by(() => {
    // Skip full-path computation when segments mode handles rendering
    if (hasAnyStyleFn && !geo.projection) return '';

    const resolvedData = data ?? series?.data ?? ctx.data;

    // Geo mode: convert data to GeoJSON LineString and render via geoPath
    if (geo.projection) {
      const coordinates = resolvedData
        .filter((d: any) => {
          if (defined) return defined(d, 0, resolvedData);
          return xAccessor(d) != null && yAccessor(d) != null;
        })
        .map((d: any) => [xAccessor(d), yAccessor(d)]);

      const lineString = { type: 'LineString' as const, coordinates };
      return d3GeoPath(geo.projection)(lineString) ?? '';
    }

    return buildPath(resolvedData);
  });

  type SegmentStyle = { stroke?: string; fill?: string; opacity?: number };

  /**
   * Groups consecutive data points by a composite key derived from function-valued style props.
   * The key at index `i` determines the style for the segment from point `i` to point `i+1`.
   * Each group includes an overlap of 1 point at boundaries for curve continuity.
   */
  function groupConsecutive(
    data: any[],
    keyFn: (d: any, index: number, data: any[]) => { key: string; style: SegmentStyle }
  ): Array<{ style: SegmentStyle; data: any[] }> {
    if (data.length < 2) return [];

    const groups: Array<{ style: SegmentStyle; data: any[] }> = [];
    let current = keyFn(data[0], 0, data);
    let startIdx = 0;

    for (let i = 1; i < data.length; i++) {
      const next = keyFn(data[i], i, data);
      if (next.key !== current.key) {
        groups.push({ style: current.style, data: data.slice(startIdx, i + 1) });
        startIdx = i;
        current = next;
      }
    }
    if (data.length - startIdx >= 2) {
      groups.push({ style: current.style, data: data.slice(startIdx) });
    }

    return groups;
  }

  const hasAnyStyleFn = $derived(
    typeof stroke === 'function' || typeof fill === 'function' || typeof opacity === 'function'
  );

  const segments = $derived.by(() => {
    if (!hasAnyStyleFn) return null;
    const resolvedData = data ?? series?.data ?? ctx.data;
    if (geo.projection) return null;

    const groups = groupConsecutive(resolvedData, (d, i, arr) => {
      const s = resolveColorProp(stroke, d, ctx.cScale, i, arr);
      const f = resolveColorProp(fill, d, ctx.cScale, i, arr);
      const o = resolveStyleProp(opacity, d, i, arr);
      return { key: `${s}\0${f}\0${o}`, style: { stroke: s, fill: f, opacity: o } };
    });

    return groups.map((group) => ({
      ...group.style,
      d: buildPath(group.data),
    }));
  });

  /**
   * Provide initial `0` horizontal baseline so the line animates up from y=0 on mount.
   * Computes a proper flattened path using d3-line with all y-values at baseline.
   */
  function defaultPathData() {
    // Skip baseline computation when motion is not initially enabled (faster initial render)
    if (!extractTweenConfig(motion)) return '';

    if (ctx.config.x) {
      const resolvedData = data ?? series?.data ?? ctx.data;
      const baseline = Math.min(ctx.yScale(0) ?? ctx.yRange[0], ctx.yRange[0]);

      const path = ctx.radial
        ? lineRadial()
            .angle((d) => getScaleValue(d, ctx.xScale, xAccessor) + 0)
            .radius(() => baseline)
        : d3Line()
            .x((d) => getScaleValue(d, ctx.xScale, xAccessor) + xOffset)
            .y(() => baseline);

      path.defined(defined ?? ((d) => xAccessor(d) != null && yAccessor(d) != null));
      if (curve) path.curve(curve);

      return path(resolvedData) ?? '';
    }

    return '';
  }

  // Always create tween motion so it's ready when motion is toggled on
  const tweenState = createMotion(defaultPathData(), () => d, {
    type: 'tween',
    interpolate: interpolatePath,
  });

  /** Reactively check whether motion is enabled */
  const isTweened = $derived(extractTweenConfig(motion) != null);

  const seriesOpacity = $derived(
    series?.key == null ||
      ctx.series.visibleSeries.length <= 1 ||
      ctx.series.isHighlighted(series.key, true)
      ? 1
      : 0.1
  );
</script>

<!-- TODO: handle in LineChart/etc? -->
<!-- class: cls(props.spline?.class, s.props?.class), -->

{#if segments}
  {#each segments as seg, i (i)}
    <Path
      pathData={seg.d}
      stroke={seg.stroke}
      fill={seg.fill}
      {...series?.props}
      {...restProps}
      opacity={seg.opacity ?? seriesOpacity}
    />
  {/each}
{:else}
  <Path
    pathData={isTweened ? tweenState.current : d}
    stroke={(typeof stroke === 'string' ? stroke : undefined) ?? series?.color}
    fill={typeof fill === 'string' ? fill : undefined}
    {...series?.props}
    {...restProps}
    opacity={(typeof opacity === 'number' ? opacity : undefined) ?? seriesOpacity}
  />
{/if}
