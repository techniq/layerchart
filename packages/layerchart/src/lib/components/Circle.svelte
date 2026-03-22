<script lang="ts" module>
  import type { Snippet } from 'svelte';
  import type { Without } from '$lib/utils/types.js';
  import type { DataProp, DataDrivenStyleProps } from '$lib/utils/dataProp.js';

  export type CirclePropsWithoutHTML = {
    /**
     * The center x position of the circle.
     * - `number`: pixel value (direct)
     * - `string`: data property name, resolved via xScale
     * - `function(d)`: accessor called per data item, result passed through xScale
     *
     * @default 0
     */
    cx?: DataProp;

    /**
     * The initial center x position of the circle (pixel mode only).
     *
     * @default cx
     */
    initialCx?: number;

    /**
     * The center y position of the circle.
     * - `number`: pixel value (direct)
     * - `string`: data property name, resolved via yScale
     * - `function(d)`: accessor called per data item, result passed through yScale
     *
     * @default 0
     */
    cy?: DataProp;

    /**
     * The initial center y position of the circle (pixel mode only).
     *
     * @default cy
     */
    initialCy?: number;

    /**
     * The radius of the circle.
     * - `number`: pixel value (direct)
     * - `string`: data property name, resolved via rScale
     * - `function(d)`: accessor called per data item, result passed through rScale
     *
     * @default 1
     */
    r?: DataProp;

    /**
     * The initial radius of the circle (pixel mode only).
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
     * A bindable reference to the `<circle>` element (pixel mode only).
     *
     * @bindable
     */
    ref?: SVGCircleElement;

    /** Motion configuration (pixel mode only). */
    motion?: MotionProp;

    /** Children content to render.  Note: Only works for Html layers */
    children?: Snippet;
  } & DataDrivenStyleProps;

  export type CircleProps = CirclePropsWithoutHTML &
    Without<SVGAttributes<Element>, CirclePropsWithoutHTML>;
</script>

