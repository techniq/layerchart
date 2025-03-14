<script lang="ts">
  import { tick, type ComponentProps, type Snippet } from 'svelte';
  import { cls } from '@layerstack/tailwind';
  import { uniqueId } from '@layerstack/utils';
  import { objectId } from '@layerstack/utils/object';
  import { merge } from 'lodash-es';
  import { motionState, type SpringOptions, type TweenedOptions } from '$lib/stores/motionStore.js';
  import Marker from './Marker.svelte';
  import { renderPathData, type ComputedStylesOptions } from '$lib/utils/canvas.js';
  import { getCanvasContext } from './layout/Canvas.svelte';
  import { getRenderContext } from './Chart.svelte';
  import type { SVGAttributes } from 'svelte/elements';

  type MarkerOptions = ComponentProps<typeof Marker>['type'] | ComponentProps<typeof Marker>;

  let {
    x1,
    initialX1 = x1,
    y1,
    initialY1 = y1,
    x2,
    initialX2 = x2,
    y2,
    initialY2 = y2,
    class: className,
    strokeWidth,
    opacity,
    fill,
    stroke,
    markerOptions,
    markerStartOptions,
    markerEndOptions,
    markerEnd,
    markerStart,
    spring,
    tweened,
    ...restProps
  }: {
    x1: number;
    initialX1?: number;
    y1: number;
    initialY1?: number;
    x2: number;
    initialX2?: number;
    y2: number;
    initialY2?: number;
    fill?: string;
    stroke?: string;
    strokeWidth?: number;
    opacity?: number;
    class?: string;
    onclick?: (e: MouseEvent) => void;
    onpointerenter?: (e: PointerEvent) => void;
    onpointermove?: (e: PointerEvent) => void;
    onpointerleave?: (e: PointerEvent) => void;
    /** Marker to attach to start and end points of path */
    markerOptions?: MarkerOptions;
    /** Marker to attach to start point of path */
    markerStartOptions?: MarkerOptions;
    /** Marker to attach to end point of path */
    markerEndOptions?: MarkerOptions;
    markerStart?: Snippet<[{ id: string }]>;
    markerEnd?: Snippet<[{ id: string }]>;
    spring?: boolean | SpringOptions;
    tweened?: boolean | TweenedOptions;
  } & SVGAttributes<SVGLineElement> = $props();

  const markerStartId = $derived(markerStartOptions || markerStart ? uniqueId('marker-') : '');
  const markerEndId = $derived(markerEndOptions || markerEnd ? uniqueId('marker-') : '');

  const tweenedX1 = motionState(initialX1, { spring, tweened });
  const tweenedY1 = motionState(initialY1, { spring, tweened });
  const tweenedX2 = motionState(initialX2, { spring, tweened });
  const tweenedY2 = motionState(initialY2, { spring, tweened });

  $effect(() => {
    [x1, y1, x2, y2];
    tick().then(() => {
      tweenedX1.set(x1);
      tweenedY1.set(y1);
      tweenedX2.set(x2);
      tweenedY2.set(y2);
    });
  });

  const renderContext = getRenderContext();
  const canvasContext = getCanvasContext();

  function render(
    ctx: CanvasRenderingContext2D,
    styleOverrides: ComputedStylesOptions | undefined
  ) {
    const pathData = `M ${tweenedX1.current},${tweenedY1.current} L ${tweenedX2.current},${tweenedY2.current}`;
    renderPathData(
      ctx,
      pathData,
      styleOverrides
        ? merge({ styles: { strokeWidth } }, styleOverrides)
        : {
            styles: { fill, stroke, strokeWidth, opacity },
            classes: className,
          }
    );
  }

  const fillKey = $derived(fill && typeof fill === 'object' ? objectId(fill) : fill);
  const strokeKey = $derived(stroke && typeof stroke === 'object' ? objectId(stroke) : stroke);

  $effect(() => {
    if (renderContext === 'canvas') {
      [tweenedX1.current, tweenedY1.current, tweenedX2.current, tweenedY2.current];
      [fillKey, strokeKey, strokeWidth, opacity, className];
      canvasContext.invalidate();
    }
  });

  $effect(() => {
    if (renderContext === 'canvas') {
      return canvasContext.register({
        name: 'Line',
        render,
        events: {
          click: restProps.onclick,
          pointerenter: restProps.onpointerenter,
          pointermove: restProps.onpointermove,
          pointerleave: restProps.onpointerleave,
        },
      });
    }
  });
</script>

{#if renderContext === 'svg'}
  <line
    x1={tweenedX1.current}
    y1={tweenedY1.current}
    x2={tweenedX2.current}
    y2={tweenedY2.current}
    {fill}
    {stroke}
    stroke-width={strokeWidth}
    {opacity}
    marker-start={markerStartId ? `url(#${markerStartId})` : undefined}
    marker-end={markerEndId ? `url(#${markerEndId})` : undefined}
    class={cls(stroke === undefined && 'stroke-surface-content', className)}
    {...restProps}
  />
  {#if markerStart}
    {@render markerStart({ id: markerStartId })}
  {:else if markerStartOptions}
    <Marker
      id={markerStartId}
      type={typeof markerStartOptions === 'string' ? markerStartOptions : undefined}
      {...typeof markerStartOptions === 'object' ? markerStartOptions : null}
    />
  {/if}
  {#if markerEnd}
    {@render markerEnd({ id: markerEndId })}
  {:else if markerEndOptions}
    <Marker
      id={markerEndId}
      type={typeof markerEndOptions === 'string' ? markerEndOptions : undefined}
      {...typeof markerEndOptions === 'object' ? markerEndOptions : null}
    />
  {/if}
{/if}
