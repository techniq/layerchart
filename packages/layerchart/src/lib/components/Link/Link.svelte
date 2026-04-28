<script lang="ts" module>
  import type { MarkerOptions } from '../MarkerWrapper.svelte';
  import type { Without } from '$lib/utils/types.js';
  import type { MotionNoneOption, MotionTweenOption } from '$lib/utils/motion.svelte.js';
  import { curveBumpX, curveBumpY, type CurveFactory } from 'd3-shape';
  import type { LinkSweep, LinkType } from '$lib/utils/linkUtils.js';
  import type { PathProps, PathPropsWithoutHTML } from '../Path/Path.svelte';
  import type { Accessor } from '$lib/utils/common.js';

  export type LinkPropsWithoutHTML = {
    /**
     * Source `x` coordinate. Accepts a `number` (pixel value), a string property
     * name, or `(d) => value` accessor. Strings/functions use `ctx.xScale`.
     */
    x1?: Accessor;
    /**
     * Source `y` coordinate. Accepts a `number`, property name, or
     * `(d) => value` accessor. Strings/functions use `ctx.yScale`.
     */
    y1?: Accessor;
    /** Target `x` coordinate. See `x1`. */
    x2?: Accessor;
    /** Target `y` coordinate. See `y1`. */
    y2?: Accessor;

    /**
     * Data for the link. In array mode (when `x1`/`y1`/`x2`/`y2` are strings or
     * functions) this should be an array of rows; one path is rendered per row.
     * In hierarchy/sankey mode, a single link object (`{source, target, ...}`).
     * Defaults to `ctx.data` in array mode.
     */
    data?: any;

    /**
     * Update source and target accessors to be compatible with d3-sankey. see:
     * https://github.com/d3/d3-sankey#sankeyLinkHorizontal
     *
     * @default false
     */
    sankey?: boolean;
    /** Accessor returning the source node from `data` (hierarchy/sankey mode). */
    source?: (d: any) => any;
    /** Accessor returning the target node from `data` (hierarchy/sankey mode). */
    target?: (d: any) => any;
    /** Accessor returning `x` for a node (hierarchy/sankey mode). */
    x?: (d: any) => any;
    /** Accessor returning `y` for a node (hierarchy/sankey mode). */
    y?: (d: any) => any;

    /**
     * The link path type.
     *
     * Set to `'d3'` to use a D3 curve function via the `curve` prop.
     *
     * @default 'd3'
     */
    type?: LinkType;

    /**
     * Corner radius (used by `'beveled'` and `'rounded'`).
     *
     * @default 20
     */
    radius?: number;

    /**
     * Bend angle in degrees for the `'swoop'` link type.
     *
     * @default 22.5
     */
    bend?: number;

    /** D3 curve function (used when `type === 'd3'`). */
    curve?: CurveFactory;

    /** Sweep direction for preset types and d3 paths. */
    sweep?: LinkSweep;

    /**
     * Natural flow direction (affects default curve and axis-dependent step
     * curves). Also toggles x/y accessor logic in hierarchy mode.
     */
    orientation?: 'vertical' | 'horizontal';

    /**
     * Interpret coords as polar (`x` = angle, `y` = radius) and render in
     * radial space. Defaults to `ctx.radial` when unset.
     */
    radial?: boolean;

    /** Marker at both start and end points. */
    marker?: MarkerOptions;
    /** Marker at the middle point. */
    markerMid?: MarkerOptions;
    /** Marker at the start point. */
    markerStart?: MarkerOptions;
    /** Marker at the end point. */
    markerEnd?: MarkerOptions;

    motion?: MotionTweenOption | MotionNoneOption;

    /**
     * CSS class. In array mode, accepts a `(d) => string` function evaluated
     * per datum.
     */
    class?: string | ((d: any) => string);
  } & Omit<PathPropsWithoutHTML, 'class'>;

  export type LinkProps = LinkPropsWithoutHTML & Without<PathProps, LinkPropsWithoutHTML>;

  const FALLBACK_COORDS = { x: 0, y: 0 };

  function isAccessorAccessor(value: Accessor | undefined): boolean {
    return typeof value === 'string' || typeof value === 'function';
  }
</script>

