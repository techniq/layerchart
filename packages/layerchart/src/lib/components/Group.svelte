<script lang="ts">
  import { tick, type Snippet } from 'svelte';
  import { cls } from '@layerstack/tailwind';
  import { watch } from 'runed';

  import { getRenderContext } from './Chart.svelte';
  import { chartContext } from './ChartContext.svelte';
  import { motionState, type SpringOptions, type TweenedOptions } from '$lib/stores/motionStore.js';
  import { getCanvasContext } from './layout/Canvas.svelte';
  import { fromStore } from 'svelte/store';

  const { width: widthStore, height: heightStore } = chartContext();

  const width = fromStore(widthStore);
  const height = fromStore(heightStore);

  let {
    x,
    initialX = x,
    y,
    initialY = y,
    center = false,
    preventTouchMove = false,
    spring,
    tweened,
    class: className,
    children,
    ref = $bindable(null),
    ...restProps
  }: {
    /**
     * Translate x
     */
    x?: number;
    initialX?: number;
    /**
     * Translate y
     */
    y?: number;
    initialY?: number;
    /**
     * Center within chart
     */
    center?: boolean | 'x' | 'y';
    /**
     * Prevent `touchmove` default, which can interfere with `pointermove` when used with `Tooltip`, for example
     */
    preventTouchMove?: boolean;
    spring?: boolean | SpringOptions;
    tweened?: boolean | TweenedOptions;
    onclick?: (e: MouseEvent) => void;
    ondblclick?: (e: MouseEvent) => void;
    onpointerenter?: (e: PointerEvent) => void;
    onpointermove?: (e: PointerEvent) => void;
    onpointerleave?: (e: PointerEvent) => void;
    onpointerdown?: (e: PointerEvent) => void;
    ontouchmove?: (e: TouchEvent) => void;
    children?: Snippet;
    ref?: Element | null;
    // this feels dirty, perhaps we could discriminate union it but we'd need to force a prop
    [key: string]: any;
  } = $props();

  const tweenedX = motionState(initialX, { spring, tweened });
  const tweenedY = motionState(initialY, { spring, tweened });

  watch([() => x, () => y, () => center, () => width.current, () => height.current], () => {
    tick().then(() => {
      tweenedX.set(x ?? (center === 'x' || center === true ? width.current / 2 : 0));
      tweenedY.set(y ?? (center === 'y' || center === true ? height.current / 2 : 0));
    });
  });

  const transform = $derived.by(() => {
    if (center || x != null || y != null) {
      return `translate(${tweenedX.current}px, ${tweenedY.current}px)`;
    }
    return undefined;
  });

  const renderContext = getRenderContext();
  const canvasContext = getCanvasContext();

  function render(ctx: CanvasRenderingContext2D) {
    ctx.translate(tweenedX.current ?? 0, tweenedY.current ?? 0);
  }

  watch([() => tweenedX.current, () => tweenedY.current], () => {
    if (renderContext === 'canvas') {
      canvasContext.invalidate();
    }
  });

  let canvasUnregister: ReturnType<typeof canvasContext.register>;

  if (renderContext === 'canvas') {
    canvasUnregister = canvasContext.register({
      name: 'Group',
      render,
      retainState: true,
      events: {
        click: restProps.onclick,
        dblclick: restProps.ondblclick,
        pointerenter: restProps.onpointerenter,
        pointermove: restProps.onpointermove,
        pointerleave: restProps.onpointerleave,
        pointerdown: restProps.onpointerdown,
      },
    });
  }

  $effect(() => {
    const ctx = renderContext;
    return () => {
      if (ctx === 'canvas') {
        canvasUnregister();
      }
    };
  });

  function handleTouchMove(e: TouchEvent) {
    if (preventTouchMove) {
      // Prevent touch to not interfere with pointer
      e.preventDefault();
    }
    restProps.ontouchmove?.(e);
  }
</script>

{#if renderContext === 'canvas'}
  {@render children?.()}
{:else if renderContext === 'svg'}
  <g style:transform {...restProps} ontouchmove={handleTouchMove} bind:this={ref}>
    {@render children?.()}
  </g>
{:else}
  <div
    bind:this={ref}
    style:transform
    {...restProps}
    class={cls('absolute', className)}
    ontouchmove={handleTouchMove}
  >
    {@render children?.()}
  </div>
{/if}
