<script lang="ts" module>
  import type { Snippet } from 'svelte';
  import type { SVGAttributes } from 'svelte/elements';
  import type { Without } from '$lib/utils/types.js';
  import type { DataProp, DataDrivenStyleProps } from '$lib/utils/dataProp.js';
  import type { VectorAnchor } from '$lib/utils/path.js';

  export type VectorShape = 'arrow' | 'arrow-filled' | 'spike';

  export type VectorPropsWithoutHTML = {
    /**
     * The x position of the vector.
     * - `number`: pixel value (direct)
     * - `string`: data property name, resolved via xScale
     * - `function(d)`: accessor called per data item, result passed through xScale
     *
     * @default 0
     */
    x?: DataProp;

    /**
     * The initial x position (pixel mode only).
     * @default x
     */
    initialX?: number;

    /**
     * The y position of the vector.
     * - `number`: pixel value (direct)
     * - `string`: data property name, resolved via yScale
     * - `function(d)`: accessor called per data item, result passed through yScale
     *
     * @default 0
     */
    y?: DataProp;

    /**
     * The initial y position (pixel mode only).
     * @default y
     */
    initialY?: number;

    /**
     * The length of the vector in pixels.
     * - `number`: pixel value (direct)
     * - `string`: data property name, resolved via rScale
     * - `function(d)`: accessor called per data item, result passed through rScale
     *
     * @default 12
     */
    length?: DataProp;

    /**
     * The initial length of the vector (pixel mode only).
     * @default length
     */
    initialLength?: number;

    /**
     * The rotation angle in degrees, clockwise from north (up).
     * - `number`: direct degree value
     * - `string`: data property name (raw value extracted, no scale)
     * - `function(d)`: accessor called per data item (raw value, no scale)
     *
     * @default 0
     */
    rotate?: DataProp;

    /**
     * The shape of the vector.
     * - `"arrow"`: a line with a V-shaped arrowhead at the tip (stroke-based)
     * - `"arrow-filled"`: a solid arrow with a tapered tail and triangular arrowhead (fill-based)
     * - `"spike"`: a thin filled triangle
     *
     * @default 'arrow'
     */
    shape?: VectorShape;

    /**
     * Where the position (x, y) is relative to the vector.
     * - `"start"`: base of the vector is at the position
     * - `"middle"`: center of the vector is at the position
     * - `"end"`: tip of the vector is at the position
     *
     * Defaults to `"middle"` for arrow shape and `"start"` for spike shape.
     */
    anchor?: VectorAnchor;

    /**
     * Width of the vector shape in pixels (arrowhead wingspan or spike base).
     * When not set, scales proportionally with length (~25% of length).
     */
    width?: number;

    /**
     * Data array to iterate over in data mode.
     * Falls back to chart context data when not provided.
     */
    data?: any[];

    /**
     * Key function for keyed {#each} rendering in data mode.
     * @default (d, i) => i
     */
    key?: (d: any, index: number) => any;

    /** Motion configuration (pixel mode only). */
    motion?: MotionProp;

    /**
     * Custom content to render inside the vector's positioned/rotated coordinate space.
     * When provided, replaces the default shape rendering.
     * The snippet receives `{ length, d }` where `d` is the data item (data mode only).
     * Content is rendered at the origin, rotated so "up" (negative y) points in the vector direction.
     */
    children?: Snippet<[{ length: number; d?: any }]>;
  } & DataDrivenStyleProps;

  export type VectorProps = VectorPropsWithoutHTML &
    Without<SVGAttributes<SVGPathElement>, VectorPropsWithoutHTML>;
</script>

