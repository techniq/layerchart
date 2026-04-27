<script lang="ts" module>
  import { type Area as D3Area, area as d3Area, areaRadial } from 'd3-shape';
  import type { SVGAttributes } from 'svelte/elements';
  import type { CommonStyleProps, Without } from '$lib/utils/types.js';
  import type { ComponentProps } from 'svelte';
  import { accessor, type Accessor } from '../utils/common.js';

  export type AreaPropsWithoutHTML = {
    /** Override data instead of using context */
    data?: any;

    /**
     * Pass `<path d={...} />` explicitly instead of calculating from data / context
     */
    pathData?: string | null;

    /**
     * Override x accessor
     */
    x?: Accessor;

    /**
     * Override y0 accessor. Defaults to max($yRange)
     */
    y0?: Accessor;

    /**
     * Override y1 accessor. Defaults to y accessor
     */
    y1?: Accessor;

    /**
     * Series key to use for accessor. Only applicable if `<Chart>` uses `series` and `y0`/`y1` are not set.
     */
    seriesKey?: string;

    /**
     * Whether to tween the interpolated path data using d3-interpolate-path
     */
    motion?: MotionProp;

    curve?: CurveFactory;

    defined?: Parameters<D3Area<any>['defined']>[0];

    /**
     * Enable showing line
     *
     * @default false
     */
    line?: boolean | Partial<ComponentProps<typeof Spline>>;
  } & Omit<PathProps, 'x' | 'y' | 'y0' | 'y1'>;

  export type AreaProps = AreaPropsWithoutHTML &
    Without<SVGAttributes<SVGPathElement>, AreaPropsWithoutHTML>;
</script>

