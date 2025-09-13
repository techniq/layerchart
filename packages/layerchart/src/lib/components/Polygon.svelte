<script lang="ts" module>
  import type { CommonStyleProps, Without } from '$lib/utils/types.js';

  export type PolygonPropsWithoutHTML = {
    /**
     * The center x position of the polygon.
     *
     * @default 0
     */
    cx?: number;

    /**
     * The initial center x position of the polygon.
     *
     * @default cx
     */
    initialCx?: number;

    /**
     * The center y position of the polygon.
     *
     * @default 0
     */
    cy?: number;

    /**
     * The initial center y position of the polygon.
     *
     * @default cy
     */
    initialCy?: number;

    /**
     * The radius of the polygon.
     *
     * @default 1
     */
    r?: number;

    /**
     * The initial radius of the polygon.
     *
     * @default r
     */
    initialR?: number;

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
  } & CommonStyleProps;

  export type PolygonProps = PolygonPropsWithoutHTML &
    Without<SVGAttributes<Element>, PolygonPropsWithoutHTML>;
</script>

<script lang="ts">
  import type { SVGAttributes } from 'svelte/elements';
  import { cls } from '@layerstack/tailwind';
  import { merge } from 'lodash-es';
  import { interpolatePath } from 'd3-interpolate-path';

  import { getRenderContext } from './Chart.svelte';
  import {
    createMotion,
    extractTweenConfig,
    type MotionProp,
    type ResolvedMotion,
  } from '$lib/utils/motion.svelte.js';
  import { registerCanvasComponent } from './layout/Canvas.svelte';
  import { renderPathData, type ComputedStylesOptions } from '$lib/utils/canvas.js';
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

  const initialCx = initialCxProp ?? cx;
  const initialCy = initialCyProp ?? cy;
  const initialR = initialRProp ?? r;

  const motionCx = createMotion(initialCx, () => cx, motion);
  const motionCy = createMotion(initialCy, () => cy, motion);
  const motionR = createMotion(initialR, () => r, motion);

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

  const renderCtx = getRenderContext();

  function render(
    ctx: CanvasRenderingContext2D,
    styleOverrides: ComputedStylesOptions | undefined
  ) {
    renderPathData(
      ctx,
      tweenedState.current,
      styleOverrides
        ? merge({ styles: { strokeWidth } }, styleOverrides)
        : {
            styles: { fill, fillOpacity, stroke, strokeWidth, opacity },
            classes: cls('lc-polygon', fill == null && 'fill-surface-content', className),
          }
    );
  }

  // TODO: Use objectId to work around Svelte 4 reactivity issue (even when memoizing gradients)
  const fillKey = createKey(() => fill);
  const strokeKey = createKey(() => stroke);

  if (renderCtx === 'canvas') {
    registerCanvasComponent({
      name: 'Polygon',
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
        fillKey.current,
        fillOpacity,
        strokeKey.current,
        strokeWidth,
        opacity,
        className,
        tweenedState.current,
      ],
    });
  }
</script>

{#if renderCtx === 'svg'}
  <path
    d={tweenedState.current}
    {fill}
    fill-opacity={fillOpacity}
    {stroke}
    stroke-width={strokeWidth}
    {opacity}
    class={cls('lc-polygon', fill == null && 'fill-surface-content', className)}
    {...restProps}
    bind:this={ref}
  />
{/if}
