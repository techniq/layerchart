<script lang="ts" module>
  import type { Snippet } from 'svelte';
  import type { SVGAttributes } from 'svelte/elements';
  import type { CommonEvents, Without } from '$lib/utils/types.js';
  import { createMotion, parseMotionProp, type MotionProp } from '$lib/utils/motion.svelte.js';
  import { renderRect, type ComputedStylesOptions } from '$lib/utils/canvas.js';
  import type { DataProp, DataDrivenStyleProps } from '$lib/utils/dataProp.js';
  import {
    resolveCorners,
    cornersUniform,
    type Corners,
    type Insets,
  } from '$lib/utils/rect.svelte.js';
  import { roundedRectPath, parseDashArray } from '$lib/utils/path.js';

  export type RectPropsWithoutHTML = {
    /**
     * The x position of the rectangle.
     * - `number`: pixel value (direct)
     * - `string`: data property name, resolved via xScale
     * - `function(d)`: accessor called per data item, result passed through xScale
     *
     * @default 0
     */
    x?: DataProp;

    /**
     * The initial x position (pixel mode only).
     *
     * @default x
     */
    initialX?: number;

    /**
     * The y position of the rectangle.
     * - `number`: pixel value (direct)
     * - `string`: data property name, resolved via yScale
     * - `function(d)`: accessor called per data item, result passed through yScale
     *
     * @default 0
     */
    y?: DataProp;

    /**
     * The initial y position (pixel mode only).
     *
     * @default y
     */
    initialY?: number;

    /**
     * The width of the rectangle (pixels).
     *
     * @default 0
     */
    width?: number;
    initialWidth?: number;

    /**
     * The height of the rectangle (pixels).
     *
     * @default 0
     */
    height?: number;
    initialHeight?: number;

    /**
     * Left/start x edge (data mode).
     * - `string`: data property name, resolved via xScale
     * - `function(d)`: accessor called per data item, result passed through xScale
     * - `number`: pixel value
     */
    x0?: DataProp;

    /**
     * Right/end x edge (data mode).
     * - `string`: data property name, resolved via xScale
     * - `function(d)`: accessor called per data item, result passed through xScale
     * - `number`: pixel value
     */
    x1?: DataProp;

    /**
     * Top/start y edge (data mode).
     * - `string`: data property name, resolved via yScale
     * - `function(d)`: accessor called per data item, result passed through yScale
     * - `number`: pixel value
     */
    y0?: DataProp;

    /**
     * Bottom/end y edge (data mode).
     * - `string`: data property name, resolved via yScale
     * - `function(d)`: accessor called per data item, result passed through yScale
     * - `number`: pixel value
     */
    y1?: DataProp;

    /**
     * Insets to shrink the rendered rectangle.
     * Supports `all`, `x`, `y`, `left`, `right`, `top`, `bottom`.
     */
    insets?: Insets;

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
     * Underlying `<rect>` tag when using <Svg>. Useful for bindings (pixel mode only).
     *
     * @bindable
     */
    ref?: SVGRectElement;

    /** Motion configuration (pixel mode only). */
    motion?: MotionProp<'x' | 'y' | 'width' | 'height'>;

    /**
     * Dashed-border pattern. Accepts a number (single dash length), a
     * `[dash, gap, ...]` array, or a string (same syntax as SVG
     * `stroke-dasharray`). HTML layer approximates via `border-style: dashed`.
     */
    dashArray?: number | number[] | string;

    /**
     * Per-corner radii. Accepts a number (all corners equal — same as `rx`),
     * a `[tl, tr, br, bl]` tuple, or `{ topLeft, topRight, bottomRight, bottomLeft }`.
     * Takes precedence over `rx`/`ry` when corners differ.
     */
    corners?: Corners;

    /** Children content to render.  Note: Only works for Html layers */
    children?: Snippet;
  } & DataDrivenStyleProps;

  export type RectProps = RectPropsWithoutHTML &
    Without<SVGAttributes<SVGRectElement>, RectPropsWithoutHTML> &
    CommonEvents;
</script>

