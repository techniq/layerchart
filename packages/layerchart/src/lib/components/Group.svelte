<script lang="ts" module>
  import type { Snippet } from 'svelte';
  import type { HTMLAttributes, TouchEventHandler } from 'svelte/elements';
  import type { Transition, TransitionParams, Without } from '$lib/utils/types.js';
  import { createMotion, extractTweenConfig, type MotionProp } from '$lib/utils/motion.svelte.js';

  export type GroupPropsWithoutHTML<In extends Transition = Transition> = {
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

    /**
     * The opacity of the element. (0 to 1)
     */
    opacity?: number;

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

    /**
     * Transition function for entering elements
     * @default defaults to fade if the motion prop is set to tweened
     */
    transitionIn?: In;

    /**
     * Parameters for the transitionIn function
     * @default { easing: cubicIn }
     */
    transitionInParams?: TransitionParams<In>;
  };

  export type GroupProps = GroupPropsWithoutHTML &
    Without<HTMLAttributes<Element>, GroupPropsWithoutHTML>;
</script>

<script lang="ts" generics="T extends Transition = Transition">
  import { fade } from 'svelte/transition';
  import { cubicIn } from 'svelte/easing';

  import { getLayerContext } from '$lib/contexts/layer.js';
  import { registerCanvasComponent } from './layers/Canvas.svelte';

  import { getChartContext } from '$lib/contexts/chart.js';

  const ctx = getChartContext();

  let {
    x,
    initialX: initialXProp,
    y,
    initialY: initialYProp,
    center = false,
    preventTouchMove = false,
    opacity = undefined,
    motion,
    transitionIn: transitionInProp,
    transitionInParams: transitionInParamsProp,
    class: className,
    children,
    ref: refProp = $bindable(),
    ...restProps
  }: GroupProps = $props();

  let ref = $state<Element>();

  $effect.pre(() => {
    refProp = ref;
  });

  const initialX = initialXProp ?? x;
  const initialY = initialYProp ?? y;

  const trueX = $derived(x ?? (center === 'x' || center === true ? ctx.width / 2 : 0));
  const trueY = $derived(y ?? (center === 'y' || center === true ? ctx.height / 2 : 0));
  const motionX = createMotion(initialX, () => trueX, motion);
  const motionY = createMotion(initialY, () => trueY, motion);

  const transitionIn = $derived(
    transitionInProp ? transitionInProp : extractTweenConfig(motion)?.options ? fade : () => {}
  ) as T;
  const transitionInParams = $derived(
    transitionInParamsProp ? transitionInParamsProp : { easing: cubicIn }
  );

  const transform = $derived.by(() => {
    if (center || x != null || y != null) {
      return `translate(${motionX.current}px, ${motionY.current}px)`;
    }
  });

  const layerCtx = getLayerContext();

  if (layerCtx === 'canvas') {
    registerCanvasComponent({
      name: 'Group',
      render: (ctx) => {
        const currentGlobalAlpha = ctx.globalAlpha;
        ctx.globalAlpha = opacity ?? 1;

        ctx.translate(motionX.current ?? 0, motionY.current ?? 0);

        // Restore in case it was modified by `opacity`
        ctx.globalAlpha = currentGlobalAlpha;
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
      deps: () => [motionX.current, motionY.current, opacity],
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

{#if layerCtx === 'canvas'}
  {@render children?.()}
{:else if layerCtx === 'svg'}
  <g
    style:transform
    class={['lc-group-g', className]}
    in:transitionIn={transitionInParams}
    {opacity}
    {...restProps}
    ontouchmove={handleTouchMove}
    bind:this={ref}
  >
    {@render children?.()}
  </g>
{:else if layerCtx === 'html'}
  <div
    bind:this={ref}
    style:transform
    style:opacity
    in:transitionIn={transitionInParams}
    {...restProps}
    class={['lc-group-div', className]}
    ontouchmove={handleTouchMove}
  >
    {@render children?.()}
  </div>
{/if}

<style>
  @layer base {
    :where(.lc-group-div) {
      position: absolute;
    }
  }
</style>
