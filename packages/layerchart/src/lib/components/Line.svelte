<script lang="ts" module>
  import type { SVGAttributes } from 'svelte/elements';
  import { createMotion, type MotionProp } from '$lib/utils/motion.svelte.js';
  import { renderPathData, type ComputedStylesOptions } from '$lib/utils/canvas.js';
  import MarkerWrapper, { type MarkerOptions } from './MarkerWrapper.svelte';
  import type { Without } from '$lib/utils/types.js';
  import { pointsToAngleAndLength } from '$lib/utils/math.js';
  import type { DataProp, DataDrivenStyleProps } from '$lib/utils/dataProp.js';

  export type LinePropsWithoutHTML = {
    /**
     * The x-coordinate of the line's starting point.
     * - `number`: pixel value (direct)
     * - `string`: data property name, resolved via xScale
     * - `function(d)`: accessor called per data item, result passed through xScale
     *
     * @required
     */
    x1: DataProp;

    /**
     * The initial x-coordinate of the line's starting point (pixel mode only).
     *
     * @default x1
     */
    initialX1?: number;

    /**
     * The y-coordinate of the line's starting point.
     * - `number`: pixel value (direct)
     * - `string`: data property name, resolved via yScale
     * - `function(d)`: accessor called per data item, result passed through yScale
     *
     * @required
     */
    y1: DataProp;

    /**
     * The initial y-coordinate of the line's starting point (pixel mode only).
     *
     * @default y1
     */
    initialY1?: number;

    /**
     * The x-coordinate of the line's ending point.
     * - `number`: pixel value (direct)
     * - `string`: data property name, resolved via xScale
     * - `function(d)`: accessor called per data item, result passed through xScale
     *
     * @required
     */
    x2: DataProp;

    /**
     * The initial x-coordinate of the line's ending point (pixel mode only).
     *
     * @default x2
     */
    initialX2?: number;

    /**
     * The y-coordinate of the line's ending point.
     * - `number`: pixel value (direct)
     * - `string`: data property name, resolved via yScale
     * - `function(d)`: accessor called per data item, result passed through yScale
     *
     * @default y2
     */
    y2: DataProp;

    /**
     * The initial y-coordinate of the line's ending point (pixel mode only).
     *
     * @default y2
     */
    initialY2?: number;

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
     * Marker to attach to both start and end points of the line
     */
    marker?: MarkerOptions;

    /**
     * Marker to attach to the start point of the line
     */
    markerStart?: MarkerOptions;

    /**
     * Marker to attach to the mid point of the line
     */
    markerMid?: MarkerOptions;

    /**
     * Marker to attach to the end point of the line
     */
    markerEnd?: MarkerOptions;

    /** Motion configuration (pixel mode only). */
    motion?: MotionProp;
  } & DataDrivenStyleProps;

  export type LineProps = LinePropsWithoutHTML &
    Without<SVGAttributes<SVGPathElement>, LinePropsWithoutHTML>;
</script>

