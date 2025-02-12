<script lang="ts">
  import { onDestroy, tick } from 'svelte';
  import type { spring as springStore, tweened as tweenedStore } from 'svelte/motion';

  import { getRenderContext } from './Chart.svelte';
  import { chartContext } from './ChartContext.svelte';
  import { motionStore } from '$lib/stores/motionStore.js';
  import { getCanvasContext } from './layout/Canvas.svelte';

  const { width, height } = chartContext();

  /**
   * Translate x
   */
  export let x: number | undefined = undefined;
  export let initialX = x;

  /**
   * Translate x
   */
  export let y: number | undefined = undefined;
  export let initialY = y;

  /**
   * Center within chart
   */
  export let center: boolean | 'x' | 'y' = false;

  /**
   * Prevent `touchmove` default, which can interfer with `pointermove` when used with `Tooltip`, for example
   */
  export let preventTouchMove = false;

  export let onclick: ((e: MouseEvent) => void) | undefined = undefined;
  export let ondblclick: ((e: MouseEvent) => void) | undefined = undefined;
  export let onpointerenter: ((e: PointerEvent) => void) | undefined = undefined;
  export let onpointermove: ((e: PointerEvent) => void) | undefined = undefined;
  export let onpointerleave: ((e: PointerEvent) => void) | undefined = undefined;
  export let onpointerdown: ((e: PointerEvent) => void) | undefined = undefined;

  export let spring: boolean | Parameters<typeof springStore>[1] = undefined;
  export let tweened: boolean | Parameters<typeof tweenedStore>[1] = undefined;

  let tweened_x = motionStore(initialX, { spring, tweened });
  let tweened_y = motionStore(initialY, { spring, tweened });

  $: tick().then(() => {
    tweened_x.set(x ?? (center === 'x' || center === true ? $width / 2 : 0));
    tweened_y.set(y ?? (center === 'y' || center === true ? $height / 2 : 0));
  });

  let transform: string | undefined = undefined;
  $: if (center || x != null || y != null) {
    transform = `translate(${$tweened_x ?? 0}px, ${$tweened_y ?? 0}px)`;
  }

  const renderContext = getRenderContext();
  const canvasContext = getCanvasContext();

  function render(ctx: CanvasRenderingContext2D) {
    ctx.translate($tweened_x ?? 0, $tweened_y ?? 0);
  }

  $: if (renderContext === 'canvas') {
    $tweened_x && $tweened_y;
    canvasContext.invalidate();
  }

  let canvasUnregister: ReturnType<typeof canvasContext.register>;
  $: if (renderContext === 'canvas') {
    canvasUnregister = canvasContext.register({
      name: 'Group',
      render,
      retainState: true,
      events: {
        click: onclick,
        dblclick: ondblclick,
        pointerenter: onpointerenter,
        pointermove: onpointermove,
        pointerleave: onpointerleave,
        pointerdown: onpointerdown,
      },
    });
  }

  onDestroy(() => {
    if (renderContext === 'canvas') {
      canvasUnregister();
    }
  });
</script>

{#if renderContext === 'canvas'}
  <slot />
{:else if renderContext === 'svg'}
  <!-- TODO: Find out why `<svelte:element this={renderContext === 'html' ? 'div' : 'g'}>` doesn't work for the SVG use case -->
  <g
    style:transform
    {...$$restProps}
    on:click={onclick}
    on:dblclick={ondblclick}
    on:pointerenter={onpointerenter}
    on:pointermove={onpointermove}
    on:pointerleave={onpointerleave}
    on:pointerdown={onpointerdown}
    on:touchmove={(e) => {
      if (preventTouchMove) {
        // Prevent touch to not interfer with pointer
        e.preventDefault();
      }
    }}
  >
    <slot />
  </g>
{:else}
  <div
    style:transform
    {...$$restProps}
    on:click={onclick}
    on:dblclick={ondblclick}
    on:pointerenter={onpointerenter}
    on:pointermove={onpointermove}
    on:pointerleave={onpointerleave}
    on:pointerdown={onpointerdown}
    on:touchmove={(e) => {
      if (preventTouchMove) {
        // Prevent touch to not interfer with pointer
        e.preventDefault();
      }
    }}
  >
    <slot />
  </div>
{/if}
