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
  import { createMotion, type MotionProp } from '$lib/utils/motion.svelte.js';
  import { registerCanvasComponent } from './layers/Canvas.svelte';
  import { renderCircle, type ComputedStylesOptions } from '$lib/utils/canvas.js';
  import { hasAnyDataProp, resolveDataProp, resolveColorProp } from '$lib/utils/dataProp.js';
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

  // Data to iterate over in data mode
  const resolvedData: any[] = $derived(
    dataMode ? (dataProp ?? chartDataArray(chartCtx.data)) : []
  );

  // Resolve a single data item to pixel coordinates
  function resolveCircle(d: any) {
    return {
      cx: resolveDataProp(cx, d, chartCtx.xScale, 0),
      cy: resolveDataProp(cy, d, chartCtx.yScale, 0),
      r: resolveDataProp(r, d, chartCtx.rScale, typeof r === 'number' ? r : 1),
    };
  }

  // --- Pixel mode (motion only applies here) ---
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
    itemStroke?: string | undefined
  ) {
    return styleOverrides
      ? merge({ styles: { strokeWidth } }, styleOverrides)
      : {
          styles: { fill: itemFill ?? fill, fillOpacity, stroke: itemStroke ?? stroke, strokeWidth, opacity },
          classes: cls('lc-circle', className),
          style: restProps.style as string | undefined,
        };
  }

  function render(
    ctx: CanvasRenderingContext2D,
    styleOverrides: ComputedStylesOptions | undefined
  ) {
    if (dataMode) {
      for (const d of resolvedData) {
        const resolved = resolveCircle(d);
        const resolvedFill = resolveColorProp(fill, d, chartCtx.cScale);
        const resolvedStroke = resolveColorProp(stroke, d, chartCtx.cScale);
        const styleOpts = getStyleOptions(styleOverrides, resolvedFill, resolvedStroke);
        renderCircle(ctx, resolved, styleOpts);
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
        dataMode ? resolvedData : null,
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
    {#each resolvedData as d, i (keyFn(d, i))}
      {@const resolved = resolveCircle(d)}
      {@const resolvedFill = resolveColorProp(fill, d, chartCtx.cScale)}
      {@const resolvedStroke = resolveColorProp(stroke, d, chartCtx.cScale)}
      <circle
        cx={resolved.cx}
        cy={resolved.cy}
        r={resolved.r}
        fill={resolvedFill}
        fill-opacity={fillOpacity}
        stroke={resolvedStroke}
        stroke-width={strokeWidth}
        {opacity}
        class={cls('lc-circle', className)}
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
      fill-opacity={fillOpacity}
      stroke={stroke as string}
      stroke-width={strokeWidth}
      {opacity}
      class={cls('lc-circle', className)}
      {...restProps}
    />
  {/if}
{:else if layerCtx === 'html'}
  {#if dataMode}
    {#each resolvedData as d, i (keyFn(d, i))}
      {@const resolved = resolveCircle(d)}
      {@const resolvedFill = resolveColorProp(fill, d, chartCtx.cScale)}
      {@const resolvedStroke = resolveColorProp(stroke, d, chartCtx.cScale)}
      <div
        style:position="absolute"
        style:left="{resolved.cx}px"
        style:top="{resolved.cy}px"
        style:width="{resolved.r * 2}px"
        style:height="{resolved.r * 2}px"
        style:border-radius="50%"
        style:background-color={resolvedFill}
        style:opacity
        style:border-width={strokeWidth}
        style:border-color={resolvedStroke}
        style:border-style="solid"
        style:transform="translate(-50%, -50%)"
        class={cls('lc-circle', className)}
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
      style:opacity
      style:border-width={strokeWidth}
      style:border-color={stroke as string}
      style:border-style="solid"
      style:transform="translate(-50%, -50%)"
      class={cls('lc-circle', className)}
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
