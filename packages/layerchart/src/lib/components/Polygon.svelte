<script lang="ts" module>
  import type { Without } from '$lib/utils/types.js';
  import type { DataProp, DataDrivenStyleProps } from '$lib/utils/dataProp.js';

  export type PolygonPropsWithoutHTML = {
    /**
     * The center x position of the polygon.
     * - `number`: pixel value (direct)
     * - `string`: data property name, resolved via xScale
     * - `function(d)`: accessor called per data item, result passed through xScale
     *
     * @default 0
     */
    cx?: DataProp;

    /**
     * The initial center x position of the polygon (pixel mode only).
     *
     * @default cx
     */
    initialCx?: number;

    /**
     * The center y position of the polygon.
     * - `number`: pixel value (direct)
     * - `string`: data property name, resolved via yScale
     * - `function(d)`: accessor called per data item, result passed through yScale
     *
     * @default 0
     */
    cy?: DataProp;

    /**
     * The initial center y position of the polygon (pixel mode only).
     *
     * @default cy
     */
    initialCy?: number;

    /**
     * The radius of the polygon.
     * - `number`: pixel value (direct)
     * - `string`: data property name, resolved via rScale
     * - `function(d)`: accessor called per data item, result passed through rScale
     *
     * @default 1
     */
    r?: DataProp;

    /**
     * The initial radius of the polygon (pixel mode only).
     *
     * @default r
     */
    initialR?: number;

    /**
     * Data array to iterate over in data mode.
     * Falls back to chart context data when not provided.
     */
    data?: any[];

    /**
     * Key function for keyed {#each} rendering in data mode.
     *
     * @default (d, i) => i
     */
    key?: (d: any, index: number) => any;

    /**
     * The number of points or explicit points to create the polygon.
     *
     * @default 4
     */
    points?: number | { x: number; y: number }[];

    /**
     * The radius of the curve for rounded corners.
     *
     * @default 0
     */
    cornerRadius?: number;

    /**
     * The rotation of the polygon.
     *
     * @default 0
     */
    rotate?: number;

    /**
     * The percent to inset the odd points of the star (<1 inset, >1 outset)
     *
     * @default 0
     */
    inset?: number;

    /**
     * The horizontal stretch factor of the polygon.
     *
     * @default 1
     */
    scaleX?: number;

    /**
     * The vertical stretch factor of the polygon.
     *
     * @default 1
     */
    scaleY?: number;

    /**
     * The skew angle in degrees along the X axis.
     *
     * @default 0
     */
    skewX?: number;

    /**
     * The skew angle in degrees along the Y axis.
     *
     * @default 0
     */
    skewY?: number;

    /**
     * The tilt factor for x-coordinates.
     *
     * @default 1
     */
    tiltX?: number;

    /**
     * The tilt factor for y-coordinates.
     *
     * @default 1
     */
    tiltY?: number;

    /**
     * A bindable reference to the `<path>` element
     *
     * @bindable
     */
    ref?: SVGPathElement;

    motion?: MotionProp;
  } & DataDrivenStyleProps;

  export type PolygonProps = PolygonPropsWithoutHTML &
    Without<SVGAttributes<Element>, PolygonPropsWithoutHTML>;
</script>

