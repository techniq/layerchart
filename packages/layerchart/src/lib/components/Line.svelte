<script lang="ts" module>
  import type { SVGAttributes } from 'svelte/elements';
  import { motionState, type MotionProps } from '$lib/stores/motionStore.js';
  import { renderPathData, type ComputedStylesOptions } from '$lib/utils/canvas.js';
  import MarkerWrapper, { type MarkerOptions } from './MarkerWrapper.svelte';
  import type { CommonStyleProps, Without } from 'layerchart/utils/types.js';

  export type LinePropsWithoutHTML = {
    /**
     * The x-coordinate of the line's starting point
     *
     * @required
     */
    x1: number;

    /**
     * The initial x-coordinate of the line's starting point (defaults to x1 if not provided)
     *
     * @default x1
     */
    initialX1?: number;

    /**
     * The y-coordinate of the line's starting point
     *
     * @required
     */
    y1: number;

    /**
     * The initial y-coordinate of the line's starting point (defaults to y1 if not provided)
     *
     * @default y1
     */
    initialY1?: number;

    /**
     * The x-coordinate of the line's ending point
     *
     * @required
     */
    x2: number;

    /**
     * The initial x-coordinate of the line's ending point (defaults to x2 if not provided)
     *
     * @default x2
     */
    initialX2?: number;

    /**
     * The y-coordinate of the line's ending point
     *
     * @default y2
     */
    y2: number;

    /**
     * The initial y-coordinate of the line's ending point (defaults to y2 if not provided)
     *
     * @default y2
     */
    initialY2?: number;

    /**
     * Event handler for when the line is clicked
     */
    onclick?: (e: MouseEvent) => void;

    /**
     * Event handler for when a pointer enters the line
     */
    onpointerenter?: (e: PointerEvent) => void;

    /**
     * Event handler for when a pointer moves over the line
     */
    onpointermove?: (e: PointerEvent) => void;

    /**
     * Event handler for when a pointer leaves the line
     */
    onpointerleave?: (e: PointerEvent) => void;

    /**
     * Marker to attach to both start and end points of the line
     */
    marker?: MarkerOptions;

    /**
     * Marker to attach to the start point of the line
     */
    markerStart?: MarkerOptions;

    /**
     * Marker to attach to the end point of the line
     */
    markerEnd?: MarkerOptions;
  } & MotionProps &
    CommonStyleProps;

  export type LineProps = LinePropsWithoutHTML &
    Without<SVGAttributes<SVGLineElement>, LinePropsWithoutHTML>;
</script>

<script lang="ts">
  import { cls } from '@layerstack/tailwind';
  import { uniqueId } from '@layerstack/utils';
  import { merge } from 'lodash-es';

  import { getCanvasContext } from './layout/Canvas.svelte';
  import { getRenderContext } from './Chart.svelte';

  import { createKey } from 'layerchart/utils/key.svelte.js';
  import { afterTick } from 'layerchart/utils/after-tick.js';

  let {
    x1,
    initialX1 = x1,
    y1,
    initialY1 = y1,
    x2,
    initialX2 = x2,
    y2,
    initialY2 = y2,
    class: className,
    strokeWidth,
    opacity,
    fill,
    stroke,
    marker,
    markerEnd,
    markerStart,
    spring,
    tweened,
    fillOpacity,
    ...restProps
  }: LineProps = $props();

  const markerStartId = $derived(markerStart || marker ? uniqueId('marker-') : '');
  const markerEndId = $derived(markerEnd || marker ? uniqueId('marker-') : '');

  const tweenedX1 = motionState(initialX1, { spring, tweened });
  const tweenedY1 = motionState(initialY1, { spring, tweened });
  const tweenedX2 = motionState(initialX2, { spring, tweened });
  const tweenedY2 = motionState(initialY2, { spring, tweened });

  $effect(() => {
    [x1, y1, x2, y1];
    afterTick(() => {
      tweenedX1.set(x1);
      tweenedY1.set(y1);
      tweenedX2.set(x2);
      tweenedY2.set(y2);
    });
  });

  const renderCtx = getRenderContext();
  const canvasCtx = getCanvasContext();

  function render(
    ctx: CanvasRenderingContext2D,
    styleOverrides: ComputedStylesOptions | undefined
  ) {
    const pathData = `M ${tweenedX1.current},${tweenedY1.current} L ${tweenedX2.current},${tweenedY2.current}`;
    renderPathData(
      ctx,
      pathData,
      styleOverrides
        ? merge({ styles: { strokeWidth } }, styleOverrides)
        : {
            styles: { fill, stroke, strokeWidth, opacity },
            classes: className,
          }
    );
  }

  const fillKey = createKey(() => fill);
  const strokeKey = createKey(() => stroke);

  $effect(() => {
    if (renderCtx !== 'canvas') return;
    [tweenedX1.current, tweenedY1.current, tweenedX2.current, tweenedY2.current];
    [fillKey.current, strokeKey.current, strokeWidth, opacity, className];
    canvasCtx.invalidate();
  });

  $effect(() => {
    if (renderCtx !== 'canvas') return;
    return canvasCtx.register({
      name: 'Line',
      render,
      events: {
        click: restProps.onclick,
        pointerenter: restProps.onpointerenter,
        pointermove: restProps.onpointermove,
        pointerleave: restProps.onpointerleave,
      },
    });
  });
</script>

{#if renderCtx === 'svg'}
  <line
    x1={tweenedX1.current}
    y1={tweenedY1.current}
    x2={tweenedX2.current}
    y2={tweenedY2.current}
    {fill}
    {stroke}
    fill-opacity={fillOpacity}
    stroke-width={strokeWidth}
    {opacity}
    marker-start={markerStartId ? `url(#${markerStartId})` : undefined}
    marker-end={markerEndId ? `url(#${markerEndId})` : undefined}
    class={cls(stroke === undefined && 'stroke-surface-content', className)}
    {...restProps}
  />
  <MarkerWrapper id={markerStartId} marker={markerStart ?? marker} />
  <MarkerWrapper id={markerEndId} marker={markerEnd ?? marker} />
{/if}
