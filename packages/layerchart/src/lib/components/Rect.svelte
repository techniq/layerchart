<script lang="ts" module>
  import type { Snippet } from 'svelte';
  import type { SVGAttributes } from 'svelte/elements';
  import type { CommonEvents, Without } from '$lib/utils/types.js';
  import { createMotion, parseMotionProp, type MotionProp } from '$lib/utils/motion.svelte.js';
  import { renderRect, type ComputedStylesOptions } from '$lib/utils/canvas.js';
  import type { DataProp, DataDrivenStyleProps } from '$lib/utils/dataProp.js';
  import type { Insets } from '$lib/utils/rect.svelte.js';

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

  import { untrack } from 'svelte';
  import { getLayerContext } from '$lib/contexts/layer.js';
  import { getChartContext } from '$lib/contexts/chart.js';
  import { createDataMotionMap, type MotionOptions } from '$lib/utils/motion.svelte.js';
  import { registerCanvasComponent } from './layers/Canvas.svelte';
  import { createKey } from '$lib/utils/key.svelte.js';
  import { hasAnyDataProp, resolveDataProp, resolveColorProp, resolveGeoDataPair } from '$lib/utils/dataProp.js';
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
  const resolvedData: any[] = $derived(
    dataMode ? (dataProp ?? chartDataArray(chartCtx.data)) : []
  );

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

  $effect(() => {
    if (!dataMode || !dataMotionMap) return;
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

  // Normalize rx/ry - if only one is provided, use it for both (SVG behavior)
  // Coerce to number for canvas rendering (SVG allows string like "50%")
  const rx = $derived(Number(rxProp ?? ryProp) || 0);
  const ry = $derived(Number(ryProp ?? rxProp) || 0);

  // --- Pixel mode ---
  let ref = $state<SVGRectElement>();

  $effect.pre(() => {
    refProp = ref;
  });

  const _initialX = initialX ?? (typeof x === 'number' ? x : 0);
  const _initialY = initialY ?? (typeof y === 'number' ? y : 0);
  const _initialWidth = initialWidth ?? (width ?? 0);
  const _initialHeight = initialHeight ?? (height ?? 0);

  const motionX = createMotion(
    _initialX,
    () => (typeof x === 'number' ? x : 0),
    parseMotionProp(motion, 'x')
  );
  const motionY = createMotion(
    _initialY,
    () => (typeof y === 'number' ? y : 0),
    parseMotionProp(motion, 'y')
  );
  const motionWidth = createMotion(
    _initialWidth,
    () => width ?? 0,
    parseMotionProp(motion, 'width')
  );
  const motionHeight = createMotion(
    _initialHeight,
    () => height ?? 0,
    parseMotionProp(motion, 'height')
  );

  const layerCtx = getLayerContext();

  function getStyleOptions(
    styleOverrides: ComputedStylesOptions | undefined,
    itemFill?: string | undefined,
    itemStroke?: string | undefined
  ) {
    return styleOverrides
      ? merge({ styles: { strokeWidth } }, styleOverrides)
      : {
          styles: { fill: itemFill ?? fill, fillOpacity, stroke: itemStroke ?? stroke, strokeWidth, opacity },
          classes: cls('lc-rect', className),
          style: restProps.style as string | undefined,
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
        const styleOpts = getStyleOptions(styleOverrides, resolvedFill, resolvedStroke);
        renderRect(ctx, {
          x: item.x,
          y: item.y,
          width: item.width,
          height: item.height,
          rx,
          ry,
        }, styleOpts);
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
        },
        styleOpts
      );
    }
  }

  // TODO: Use objectId to work around Svelte 4 reactivity issue (even when memoizing gradients)
  const fillKey = createKey(() => fill);
  const strokeKey = createKey(() => stroke);

  if (layerCtx === 'canvas') {
    registerCanvasComponent({
      name: 'Rect',
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
        fillKey.current,
        strokeKey.current,
        strokeWidth,
        opacity,
        className,
        restProps.style,
        rx,
        ry,
      ],
    });
  }
</script>

{#if layerCtx === 'svg'}
  {#if dataMode}
    {#each resolvedItems as item (item.key)}
      {@const resolvedFill = resolveColorProp(fill, item.d, chartCtx.cScale)}
      {@const resolvedStroke = resolveColorProp(stroke, item.d, chartCtx.cScale)}
      <rect
        x={item.x}
        y={item.y}
        width={item.width}
        height={item.height}
        fill={resolvedFill}
        fill-opacity={fillOpacity}
        stroke={resolvedStroke}
        stroke-width={strokeWidth}
        {opacity}
        {rx}
        {ry}
        class={cls('lc-rect', className)}
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
  {:else}
    <rect
      x={motionX.current}
      y={motionY.current}
      width={motionWidth.current}
      height={motionHeight.current}
      fill={fill as string}
      fill-opacity={fillOpacity}
      stroke={stroke as string}
      stroke-width={strokeWidth}
      {opacity}
      {rx}
      {ry}
      class={cls('lc-rect', className)}
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
      <!-- svelte-ignore a11y_click_events_have_key_events -->
      <!-- svelte-ignore a11y_no_static_element_interactions -->
      <div
        style:position="absolute"
        style:left="{item.x}px"
        style:top="{item.y}px"
        style:width="{item.width}px"
        style:height="{item.height}px"
        style:background={resolvedFill}
        style:background-opacity={opacity}
        style:border-width="{strokeWidth}px"
        style:border-style="solid"
        style:border-color={resolvedStroke}
        style:border-radius="{rx}px"
        class={cls('lc-rect', className)}
        {...restProps as any}
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
      style:background={fill as string}
      style:background-opacity={opacity}
      style:border-width="{strokeWidth}px"
      style:border-style="solid"
      style:border-color={stroke as string}
      style:border-radius="{rx}px"
      class={cls('lc-rect', className)}
      {...restProps as any}
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
    :global(:where(.lc-layout-html .lc-rect):not([background])) {
      background: var(--fill-color);
    }
    :global(:where(.lc-layout-html .lc-rect):not([border-color])) {
      border-color: var(--stroke-color);
    }
  }
</style>