<script lang="ts">
  import { cls } from '@layerstack/tailwind';
  import { merge } from '@layerstack/utils';

  import { registerCanvasComponent } from './layers/Canvas.svelte';
  import { getLayerContext } from '$lib/contexts/layer.js';
  import { getChartContext } from '$lib/contexts/chart.js';
  import { hasAnyDataProp, resolveDataProp, resolveColorProp } from '$lib/utils/dataProp.js';
  import { chartDataArray } from '$lib/utils/common.js';

  import { createKey } from '$lib/utils/key.svelte.js';
  import { createId } from '$lib/utils/createId.js';

  const uid = $props.id();

  let {
    x1,
    initialX1,
    y1,
    initialY1,
    x2,
    initialX2,
    y2,
    initialY2,
    data: dataProp,
    key: keyFn = (_: any, i: number) => i,
    class: className,
    strokeWidth,
    opacity,
    fill,
    stroke,
    marker,
    markerEnd,
    markerStart,
    markerMid,
    motion,
    fillOpacity,
    ...restProps
  }: LineProps = $props();

  // Data mode detection
  const dataMode = $derived(hasAnyDataProp(x1, y1, x2, y2));

  // Chart context
  const chartCtx = getChartContext();

  // Data to iterate over in data mode
  const resolvedData: any[] = $derived(
    dataMode ? (dataProp ?? chartDataArray(chartCtx.data)) : []
  );

  // Resolve a single data item to pixel coordinates
  function resolveLine(d: any) {
    return {
      x1: resolveDataProp(x1, d, chartCtx.xScale, 0),
      y1: resolveDataProp(y1, d, chartCtx.yScale, 0),
      x2: resolveDataProp(x2, d, chartCtx.xScale, 0),
      y2: resolveDataProp(y2, d, chartCtx.yScale, 0),
    };
  }

  // --- Markers (shared across all lines in data mode) ---
  const markerStartId = $derived(markerStart || marker ? createId('marker-start', uid) : '');
  const markerMidId = $derived(markerMid || marker ? createId('marker-mid', uid) : '');
  const markerEndId = $derived(markerEnd || marker ? createId('marker-end', uid) : '');

  // --- Pixel mode ---
  const _initialX1 = initialX1 ?? (typeof x1 === 'number' ? x1 : 0);
  const _initialY1 = initialY1 ?? (typeof y1 === 'number' ? y1 : 0);
  const _initialX2 = initialX2 ?? (typeof x2 === 'number' ? x2 : 0);
  const _initialY2 = initialY2 ?? (typeof y2 === 'number' ? y2 : 0);

  const motionX1 = createMotion(
    _initialX1,
    () => (typeof x1 === 'number' ? x1 : 0),
    motion
  );
  const motionY1 = createMotion(
    _initialY1,
    () => (typeof y1 === 'number' ? y1 : 0),
    motion
  );
  const motionX2 = createMotion(
    _initialX2,
    () => (typeof x2 === 'number' ? x2 : 0),
    motion
  );
  const motionY2 = createMotion(
    _initialY2,
    () => (typeof y2 === 'number' ? y2 : 0),
    motion
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
          styles: { fill: itemFill ?? fill, stroke: itemStroke ?? stroke, strokeWidth, opacity },
          classes: cls('lc-line', className),
          style: restProps.style as string | undefined,
        };
  }

  function render(
    ctx: CanvasRenderingContext2D,
    styleOverrides: ComputedStylesOptions | undefined
  ) {
    if (dataMode) {
      for (const d of resolvedData) {
        const resolved = resolveLine(d);
        const resolvedFill = resolveColorProp(fill, d, chartCtx.cScale);
        const resolvedStroke = resolveColorProp(stroke, d, chartCtx.cScale);
        const styleOpts = getStyleOptions(styleOverrides, resolvedFill, resolvedStroke);
        const pathData = `M ${resolved.x1},${resolved.y1} L ${resolved.x2},${resolved.y2}`;
        renderPathData(ctx, pathData, styleOpts);
      }
    } else {
      const styleOpts = getStyleOptions(styleOverrides);
      const pathData = `M ${motionX1.current},${motionY1.current} L ${motionX2.current},${motionY2.current}`;
      renderPathData(ctx, pathData, styleOpts);
    }
  }

  const fillKey = createKey(() => fill);
  const strokeKey = createKey(() => stroke);

  if (layerCtx === 'canvas') {
    registerCanvasComponent({
      name: 'Line',
      render,
      events: {
        click: restProps.onclick,
        pointerenter: restProps.onpointerenter,
        pointermove: restProps.onpointermove,
        pointerleave: restProps.onpointerleave,
      },
      deps: () => [
        dataMode,
        dataMode ? resolvedData : null,
        motionX1.current,
        motionY1.current,
        motionX2.current,
        motionY2.current,
        fillKey.current,
        strokeKey.current,
        strokeWidth,
        opacity,
        className,
        restProps.style,
      ],
    });
  }
</script>

