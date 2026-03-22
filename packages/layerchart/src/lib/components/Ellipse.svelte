<script lang="ts" module>
  import type { Without } from '$lib/utils/types.js';
  import type { DataProp, DataDrivenStyleProps } from '$lib/utils/dataProp.js';

  export type EllipsePropsWithoutHTML = {
    /**
     * The center x position of the ellipse.
     * - `number`: pixel value (direct)
     * - `string`: data property name, resolved via xScale
     * - `function(d)`: accessor called per data item, result passed through xScale
     *
     * @default 0
     */
    cx?: DataProp;

    /**
     * The initial center x position of the ellipse (pixel mode only).
     *
     * @default cx
     */
    initialCx?: number;

    /**
     * The center y position of the ellipse.
     * - `number`: pixel value (direct)
     * - `string`: data property name, resolved via yScale
     * - `function(d)`: accessor called per data item, result passed through yScale
     *
     * @default 0
     */
    cy?: DataProp;

    /**
     * The initial center y position of the ellipse (pixel mode only).
     *
     * @default cy
     */
    initialCy?: number;

    /**
     * The radius of the ellipse on the x-axis.
     * - `number`: pixel value (direct)
     * - `string`: data property name, resolved via rScale
     * - `function(d)`: accessor called per data item, result passed through rScale
     *
     * @default 1
     */
    rx?: DataProp;

    /**
     * The initial radius of the ellipse on the x-axis (pixel mode only).
     *
     * @default rx
     */
    initialRx?: number;

    /**
     * The radius of the ellipse on the y-axis.
     * - `number`: pixel value (direct)
     * - `string`: data property name, resolved via rScale
     * - `function(d)`: accessor called per data item, result passed through rScale
     *
     * @default 1
     */
    ry?: DataProp;

    /**
     * The initial radius of the ellipse on the y-axis (pixel mode only).
     *
     * @default ry
     */
    initialRy?: number;

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
     * A bindable reference to the `<ellipse>` element (pixel mode only).
     *
     * @bindable
     */
    ref?: SVGEllipseElement;

    /** Motion configuration (pixel mode only). */
    motion?: MotionProp;
  } & DataDrivenStyleProps;

  export type EllipseProps = EllipsePropsWithoutHTML &
    Without<SVGAttributes<Element>, EllipsePropsWithoutHTML>;
</script>

