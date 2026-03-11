<script lang="ts" module>
  import type { Snippet } from 'svelte';
  import type { HTMLAttributes, TouchEventHandler } from 'svelte/elements';
  import type { Transition, TransitionParams, Without } from '$lib/utils/types.js';
  import type { DataProp } from '$lib/utils/dataProp.js';
  import { createMotion, extractTweenConfig, type MotionProp } from '$lib/utils/motion.svelte.js';

  export type GroupPropsWithoutHTML<In extends Transition = Transition> = {
    /**
     * Translate x position of the group.
     * - `number`: pixel value (direct)
     * - `string`: data property name, resolved via xScale
     * - `function(d)`: accessor called per data item, result passed through xScale
     */
    x?: DataProp;

    /**
     * Initial translate x (pixel mode only).
     *
     * @default x
     */
    initialX?: number;

    /**
     * Translate y position of the group.
     * - `number`: pixel value (direct)
     * - `string`: data property name, resolved via yScale
     * - `function(d)`: accessor called per data item, result passed through yScale
     */
    y?: DataProp;

    /**
     * Initial translate y (pixel mode only).
     *
     * @default y
     */
    initialY?: number;

    /**
     * Data array to iterate over in data mode.
     * Falls back to chart context data when not provided.
     */
    data?: any[];

    /**
     * Key function for keyed {#each} rendering in data mode.
     *
     * @default (d, i) => i
     */
    key?: (d: any, index: number) => any;

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
  import { hasAnyDataProp, resolveDataProp } from '$lib/utils/dataProp.js';
  import { chartDataArray } from '$lib/utils/common.js';

  const chartCtx = getChartContext();

  let {
    x,
    initialX: initialXProp,
    y,
    initialY: initialYProp,
    data: dataProp,
    key: keyFn = (_: any, i: number) => i,
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

  // Data mode detection: if any positional prop is a string or function
  const dataMode = $derived(hasAnyDataProp(x, y));

  // Data to iterate over in data mode
  const resolvedData: any[] = $derived(
    dataMode ? (dataProp ?? chartDataArray(chartCtx.data)) : []
  );

  // Resolve a single data item to pixel coordinates
  function resolveGroup(d: any) {
    return {
      x: resolveDataProp(x, d, chartCtx.xScale, 0),
      y: resolveDataProp(y, d, chartCtx.yScale, 0),
    };
  }

  // --- Pixel mode (motion only applies here) ---
  let ref = $state<Element>();

  $effect.pre(() => {
    refProp = ref;
  });

  const initialX = initialXProp ?? (typeof x === 'number' ? x : undefined);
  const initialY = initialYProp ?? (typeof y === 'number' ? y : undefined);

  const trueX = $derived(
    typeof x === 'number' ? x : (x == null && (center === 'x' || center === true) ? chartCtx.width / 2 : 0)
  );
  const trueY = $derived(
    typeof y === 'number' ? y : (y == null && (center === 'y' || center === true) ? chartCtx.height / 2 : 0)
  );
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
  {#if dataMode}
    {#each resolvedData as d, i (keyFn(d, i))}
      {@const resolved = resolveGroup(d)}
      <g
        style:transform="translate({resolved.x}px, {resolved.y}px)"
        class={['lc-group-g', className]}
        {opacity}
        {...restProps}
        ontouchmove={handleTouchMove}
      >
        {@render children?.()}
      </g>
    {/each}
  {:else}
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
  {/if}
{:else if layerCtx === 'html'}
  {#if dataMode}
    {#each resolvedData as d, i (keyFn(d, i))}
      {@const resolved = resolveGroup(d)}
      <div
        style:transform="translate({resolved.x}px, {resolved.y}px)"
        style:opacity
        {...restProps}
        class={['lc-group-div', className]}
        ontouchmove={handleTouchMove}
      >
        {@render children?.()}
      </div>
    {/each}
  {:else}
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
{/if}

<style>
  @layer base {
    :where(.lc-group-div) {
      position: absolute;
    }
  }
</style>
