<script lang="ts" module>
  import type { CommonStyleProps, Without } from '$lib/utils/types.js';

  export type EllipsePropsWithoutHTML = {
    /**
     * The center x position of the ellipse.
     *
     * @default 0
     */
    cx?: number;

    /**
     * The initial center x position of the ellipse.
     *
     * @default cx
     */
    initialCx?: number;

    /**
     * The center y position of the ellipse.
     *
     * @default 0
     */
    cy?: number;

    /**
     * The initial center y position of the ellipse.
     *
     * @default cy
     */
    initialCy?: number;

    /**
     * The radius of the ellipse on the x-axis.
     *
     * @default 1
     */
    rx?: number;

    /**
     * The initial radius of the ellipse on the x-axis.
     *
     * @default rx
     */
    initialRx?: number;

    /**
     * The radius of the ellipse on the y-axis.
     *
     * @default 1
     */
    ry?: number;

    /**
     * The initial radius of the ellipse on the y-axis.
     *
     * @default ry
     */
    initialRy?: number;

    /**
     * A bindable reference to the `<ellipse>` element
     *
     * @bindable
     */
    ref?: SVGEllipseElement;

    motion?: MotionProp;
  } & CommonStyleProps;

  export type EllipseProps = EllipsePropsWithoutHTML &
    Without<SVGAttributes<Element>, EllipsePropsWithoutHTML>;
</script>

<script lang="ts">
  import { cls } from '@layerstack/tailwind';
  import { merge } from 'lodash-es';

  import { getRenderContext } from './Chart.svelte';
  import { createMotion, type MotionProp } from '$lib/utils/motion.svelte.js';
  import { registerCanvasComponent } from './layout/Canvas.svelte';
  import { renderEllipse, type ComputedStylesOptions } from '$lib/utils/canvas.js';
  import type { SVGAttributes } from 'svelte/elements';
  import { createKey } from '$lib/utils/key.svelte.js';
  import { layerClass } from '$lib/utils/attributes.js';

  let {
    cx = 0,
    initialCx: initialCxProp,
    cy = 0,
    initialCy: initialCyProp,
    rx = 1,
    initialRx: initialRxProp,
    ry = 1,
    initialRy: initialRyProp,
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

  let ref = $state<SVGEllipseElement>();

  $effect.pre(() => {
    refProp = ref;
  });

  const initialCx = initialCxProp ?? cx;
  const initialCy = initialCyProp ?? cy;
  const initialRx = initialRxProp ?? rx;
  const initialRy = initialRyProp ?? ry;

  const renderCtx = getRenderContext();

  const motionCx = createMotion(initialCx, () => cx, motion);
  const motionCy = createMotion(initialCy, () => cy, motion);
  const motionRx = createMotion(initialRx, () => rx, motion);
  const motionRy = createMotion(initialRy, () => ry, motion);

  function render(
    ctx: CanvasRenderingContext2D,
    styleOverrides: ComputedStylesOptions | undefined
  ) {
    renderEllipse(
      ctx,
      { cx: motionCx.current, cy: motionCy.current, rx: motionRx.current, ry: motionRy.current },
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

{#if renderCtx === 'svg'}
  <ellipse
    bind:this={ref}
    cx={motionCx.current}
    cy={motionCy.current}
    rx={motionRx.current}
    ry={motionRy.current}
    {fill}
    fill-opacity={fillOpacity}
    {stroke}
    stroke-width={strokeWidth}
    {opacity}
    class={cls(layerClass('ellipse'), fill == null && 'fill-surface-content', className)}
    {...restProps}
  />
{:else if renderCtx === 'html'}
  <div
    style:position="absolute"
    style:left="{motionCx.current}px"
    style:top="{motionCy.current}px"
    style:width="{motionRx.current * 2}px"
    style:height="{motionRy.current * 2}px"
    style:border-radius="50%"
    style:background-color={fill}
    style:opacity
    style:border-width={strokeWidth}
    style:border-color={stroke}
    style:border-style="solid"
    style:transform="translate(-50%, -50%)"
    class={cls(layerClass('ellipse'), fill == null && 'bg-surface-content', className)}
    {...restProps}
  ></div>
{/if}
