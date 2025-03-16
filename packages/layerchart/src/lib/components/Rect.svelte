<script lang="ts" module>
  import type { CommonStyleProps, Without } from 'layerchart/utils/types.js';
  import type { SVGAttributes } from 'svelte/elements';
  import { motionState, resolveOptions, type MotionProps } from '$lib/stores/motionStore.js';
  import { renderRect, type ComputedStylesOptions } from '$lib/utils/canvas.js';

  export type RectPropsWithoutHTML = {
    /**
     * @default 0
     */
    x?: number;

    /**
     * @default x
     */
    initialX?: number;

    /**
     * @default 0
     */
    y?: number;

    /**
     * @default y
     */
    initialY?: number;
    width: number;
    initialWidth?: number;
    height: number;
    initialHeight?: number;
    /**
     * Underlying `<rect>` tag when using <Svg>. Useful for bindings.
     *
     * @bindable
     */
    ref?: SVGRectElement;
  } & MotionProps &
    CommonStyleProps;

  export type RectProps = RectPropsWithoutHTML &
    Without<SVGAttributes<SVGRectElement>, RectPropsWithoutHTML>;
</script>

<script lang="ts">
  import { cls } from '@layerstack/tailwind';
  import { merge } from 'lodash-es';

  import { getRenderContext } from './Chart.svelte';
  import { getCanvasContext } from './layout/Canvas.svelte';
  import { afterTick } from 'layerchart/utils/after-tick.js';
  import { createKey } from 'layerchart/utils/key.svelte.js';

  let {
    height,
    width,
    x = 0,
    y = 0,
    initialX = x,
    initialY = y,
    fill,
    fillOpacity,
    stroke,
    initialHeight = height,
    initialWidth = width,
    strokeWidth,
    opacity,
    ref = $bindable(),
    spring,
    tweened,
    class: className,
    ...restProps
  }: RectProps = $props();

  const tweenedX = $derived(motionState(initialX, resolveOptions('x', { spring, tweened })));
  const tweenedY = $derived(motionState(initialY, resolveOptions('y', { spring, tweened })));
  const tweenedWidth = $derived(
    motionState(initialWidth, resolveOptions('width', { spring, tweened }))
  );
  const tweenedHeight = $derived(
    motionState(initialHeight, resolveOptions('height', { spring, tweened }))
  );

  const renderCtx = getRenderContext();
  const canvasCtx = getCanvasContext();

  $effect(() => {
    [x, y, width, height];
    afterTick(() => {
      tweenedX.set(x);
      tweenedY.set(y);
      tweenedWidth.set(width);
      tweenedHeight.set(height);
    });
  });

  function render(
    ctx: CanvasRenderingContext2D,
    styleOverrides: ComputedStylesOptions | undefined
  ) {
    renderRect(
      ctx,
      {
        x: tweenedX.current,
        y: tweenedY.current,
        width: tweenedWidth.current,
        height: tweenedHeight.current,
      },
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
      tweenedX.current,
      tweenedY.current,
      tweenedWidth.current,
      tweenedHeight.current,
      fillKey.current,
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
    });
  });
</script>

{#if renderCtx === 'svg'}
  <rect
    x={tweenedX.current}
    y={tweenedY.current}
    width={tweenedWidth.current}
    height={tweenedHeight.current}
    {fill}
    fill-opacity={fillOpacity}
    {stroke}
    stroke-width={strokeWidth}
    {opacity}
    class={cls(fill == null && 'fill-surface-content', className)}
    {...restProps}
    bind:this={ref}
  />
{/if}
