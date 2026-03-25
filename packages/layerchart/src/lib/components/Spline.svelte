<script lang="ts" module>
  import type { Without } from '$lib/utils/types.js';
  import type { SVGAttributes } from 'svelte/elements';
  import type { CurveFactory, CurveFactoryLineOnly, Line } from 'd3-shape';

  import { accessor, type Accessor } from '../utils/common.js';

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
  } & Omit<PathProps, 'x' | 'y'>;

  export type SplineProps = SplinePropsWithoutHTML &
    Without<SVGAttributes<SVGPathElement>, SplinePropsWithoutHTML>;
</script>

<script lang="ts">
  import { draw as _drawTransition } from 'svelte/transition';

  import { geoPath as d3GeoPath } from 'd3-geo';
  import { line as d3Line, lineRadial } from 'd3-shape';
  import { max } from 'd3-array';

  import { isScaleBand } from '../utils/scales.svelte.js';
  import { getChartContext } from '$lib/contexts/chart.js';
  import { getGeoContext } from '$lib/contexts/geo.js';
  import Path, { type PathProps } from './Path.svelte';

  const ctx = getChartContext();
  const geo = getGeoContext();

  let { data, x, y, seriesKey, defined, curve, stroke, ...restProps }: SplineProps = $props();

  ctx.registerComponentNode({
    name: 'Spline',
    kind: 'mark',
    markInfo: () => ({ data, x, y, seriesKey, color: stroke as string | undefined }),
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

  const d = $derived.by(() => {
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
  });
</script>

<!-- TODO: handle in LineChart/etc? -->
<!-- class: cls(props.spline?.class, s.props?.class), -->

<Path
  pathData={d}
  stroke={stroke ?? series?.color}
  opacity={series?.key == null ||
  // Checking `visibleSeries.length <= 1` fixes re-animated tweened areas on hover
  ctx.series.visibleSeries.length <= 1 ||
  ctx.series.isHighlighted(series.key, true)
    ? 1
    : 0.1}
  {...series?.props}
  {...restProps}
/>