<script lang="ts">
  import { untrack } from 'svelte';

  import { getChartContext } from '$lib/contexts/chart.js';
  import { getGeoContext } from '$lib/contexts/geo.js';
  import { getLayerContext } from '$lib/contexts/layer.js';
  import { createMotion, createDataMotionMap, type MotionProp } from '$lib/utils/motion.svelte.js';
  import { hasAnyDataProp, resolveDataProp, extractRawDataValue, resolveGeoDataPair, resolveStyleProp, resolveColorProp } from '$lib/utils/dataProp.js';
  import { chartDataArray } from '$lib/utils/common.js';
  import { cls } from '@layerstack/tailwind';
  import { vectorArrowPath, vectorArrowFilledPath, vectorSpikePath, transformVectorPath } from '$lib/utils/path.js';
  import Path from './Path.svelte';

  let {
    x = 0,
    initialX: initialXProp,
    y = 0,
    initialY: initialYProp,
    length: lengthProp = 12,
    initialLength: initialLengthProp,
    rotate: rotateProp = 0,
    shape = 'arrow',
    anchor,
    width,
    children,
    data: dataProp,
    key: keyFn = (_: any, i: number) => i,
    motion,
    fill,
    fillOpacity,
    stroke,
    strokeWidth,
    opacity,
    class: className,
    ...restProps
  }: VectorProps = $props();

  // Filled shapes use fill instead of stroke for their default styling
  const isFilled = $derived(shape === 'spike' || shape === 'arrow-filled');

  // Resolve anchor default based on shape
  const resolvedAnchor = $derived(anchor ?? (isFilled ? 'start' : 'middle'));

  // Data mode detection
  const dataMode = $derived(hasAnyDataProp(x, y, lengthProp, rotateProp));

  // Per-item style mode: when any style prop is a function, we must render individual paths
  const hasPerItemStyles = $derived(
    typeof fill === 'function' ||
    typeof stroke === 'function' ||
    typeof fillOpacity === 'function' ||
    typeof strokeWidth === 'function' ||
    typeof opacity === 'function' ||
    typeof className === 'function'
  );

  // Contexts
  const chartCtx = getChartContext();
  const geo = getGeoContext();
  const layerCtx = getLayerContext();

  // Data to iterate over in data mode
  const resolvedData: any[] = $derived(
    dataMode ? (dataProp ?? chartDataArray(chartCtx.data)) : []
  );

  // Resolve a single data item to pixel coordinates and values
  function resolveVector(d: any) {
    let resolvedX: number, resolvedY: number;

    if (geo.projection) {
      [resolvedX, resolvedY] = resolveGeoDataPair(x, y, d, geo.projection);
    } else {
      resolvedX = resolveDataProp(x, d, chartCtx.xScale, 0);
      resolvedY = resolveDataProp(y, d, chartCtx.yScale, 0);
    }

    return {
      x: resolvedX,
      y: resolvedY,
      length: resolveDataProp(lengthProp, d, chartCtx.rScale, typeof lengthProp === 'number' ? lengthProp : 12),
      rotate: typeof rotateProp === 'number' ? rotateProp : (extractRawDataValue(rotateProp, d) ?? 0),
    };
  }

  // --- Data mode motion ---
  const dataMotionMap = createDataMotionMap(motion);

  if (dataMotionMap) {
    $effect(() => {
      if (!dataMode) return;
      const activeKeys = new Set<any>();
      for (let i = 0; i < resolvedData.length; i++) {
        const d = resolvedData[i];
        const key = keyFn(d, i);
        activeKeys.add(key);
        const resolved = resolveVector(d);
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
      const resolved = resolveVector(d);
      const animated = dataMotionMap?.get(key);
      return {
        d,
        key,
        x: animated?.x ?? resolved.x,
        y: animated?.y ?? resolved.y,
        length: animated?.length ?? resolved.length,
        rotate: resolved.rotate,
      };
    });
  });

  // --- Anchor offset for custom children ---
  function getAnchorOffset(len: number) {
    switch (resolvedAnchor) {
      case 'start':
        return 0;
      case 'end':
        return len;
      case 'middle':
      default:
        return len / 2;
    }
  }

  // --- Path generation ---
  // Generate local path data (at origin, pointing up)
  function getLocalPathData(len: number) {
    const w = width ?? len * 0.25;
    if (shape === 'spike') {
      return vectorSpikePath({ length: len, anchor: resolvedAnchor, width: w });
    }
    if (shape === 'arrow-filled') {
      return vectorArrowFilledPath({ length: len, anchor: resolvedAnchor, width: w });
    }
    return vectorArrowPath({ length: len, anchor: resolvedAnchor, width: w });
  }

  // Generate absolute path data with position and rotation baked in
  function getAbsolutePathData(itemX: number, itemY: number, len: number, rot: number) {
    return transformVectorPath(getLocalPathData(len), itemX, itemY, rot);
  }

  // --- Combined path for all items (single Path element for SVG + Canvas) ---
  const combinedPathData = $derived.by(() => {
    if (dataMode) {
      return resolvedItems
        .map((item) => getAbsolutePathData(item.x, item.y, item.length, item.rotate))
        .join('');
    }
    return null;
  });

  // --- Pixel mode ---
  const initialX = initialXProp ?? (typeof x === 'number' ? x : 0);
  const initialY = initialYProp ?? (typeof y === 'number' ? y : 0);
  const initialLength = initialLengthProp ?? (typeof lengthProp === 'number' ? lengthProp : 12);

  const motionX = createMotion(initialX, () => (typeof x === 'number' ? x : 0), motion);
  const motionY = createMotion(initialY, () => (typeof y === 'number' ? y : 0), motion);
  const motionLength = createMotion(initialLength, () => (typeof lengthProp === 'number' ? lengthProp : 12), motion);

  const pixelRotate = $derived(typeof rotateProp === 'number' ? rotateProp : 0);

  const pixelPathData = $derived(
    getAbsolutePathData(motionX.current, motionY.current, motionLength.current, pixelRotate)
  );
