<script lang="ts" module>
  import type { CommonStyleProps, Without } from '$lib/utils/types.js';
  import type { SVGAttributes } from 'svelte/elements';
  import { createMotion, parseMotionProp, type MotionProp } from '$lib/utils/motion.svelte.js';
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

    motion?: MotionProp<'x' | 'y' | 'width' | 'height'>;
  } & CommonStyleProps;

  export type RectProps = RectPropsWithoutHTML &
    Without<SVGAttributes<SVGRectElement>, RectPropsWithoutHTML>;
</script>

<script lang="ts">
  import { cls } from '@layerstack/tailwind';
  import { merge } from 'lodash-es';

  import { getRenderContext } from './Chart.svelte';
  import { registerCanvasComponent } from './layout/Canvas.svelte';
  import { createKey } from '$lib/utils/key.svelte.js';
  import { layerClass } from '$lib/utils/attributes.js';

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
    ref: refProp = $bindable(),
    motion,
    class: className,
    onclick,
    ondblclick,
    onpointerenter,
    onpointermove,
    onpointerleave,
    onpointerover,
    onpointerout,
    ...restProps
  }: RectProps = $props();

  let ref = $state<SVGRectElement>();

  $effect.pre(() => {
    refProp = ref;
  });

  const motionX = createMotion(initialX, () => x, parseMotionProp(motion, 'x'));
  const motionY = createMotion(initialY, () => y, parseMotionProp(motion, 'y'));
  const motionWidth = createMotion(initialWidth, () => width, parseMotionProp(motion, 'width'));
  const motionHeight = createMotion(initialHeight, () => height, parseMotionProp(motion, 'height'));

  const renderCtx = getRenderContext();

  function render(
    ctx: CanvasRenderingContext2D,
    styleOverrides: ComputedStylesOptions | undefined
  ) {
    renderRect(
      ctx,
      {
        x: motionX.current,
        y: motionY.current,
        width: motionWidth.current,
        height: motionHeight.current,
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

  if (renderCtx === 'canvas') {
    registerCanvasComponent({
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
      deps: () => [
        motionX.current,
        motionY.current,
        motionWidth.current,
        motionHeight.current,
        fillKey.current,
        strokeKey.current,
        strokeWidth,
        opacity,
        className,
      ],
    });
  }
</script>

{#if renderCtx === 'svg'}
  <rect
    x={motionX.current}
    y={motionY.current}
    width={motionWidth.current}
    height={motionHeight.current}
    {fill}
    fill-opacity={fillOpacity}
    {stroke}
    stroke-width={strokeWidth}
    {opacity}
    class={cls(layerClass('rect'), fill == null && 'fill-surface-content', className)}
    {...restProps}
    {onclick}
    {ondblclick}
    {onpointerenter}
    {onpointermove}
    {onpointerleave}
    {onpointerover}
    {onpointerout}
    bind:this={ref}
  />
{:else if renderCtx === 'html'}
  <div
    style:position="absolute"
    style:left="{motionX.current}px"
    style:top="{motionY.current}px"
    style:width="{motionWidth.current}px"
    style:height="{motionHeight.current}px"
    style:background-color={fill}
    style:background-opacity={opacity}
    style:border-width="{strokeWidth}px"
    style:border-style="solid"
    style:border-color={stroke}
    style:border-radius="{restProps.rx}px"
    class={cls(layerClass('rect'), fill == null && 'fill-surface-content', className)}
    {...restProps}
    {onclick}
    {ondblclick}
    {onpointerenter}
    {onpointermove}
    {onpointerleave}
    {onpointerover}
    {onpointerout}
  />
{/if}