<script lang="ts">
  import {
    getLinkD3Path,
    getLinkPresetPath,
    getLinkRadialD3Path,
    getLinkRadialPresetPath,
  } from '$lib/utils/linkUtils.js';
  import { getChartContext } from '$lib/contexts/chart.js';
  import Path from '../Path/Path.svelte';
  import { extractLayerProps } from '$lib/utils/attributes.js';
  import { accessor } from '$lib/utils/common.js';
  import { cls } from '@layerstack/tailwind';
  import {
    createMotion,
    extractTweenConfig,
    type ResolvedMotion,
  } from '$lib/utils/motion.svelte.js';
  import { interpolatePath } from 'd3-interpolate-path';

  const ctx = getChartContext();

  let {
    x1,
    y1,
    x2,
    y2,
    data,
    sankey = false,
    source: sourceProp,
    target: targetProp,
    x: xProp,
    y: yProp,
    orientation: orientationProp,
    curve: curveProp,
    type = 'd3',
    sweep: sweepProp,
    radius = 20,
    bend = 22.5,
    radial: radialProp,
    marker,
    markerStart,
    markerMid,
    markerEnd,
    motion,
    pathRef = $bindable(),
    pathData: pathDataProp,
    class: classProp,
    ...restProps
  }: LinkProps = $props();

  const radial = $derived(radialProp ?? ctx.radial ?? false);

  const orientation = $derived.by(() => {
    if (orientationProp) return orientationProp;
    if (sankey) return 'horizontal';
    return 'vertical';
  });

  const curve = $derived.by(() => {
    if (curveProp) return curveProp;
    if (orientation === 'horizontal') return curveBumpX;
    return curveBumpY;
  });

  const sweep = $derived.by(() => {
    if (type === 'd3') return sweepProp ?? 'none';
    if (sweepProp && sweepProp !== 'none') return sweepProp;
    return orientation === 'vertical' ? 'horizontal-vertical' : 'vertical-horizontal';
  });

  // Array/data mode: any of x1/y1/x2/y2 is a string or function
  const isArrayMode = $derived(
    isAccessorAccessor(x1) ||
      isAccessorAccessor(y1) ||
      isAccessorAccessor(x2) ||
      isAccessorAccessor(y2)
  );

  // Pixel mode: any of x1/y1/x2/y2 is a number (and not array mode)
  const isPixelMode = $derived(
    !isArrayMode &&
      (typeof x1 === 'number' ||
        typeof y1 === 'number' ||
        typeof x2 === 'number' ||
        typeof y2 === 'number')
  );

  // --- Hierarchy/sankey accessors (used only when !isArrayMode && !isPixelMode) ---
  const sourceAccessor = $derived.by(() => {
    if (sourceProp) return sourceProp;
    if (sankey) return (d: any) => ({ node: d.source, y: d.y0, isSource: true });
    return (d: any) => d.source;
  });

  const targetAccessor = $derived.by(() => {
    if (targetProp) return targetProp;
    if (sankey) return (d: any) => ({ node: d.target, y: d.y1, isSource: false });
    return (d: any) => d.target;
  });

  const xAccessor = $derived.by(() => {
    if (xProp) return xProp;
    if (sankey) return (d: any) => (d.isSource ? d.node.x1 : d.node.x0);
    if (radial) return (d: any) => d.x;
    return (d: any) => (orientation === 'horizontal' ? d.y : d.x);
  });

  const yAccessor = $derived.by(() => {
    if (yProp) return yProp;
    if (sankey) return (d: any) => d.y;
    if (radial) return (d: any) => d.y;
    return (d: any) => (orientation === 'horizontal' ? d.x : d.y);
  });

  // --- Array mode: resolve endpoint coords for each row ---
  const x1Accessor = $derived(accessor(x1 as Accessor));
  const y1Accessor = $derived(accessor(y1 as Accessor));
  const x2Accessor = $derived(accessor(x2 as Accessor));
  const y2Accessor = $derived(accessor(y2 as Accessor));

  const resolveArrayCoords = (d: any) => {
    const sxRaw = x1Accessor(d);
    const syRaw = y1Accessor(d);
    const txRaw = x2Accessor(d);
    const tyRaw = y2Accessor(d);
    const scaleX = typeof x1 === 'string' || typeof x1 === 'function' ? ctx.xScale : null;
    const scaleY = typeof y1 === 'string' || typeof y1 === 'function' ? ctx.yScale : null;
    const sx = scaleX && sxRaw != null ? scaleX(sxRaw) : typeof sxRaw === 'number' ? sxRaw : 0;
    const sy = scaleY && syRaw != null ? scaleY(syRaw) : typeof syRaw === 'number' ? syRaw : 0;
    const tx = scaleX && txRaw != null ? scaleX(txRaw) : typeof txRaw === 'number' ? txRaw : 0;
    const ty = scaleY && tyRaw != null ? scaleY(tyRaw) : typeof tyRaw === 'number' ? tyRaw : 0;
    return {
      source: { x: Number.isFinite(sx) ? sx : 0, y: Number.isFinite(sy) ? sy : 0 },
      target: { x: Number.isFinite(tx) ? tx : 0, y: Number.isFinite(ty) ? ty : 0 },
    };
  };

  // --- Single-path coords (pixel or hierarchy/sankey mode) ---
  const singleSourceCoords = $derived.by(() => {
    if (isPixelMode) {
      return { x: typeof x1 === 'number' ? x1 : 0, y: typeof y1 === 'number' ? y1 : 0 };
    }
    if (!data) return FALLBACK_COORDS;
    try {
      const sourceData = sourceAccessor(data);
      if (sourceData == null) return FALLBACK_COORDS;
      const xVal = xAccessor(sourceData);
      const yVal = yAccessor(sourceData);
      return { x: Number.isFinite(xVal) ? xVal : 0, y: Number.isFinite(yVal) ? yVal : 0 };
    } catch (e) {
      console.error('Error accessing source coordinates:', e, 'Data:', data);
      return FALLBACK_COORDS;
    }
  });

  const singleTargetCoords = $derived.by(() => {
    if (isPixelMode) {
      return { x: typeof x2 === 'number' ? x2 : 100, y: typeof y2 === 'number' ? y2 : 100 };
    }
    if (!data) return FALLBACK_COORDS;
    try {
      const targetData = targetAccessor(data);
      if (targetData == null) return FALLBACK_COORDS;
      const xVal = xAccessor(targetData);
      const yVal = yAccessor(targetData);
      return { x: Number.isFinite(xVal) ? xVal : 0, y: Number.isFinite(yVal) ? yVal : 0 };
    } catch (e) {
      console.error('Error accessing target coordinates:', e, 'Data:', data);
      return FALLBACK_COORDS;
    }
  });

  function buildPath(source: { x: number; y: number }, target: { x: number; y: number }) {
    if (pathDataProp) return pathDataProp;
    if (radial) {
      return type === 'd3'
        ? getLinkRadialD3Path({ source, target, curve })
        : getLinkRadialPresetPath({ source, target, type, radius, bend });
    }
    if (type === 'd3') {
      return getLinkD3Path({ source, target, sweep, curve, orientation });
    }
    return getLinkPresetPath({ source, target, sweep, type, radius, bend });
  }

  // --- Single-path case ---
  const singlePathData = $derived(
    isArrayMode ? '' : buildPath(singleSourceCoords, singleTargetCoords)
  );

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

  const motionPath = createMotion(
    '',
    () => singlePathData,
    tweenOptions ? tweenOptions : { type: 'none' }
  );

  // --- Array mode paths ---
  const arrayRows = $derived(isArrayMode ? (data ?? ctx.data ?? []) : []);

  function resolvePerDatum<T>(value: T | ((d: any) => T) | undefined, d: any): T | undefined {
    return typeof value === 'function' ? (value as (d: any) => T)(d) : (value as T | undefined);
  }

  function resolveClass(d: any): string | undefined {
    return resolvePerDatum<string>(classProp as any, d);
  }

  // Pull potentially-per-datum style props out of restProps so we can resolve
  // each per row in array mode (e.g. stroke={(d) => colorScale(...)})
  const strokeProp = $derived((restProps as any).stroke);
  const fillProp = $derived((restProps as any).fill);
  const strokeWidthProp = $derived(
    (restProps as any)['stroke-width'] ?? (restProps as any).strokeWidth
  );
</script>

{#if isArrayMode}
  {#each arrayRows as d, i (i)}
    {@const { source, target } = resolveArrayCoords(d)}
    {@const resolvedStroke =
      resolvePerDatum(strokeProp, d) ?? (ctx.config.c ? ctx.cGet(d) : undefined)}
    <Path
      pathData={buildPath(source, target)}
      {marker}
      {markerStart}
      {markerMid}
      {markerEnd}
      {...extractLayerProps(restProps, 'lc-link')}
      {...restProps}
      stroke={resolvedStroke}
      fill={resolvePerDatum(fillProp, d)}
      stroke-width={resolvePerDatum(strokeWidthProp, d)}
      class={cls('lc-link', resolveClass(d))}
    />
  {/each}
{:else}
  <Path
    pathData={motionPath.current}
    bind:pathRef
    {marker}
    {markerStart}
    {markerMid}
    {markerEnd}
    {...extractLayerProps(restProps, 'lc-link')}
    {...restProps}
    class={cls('lc-link', typeof classProp === 'string' ? classProp : undefined)}
  />
{/if}