</script>

{#if children}
  <!-- Custom children: use <g> with transform for positioning/rotation -->
  {#if dataMode}
    {#each resolvedItems as item (item.key)}
      {@const offset = getAnchorOffset(item.length)}
      {@const resolvedClass = resolveStyleProp(className, item.d)}
      <g transform="translate({item.x},{item.y}) rotate({item.rotate})" class={resolvedClass}>
        <g transform="translate(0,{offset})">
          {@render children({ length: item.length, d: item.d })}
        </g>
      </g>
    {/each}
  {:else}
    {@const offset = getAnchorOffset(motionLength.current)}
    <g transform="translate({motionX.current},{motionY.current}) rotate({pixelRotate})">
      <g transform="translate(0,{offset})">
        {@render children({ length: motionLength.current })}
      </g>
    </g>
  {/if}
{:else if dataMode && hasPerItemStyles}
  <!-- Data mode with per-item styles: render individual paths -->
  {#each resolvedItems as item (item.key)}
    {@const resolvedFill = resolveColorProp(fill, item.d, chartCtx.cScale)}
    {@const resolvedStroke = resolveColorProp(stroke, item.d, chartCtx.cScale)}
    {@const resolvedFillOpacity = resolveStyleProp(fillOpacity, item.d)}
    {@const resolvedStrokeWidth = resolveStyleProp(strokeWidth, item.d)}
    {@const resolvedOpacity = resolveStyleProp(opacity, item.d)}
    {@const resolvedClass = resolveStyleProp(className, item.d)}
    <Path
      pathData={getAbsolutePathData(item.x, item.y, item.length, item.rotate)}
      fill={resolvedFill}
      fillOpacity={resolvedFillOpacity}
      stroke={resolvedStroke}
      strokeWidth={resolvedStrokeWidth}
      opacity={resolvedOpacity}
      class={cls('lc-vector', isFilled ? 'lc-vector-filled' : 'lc-vector-stroked', resolvedClass)}
    />
  {/each}
{:else}
  <!-- Built-in shapes: single Path element handles SVG + Canvas -->
  <Path
    pathData={dataMode ? combinedPathData : pixelPathData}
    fill={fill as string}
    fillOpacity={fillOpacity as number}
    stroke={stroke as string}
    strokeWidth={strokeWidth as number}
    opacity={opacity as number}
    class="lc-vector {isFilled ? 'lc-vector-filled' : 'lc-vector-stroked'} {typeof className === 'string' ? className : ''}"
  />
{/if}

<style>
  @layer base {
    :global(:where(.lc-vector)) {
      stroke-linecap: round;
      stroke-linejoin: round;
    }

    /* Stroked shapes (arrow): stroke defaults to currentColor, fill to none */
    :global(:where(.lc-layout-svg .lc-vector-stroked, svg.lc-vector-stroked):not([stroke])) {
      stroke: var(--color-surface-content, currentColor);
    }
    :global(:where(.lc-layout-svg .lc-vector-stroked, svg.lc-vector-stroked):not([fill])) {
      fill: none;
    }

    /* Filled shapes (spike, arrow-filled): fill defaults to currentColor, stroke to none */
    :global(:where(.lc-layout-svg .lc-vector-filled, svg.lc-vector-filled):not([fill])) {
      fill: var(--color-surface-content, currentColor);
    }
    :global(:where(.lc-layout-svg .lc-vector-filled, svg.lc-vector-filled):not([stroke])) {
      stroke: none;
    }
  }
</style>