<script lang="ts">
  import { untrack } from 'svelte';
  import type { SVGAttributes } from 'svelte/elements';
  import { cls } from '@layerstack/tailwind';
  import { merge } from '@layerstack/utils';
  import { interpolatePath } from 'd3-interpolate-path';

  import { getLayerContext } from '$lib/contexts/layer.js';
  import { getChartContext } from '$lib/contexts/chart.js';
  import {
    createMotion,
    createDataMotionMap,
    extractTweenConfig,
    type MotionProp,
    type ResolvedMotion,
  } from '$lib/utils/motion.svelte.js';
  import { registerComponentNode } from '$lib/contexts/componentTree.svelte.js';
  import { renderPathData, type ComputedStylesOptions } from '$lib/utils/canvas.js';
  import { hasAnyDataProp, resolveDataProp, resolveColorProp, resolveGeoDataPair, resolveStyleProp } from '$lib/utils/dataProp.js';
  import { getGeoContext } from '$lib/contexts/geo.js';
  import { chartDataArray } from '$lib/utils/common.js';
  import { createKey } from '$lib/utils/key.svelte.js';
  import { polygon } from '$lib/utils/shape.js';
  import { roundedPolygonPath } from '$lib/utils/path.js';

  let {
    cx = 0,
    initialCx: initialCxProp,
    cy = 0,
    initialCy: initialCyProp,
    r = 1,
    initialR: initialRProp,
    data: dataProp,
    key: keyFn = (_: any, i: number) => i,
    points = 4,
    cornerRadius = 0,
    rotate = 0,
    inset = 0,
    scaleX = 1,
    scaleY = 1,
    skewX = 0,
    skewY = 0,
    tiltX = 0,
    tiltY = 0,
    motion,
    fill,
    fillOpacity,
    stroke,
    strokeWidth,
    opacity,
    class: className,
    ref: refProp = $bindable(),
    ...restProps
  }: PolygonProps = $props();

  let ref = $state<SVGPathElement>();

  $effect.pre(() => {
    refProp = ref;
  });

  // Chart context (safe to call outside Chart — returns fallback)
  const chartCtx = getChartContext();
  const geo = getGeoContext();

  // Data mode detection: if any positional prop is a string or function
  const dataMode = $derived(hasAnyDataProp(cx, cy, r));

  // Data to iterate over in data mode
  const resolvedData: any[] = $derived(
    dataMode ? (dataProp ?? chartDataArray(chartCtx.data)) : []
  );

  // Resolve a single data item to a polygon path string
  function resolvePolygon(d: any) {
    let resolvedCx: number, resolvedCy: number;
    if (geo.projection) {
      [resolvedCx, resolvedCy] = resolveGeoDataPair(cx, cy, d, geo.projection);
    } else {
      resolvedCx = resolveDataProp(cx, d, chartCtx.xScale, 0);
      resolvedCy = resolveDataProp(cy, d, chartCtx.yScale, 0);
    }
    const resolvedR = resolveDataProp(r, d, chartCtx.rScale, typeof r === 'number' ? r : 1);

    const pts = typeof points === 'number'
      ? polygon({
          cx: resolvedCx,
          cy: resolvedCy,
          count: points,
          radius: resolvedR,
          rotate,
          inset,
          scaleX,
          scaleY,
          skewX,
          skewY,
          tiltX,
          tiltY,
        })
      : points;

    return roundedPolygonPath(pts, cornerRadius);
  }

  // --- Data mode motion ---
  const dataMotionMap = createDataMotionMap(motion);

  $effect(() => {
    if (!dataMode || !dataMotionMap) return;
    const activeKeys = new Set<any>();
    for (let i = 0; i < resolvedData.length; i++) {
      const d = resolvedData[i];
      const key = keyFn(d, i);
      activeKeys.add(key);
      // Polygon resolve returns a path string, so resolve coords separately for motion
      let resolvedCx: number, resolvedCy: number;
      if (geo.projection) {
        [resolvedCx, resolvedCy] = resolveGeoDataPair(cx, cy, d, geo.projection);
      } else {
        resolvedCx = resolveDataProp(cx, d, chartCtx.xScale, 0);
        resolvedCy = resolveDataProp(cy, d, chartCtx.yScale, 0);
      }
      const resolvedR = resolveDataProp(r, d, chartCtx.rScale, typeof r === 'number' ? r : 1);
      untrack(() => dataMotionMap.update(key, { cx: resolvedCx, cy: resolvedCy, r: resolvedR }));
    }
    untrack(() => dataMotionMap.cleanup(activeKeys));
  });

  // TODO: Apply animated values from dataMotionMap to SVG/HTML/Canvas templates.
  // Polygon uses a path string from resolvePolygon(), so animated cx/cy/r values
  // need to be passed through the polygon generator to produce an animated path.

  // Single source of truth: resolved values with animated overlay
  const resolvedItems = $derived.by(() => {
    if (!dataMode) return [];
    return resolvedData.map((d, i) => {
      const key = keyFn(d, i);
      let resolvedCx: number, resolvedCy: number;
      if (geo.projection) {
        [resolvedCx, resolvedCy] = resolveGeoDataPair(cx, cy, d, geo.projection);
      } else {
        resolvedCx = resolveDataProp(cx, d, chartCtx.xScale, 0);
        resolvedCy = resolveDataProp(cy, d, chartCtx.yScale, 0);
      }
      const resolvedR = resolveDataProp(r, d, chartCtx.rScale, typeof r === 'number' ? r : 1);
      const animated = dataMotionMap?.get(key);
      return {
        d,
        key,
        cx: animated?.cx ?? resolvedCx,
        cy: animated?.cy ?? resolvedCy,
        r: animated?.r ?? resolvedR,
      };
    });
  });

  // --- Pixel mode (motion only applies here) ---
  const initialCx = initialCxProp ?? (typeof cx === 'number' ? cx : 0);
  const initialCy = initialCyProp ?? (typeof cy === 'number' ? cy : 0);
  const initialR = initialRProp ?? (typeof r === 'number' ? r : 1);

  const motionCx = createMotion(initialCx, () => (typeof cx === 'number' ? cx : 0), motion);
  const motionCy = createMotion(initialCy, () => (typeof cy === 'number' ? cy : 0), motion);
  const motionR = createMotion(initialR, () => (typeof r === 'number' ? r : 1), motion);

  let polygonPoints = $derived(
    typeof points === 'number'
      ? polygon({
          cx: motionCx.current,
          cy: motionCy.current,
          count: points,
          radius: motionR.current,
          rotate,
          inset,
          scaleX,
          scaleY,
          skewX,
          skewY,
          tiltX,
          tiltY,
        })
      : points
  );
  let d = $derived(roundedPolygonPath(polygonPoints, cornerRadius));

  const extractedTween = extractTweenConfig(motion);

  const tweenedOptions: ResolvedMotion | undefined = extractedTween
    ? {
        type: extractedTween.type,
        options: { interpolate: interpolatePath, ...extractedTween.options },
      }
    : undefined;

  const tweenedState = createMotion(null, () => d, tweenedOptions);

  const layerCtx = getLayerContext();

  function getStyleOptions(
    styleOverrides: ComputedStylesOptions | undefined,
    itemFill?: string | undefined,
    itemStroke?: string | undefined,
    itemFillOpacity?: number | undefined,
    itemStrokeWidth?: number | undefined,
    itemOpacity?: number | undefined,
    itemClass?: string | undefined
  ) {
    return styleOverrides
      ? merge({ styles: { strokeWidth: itemStrokeWidth ?? (typeof strokeWidth === 'number' ? strokeWidth : undefined) } }, styleOverrides)
      : {
          styles: {
            fill: itemFill ?? fill,
            fillOpacity: itemFillOpacity ?? (typeof fillOpacity === 'number' ? fillOpacity : undefined),
            stroke: itemStroke ?? stroke,
            strokeWidth: itemStrokeWidth ?? (typeof strokeWidth === 'number' ? strokeWidth : undefined),
            opacity: itemOpacity ?? (typeof opacity === 'number' ? opacity : undefined),
          },
          classes: cls('lc-polygon', itemClass ?? (typeof className === 'string' ? className : undefined)),
          style: restProps.style as string | undefined,
        };
  }

  function render(
    ctx: CanvasRenderingContext2D,
    styleOverrides: ComputedStylesOptions | undefined
  ) {
    if (dataMode) {
      for (const d of resolvedData) {
        const pathData = resolvePolygon(d);
        const resolvedFill = resolveColorProp(fill, d, chartCtx.cScale);
        const resolvedStroke = resolveColorProp(stroke, d, chartCtx.cScale);
        const resolvedFillOpacity = resolveStyleProp(fillOpacity, d);
        const resolvedStrokeWidth = resolveStyleProp(strokeWidth, d);
        const resolvedOpacity = resolveStyleProp(opacity, d);
        const resolvedClass = resolveStyleProp(className, d);
        const styleOpts = getStyleOptions(styleOverrides, resolvedFill, resolvedStroke, resolvedFillOpacity, resolvedStrokeWidth, resolvedOpacity, resolvedClass);
        renderPathData(ctx, pathData, styleOpts);
      }
    } else {
      const styleOpts = getStyleOptions(styleOverrides);
      renderPathData(ctx, tweenedState.current, styleOpts);
    }
  }

  // TODO: Use objectId to work around Svelte 4 reactivity issue (even when memoizing gradients)
  const fillKey = createKey(() => fill);
  const strokeKey = createKey(() => stroke);

  if (layerCtx === 'canvas') {
    registerComponentNode({ name: 'Polygon', kind: 'mark', canvasRender: {
      render,
      events: {
        click: restProps.onclick,
        pointerenter: restProps.onpointerenter,
        pointermove: restProps.onpointermove,
        pointerleave: restProps.onpointerleave,
        pointerdown: restProps.onpointerdown,
        pointerover: restProps.onpointerover,
        pointerout: restProps.onpointerout,
        touchmove: restProps.ontouchmove,
      },
      deps: () => [
        dataMode,
        dataMode ? resolvedItems : null,
        fillKey.current,
        fillOpacity,
        strokeKey.current,
        strokeWidth,
        opacity,
        className,
        tweenedState.current,
        restProps.style,
      ],
    } });
  }