{#if layerCtx === 'svg'}
  {#if dataMode}
    <!-- Marker defs shared across all data-mode lines -->
    <MarkerWrapper id={markerStartId} marker={markerStart ?? marker} />
    <MarkerWrapper id={markerMidId} marker={markerMid ?? marker} />
    <MarkerWrapper id={markerEndId} marker={markerEnd ?? marker} />
    {#each resolvedData as d, i (keyFn(d, i))}
      {@const resolved = resolveLine(d)}
      {@const resolvedFill = resolveColorProp(fill, d, chartCtx.cScale)}
      {@const resolvedStroke = resolveColorProp(stroke, d, chartCtx.cScale)}
      <line
        x1={resolved.x1}
        y1={resolved.y1}
        x2={resolved.x2}
        y2={resolved.y2}
        fill={resolvedFill}
        stroke={resolvedStroke}
        fill-opacity={fillOpacity}
        stroke-width={strokeWidth}
        {opacity}
        marker-start={markerStartId ? `url(#${markerStartId})` : undefined}
        marker-mid={markerMidId ? `url(#${markerMidId})` : undefined}
        marker-end={markerEndId ? `url(#${markerEndId})` : undefined}
        class={cls('lc-line', className)}
        {...restProps}
      />
    {/each}
  {:else}
    <line
      x1={motionX1.current}
      y1={motionY1.current}
      x2={motionX2.current}
      y2={motionY2.current}
      fill={fill as string}
      stroke={stroke as string}
      fill-opacity={fillOpacity}
      stroke-width={strokeWidth}
      {opacity}
      marker-start={markerStartId ? `url(#${markerStartId})` : undefined}
      marker-mid={markerMidId ? `url(#${markerMidId})` : undefined}
      marker-end={markerEndId ? `url(#${markerEndId})` : undefined}
      class={cls('lc-line', className)}
      {...restProps}
    />
    <MarkerWrapper id={markerStartId} marker={markerStart ?? marker} />
    <MarkerWrapper id={markerMidId} marker={markerMid ?? marker} />
    <MarkerWrapper id={markerEndId} marker={markerEnd ?? marker} />
  {/if}
{:else if layerCtx === 'html'}
  {#if dataMode}
    {#each resolvedData as d, i (keyFn(d, i))}
      {@const resolved = resolveLine(d)}
      {@const resolvedStroke = resolveColorProp(stroke, d, chartCtx.cScale)}
      {@const { angle, length } = pointsToAngleAndLength(
        { x: resolved.x1, y: resolved.y1 },
        { x: resolved.x2, y: resolved.y2 }
      )}
      <div
        style:position="absolute"
        style:left="{resolved.x1}px"
        style:top="{resolved.y1}px"
        style:width="{length}px"
        style:height="{strokeWidth ?? 1}px"
        style:transform="translateY(-50%) rotate({angle}deg)"
        style:transform-origin="0 50%"
        style:opacity
        style:background-color={resolvedStroke}
        class={cls('lc-line', className)}
        style={restProps.style}
      ></div>
    {/each}
  {:else}
    {@const { angle, length } = pointsToAngleAndLength(
      { x: motionX1.current, y: motionY1.current },
      { x: motionX2.current, y: motionY2.current }
    )}
    <!-- STYLE-TODO: Should html use stroke for fill? -->
    <div
      style:position="absolute"
      style:left="{motionX1.current}px"
      style:top="{motionY1.current}px"
      style:width="{length}px"
      style:height="{strokeWidth ?? 1}px"
      style:transform="translateY(-50%) rotate({angle}deg)"
      style:transform-origin="0 50%"
      style:opacity
      style:background-color={stroke as string}
      class={cls('lc-line', className)}
      style={restProps.style}
    ></div>
  {/if}
{/if}

<style>
  @layer base {
    :global(:where(.lc-line)) {
      --stroke-color: var(--color-surface-content, currentColor);
    }

    /* Svg | Canvas layers */
    :global(:where(.lc-layout-svg .lc-line, svg.lc-line):not([stroke])) {
      stroke: var(--stroke-color);
    }

    /* Html layers */
    :global(:where(.lc-layout-html .lc-line):not([background-color])) {
      background-color: var(--stroke-color);
    }
  }
</style>