<script lang="ts">
  import { cls } from '@layerstack/tailwind';
  import { merge } from '@layerstack/utils';
  import type { HTMLAttributes } from 'svelte/elements';

  import { untrack } from 'svelte';
  import { getLayerContext } from '$lib/contexts/layer.js';
  import { getChartContext } from '$lib/contexts/chart.js';
  import { createDataMotionMap, type MotionOptions } from '$lib/utils/motion.svelte.js';
  import { createKey } from '$lib/utils/key.svelte.js';
  import {
    hasAnyDataProp,
    resolveDataProp,
    resolveColorProp,
    resolveGeoDataPair,
    resolveStyleProp,
  } from '$lib/utils/dataProp.js';
  import { getGeoContext } from '$lib/contexts/geo.js';
  import { chartDataArray } from '$lib/utils/common.js';
  import { resolveInsets } from '$lib/utils/rect.svelte.js';

  let {
    height = 0,
    width = 0,
    x = 0,
    y = 0,
    initialX,
    initialY,
    fill,
    fillOpacity,
    stroke,
    strokeOpacity,
    initialHeight,
    initialWidth,
    strokeWidth,
    opacity,
    rx: rxProp,
    ry: ryProp,
    x0,
    y0,
    x1,
    y1,
    insets,
    data: dataProp,
    key: keyFn = (_: any, i: number) => i,
    ref: refProp = $bindable(),
    motion,
    corners,
    dashArray,
    class: className,
    onclick,
    ondblclick,
    onpointerenter,
    onpointermove,
    onpointerleave,
    onpointerover,
    onpointerout,
    children,
    ...restProps
  }: RectProps = $props();

  // Data mode detection
  const hasEdgeProps = $derived(hasAnyDataProp(x0, y0, x1, y1));
  const dataMode = $derived(hasAnyDataProp(x, y) || hasEdgeProps);

  // Chart context
  const chartCtx = getChartContext();
  const geo = getGeoContext();

  // Data to iterate over in data mode
  const resolvedData: any[] = $derived(dataMode ? (dataProp ?? chartDataArray(chartCtx.data)) : []);

  // Resolve a single data item to rect dimensions
  function resolveRect(d: any) {
    const resolvedInsets = resolveInsets(insets);

    if (hasEdgeProps) {
      let rx0: number, rx1p: number, ry0: number, ry1p: number;
      if (geo.projection) {
        [rx0, ry0] = resolveGeoDataPair(x0, y0, d, geo.projection);
        [rx1p, ry1p] = resolveGeoDataPair(x1, y1, d, geo.projection);
      } else {
        rx0 = resolveDataProp(x0, d, chartCtx.xScale, 0);
        rx1p = resolveDataProp(x1, d, chartCtx.xScale, 0);
        ry0 = resolveDataProp(y0, d, chartCtx.yScale, 0);
        ry1p = resolveDataProp(y1, d, chartCtx.yScale, 0);
      }

      const left = Math.min(rx0, rx1p) + resolvedInsets.left;
      const right = Math.max(rx0, rx1p) - resolvedInsets.right;
      const top = Math.min(ry0, ry1p) + resolvedInsets.top;
      const bottom = Math.max(ry0, ry1p) - resolvedInsets.bottom;

      return {
        x: left,
        y: top,
        width: Math.max(0, right - left),
        height: Math.max(0, bottom - top),
      };
    } else {
      let resolvedX: number, resolvedY: number;
      if (geo.projection) {
        [resolvedX, resolvedY] = resolveGeoDataPair(x, y, d, geo.projection);
      } else {
        resolvedX = resolveDataProp(x, d, chartCtx.xScale, 0);
        resolvedY = resolveDataProp(y, d, chartCtx.yScale, 0);
      }
      return {
        x: resolvedX + resolvedInsets.left,
        y: resolvedY + resolvedInsets.top,
        width: Math.max(0, (width ?? 0) - resolvedInsets.left - resolvedInsets.right),
        height: Math.max(0, (height ?? 0) - resolvedInsets.top - resolvedInsets.bottom),
      };
    }
  }

  // --- Data mode motion ---
  const dataMotionMap = createDataMotionMap(motion as MotionOptions | undefined);

  // Only create the data motion tracking effect when motion is actually configured
  if (dataMotionMap) {
    $effect(() => {
      if (!dataMode) return;
      const activeKeys = new Set<any>();
      for (let i = 0; i < resolvedData.length; i++) {
        const d = resolvedData[i];
        const key = keyFn(d, i);
        activeKeys.add(key);
        const resolved = resolveRect(d);
        untrack(() => dataMotionMap.update(key, resolved));
      }
      untrack(() => dataMotionMap.cleanup(activeKeys));
    });
  }

  // Single source of truth: resolved values with animated overlay
  const resolvedItems = $derived.by(() => {
    if (!dataMode) return [];
    return resolvedData.map((d, i) => {
      const key = keyFn(d, i);
      const resolved = resolveRect(d);
      const animated = dataMotionMap?.get(key);
      return {
        d,
        key,
        x: animated?.x ?? resolved.x,
        y: animated?.y ?? resolved.y,
        width: animated?.width ?? resolved.width,
        height: animated?.height ?? resolved.height,
      };
    });
  });

  // Fold a uniform `corners` value into rx/ry so SVG `<rect>` renders rounded
  // corners without needing a `<path>`. When corners are per-corner different,
  // `pixelPathData` kicks in below and SVG emits a `<path>` instead.
  const dashArrayResolved = $derived(parseDashArray(dashArray));
  const dashArrayAttr = $derived(dashArrayResolved ? dashArrayResolved.join(' ') : undefined);

  const cornersUniformValue = $derived.by(() => {
    if (corners === undefined) return undefined;
    if (typeof corners === 'number') return corners;
    const resolved = resolveCorners(corners, Infinity, Infinity);
    return cornersUniform(resolved) ? resolved[0] : undefined;
  });
  const cornersNonUniform = $derived(corners !== undefined && cornersUniformValue === undefined);

  // Normalize rx/ry - if only one is provided, use it for both (SVG behavior)
  // Coerce to number for canvas rendering (SVG allows string like "50%")
  const rx = $derived(Number(rxProp ?? ryProp ?? cornersUniformValue) || 0);
  const ry = $derived(Number(ryProp ?? rxProp ?? cornersUniformValue) || 0);

  // --- Pixel mode ---
  let ref = $state<SVGRectElement>();

  $effect.pre(() => {
    refProp = ref;
  });

  const _initialX = initialX ?? (typeof x === 'number' ? x : 0);
  const _initialY = initialY ?? (typeof y === 'number' ? y : 0);
  const _initialWidth = initialWidth ?? width ?? 0;
  const _initialHeight = initialHeight ?? height ?? 0;

  // Parse motion config once, then pass resolved config to each axis
  // (avoids 4 separate parseMotionProp calls that re-parse the same prop)
  const motionX = createMotion(
    _initialX,
    () => (typeof x === 'number' ? x : 0),
    motion === undefined ? undefined : parseMotionProp(motion, 'x')
  );
  const motionY = createMotion(
    _initialY,
    () => (typeof y === 'number' ? y : 0),
    motion === undefined ? undefined : parseMotionProp(motion, 'y')
  );
  const motionWidth = createMotion(
    _initialWidth,
    () => width ?? 0,
    motion === undefined ? undefined : parseMotionProp(motion, 'width')
  );
  const motionHeight = createMotion(
    _initialHeight,
    () => height ?? 0,
    motion === undefined ? undefined : parseMotionProp(motion, 'height')
  );

  const layerCtx = getLayerContext();

  const staticFill = $derived(typeof fill === 'string' ? fill : undefined);
  const staticFillOpacity = $derived(typeof fillOpacity === 'number' ? fillOpacity : undefined);
  const staticStroke = $derived(typeof stroke === 'string' ? stroke : undefined);
  const staticStrokeOpacity = $derived(
    typeof strokeOpacity === 'number' ? strokeOpacity : undefined
  );
  const staticStrokeWidth = $derived(typeof strokeWidth === 'number' ? strokeWidth : undefined);
  const staticOpacity = $derived(typeof opacity === 'number' ? opacity : undefined);
  const staticClassName = $derived(typeof className === 'string' ? className : undefined);
  // Match SVG's implicit `stroke-width: 1` default: if `stroke` is set but
  // `strokeWidth` is not, render a 1px border so HTML matches SVG/Canvas layers.
  const staticBorderWidth = $derived(
    typeof strokeWidth === 'number'
      ? `${strokeWidth}px`
      : typeof stroke === 'string'
        ? '1px'
        : undefined
  );
  const htmlRestProps = $derived(restProps as unknown as HTMLAttributes<HTMLDivElement>);

  // Resolved per-corner radii for the static (pixel-mode) rect, clamped to bounds.
  const resolvedCorners = $derived(
    corners !== undefined
      ? resolveCorners(corners, motionWidth.current, motionHeight.current)
      : undefined
  );
  const borderRadiusStyle = $derived(
    resolvedCorners ? resolvedCorners.map((c) => `${c}px`).join(' ') : undefined
  );
  const pixelPathData = $derived(
    resolvedCorners && cornersNonUniform
      ? roundedRectPath(
          motionX.current,
          motionY.current,
          motionWidth.current,
          motionHeight.current,
          resolvedCorners
        )
      : undefined
  );

  function getStyleOptions(
    styleOverrides: ComputedStylesOptions | undefined,
    itemFill?: string | undefined,
    itemStroke?: string | undefined,
    itemFillOpacity?: number | undefined,
    itemStrokeOpacity?: number | undefined,
    itemStrokeWidth?: number | undefined,
    itemOpacity?: number | undefined,
    itemClass?: string | undefined
  ) {
    return styleOverrides
      ? merge(
          {
            styles: {
              strokeWidth:
                itemStrokeWidth ?? (typeof strokeWidth === 'number' ? strokeWidth : undefined),
            },
          },
          styleOverrides
        )
      : {
          styles: {
            fill: itemFill ?? fill,
            fillOpacity:
              itemFillOpacity ?? (typeof fillOpacity === 'number' ? fillOpacity : undefined),
            stroke: itemStroke ?? stroke,
            strokeOpacity:
              itemStrokeOpacity ?? (typeof strokeOpacity === 'number' ? strokeOpacity : undefined),
            strokeWidth:
              itemStrokeWidth ?? (typeof strokeWidth === 'number' ? strokeWidth : undefined),
            opacity: itemOpacity ?? (typeof opacity === 'number' ? opacity : undefined),
          },
          classes: cls(
            'lc-rect',
            itemClass ?? (typeof className === 'string' ? className : undefined)
          ),
          style:
            [
              restProps.style as string | undefined,
              dashArrayAttr ? `stroke-dasharray: ${dashArrayAttr}` : undefined,
            ]
              .filter(Boolean)
              .join('; ') || undefined,
        };
  }

  function render(
    ctx: CanvasRenderingContext2D,
    styleOverrides: ComputedStylesOptions | undefined
  ) {
    if (dataMode) {
      for (const item of resolvedItems) {
        const resolvedFill = resolveColorProp(fill, item.d, chartCtx.cScale);
        const resolvedStroke = resolveColorProp(stroke, item.d, chartCtx.cScale);
        const resolvedFillOpacity = resolveStyleProp(fillOpacity, item.d);
        const resolvedStrokeOpacity = resolveStyleProp(strokeOpacity, item.d);
        const resolvedStrokeWidth = resolveStyleProp(strokeWidth, item.d);
        const resolvedOpacity = resolveStyleProp(opacity, item.d);
        const resolvedClass = resolveStyleProp(className, item.d);
        const styleOpts = getStyleOptions(
          styleOverrides,
          resolvedFill,
          resolvedStroke,
          resolvedFillOpacity,
          resolvedStrokeOpacity,
          resolvedStrokeWidth,
          resolvedOpacity,
          resolvedClass
        );
        renderRect(
          ctx,
          {
            x: item.x,
            y: item.y,
            width: item.width,
            height: item.height,
            rx,
            ry,
          },
          styleOpts
        );
      }
    } else {
      const styleOpts = getStyleOptions(styleOverrides);
      renderRect(
        ctx,
        {
          x: motionX.current,
          y: motionY.current,
          width: motionWidth.current,
          height: motionHeight.current,
          rx,
          ry,
          corners: resolvedCorners,
        },
        styleOpts
      );
    }
  }

  // TODO: Use objectId to work around Svelte 4 reactivity issue (even when memoizing gradients)
  // Only create key trackers when in canvas mode (they're only used for canvas dep tracking)
  const fillKey = layerCtx === 'canvas' ? createKey(() => fill) : undefined;
  const strokeKey = layerCtx === 'canvas' ? createKey(() => stroke) : undefined;

  chartCtx.registerComponent({
    name: 'Rect',
    kind: 'mark',
    markInfo: () => {
      if (!dataMode) return {};
      return {
        data: dataProp,
        x: typeof x === 'string' ? x : undefined,
        y: typeof y === 'string' ? y : undefined,
        color: typeof fill === 'string' ? fill : typeof stroke === 'string' ? stroke : undefined,
      };
    },
    canvasRender:
      layerCtx === 'canvas'
        ? {
            render,
            events: {
              click: onclick,
              dblclick: ondblclick,
              pointerenter: onpointerenter,
              pointermove: onpointermove,
              pointerleave: onpointerleave,
              pointerover: onpointerover,
              pointerout: onpointerout,
            },
            deps: () => [
              dataMode,
              dataMode ? resolvedItems : null,
              motionX.current,
              motionY.current,
              motionWidth.current,
              motionHeight.current,
              fillKey!.current,
              strokeKey!.current,
              fillOpacity,
              strokeOpacity,
              strokeWidth,
              opacity,
              className,
              restProps.style,
              rx,
              ry,
              resolvedCorners,
              dashArrayAttr,
            ],
          }
        : undefined,
  });