<script lang="ts">
  import { cls } from '@layerstack/tailwind';
  import { merge } from '@layerstack/utils';

  import { untrack } from 'svelte';
  import { getLayerContext } from '$lib/contexts/layer.js';
  import { getChartContext } from '$lib/contexts/chart.js';
  import { createMotion, createDataMotionMap, type MotionProp } from '$lib/utils/motion.svelte.js';
  import { registerCanvasComponent } from './layers/Canvas.svelte';
  import { renderEllipse, type ComputedStylesOptions } from '$lib/utils/canvas.js';
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
    rx = 1,
    initialRx: initialRxProp,
    ry = 1,
    initialRy: initialRyProp,
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
    ...restProps
  }: EllipseProps = $props();

  // Data mode detection
  const dataMode = $derived(hasAnyDataProp(cx, cy, rx, ry));

  // Chart context
  const chartCtx = getChartContext();
  const geo = getGeoContext();

  // Data to iterate over in data mode
  const resolvedData: any[] = $derived(
    dataMode ? (dataProp ?? chartDataArray(chartCtx.data)) : []
  );

  // Resolve a single data item to pixel coordinates
  function resolveEllipse(d: any) {
    if (geo.projection) {
      const [projX, projY] = resolveGeoDataPair(cx, cy, d, geo.projection);
      return {
        cx: projX,
        cy: projY,
        rx: resolveDataProp(rx, d, chartCtx.rScale, typeof rx === 'number' ? rx : 1),
        ry: resolveDataProp(ry, d, chartCtx.rScale, typeof ry === 'number' ? ry : 1),
      };
    }
    return {
      cx: resolveDataProp(cx, d, chartCtx.xScale, 0),
      cy: resolveDataProp(cy, d, chartCtx.yScale, 0),
      rx: resolveDataProp(rx, d, chartCtx.rScale, typeof rx === 'number' ? rx : 1),
      ry: resolveDataProp(ry, d, chartCtx.rScale, typeof ry === 'number' ? ry : 1),
    };
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
      const resolved = resolveEllipse(d);
      untrack(() => dataMotionMap.update(key, resolved));
    }
    untrack(() => dataMotionMap.cleanup(activeKeys));
  });

  // Single source of truth: resolved values with animated overlay
  const resolvedItems = $derived.by(() => {
    if (!dataMode) return [];
    return resolvedData.map((d, i) => {
      const key = keyFn(d, i);
      const resolved = resolveEllipse(d);
      const animated = dataMotionMap?.get(key);
      return {
        d,
        key,
        cx: animated?.cx ?? resolved.cx,
        cy: animated?.cy ?? resolved.cy,
        rx: animated?.rx ?? resolved.rx,
        ry: animated?.ry ?? resolved.ry,
      };
    });
  });

  // --- Pixel mode ---
  let ref = $state<SVGEllipseElement>();

  $effect.pre(() => {
    refProp = ref;
  });

  const initialCx = initialCxProp ?? (typeof cx === 'number' ? cx : 0);
  const initialCy = initialCyProp ?? (typeof cy === 'number' ? cy : 0);
  const initialRx = initialRxProp ?? (typeof rx === 'number' ? rx : 1);
  const initialRy = initialRyProp ?? (typeof ry === 'number' ? ry : 1);

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
  const motionRx = createMotion(
    initialRx,
    () => (typeof rx === 'number' ? rx : 1),
    motion
  );
  const motionRy = createMotion(
    initialRy,
    () => (typeof ry === 'number' ? ry : 1),
    motion
  );

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
          classes: cls('lc-ellipse', itemClass ?? (typeof className === 'string' ? className : undefined)),
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
        renderEllipse(ctx, item, styleOpts);
      }
    } else {
      const styleOpts = getStyleOptions(styleOverrides);
      renderEllipse(
        ctx,
        {
          cx: motionCx.current,
          cy: motionCy.current,
          rx: motionRx.current,
          ry: motionRy.current,
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
      name: 'Ellipse',
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
        motionRx.current,
        motionRy.current,
        fillKey.current,
        fillOpacity,
        strokeKey.current,
        strokeWidth,
        opacity,
        className,
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
      <ellipse
        cx={item.cx}
        cy={item.cy}
        rx={item.rx}
        ry={item.ry}
        fill={resolvedFill}
        fill-opacity={resolvedFillOpacity}
        stroke={resolvedStroke}
        stroke-width={resolvedStrokeWidth}
        opacity={resolvedOpacity}
        class={cls('lc-ellipse', resolvedClass)}
        {...restProps}
      />
    {/each}
  {:else}
    <ellipse
      bind:this={ref}
      cx={motionCx.current}
      cy={motionCy.current}
      rx={motionRx.current}
      ry={motionRy.current}
      fill={fill as string}
      fill-opacity={fillOpacity as number}
      stroke={stroke as string}
      stroke-width={strokeWidth as number}
      opacity={opacity as number}
      class={cls('lc-ellipse', className as string)}
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
        style:width="{item.rx * 2}px"
        style:height="{item.ry * 2}px"
        style:border-radius="50%"
        style:background-color={resolvedFill}
        style:opacity={resolvedOpacity}
        style:border-width={resolvedStrokeWidth}
        style:border-color={resolvedStroke}
        style:border-style="solid"
        style:transform="translate(-50%, -50%)"
        class={cls('lc-ellipse', resolvedClass)}
        {...restProps}
      ></div>
    {/each}
  {:else}
    <div
      style:position="absolute"
      style:left="{motionCx.current}px"
      style:top="{motionCy.current}px"
      style:width="{motionRx.current * 2}px"
      style:height="{motionRy.current * 2}px"
      style:border-radius="50%"
      style:background-color={fill as string}
      style:opacity={opacity as number}
      style:border-width={strokeWidth as number}
      style:border-color={stroke as string}
      style:border-style="solid"
      style:transform="translate(-50%, -50%)"
      class={cls('lc-ellipse', className as string)}
      {...restProps}
    ></div>
  {/if}
{/if}

<style>
  @layer base {
    :global(:where(.lc-ellipse)) {
      --fill-color: var(--color-surface-content, currentColor);
      --stroke-color: initial;
    }

    /* Svg | Canvas layers */
    :global(:where(.lc-layout-svg .lc-ellipse, svg.lc-ellipse):not([fill])) {
      fill: var(--fill-color);
    }
    :global(:where(.lc-layout-svg .lc-ellipse, svg.lc-ellipse):not([stroke])) {
      stroke: var(--stroke-color);
    }

    /* Html layers */
    :global(:where(.lc-layout-html .lc-ellipse):not([background-color])) {
      background-color: var(--fill-color);
    }
    :global(:where(.lc-layout-html .lc-ellipse):not([border-color])) {
      border-color: var(--stroke-color);
    }
  }
</style>
