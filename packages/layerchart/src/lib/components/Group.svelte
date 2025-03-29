<script lang="ts" module>
  import type { Snippet } from 'svelte';
  import type { HTMLAttributes, TouchEventHandler } from 'svelte/elements';
  import type { Without } from '$lib/utils/types.js';
  import { createMotion, type MotionProp } from '$lib/utils/motion.svelte.js';

  export type GroupPropsWithoutHTML = {
    /**
     * Translate x
     */
    x?: number;

    /**
     * Initial translate x
     *
     * @default x
     */
    initialX?: number;

    /**
     * Translate y
     */
    y?: number;

    /**
     * Initial translate y
     *
     * @default y
     */
    initialY?: number;

    /**
     * Center within chart
     *
     * @default false
     */
    center?: boolean | 'x' | 'y';

    /**
     * Prevent `touchmove` default, which can interfere with `pointermove` when
     * used with `Tooltip`, for example.
     *
     * @default false
     */
    preventTouchMove?: boolean;

    children?: Snippet;

    /**
     * A reference to the rendered DOM element, which could be
     * either nothing, a `<g>` element (when using `<Svg>`), or a `<div>` element
     * (when using `<Html>`).
     *
     * @bindable
     */
    ref?: Element;

    motion?: MotionProp;
  };

  export type GroupProps = GroupPropsWithoutHTML &
    Without<HTMLAttributes<Element>, GroupPropsWithoutHTML>;
</script>

<script lang="ts">
  import { cls } from '@layerstack/tailwind';

  import { getRenderContext } from './Chart.svelte';
  import { registerCanvasComponent } from './layout/Canvas.svelte';

  import { getChartContext } from './Chart.svelte';
  import { layerClass } from '$lib/utils/attributes.js';

  const ctx = getChartContext();

  let {
    x,
    initialX: initialXProp,
    y,
    initialY: initialYProp,
    center = false,
    preventTouchMove = false,
    motion,
    class: className,
    children,
    ref = $bindable(),
    ...restProps
  }: GroupProps = $props();

  const initialX = initialXProp ?? x;
  const initialY = initialYProp ?? y;

  const trueX = $derived(x ?? (center === 'x' || center === true ? ctx.width / 2 : 0));
  const trueY = $derived(y ?? (center === 'y' || center === true ? ctx.height / 2 : 0));
  const motionX = createMotion(initialX, () => trueX, motion);
  const motionY = createMotion(initialY, () => trueY, motion);

  const transform = $derived.by(() => {
    if (center || x != null || y != null) {
      return `translate(${motionX.current}px, ${motionY.current}px)`;
    }
  });

  const renderCtx = getRenderContext();

  if (renderCtx === 'canvas') {
    registerCanvasComponent({
      name: 'Group',
      render: (ctx) => {
        ctx.translate(motionX.current ?? 0, motionY.current ?? 0);
      },
      retainState: true,
      events: {
        click: restProps.onclick,
        dblclick: restProps.ondblclick,
        pointerenter: restProps.onpointerenter,
        pointermove: restProps.onpointermove,
        pointerleave: restProps.onpointerleave,
        pointerdown: restProps.onpointerdown,
      },
      deps: () => [motionX.current, motionY.current],
    });
  }

  const handleTouchMove: TouchEventHandler<Element> = (e) => {
    if (preventTouchMove) {
      // Prevent touch to not interfere with pointer
      e.preventDefault();
    }
    restProps.ontouchmove?.(e);
  };
</script>

{#if renderCtx === 'canvas'}
  {@render children?.()}
{:else if renderCtx === 'svg'}
  <g
    style:transform
    class={cls(layerClass('group-g'), className)}
    {...restProps}
    ontouchmove={handleTouchMove}
    bind:this={ref}
  >
    {@render children?.()}
  </g>
{:else}
  <div
    bind:this={ref}
    style:transform
    {...restProps}
    class={cls(layerClass('group-div'), 'absolute', className)}
    ontouchmove={handleTouchMove}
  >
    {@render children?.()}
  </div>
{/if}
