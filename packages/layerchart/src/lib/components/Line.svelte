<script lang="ts">
  import { onDestroy, tick, type ComponentProps } from 'svelte';
  import type { spring as springStore, tweened as tweenedStore } from 'svelte/motion';
  import { cls } from '@layerstack/tailwind';
  import { uniqueId } from '@layerstack/utils';
  import { objectId } from '@layerstack/utils/object';

  import { motionStore } from '$lib/stores/motionStore.js';

  import Marker from './Marker.svelte';
  import { renderPathData } from '../utils/canvas.js';
  import { getCanvasContext } from './layout/Canvas.svelte';

  export let x1: number;
  export let initialX1 = x1;

  export let y1: number;
  export let initialY1 = y1;

  export let x2: number;
  export let initialX2 = x2;

  export let y2: number;
  export let initialY2 = y2;

  export let fill: string | undefined = undefined;
  export let stroke: string | undefined = undefined;
  export let strokeWidth: number | undefined = undefined;

  let className: string | undefined = undefined;
  export { className as class };

  /** Marker to attach to start and end points of path */
  export let marker: ComponentProps<Marker>['type'] | ComponentProps<Marker> | undefined =
    undefined;
  /** Marker to attach to start point of path */
  export let markerStart: ComponentProps<Marker>['type'] | ComponentProps<Marker> | undefined =
    marker;
  /** Marker to attach to end point of path */
  export let markerEnd: ComponentProps<Marker>['type'] | ComponentProps<Marker> | undefined =
    marker;

  $: markerStartId = markerStart || $$slots['markerStart'] ? uniqueId('marker-') : '';
  $: markerEndId = markerEnd || $$slots['markerEnd'] ? uniqueId('marker-') : '';

  export let spring: boolean | Parameters<typeof springStore>[1] = undefined;
  export let tweened: boolean | Parameters<typeof tweenedStore>[1] = undefined;

  let tweened_x1 = motionStore(initialX1, { spring, tweened });
  let tweened_y1 = motionStore(initialY1, { spring, tweened });
  let tweened_x2 = motionStore(initialX2, { spring, tweened });
  let tweened_y2 = motionStore(initialY2, { spring, tweened });

  $: tick().then(() => {
    tweened_x1.set(x1);
    tweened_y1.set(y1);
    tweened_x2.set(x2);
    tweened_y2.set(y2);
  });

  const canvasContext = getCanvasContext();
  const renderContext = canvasContext ? 'canvas' : 'svg';

  function render(ctx: CanvasRenderingContext2D) {
    const pathData = `M ${$tweened_x1},${$tweened_y1} L ${$tweened_x2},${$tweened_y2}`;
    renderPathData(ctx, pathData, {
      styles: { fill, stroke, strokeWidth },
      classes: className,
    });
  }

  // TODO: Use objectId to work around Svelte 4 reactivity issue (even when memoizing gradients)
  $: fillKey = typeof fill === 'object' ? objectId(fill) : fill;
  $: strokeKey = typeof stroke === 'object' ? objectId(stroke) : stroke;

  $: if (renderContext === 'canvas') {
    // Redraw when props change
    $tweened_x1 &&
      $tweened_y1 &&
      $tweened_x2 &&
      $tweened_y2 &&
      fillKey &&
      strokeKey &&
      strokeWidth &&
      className;
    canvasContext.invalidate();
  }

  let canvasUnregister: ReturnType<typeof canvasContext.register>;
  $: if (renderContext === 'canvas') {
    canvasUnregister = canvasContext.register({ name: 'Line', render });
  }

  onDestroy(() => {
    if (renderContext === 'canvas') {
      canvasUnregister();
    }
  });
</script>

{#if renderContext === 'svg'}
  <!-- svelte-ignore a11y-no-static-element-interactions -->
  <line
    x1={$tweened_x1}
    y1={$tweened_y1}
    x2={$tweened_x2}
    y2={$tweened_y2}
    {fill}
    {stroke}
    stroke-width={strokeWidth}
    marker-start={markerStartId ? `url(#${markerStartId})` : undefined}
    marker-end={markerEndId ? `url(#${markerEndId})` : undefined}
    class={cls(stroke === undefined && 'stroke-surface-content', className)}
    {...$$restProps}
    on:click
    on:pointermove
    on:pointerleave
  />

  <slot name="markerStart" id={markerStartId}>
    {#if markerStart}
      <Marker
        id={markerStartId}
        type={typeof markerStart === 'string' ? markerStart : undefined}
        {...typeof markerStart === 'object' ? markerStart : null}
      />
    {/if}
  </slot>

  <slot name="markerEnd" id={markerEndId}>
    <Marker
      id={markerEndId}
      type={typeof markerEnd === 'string' ? markerEnd : undefined}
      {...typeof markerEnd === 'object' ? markerEnd : null}
    />
  </slot>
{/if}
