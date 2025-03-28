<script lang="ts" module>
  import type { SVGAttributes } from 'svelte/elements';
  import { createMotion, type MotionProp } from '$lib/utils/motion.svelte.js';
  import { renderPathData, type ComputedStylesOptions } from '$lib/utils/canvas.js';
  import MarkerWrapper, { type MarkerOptions } from './MarkerWrapper.svelte';
  import type { CommonStyleProps, Without } from '$lib/utils/types.js';

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

    motion?: MotionProp;
  } & CommonStyleProps;

  export type LineProps = LinePropsWithoutHTML &
    Without<SVGAttributes<SVGPathElement>, LinePropsWithoutHTML>;
</script>

<script lang="ts">
  import { cls } from '@layerstack/tailwind';
  import { merge } from 'lodash-es';

  import { getCanvasContext } from './layout/Canvas.svelte';
  import { getRenderContext } from './Chart.svelte';

  import { createKey } from '$lib/utils/key.svelte.js';
  import { createId } from '$lib/utils/createId.js';
  import { layerClass } from '$lib/utils/attributes.js';

  const uid = $props.id();

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
    markerMid,
    motion,
    fillOpacity,
    ...restProps
  }: LineProps = $props();

  const markerStartId = $derived(markerStart || marker ? createId('marker-start', uid) : '');
  const markerMidId = $derived(markerMid || marker ? createId('marker-mid', uid) : '');
  const markerEndId = $derived(markerEnd || marker ? createId('marker-end', uid) : '');

  const motionX1 = createMotion(initialX1, () => x1, motion);
  const motionY1 = createMotion(initialY1, () => y1, motion);
  const motionX2 = createMotion(initialX2, () => x2, motion);
  const motionY2 = createMotion(initialY2, () => y2, motion);

  const renderCtx = getRenderContext();
  const canvasCtx = getCanvasContext();

  function render(
    ctx: CanvasRenderingContext2D,
    styleOverrides: ComputedStylesOptions | undefined
  ) {
    const pathData = `M ${motionX1.current},${motionY1.current} L ${motionX2.current},${motionY2.current}`;
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
    [motionX1.current, motionY1.current, motionX2.current, motionY2.current];
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
    x1={motionX1.current}
    y1={motionY1.current}
    x2={motionX2.current}
    y2={motionY2.current}
    {fill}
    {stroke}
    fill-opacity={fillOpacity}
    stroke-width={strokeWidth}
    {opacity}
    marker-start={markerStartId ? `url(#${markerStartId})` : undefined}
    marker-mid={markerMidId ? `url(#${markerMidId})` : undefined}
    marker-end={markerEndId ? `url(#${markerEndId})` : undefined}
    class={cls(layerClass('line'), stroke === undefined && 'stroke-surface-content', className)}
    {...restProps}
  />
  <MarkerWrapper id={markerStartId} marker={markerStart ?? marker} />
  <MarkerWrapper id={markerMidId} marker={markerMid ?? marker} />
  <MarkerWrapper id={markerEndId} marker={markerEnd ?? marker} />
{/if}
