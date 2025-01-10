<script lang="ts">
  import { onDestroy, tick } from 'svelte';
  import { cls } from '@layerstack/tailwind';

  import {
    motionStore,
    resolveOptions,
    type SpringOptions,
    type TweenedOptions,
  } from '$lib/stores/motionStore.js';
  import { getCanvasContext } from './layout/Canvas.svelte';
  import { renderRect } from 'layerchart/utils/canvas.js';

  export let x = 0;
  export let initialX = x;

  export let y = 0;
  export let initialY = y;

  export let width: number;
  export let initialWidth = width;

  export let height: number;
  export let initialHeight = height;

  export let fill: string | undefined = undefined;
  export let stroke: string | undefined = undefined;
  export let strokeWidth: number | undefined = undefined;

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

  const canvasContext = getCanvasContext();
  const renderContext = canvasContext ? 'canvas' : 'svg';

  function render(ctx: CanvasRenderingContext2D) {
    renderRect(
      ctx,
      { x: $tweened_x, y: $tweened_y, width: $tweened_width, height: $tweened_height },
      {
        styles: { fill, stroke, strokeWidth },
        classes: $$props.class,
      }
    );
  }

  let canvasUnregister: ReturnType<typeof canvasContext.register>;
  $: if (renderContext === 'canvas') {
    canvasUnregister = canvasContext.register({ name: 'Rect', render });
  }

  $: if (renderContext === 'canvas') {
    // Redraw when props changes (TODO: styles, class, etc)
    $tweened_x && $tweened_y && $tweened_width && $tweened_height;
    canvasContext.invalidate();
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
    class={cls($$props.fill == null && 'fill-surface-content')}
    {fill}
    {stroke}
    stroke-width={strokeWidth}
    {...$$restProps}
    on:click
    on:pointerenter
    on:pointerover
    on:pointermove
    on:pointerout
    on:pointerleave
    on:dblclick
  />
{/if}