</script>

{#if layerCtx === 'svg'}
  {#if dataMode}
    {#each resolvedData as d, i (keyFn(d, i))}
      {@const pathData = resolvePolygon(d)}
      {@const resolvedFill = resolveColorProp(fill, d, chartCtx.cScale)}
      {@const resolvedStroke = resolveColorProp(stroke, d, chartCtx.cScale)}
      {@const resolvedFillOpacity = resolveStyleProp(fillOpacity, d)}
      {@const resolvedStrokeWidth = resolveStyleProp(strokeWidth, d)}
      {@const resolvedOpacity = resolveStyleProp(opacity, d)}
      {@const resolvedClass = resolveStyleProp(className, d)}
      <path
        d={pathData}
        fill={resolvedFill}
        fill-opacity={resolvedFillOpacity}
        stroke={resolvedStroke}
        stroke-width={resolvedStrokeWidth}
        opacity={resolvedOpacity}
        class={cls('lc-polygon', resolvedClass)}
        {...restProps}
      />
    {/each}
  {:else}
    <path
      d={tweenedState.current}
      fill={fill as string}
      fill-opacity={fillOpacity as number}
      stroke={stroke as string}
      stroke-width={strokeWidth as number}
      opacity={opacity as number}
      class={cls('lc-polygon', className as string)}
      {...restProps}
      bind:this={ref}
    />
  {/if}
{/if}

<style>
  @layer base {
    :global(:where(.lc-polygon)) {
      --fill-color: var(--color-surface-content, currentColor);
      --stroke-color: initial;
    }

    /* Svg | Canvas layers */
    :global(:where(.lc-layout-svg .lc-polygon, svg.lc-polygon):not([fill])) {
      fill: var(--fill-color);
    }
    :global(:where(.lc-layout-svg .lc-polygon, svg.lc-polygon):not([stroke])) {
      stroke: var(--stroke-color);
    }

    /* Html layers */
    :global(:where(.lc-layout-html .lc-polygon):not([background-color])) {
      background-color: var(--fill-color);
    }
    :global(:where(.lc-layout-html .lc-polygon):not([border-color])) {
      border-color: var(--stroke-color);
    }
  }
</style>
