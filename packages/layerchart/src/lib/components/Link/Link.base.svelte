<script lang="ts" module>
  import type { Component } from 'svelte';
  import type { LinkProps } from './Link.shared.svelte.js';

  export type LinkBaseLayerComponents = {
    Path: Component<any>;
  };

  export type LinkBaseProps = LinkProps & LinkBaseLayerComponents;
</script>

<script lang="ts">
  import { curveBumpX, curveBumpY } from 'd3-shape';
  import {
    getLinkD3Path,
    getLinkPresetPath,
    getLinkRadialD3Path,
    getLinkRadialPresetPath,
  } from '$lib/utils/linkUtils.js';
  import { getChartContext } from '$lib/contexts/chart.js';
  import { accessor, type Accessor } from '$lib/utils/common.js';
  import { cls } from '@layerstack/tailwind';
  import {
    createMotion,
    extractTweenConfig,
    type ResolvedMotion,
  } from '$lib/utils/motion.svelte.js';
  import { interpolatePath } from 'd3-interpolate-path';
  import { LINK_FALLBACK_COORDS, isAccessorAccessor } from './Link.shared.svelte.js';

  const ctx = getChartContext();

  let {
    Path,
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
  }: LinkBaseProps = $props();

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

  const isArrayMode = $derived(
    isAccessorAccessor(x1) ||
      isAccessorAccessor(y1) ||
      isAccessorAccessor(x2) ||
      isAccessorAccessor(y2)
  );

  const isPixelMode = $derived(
    !isArrayMode &&
      (typeof x1 === 'number' ||
        typeof y1 === 'number' ||
        typeof x2 === 'number' ||
        typeof y2 === 'number')
  );

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

  const singleSourceCoords = $derived.by(() => {
    if (isPixelMode) {
      return { x: typeof x1 === 'number' ? x1 : 0, y: typeof y1 === 'number' ? y1 : 0 };
    }
    if (!data) return LINK_FALLBACK_COORDS;
    try {
      const sourceData = sourceAccessor(data);
      if (sourceData == null) return LINK_FALLBACK_COORDS;
      const xVal = xAccessor(sourceData);
      const yVal = yAccessor(sourceData);
      return { x: Number.isFinite(xVal) ? xVal : 0, y: Number.isFinite(yVal) ? yVal : 0 };
    } catch (e) {
      console.error('Error accessing source coordinates:', e, 'Data:', data);
      return LINK_FALLBACK_COORDS;
    }
  });

  const singleTargetCoords = $derived.by(() => {
    if (isPixelMode) {
      return { x: typeof x2 === 'number' ? x2 : 100, y: typeof y2 === 'number' ? y2 : 100 };
    }
    if (!data) return LINK_FALLBACK_COORDS;
    try {
      const targetData = targetAccessor(data);
      if (targetData == null) return LINK_FALLBACK_COORDS;
      const xVal = xAccessor(targetData);
      const yVal = yAccessor(targetData);
      return { x: Number.isFinite(xVal) ? xVal : 0, y: Number.isFinite(yVal) ? yVal : 0 };
    } catch (e) {
      console.error('Error accessing target coordinates:', e, 'Data:', data);
      return LINK_FALLBACK_COORDS;
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

  const singlePathData = $derived(
    isArrayMode ? '' : buildPath(singleSourceCoords, singleTargetCoords)
  );

  const extractedTween = extractTweenConfig(motion);
  const tweenOptions: ResolvedMotion | undefined = extractedTween
    ? {
        type: extractedTween.type,
        options: { interpolate: interpolatePath, ...extractedTween.options },
      }
    : undefined;

  // Pass `tweenOptions` (possibly undefined) so `createMotion` takes its
  // fast-path passthrough when no tween is configured — avoids allocating
  // a MotionNone container + per-instance `$effect` that fires on every
  // x1/y1/x2/y2 change. Critical for force-simulation graphs which can
  // have hundreds of links updating on every tick.
  const motionPath = createMotion('', () => singlePathData, tweenOptions);

  // Stable getter handed to `<Path>` instead of `motionPath.current`.
  // Reading `motionPath.current` directly in the template would subscribe
  // *this* component's template to per-tick updates, forcing the entire
  // `<Path>` block to re-evaluate (and re-spread props) on every change.
  // By passing a function reference, the per-tick `current` read happens
  // inside `<Path>`'s own template — the parent stays stable.
  const getPathData = () => motionPath.current;

  const arrayRows = $derived(isArrayMode ? data ?? ctx.data ?? [] : []);

  function resolvePerDatum<T>(value: T | ((d: any) => T) | undefined, d: any): T | undefined {
    return typeof value === 'function' ? (value as (d: any) => T)(d) : (value as T | undefined);
  }

  function resolveClass(d: any): string | undefined {
    return resolvePerDatum<string>(classProp as any, d);
  }

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
      {...restProps}
      stroke={resolvedStroke}
      fill={resolvePerDatum(fillProp, d)}
      stroke-width={resolvePerDatum(strokeWidthProp, d)}
      class={cls('lc-link', resolveClass(d))}
    />
  {/each}
{:else}
  <Path
    pathData={getPathData}
    bind:pathRef
    {marker}
    {markerStart}
    {markerMid}
    {markerEnd}
    {...restProps}
    class={cls('lc-link', typeof classProp === 'string' ? classProp : undefined)}
  />
{/if}
