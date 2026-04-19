<script lang="ts" module>
  import type { MarkerOptions } from './MarkerWrapper.svelte';
  import type { Without } from '$lib/utils/types.js';
  import type { MotionNoneOption, MotionTweenOption } from '$lib/utils/motion.svelte.js';
  import { curveBumpX, curveBumpY, type CurveFactory } from 'd3-shape';
  import type {
    ConnectorSweep,
    ConnectorType,
  } from '$lib/utils/connectorUtils.js';
  import type { PathProps, PathPropsWithoutHTML } from './Path.svelte';

  export type LinkPropsWithoutHTML = {
    // --- Pixel mode -------------------------------------------------------
    /** Source `x` coordinate (pixel mode). */
    x1?: number;
    /** Source `y` coordinate (pixel mode). */
    y1?: number;
    /** Target `x` coordinate (pixel mode). */
    x2?: number;
    /** Target `y` coordinate (pixel mode). */
    y2?: number;

    // --- Data mode --------------------------------------------------------
    /** Link datum (e.g. a d3 hierarchy link or sankey link). */
    data?: any;

    /**
     * Update source and target accessors to be compatible with d3-sankey.  see: https://github.com/d3/d3-sankey#sankeyLinkHorizontal
     *
     * @default false
     */
    sankey?: boolean;
    /** Accessor returning the source node from `data`. */
    source?: (d: any) => any;
    /** Accessor returning the target node from `data`. */
    target?: (d: any) => any;
    /** Accessor returning `x` for a node. */
    x?: (d: any) => any;
    /** Accessor returning `y` for a node. */
    y?: (d: any) => any;

    // --- Geometry ---------------------------------------------------------
    /**
     * The connector path type.
     *
     * Set to `'d3'` to use a D3 curve function via the `curve` prop.
     *
     * @default 'd3'
     */
    type?: ConnectorType;

    /**
     * Corner radius (used by `'beveled'` and `'rounded'`).
     *
     * @default 20
     */
    radius?: number;

    /**
     * Bend angle in degrees for the `'swoop'` connector type.
     *
     * @default 22.5
     */
    bend?: number;

    /**
     * D3 curve function (used when `type === 'd3'`).
     */
    curve?: CurveFactory;

    /**
     * Sweep direction for preset types and d3 paths.
     */
    sweep?: ConnectorSweep;

    /**
     * Convenient property to swap x/y accessor logic, and to indicate the
     * natural flow direction (affects default curve and axis-dependent step
     * curves).
     */
    orientation?: 'vertical' | 'horizontal';

    /**
     * Interpret coords as polar (`x` = angle, `y` = radius) and render in
     * radial space. Defaults to `ctx.radial` when unset.
     */
    radial?: boolean;

    // --- Markers ----------------------------------------------------------
    /** Marker at both start and end points. */
    marker?: MarkerOptions;
    /** Marker at the middle point. */
    markerMid?: MarkerOptions;
    /** Marker at the start point. */
    markerStart?: MarkerOptions;
    /** Marker at the end point. */
    markerEnd?: MarkerOptions;

    motion?: MotionTweenOption | MotionNoneOption;
  } & PathPropsWithoutHTML;

  export type LinkProps = LinkPropsWithoutHTML & Without<PathProps, LinkPropsWithoutHTML>;

  const FALLBACK_COORDS = { x: 0, y: 0 };
</script>

<script lang="ts">
  import {
    getConnectorD3Path,
    getConnectorPresetPath,
    getConnectorRadialD3Path,
    getConnectorRadialPresetPath,
  } from '$lib/utils/connectorUtils.js';
  import { getChartContext } from '$lib/contexts/chart.js';
  import Path from './Path.svelte';
  import MarkerWrapper from './MarkerWrapper.svelte';
  import { extractLayerProps } from '$lib/utils/attributes.js';
  import { createId } from '$lib/utils/createId.js';
  import {
    createMotion,
    extractTweenConfig,
    type ResolvedMotion,
  } from '$lib/utils/motion.svelte.js';
  import { interpolatePath } from 'd3-interpolate-path';

  const uid = $props.id();
  const ctx = getChartContext();

  let {
    // Pixel mode
    x1,
    y1,
    x2,
    y2,
    // Data mode
    data,
    sankey = false,
    source: sourceProp,
    target: targetProp,
    x: xProp,
    y: yProp,
    // Geometry
    orientation: orientationProp,
    curve: curveProp,
    type = 'd3',
    sweep: sweepProp,
    radius = 20,
    bend = 22.5,
    radial: radialProp,
    // Markers
    marker,
    markerStart,
    markerMid,
    markerEnd,
    // Motion / path
    motion,
    pathRef = $bindable(),
    pathData: pathDataProp,
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
    if (sweepProp) return sweepProp;
    if (type === 'd3') return 'none';
    return 'horizontal-vertical';
  });

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

  const isPixelMode = $derived(
    x1 !== undefined || y1 !== undefined || x2 !== undefined || y2 !== undefined
  );

  const sourceCoords = $derived.by(() => {
    if (isPixelMode) return { x: x1 ?? 0, y: y1 ?? 0 };
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

  const targetCoords = $derived.by(() => {
    if (isPixelMode) return { x: x2 ?? 100, y: y2 ?? 100 };
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

  const markerStartId = $derived(markerStart || marker ? createId('marker-start', uid) : '');
  const markerMidId = $derived(markerMid || marker ? createId('marker-mid', uid) : '');
  const markerEndId = $derived(markerEnd || marker ? createId('marker-end', uid) : '');

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

  const pathData = $derived.by(() => {
    if (pathDataProp) return pathDataProp;
    if (radial) {
      return type === 'd3'
        ? getConnectorRadialD3Path({ source: sourceCoords, target: targetCoords, curve })
        : getConnectorRadialPresetPath({
            source: sourceCoords,
            target: targetCoords,
            type,
            radius,
            bend,
          });
    }
    if (type === 'd3') {
      return getConnectorD3Path({
        source: sourceCoords,
        target: targetCoords,
        sweep,
        curve,
        orientation,
      });
    } else {
      return getConnectorPresetPath({
        source: sourceCoords,
        target: targetCoords,
        sweep,
        type,
        radius,
        bend,
      });
    }
  });

  const motionPath = createMotion(
    '',
    () => pathData,
    tweenOptions ? tweenOptions : { type: 'none' }
  );
</script>

<Path
  pathData={motionPath.current}
  bind:pathRef
  marker-start={markerStartId ? `url(#${markerStartId})` : undefined}
  marker-mid={markerMidId ? `url(#${markerMidId})` : undefined}
  marker-end={markerEndId ? `url(#${markerEndId})` : undefined}
  {...extractLayerProps(restProps, 'lc-link')}
  {...restProps}
/>
<MarkerWrapper id={markerStartId} marker={markerStart} />
<MarkerWrapper id={markerMidId} marker={markerMid} />
<MarkerWrapper id={markerEndId} marker={markerEnd} />
