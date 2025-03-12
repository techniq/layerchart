<script lang="ts">
  import { onDestroy, tick } from 'svelte';
  import type { spring as springStore, tweened as tweenedStore } from 'svelte/motion';
  import { cls } from '@layerstack/tailwind';
  import { objectId } from '@layerstack/utils/object';
  import { merge } from 'lodash-es';

  import { getRenderContext } from './Chart.svelte';
  import { motionStore } from '$lib/stores/motionStore.js';
  import { getCanvasContext } from './layout/Canvas.svelte';
  import { renderCircle, type ComputedStylesOptions } from '$lib/utils/canvas.js';

  export let cx: number = 0;
  export let initialCx = cx;

  export let cy: number = 0;
  export let initialCy = cy;

  export let r: number = 1;
  export let initialR = r;

  export let spring: boolean | Parameters<typeof springStore>[1] = undefined;
  export let tweened: boolean | Parameters<typeof tweenedStore>[1] = undefined;

  export let fill: string | undefined = undefined;
  export let fillOpacity: number | undefined = undefined;
  export let stroke: string | undefined = undefined;
  export let strokeWidth: number | undefined = undefined;
  export let opacity: number | undefined = undefined;

  let className: string | undefined = undefined;
  export { className as class };

  export let onclick: ((e: MouseEvent) => void) | undefined = undefined;
  export let onpointerdown: ((e: PointerEvent) => void) | undefined = undefined;
  export let onpointerenter: ((e: PointerEvent) => void) | undefined = undefined;
  export let onpointermove: ((e: PointerEvent) => void) | undefined = undefined;
  export let onpointerleave: ((e: PointerEvent) => void) | undefined = undefined;

  let tweened_cx = motionStore(initialCx, { spring, tweened });
  let tweened_cy = motionStore(initialCy, { spring, tweened });
  let tweened_r = motionStore(initialR, { spring, tweened });

  $: tick().then(() => {
    tweened_cx.set(cx);
    tweened_cy.set(cy);
    tweened_r.set(r);
  });

  const renderContext = getRenderContext();
  const canvasContext = getCanvasContext();

  function render(
    ctx: CanvasRenderingContext2D,
    styleOverrides: ComputedStylesOptions | undefined
  ) {
    renderCircle(
      ctx,
      { cx: $tweened_cx, cy: $tweened_cy, r: $tweened_r },
      styleOverrides
        ? merge({ styles: { strokeWidth } }, styleOverrides)
        : {
            styles: { fill, fillOpacity, stroke, strokeWidth, opacity },
            classes: className,
          }
    );
  }

  // TODO: Use objectId to work around Svelte 4 reactivity issue (even when memoizing gradients)
  $: fillKey = fill && typeof fill === 'object' ? objectId(fill) : fill;
  $: strokeKey = stroke && typeof stroke === 'object' ? objectId(stroke) : stroke;

  $: if (renderContext === 'canvas') {
    // Redraw when props changes
    $tweened_cx &&
      $tweened_cy &&
      $tweened_r &&
      fillKey &&
      fillOpacity &&
      strokeKey &&
      strokeWidth &&
      opacity &&
      className;
    canvasContext.invalidate();
  }

  let canvasUnregister: ReturnType<typeof canvasContext.register>;
  $: if (renderContext === 'canvas') {
    canvasUnregister = canvasContext.register({
      name: 'Circle',
      render,
      events: {
        click: onclick,
        pointerdown: onpointerdown,
        pointerenter: onpointerenter,
        pointermove: onpointermove,
        pointerleave: onpointerleave,
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
  <!-- svelte-ignore a11y-no-static-element-interactions -->
  <circle
    cx={$tweened_cx}
    cy={$tweened_cy}
    r={$tweened_r}
    {fill}
    fill-opacity={fillOpacity}
    {stroke}
    stroke-width={strokeWidth}
    {opacity}
    class={cls(fill == null && 'fill-surface-content', className)}
    {...$$restProps}
    on:click={onclick}
    on:pointerdown={onpointerdown}
    on:pointerenter={onpointerenter}
    on:pointermove={onpointermove}
    on:pointerleave={onpointerleave}
  />
{/if}