<script lang="ts">
  import type { CurveFactory } from 'd3-shape';
  import { min } from 'd3-array';
  import { interpolatePath } from 'd3-interpolate-path';

  import Spline from './Spline.svelte';
  import Path, { type PathProps } from './Path/Path.svelte';
  import { isScaleBand } from '../utils/scales.svelte.js';
  import { flattenPathData } from '../utils/path.js';
  import { getChartContext } from '$lib/contexts/chart.js';
  import {
    createMotion,
    extractTweenConfig,
    type MotionProp,
    type ResolvedMotion,
  } from '$lib/utils/motion.svelte.js';
  import { extractLayerProps } from '$lib/utils/attributes.js';

  const ctx = getChartContext();

  let {
    curve,
    data,
    defined,
    fill,
    stroke = 'none',
    line = false,
    pathData,
    motion,
    x,
    y0,
    y1,
    seriesKey,
    ...restProps
  }: AreaProps = $props();

  // Register as composite mark (shields child Spline) + chart mark registration
  ctx.registerComponent({
    name: 'Area',
    kind: 'composite-mark',
    markInfo: () => ({ data, x, y: y1 ?? y0, seriesKey, color: fill as string | undefined }),
  });

  let series = $derived(ctx.series.series.find((s) => s.key === seriesKey));
  let seriesData = $derived(series?.data);
  let seriesAccessor = $derived(series?.value ?? (series?.data ? undefined : series?.key));

  // Get stack accessors if seriesKey is provided and stacking is enabled
  let stackAccessors = $derived(
    seriesKey && ctx.series.isStacked ? ctx.series.getStackAccessors(seriesKey) : null
  );

  const xAccessor = $derived(x ? accessor(x) : ctx.x);
  // Use stack accessors when available, otherwise fall back to explicit props or defaults
  // Also handle array-form seriesAccessor like ['baseline', 'value']
  const y0Accessor = $derived(
    y0
      ? accessor(y0)
      : stackAccessors
        ? stackAccessors.y0
        : Array.isArray(seriesAccessor)
          ? accessor(seriesAccessor[0])
          : Array.isArray(ctx.config.y) && ctx.config.y[0] === 0
            ? (d: any) => ctx.y(d)[0]
            : ctx.props.yBaseline != null
              ? () => ctx.props.yBaseline
              : (d: any) => min(ctx.yScale.domain())
  );
  const y1Accessor = $derived(
    y1
      ? accessor(y1)
      : stackAccessors
        ? stackAccessors.y1
        : Array.isArray(seriesAccessor)
          ? accessor(seriesAccessor[1])
          : seriesAccessor
            ? accessor(seriesAccessor)
            : Array.isArray(ctx.config.y) && ctx.config.y[1] === 1
              ? (d: any) => ctx.y(d)[1]
              : ctx.y
  );
  const resolvedData = $derived(data ?? seriesData ?? ctx.data);

  const xOffset = $derived(isScaleBand(ctx.xScale) ? ctx.xScale.bandwidth() / 2 : 0);
  const yOffset = $derived(isScaleBand(ctx.yScale) ? ctx.yScale.bandwidth() / 2 : 0);

  const extractedTween = extractTweenConfig(motion);

  const tweenOptions: ResolvedMotion | undefined = extractedTween
    ? {
        type: extractedTween.type,
        options: {
          interpolate: interpolatePath,
          ...extractedTween.options,
        },
      }
    : undefined;

  /**
   * Provide initial `0` horizontal baseline and initially hide/untrack scale changes so not
   * reactive (only set on initial mount)
   */
  function defaultPathData() {
    if (!tweenOptions) {
      // If not tweened, return empty string (faster initial render)
      return '';
    } else if (pathData) {
      // Flatten all `y` coordinates of pre-defined `pathData`
      return flattenPathData(pathData, Math.min(ctx.yScale(0), ctx.yRange[0]));
    } else if (ctx.config.x) {
      // Only use default line if `x` accessor is defined (cartesian chart)
      const path = ctx.radial
        ? areaRadial()
            .angle((d) => ctx.xScale(xAccessor(d)))
            .innerRadius(() => Math.min(ctx.yScale(0), ctx.yRange[0]))
            .outerRadius(() => Math.min(ctx.yScale(0), ctx.yRange[0]))
        : d3Area()
            .x((d) => ctx.xScale(xAccessor(d)) + xOffset)
            .y0(() => Math.min(ctx.yScale(0), ctx.yRange[0]))
            .y1(() => Math.min(ctx.yScale(0), ctx.yRange[0]));

      path.defined(defined ?? ((d) => xAccessor(d) != null && y1Accessor(d) != null));

      if (curve) path.curve(curve);

      // TODO: type this appropriately otherwise we will have bugs in the future
      return path(resolvedData);
    }
  }

  const d = $derived.by(() => {
    const _path = ctx.radial
      ? areaRadial()
          .angle((d) => ctx.xScale(xAccessor(d)))
          .innerRadius((d) => ctx.yScale(y0Accessor(d)))
          .outerRadius((d) => ctx.yScale(y1Accessor(d)))
      : d3Area()
          .x((d) => {
            const v = xAccessor(d);
            return ctx.xScale(v) + xOffset;
          })
          .y0((d) => ctx.yScale(y0Accessor(d)) + yOffset)
          .y1((d) => ctx.yScale(y1Accessor(d)) + yOffset);

    _path.defined(defined ?? ((d: any) => xAccessor(d) != null && y1Accessor(d) != null));

    if (curve) _path.curve(curve);

    return pathData ?? _path(resolvedData) ?? defaultPathData();
  });

  const tweenState = createMotion(defaultPathData(), () => d, tweenOptions);

  const lineYAccessor = $derived.by(() => {
    // For diverging stacks, use the outer edge (y0 for below-baseline series, y1 for above)
    if (stackAccessors && ctx.series.stackLayout === 'stackDiverging') {
      const firstPoint = resolvedData?.[0];
      if (firstPoint) {
        const val = stackAccessors.value(firstPoint);
        if (val && val[1] <= 0) return y0Accessor;
      }
    }

    return y1 || stackAccessors || Array.isArray(seriesAccessor) || seriesAccessor
      ? y1Accessor
      : undefined;
  });
</script>

{#if line}
  <Spline
    data={data ?? seriesData}
    {x}
    y={lineYAccessor}
    {seriesKey}
    {curve}
    {defined}
    {motion}
    {...extractLayerProps(line, 'lc-area-line')}
  />
{/if}

<Path
  pathData={tweenState.current}
  fill={fill ?? series?.color}
  {stroke}
  opacity={series?.key == null ||
  // Checking `visibleSeries.length <= 1` fixes re-animated tweened areas on hover
  ctx.series.visibleSeries.length <= 1 ||
  ctx.series.isHighlighted(series.key, true)
    ? 1
    : 0.1}
  {...extractLayerProps(restProps, 'lc-area-path')}
/>