</script>

{#if layerCtx === 'svg'}
  {#if dataMode}
    {#each resolvedItems as item (item.key)}
      {@const resolvedFill = resolveColorProp(fill, item.d, chartCtx.cScale)}
      {@const resolvedStroke = resolveColorProp(stroke, item.d, chartCtx.cScale)}
      {@const resolvedFillOpacity = resolveStyleProp(fillOpacity, item.d)}
      {@const resolvedStrokeOpacity = resolveStyleProp(strokeOpacity, item.d)}
      {@const resolvedStrokeWidth = resolveStyleProp(strokeWidth, item.d)}
      {@const resolvedOpacity = resolveStyleProp(opacity, item.d)}
      {@const resolvedClass = resolveStyleProp(className, item.d)}
      <rect
        x={item.x}
        y={item.y}
        width={item.width}
        height={item.height}
        fill={resolvedFill}
        fill-opacity={resolvedFillOpacity}
        stroke={resolvedStroke}
        stroke-opacity={resolvedStrokeOpacity}
        stroke-width={resolvedStrokeWidth}
        opacity={resolvedOpacity}
        {rx}
        {ry}
        stroke-dasharray={dashArrayAttr}
        class={cls('lc-rect', resolvedClass)}
        {...restProps}
        {onclick}
        {ondblclick}
        {onpointerenter}
        {onpointermove}
        {onpointerleave}
        {onpointerover}
        {onpointerout}
      />
    {/each}
  {:else if pixelPathData}
    <!-- svelte-ignore a11y_click_events_have_key_events -->
    <!-- svelte-ignore a11y_no_static_element_interactions -->
    <path
      d={pixelPathData}
      fill={staticFill}
      fill-opacity={staticFillOpacity}
      stroke={staticStroke}
      stroke-opacity={staticStrokeOpacity}
      stroke-width={staticStrokeWidth}
      opacity={staticOpacity}
      stroke-dasharray={dashArrayAttr}
      class={cls('lc-rect', staticClassName)}
      {...restProps as unknown as SVGAttributes<SVGPathElement>}
      {onclick}
      {ondblclick}
      {onpointerenter}
      {onpointermove}
      {onpointerleave}
      {onpointerover}
      {onpointerout}
    />
  {:else}
    <rect
      x={motionX.current}
      y={motionY.current}
      width={motionWidth.current}
      height={motionHeight.current}
      fill={staticFill}
      fill-opacity={staticFillOpacity}
      stroke={staticStroke}
      stroke-opacity={staticStrokeOpacity}
      stroke-width={staticStrokeWidth}
      opacity={staticOpacity}
      {rx}
      {ry}
      stroke-dasharray={dashArrayAttr}
      class={cls('lc-rect', staticClassName)}
      {...restProps}
      {onclick}
      {ondblclick}
      {onpointerenter}
      {onpointermove}
      {onpointerleave}
      {onpointerover}
      {onpointerout}
      bind:this={ref}
    />
  {/if}
{:else if layerCtx === 'html'}
  {#if dataMode}
    {#each resolvedItems as item (item.key)}
      {@const resolvedFill = resolveColorProp(fill, item.d, chartCtx.cScale)}
      {@const resolvedStroke = resolveColorProp(stroke, item.d, chartCtx.cScale)}
      {@const resolvedFillOpacity = resolveStyleProp(fillOpacity, item.d)}
      {@const resolvedStrokeWidth = resolveStyleProp(strokeWidth, item.d)}
      {@const resolvedOpacity = resolveStyleProp(opacity, item.d)}
      {@const resolvedClass = resolveStyleProp(className, item.d)}
      {@const resolvedBorderWidth =
        resolvedStrokeWidth != null
          ? `${resolvedStrokeWidth}px`
          : resolvedStroke != null
            ? '1px'
            : undefined}
      <!-- svelte-ignore a11y_click_events_have_key_events -->
      <!-- svelte-ignore a11y_no_static_element_interactions -->
      <div
        style:position="absolute"
        style:left="{item.x}px"
        style:top="{item.y}px"
        style:width="{item.width}px"
        style:height="{item.height}px"
        style:background={resolvedFill}
        style:background-origin="border-box"
        style:opacity={resolvedOpacity}
        style:border-width={resolvedBorderWidth}
        style:border-style={dashArrayResolved ? 'dashed' : 'solid'}
        style:border-color={resolvedStroke}
        style:border-radius="{rx}px"
        class={cls('lc-rect', resolvedClass)}
        {...htmlRestProps}
        {onclick}
        {ondblclick}
        {onpointerenter}
        {onpointermove}
        {onpointerleave}
        {onpointerover}
        {onpointerout}
      ></div>
    {/each}
  {:else}
    <!-- svelte-ignore a11y_click_events_have_key_events -->
    <!-- svelte-ignore a11y_no_static_element_interactions -->
    <div
      style:position="absolute"
      style:left="{motionX.current}px"
      style:top="{motionY.current}px"
      style:width="{motionWidth.current}px"
      style:height="{motionHeight.current}px"
      style:background={staticFill}
      style:background-origin="border-box"
      style:opacity={staticOpacity}
      style:border-width={staticBorderWidth}
      style:border-style={dashArrayResolved ? 'dashed' : 'solid'}
      style:border-color={staticStroke}
      style:border-radius={borderRadiusStyle ?? `${rx}px`}
      class={cls('lc-rect', staticClassName)}
      {...htmlRestProps}
      {onclick}
      {ondblclick}
      {onpointerenter}
      {onpointermove}
      {onpointerleave}
      {onpointerover}
      {onpointerout}
    >
      {@render children?.()}
    </div>
  {/if}
{/if}

<style>
  @layer base {
    :global(:where(.lc-rect)) {
      --fill-color: var(--color-surface-content, currentColor);
      --stroke-color: initial;
    }

    /* Svg | Canvas layers */
    :global(:where(.lc-layout-svg .lc-rect, svg.lc-rect):not([fill])) {
      fill: var(--fill-color);
    }
    :global(:where(.lc-layout-svg .lc-rect, svg.lc-rect):not([stroke])) {
      stroke: var(--stroke-color);
    }

    /* Html layers */
    :global(:where(.lc-layout-html .lc-rect)) {
      /* Match SVG sizing/positioning (visual extent equals `width`×`height`, border on outer edge) */
      box-sizing: border-box;
    }
    :global(:where(.lc-layout-html .lc-rect):not([background])) {
      background: var(--fill-color);
    }
    :global(:where(.lc-layout-html .lc-rect):not([border-color])) {
      border-color: var(--stroke-color);
    }
  }
</style>
