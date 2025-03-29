<script lang="ts" module>
  import type { CommonStyleProps, Without } from '$lib/utils/types.js';

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

    motion?: MotionProp;
  } & CommonStyleProps;

  export type CircleProps = CirclePropsWithoutHTML &
    Without<SVGAttributes<Element>, CirclePropsWithoutHTML>;
</script>

<script lang="ts">
  import { cls } from '@layerstack/tailwind';
  import { merge } from 'lodash-es';

  import { getRenderContext } from './Chart.svelte';
  import { createMotion, type MotionProp } from '$lib/utils/motion.svelte.js';
  import { registerCanvasComponent } from './layout/Canvas.svelte';
  import { renderCircle, type ComputedStylesOptions } from 'layerchart/utils/canvas.js';
  import type { SVGAttributes } from 'svelte/elements';
  import { createKey } from '$lib/utils/key.svelte.js';
  import { layerClass } from '$lib/utils/attributes.js';

  let {
    cx = 0,
    initialCx: initialCxProp,
    cy = 0,
    initialCy: initialCyProp,
    r = 1,
    initialR: initialRProp,
    motion,
    fill,
    fillOpacity,
    stroke,
    strokeWidth,
    opacity,
    class: className,
    ref = $bindable(),
    ...restProps
  }: CircleProps = $props();

  const initialCx = initialCxProp ?? cx;
  const initialCy = initialCyProp ?? cy;
  const initialR = initialRProp ?? r;

  const renderCtx = getRenderContext();

  const motionCx = createMotion(initialCx, () => cx, motion);
  const motionCy = createMotion(initialCy, () => cy, motion);
  const motionR = createMotion(initialR, () => r, motion);

  function render(
    ctx: CanvasRenderingContext2D,
    styleOverrides: ComputedStylesOptions | undefined
  ) {
    renderCircle(
      ctx,
      { cx: motionCx.current, cy: motionCy.current, r: motionR.current },
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
        motionCx.current,
        motionCy.current,
        motionR.current,
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

{#if renderCtx === 'svg'}
  <circle
    bind:this={ref}
    cx={motionCx.current}
    cy={motionCy.current}
    r={motionR.current}
    {fill}
    fill-opacity={fillOpacity}
    {stroke}
    stroke-width={strokeWidth}
    {opacity}
    class={cls(layerClass('circle'), fill == null && 'fill-surface-content', className)}
    {...restProps}
  />
{/if}
