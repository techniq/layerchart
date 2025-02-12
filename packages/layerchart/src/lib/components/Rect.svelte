<script lang="ts">
  import { onDestroy, tick } from 'svelte';
  import type { ClassValue } from 'svelte/elements';
  import { cls } from '@layerstack/tailwind';
  import { objectId } from '@layerstack/utils/object';
  import { merge } from 'lodash-es';

  import {
    motionStore,
    resolveOptions,
    type SpringOptions,
    type TweenedOptions,
  } from '$lib/stores/motionStore.js';
  import { getRenderContext } from './Chart.svelte';
  import { getCanvasContext } from './layout/Canvas.svelte';
  import { renderRect, type ComputedStylesOptions } from '$lib/utils/canvas.js';

  /** Undlying `<rect>` tag when using <Svg>. Useful for bindings. */
  export let element: SVGRectElement | undefined = undefined;

  export let x = 0;
  export let initialX = x;

  export let y = 0;
  export let initialY = y;

  export let width: number;
  export let initialWidth = width;

  export let height: number;
  export let initialHeight = height;

  export let fill: string | undefined = undefined;
  export let fillOpacity: number | undefined = undefined;
  export let stroke: string | undefined = undefined;
  export let strokeWidth: number | undefined = undefined;

  let className: ClassValue | undefined = undefined;
  export { className as class };

  export let onclick: ((e: MouseEvent) => void) | undefined = undefined;
  export let ondblclick: ((e: MouseEvent) => void) | undefined = undefined;
  export let onpointerenter: ((e: PointerEvent) => void) | undefined = undefined;
  export let onpointermove: ((e: PointerEvent) => void) | undefined = undefined;
  export let onpointerleave: ((e: PointerEvent) => void) | undefined = undefined;
  export let onpointerover: ((e: PointerEvent) => void) | undefined = undefined;
  export let onpointerout: ((e: PointerEvent) => void) | undefined = undefined;

  export let spring: boolean | SpringOptions | { [prop: string]: SpringOptions } = undefined;
  export let tweened: boolean | TweenedOptions | { [prop: string]: TweenedOptions } = undefined;

  let tweened_x = motionStore(initialX, resolveOptions('x', { spring, tweened }));
  let tweened_y = motionStore(initialY, resolveOptions('y', { spring, tweened }));
  let tweened_width = motionStore(initialWidth, resolveOptions('width', { spring, tweened }));
  let tweened_height = motionStore(initialHeight, resolveOptions('height', { spring, tweened }));

  $: tick().then(() => {
    tweened_x.set(x);
    tweened_y.set(y);
    tweened_width.set(width);
    tweened_height.set(height);
  });

  const renderContext = getRenderContext();
  const canvasContext = getCanvasContext();

  function render(
    ctx: CanvasRenderingContext2D,
    styleOverrides: ComputedStylesOptions | undefined
  ) {
    renderRect(
      ctx,
      { x: $tweened_x, y: $tweened_y, width: $tweened_width, height: $tweened_height },
      styleOverrides
        ? merge({ styles: { strokeWidth } }, styleOverrides)
        : {
            styles: { fill, fillOpacity, stroke, strokeWidth },
            classes: className,
          }
    );
  }

  // TODO: Use objectId to work around Svelte 4 reactivity issue (even when memoizing gradients)
  $: fillKey = fill && typeof fill === 'object' ? objectId(fill) : fill;
  $: strokeKey = stroke && typeof stroke === 'object' ? objectId(stroke) : stroke;

  $: if (renderContext === 'canvas') {
    // Redraw when props change
    $tweened_x &&
      $tweened_y &&
      $tweened_width &&
      $tweened_height &&
      fillKey &&
      strokeKey &&
      strokeWidth &&
      className;
    canvasContext.invalidate();
  }

  let canvasUnregister: ReturnType<typeof canvasContext.register>;
  $: if (renderContext === 'canvas') {
    canvasUnregister = canvasContext.register({
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
  }

  onDestroy(() => {
    if (renderContext === 'canvas') {
      canvasUnregister();
    }
  });
</script>

{#if renderContext === 'svg'}
  <!-- svelte-ignore a11y-mouse-events-have-key-events -->
  <!-- svelte-ignore a11y-no-static-element-interactions -->
  <rect
    x={$tweened_x}
    y={$tweened_y}
    width={$tweened_width}
    height={$tweened_height}
    {fill}
    fill-opacity={fillOpacity}
    {stroke}
    stroke-width={strokeWidth}
    class={cls(fill == null && 'fill-surface-content', className)}
    {...$$restProps}
    on:click={onclick}
    on:dblclick={ondblclick}
    on:pointerenter={onpointerenter}
    on:pointerover={onpointerover}
    on:pointermove={onpointermove}
    on:pointerout={onpointerout}
    on:pointerleave={onpointerleave}
    bind:this={element}
  />
{/if}
