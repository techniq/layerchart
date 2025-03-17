<script lang="ts" module>
  import type { CommonStyleProps, Without } from 'layerchart/utils/types.js';

  export type CirclePropsWithoutHTML = {
    /**
     * The center x position of the circle.
     *
     * @default 0
     */
    cx?: number;

    /**
     * The initial center x position of the circle.
     *
     * @default cx
     */
    initialCx?: number;

    /**
     * The center y position of the circle.
     *
     * @default 0
     */
    cy?: number;

    /**
     * The initial center y position of the circle.
     *
     * @default cy
     */
    initialCy?: number;

    /**
     * The radius of the circle.
     *
     * @default 1
     */
    r?: number;

    /**
     * The initial radius of the circle.
     *
     * @default r
     */
    initialR?: number;

    /**
     * A bindable reference to the `<circle>` element
     *
     * @bindable
     */
    ref?: SVGCircleElement;
  } & MotionProps &
    CommonStyleProps;

  export type CircleProps = CirclePropsWithoutHTML &
    Without<SVGAttributes<SVGCircleElement>, CirclePropsWithoutHTML>;
</script>

<script lang="ts">
  import { cls } from '@layerstack/tailwind';
  import { merge } from 'lodash-es';

  import { getRenderContext } from './Chart.svelte';
  import { motionState, type MotionProps } from '$lib/stores/motionState.svelte.js';
  import { getCanvasContext } from './layout/Canvas.svelte';
  import { renderCircle, type ComputedStylesOptions } from '$lib/utils/canvas.js';
  import type { SVGAttributes } from 'svelte/elements';
  import { afterTick } from 'layerchart/utils/after-tick.js';
  import { createKey } from 'layerchart/utils/key.svelte.js';

  let {
    cx = 0,
    initialCx = cx,
    cy = 0,
    initialCy = cy,
    r = 1,
    initialR = r,
    spring,
    tweened,
    fill,
    fillOpacity,
    stroke,
    strokeWidth,
    opacity,
    class: className,
    ref = $bindable(),
    ...restProps
  }: CircleProps = $props();

  const renderCtx = getRenderContext();
  const canvasCtx = getCanvasContext();

  const tweenedCx = $derived(motionState(initialCx, { spring, tweened }));
  const tweenedCy = $derived(motionState(initialCy, { spring, tweened }));
  const tweenedR = $derived(motionState(initialR, { spring, tweened }));

  $effect(() => {
    [cx, cy, r];
    afterTick(() => {
      tweenedCx.set(cx);
      tweenedCy.set(cy);
      tweenedR.set(r);
    });
  });

  function render(
    ctx: CanvasRenderingContext2D,
    styleOverrides: ComputedStylesOptions | undefined
  ) {
    renderCircle(
      ctx,
      { cx: tweenedCx.current, cy: tweenedCy.current, r: tweenedR.current },
      styleOverrides
        ? merge({ styles: { strokeWidth } }, styleOverrides)
        : {
            styles: { fill, fillOpacity, stroke, strokeWidth, opacity },
            classes: className,
          }
    );
  }

  // TODO: Use objectId to work around Svelte 4 reactivity issue (even when memoizing gradients)
  const fillKey = createKey(() => fill);
  const strokeKey = createKey(() => stroke);

  $effect(() => {
    if (renderCtx !== 'canvas') return;
    [
      tweenedCx.current,
      tweenedCy.current,
      tweenedR.current,
      fillKey.current,
      fillOpacity,
      strokeKey.current,
      strokeWidth,
      opacity,
      className,
    ];

    canvasCtx.invalidate();
  });

  $effect(() => {
    if (renderCtx !== 'canvas') return;
    return canvasCtx.register({
      name: 'Circle',
      render,
      events: {
        click: restProps.onclick,
        pointerdown: restProps.onpointerdown,
        pointerenter: restProps.onpointerenter,
        pointermove: restProps.onpointermove,
        pointerleave: restProps.onpointerleave,
      },
    });
  });
</script>

{#if renderCtx === 'svg'}
  <circle
    bind:this={ref}
    cx={tweenedCx.current}
    cy={tweenedCy.current}
    r={tweenedR.current}
    {fill}
    fill-opacity={fillOpacity}
    {stroke}
    stroke-width={strokeWidth}
    {opacity}
    class={cls(fill == null && 'fill-surface-content', className)}
    {...restProps}
  />
{/if}
