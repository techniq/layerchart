<script lang="ts" context="module">
  import { getContext, onDestroy, setContext } from 'svelte';

  type DrawFunction = (ctx: CanvasRenderingContext2D) => any;

  export type CanvasContext = {
    register(fn: DrawFunction): void;
    deregister(fn: DrawFunction): void;
    invalidate(): void;
  };

  export const canvasContextKey = Symbol();

  export function getCanvasContext() {
    return getContext<CanvasContext>(canvasContextKey);
  }

  function setCanvasContext(context: CanvasContext) {
    setContext(canvasContextKey, context);
  }
</script>

<script lang="ts">
  import { onMount } from 'svelte';
  import { cls } from '@layerstack/tailwind';

  import { chartContext } from '../ChartContext.svelte';
  import { transformContext } from '../TransformContext.svelte';
  import { scaleCanvas } from '../../utils/canvas.js';

  const { width, height, containerWidth, containerHeight, padding } = chartContext();

  /** The `<canvas>` tag. Useful for bindings. */
  export let element: HTMLCanvasElement | undefined = undefined;

  /** The `<canvas>`'s 2d context. Useful for bindings. */
  // @ts-expect-error: set during onMount()
  export let context: CanvasRenderingContext2D = undefined;

  /** Force the use of a software (instead of hardware accelerated) 2D canvas and can save memory when calling getImageData() frequently.
   * see: https://developer.mozilla.org/en-US/docs/Web/API/HTMLCanvasElement/getContext#willreadfrequently */
  export let willReadFrequently = false;

  /** The layer's z-index. */
  export let zIndex = undefined;

  /** Set this to `false` to set `pointer-events: none;` on the entire layer. */
  export let pointerEvents: boolean | undefined = undefined;

  /** Text to display if the browser won't render a canvas tag. You can also set arbitrary HTML via the "fallback" slot but this is fine if you just need text. If you use the "fallback" slot, this prop is ignored. */
  export let fallback = '';

  /** A string passed to the `aria-label` on the `<canvas>` tag. */
  export let label: string | undefined = undefined;

  /** A string passed to the `aria-labelledby` on the `<canvas>` tag. */
  export let labelledBy: string | undefined = undefined;

  /** A string passed to `aria-describedby` property on the `<canvas>` tag. */
  export let describedBy: string | undefined = undefined;

  const drawFunctions: DrawFunction[] = [];
  let pendingInvalidation = false;
  let frameId: number | undefined;

  const { mode, scale, translate } = transformContext();

  onMount(() => {
    context = element?.getContext('2d', { willReadFrequently }) as CanvasRenderingContext2D;
  });

  onDestroy(() => {
    if (frameId) {
      cancelAnimationFrame(frameId);
    }
  });

  function update() {
    if (!context) return;
    // TODO: only `scaleCanvas()` when containerWidth/Height change (not all invalidations)
    // scaleCanvas in `update()` to fix `requestAnimationFrame()` timing causing flash of blank canvas
    scaleCanvas(context, $containerWidth, $containerHeight);

    context.clearRect(0, 0, $containerWidth, $containerHeight);

    context.translate($padding.left ?? 0, $padding.top ?? 0);
    if (mode === 'canvas') {
      const center = { x: $width / 2, y: $height / 2 };
      const newTranslate = {
        x: $translate.x * $scale + center.x - center.x * $scale,
        y: $translate.y * $scale + center.y - center.y * $scale,
      };
      context.translate(newTranslate.x, newTranslate.y);
      context.scale($scale, $scale);
    }

    drawFunctions.forEach((fn) => {
      context.save();
      fn(context);
      context.restore();
    });

    pendingInvalidation = false;
  }

  const canvasContext: CanvasContext = {
    register(fn) {
      drawFunctions.push(fn);
      this.invalidate();
    },
    deregister(fn) {
      drawFunctions.splice(drawFunctions.indexOf(fn), 1);
      this.invalidate();
    },
    invalidate() {
      if (pendingInvalidation) return;
      pendingInvalidation = true;
      frameId = requestAnimationFrame(update);
    },
  };

  $: {
    // Redraw when resized
    $containerWidth, $containerHeight;
    canvasContext.invalidate();
  }

  setCanvasContext(canvasContext);
</script>

<canvas
  bind:this={element}
  style:z-index={zIndex}
  class={cls(
    'layercake-layout-canvas',
    'absolute top-0 left-0 w-full h-full',
    pointerEvents === false && 'pointer-events-none',
    $$props.class
  )}
  aria-label={label}
  aria-labelledby={labelledBy}
  aria-describedby={describedBy}
  on:pointerenter
  on:pointermove
  on:pointerleave
  on:pointerleave
  on:touchmove
  on:click
>
  <slot name="fallback">
    {fallback || ''}
  </slot>
</canvas>

<slot {element} {context}></slot>
