<script lang="ts" module>
  import type { CommonEvents, CommonStyleProps, Without } from '$lib/utils/types.js';
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
    Without<SVGAttributes<SVGRectElement>, RectPropsWithoutHTML> &
    CommonEvents;
</script>

<script lang="ts">
  import { cls } from '@layerstack/tailwind';
  import { merge } from 'lodash-es';

  import { getLayerContext } from '$lib/contexts/layer.js';
  import { registerCanvasComponent } from './layout/Canvas.svelte';
  import { createKey } from '$lib/utils/key.svelte.js';

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

  const layerCtx = getLayerContext();

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
            classes: cls('lc-rect', className),
          }
    );
  }

  // TODO: Use objectId to work around Svelte 4 reactivity issue (even when memoizing gradients)
  const fillKey = createKey(() => fill);
  const strokeKey = createKey(() => stroke);

  if (layerCtx === 'canvas') {
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

{#if layerCtx === 'svg'}
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
    class={cls('lc-rect', className)}
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
{:else if layerCtx === 'html'}
  <!-- svelte-ignore a11y_click_events_have_key_events -->
  <!-- svelte-ignore a11y_no_static_element_interactions -->
  <div
    style:position="absolute"
    style:left="{motionX.current}px"
    style:top="{motionY.current}px"
    style:width="{motionWidth.current}px"
    style:height="{motionHeight.current}px"
    style:background={fill}
    style:background-opacity={opacity}
    style:border-width="{strokeWidth}px"
    style:border-style="solid"
    style:border-color={stroke}
    style:border-radius="{restProps.rx}px"
    class={cls('lc-rect', className)}
    {...restProps as any}
    {onclick}
    {ondblclick}
    {onpointerenter}
    {onpointermove}
    {onpointerleave}
    {onpointerover}
    {onpointerout}
  ></div>
{/if}

<style>
  @layer base {
    :global(:where(.lc-rect)) {
      --fill-color: var(--color-surface-content, currentColor);
      --stroke-color: initial;
    }

    /* Svg | Canvas layers */
    :global(:where(.lc-layout-svg .lc-rect, svg.lc-rect):not([fill])) {
      fill: var(--fill-color);
    }
    :global(:where(.lc-layout-svg .lc-rect, svg.lc-rect):not([stroke])) {
      stroke: var(--stroke-color);
    }

    /* Html layers */
    :global(:where(.lc-layout-html .lc-rect):not([background])) {
      background: var(--fill-color);
    }
    :global(:where(.lc-layout-html .lc-rect):not([border-color])) {
      border-color: var(--stroke-color);
    }
  }
</style>