<script lang="ts">
  import { cls } from '@layerstack/tailwind';
  import { merge } from '@layerstack/utils';

  import { getLayerContext } from '$lib/contexts/layer.js';
  import { getChartContext } from '$lib/contexts/chart.js';
  import { untrack } from 'svelte';
  import { createMotion, createDataMotionMap, type MotionProp } from '$lib/utils/motion.svelte.js';
  import { registerCanvasComponent } from './layers/Canvas.svelte';
  import { renderCircle, type ComputedStylesOptions } from '$lib/utils/canvas.js';
  import { hasAnyDataProp, resolveDataProp, resolveColorProp, resolveGeoDataPair, resolveStyleProp } from '$lib/utils/dataProp.js';
  import { getGeoContext } from '$lib/contexts/geo.js';
  import { chartDataArray } from '$lib/utils/common.js';
  import type { SVGAttributes } from 'svelte/elements';
  import { createKey } from '$lib/utils/key.svelte.js';

  let {
    cx = 0,
    initialCx: initialCxProp,
    cy = 0,
    initialCy: initialCyProp,
    r = 1,
    initialR: initialRProp,
    data: dataProp,
    key: keyFn = (_: any, i: number) => i,
    motion,
    fill,
    fillOpacity,
    stroke,
    strokeWidth,
    opacity,
    class: className,
    ref: refProp = $bindable(),
    children,
    ...restProps
  }: CircleProps = $props();

  // Data mode detection: if any positional prop is a string or function
  const dataMode = $derived(hasAnyDataProp(cx, cy, r));

  // Chart context (safe to call outside Chart — returns fallback)
  const chartCtx = getChartContext();
  const geo = getGeoContext();

  // Data to iterate over in data mode
  const resolvedData: any[] = $derived(
    dataMode ? (dataProp ?? chartDataArray(chartCtx.data)) : []
  );

  // Resolve a single data item to pixel coordinates
  function resolveCircle(d: any) {
    if (geo.projection) {
      const [projX, projY] = resolveGeoDataPair(cx, cy, d, geo.projection);
      return {
        cx: projX,
        cy: projY,
        r: resolveDataProp(r, d, chartCtx.rScale, typeof r === 'number' ? r : 1),
      };
    }
    return {
      cx: resolveDataProp(cx, d, chartCtx.xScale, 0),
      cy: resolveDataProp(cy, d, chartCtx.yScale, 0),
      r: resolveDataProp(r, d, chartCtx.rScale, typeof r === 'number' ? r : 1),
    };
  }

  // --- Data mode: resolved items with optional motion ---
  const dataMotionMap = createDataMotionMap(motion);

  // Update motion targets when resolved values change
  $effect(() => {
    if (!dataMode || !dataMotionMap) return;
    const activeKeys = new Set<any>();
    for (let i = 0; i < resolvedData.length; i++) {
      const d = resolvedData[i];
      const key = keyFn(d, i);
      activeKeys.add(key);
      const resolved = resolveCircle(d);
      untrack(() => dataMotionMap.update(key, resolved));
    }
    untrack(() => dataMotionMap.cleanup(activeKeys));
  });

  // Single source of truth: resolved values with animated overlay
  // Reading Spring .current here makes this reactive to animation frames
  const resolvedItems = $derived.by(() => {
    if (!dataMode) return [];
    return resolvedData.map((d, i) => {
      const key = keyFn(d, i);
      const resolved = resolveCircle(d);
      const animated = dataMotionMap?.get(key);
      return {
        d,
        key,
        cx: animated?.cx ?? resolved.cx,
        cy: animated?.cy ?? resolved.cy,
        r: animated?.r ?? resolved.r,
      };
    });
  });

  // --- Pixel mode ---
  let ref = $state<SVGCircleElement>();

  $effect.pre(() => {
    refProp = ref;
  });

  const initialCx = initialCxProp ?? (typeof cx === 'number' ? cx : 0);
  const initialCy = initialCyProp ?? (typeof cy === 'number' ? cy : 0);
  const initialR = initialRProp ?? (typeof r === 'number' ? r : 1);

  const layerCtx = getLayerContext();

  const motionCx = createMotion(
    initialCx,
    () => (typeof cx === 'number' ? cx : 0),
    motion
  );
  const motionCy = createMotion(
    initialCy,
    () => (typeof cy === 'number' ? cy : 0),
    motion
  );
  const motionR = createMotion(
    initialR,
    () => (typeof r === 'number' ? r : 1),
    motion
  );

  // Style options (shared between pixel and data mode)
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
          classes: cls('lc-circle', itemClass ?? (typeof className === 'string' ? className : undefined)),
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
        const resolvedFillOpacity = resolveStyleProp(fillOpacity, item.d);
        const resolvedStrokeWidth = resolveStyleProp(strokeWidth, item.d);
        const resolvedOpacity = resolveStyleProp(opacity, item.d);
        const resolvedClass = resolveStyleProp(className, item.d);
        const styleOpts = getStyleOptions(styleOverrides, resolvedFill, resolvedStroke, resolvedFillOpacity, resolvedStrokeWidth, resolvedOpacity, resolvedClass);
        renderCircle(ctx, item, styleOpts);
      }
    } else {
      const styleOpts = getStyleOptions(styleOverrides);
      renderCircle(
        ctx,
        { cx: motionCx.current, cy: motionCy.current, r: motionR.current },
        styleOpts
      );
    }
  }

  // TODO: Use objectId to work around Svelte 4 reactivity issue (even when memoizing gradients)
  const fillKey = createKey(() => fill);
  const strokeKey = createKey(() => stroke);

  if (layerCtx === 'canvas') {
    registerCanvasComponent({
      name: 'Circle',
      render,
      events: {
        click: restProps.onclick,
        pointerdown: restProps.onpointerdown,
        pointerenter: restProps.onpointerenter,
        pointermove: restProps.onpointermove,
        pointerleave: restProps.onpointerleave,
      },
      deps: () => [
        dataMode,
        dataMode ? resolvedItems : null,
        motionCx.current,
        motionCy.current,
        motionR.current,
        fillKey.current,
        fillOpacity,
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
    {#each resolvedItems as item (item.key)}
      {@const resolvedFill = resolveColorProp(fill, item.d, chartCtx.cScale)}
      {@const resolvedStroke = resolveColorProp(stroke, item.d, chartCtx.cScale)}
      {@const resolvedFillOpacity = resolveStyleProp(fillOpacity, item.d)}
      {@const resolvedStrokeWidth = resolveStyleProp(strokeWidth, item.d)}
      {@const resolvedOpacity = resolveStyleProp(opacity, item.d)}
      {@const resolvedClass = resolveStyleProp(className, item.d)}
      <circle
        cx={item.cx}
        cy={item.cy}
        r={item.r}
        fill={resolvedFill}
        fill-opacity={resolvedFillOpacity}
        stroke={resolvedStroke}
        stroke-width={resolvedStrokeWidth}
        opacity={resolvedOpacity}
        class={cls('lc-circle', resolvedClass)}
        {...restProps}
      />
    {/each}
  {:else}
    <circle
      bind:this={ref}
      cx={motionCx.current}
      cy={motionCy.current}
      r={motionR.current}
      fill={fill as string}
      fill-opacity={fillOpacity as number}
      stroke={stroke as string}
      stroke-width={strokeWidth as number}
      opacity={opacity as number}
      class={cls('lc-circle', className as string)}
      {...restProps}
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
      <div
        style:position="absolute"
        style:left="{item.cx}px"
        style:top="{item.cy}px"
        style:width="{item.r * 2}px"
        style:height="{item.r * 2}px"
        style:border-radius="50%"
        style:background-color={resolvedFill}
        style:opacity={resolvedOpacity}
        style:border-width={resolvedStrokeWidth}
        style:border-color={resolvedStroke}
        style:border-style="solid"
        style:transform="translate(-50%, -50%)"
        class={cls('lc-circle', resolvedClass)}
        {...restProps}
      ></div>
    {/each}
  {:else}
    <div
      style:position="absolute"
      style:left="{motionCx.current}px"
      style:top="{motionCy.current}px"
      style:width="{motionR.current * 2}px"
      style:height="{motionR.current * 2}px"
      style:border-radius="50%"
      style:background-color={fill as string}
      style:opacity={opacity as number}
      style:border-width={strokeWidth as number}
      style:border-color={stroke as string}
      style:border-style="solid"
      style:transform="translate(-50%, -50%)"
      class={cls('lc-circle', className as string)}
      {...restProps}
    >
      {@render children?.()}
    </div>
  {/if}
{/if}

<style>
  @layer base {
    :global(:where(.lc-circle)) {
      --fill-color: var(--color-surface-content, currentColor);
      --stroke-color: initial;
    }

    /* Svg | Canvas layers */
    :global(:where(.lc-layout-svg .lc-circle, svg.lc-circle):not([fill])) {
      fill: var(--fill-color);
    }
    :global(:where(.lc-layout-svg .lc-circle, svg.lc-circle):not([stroke])) {
      stroke: var(--stroke-color);
    }

    /* Html layers */
    :global(:where(.lc-layout-html .lc-circle):not([background-color])) {
      background-color: var(--fill-color);
    }
    :global(:where(.lc-layout-html .lc-circle):not([border-color])) {
      border-color: var(--stroke-color);
    }
  }
</style>
