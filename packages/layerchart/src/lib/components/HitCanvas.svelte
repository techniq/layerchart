<script lang="ts">
  import { cls } from '@layerstack/tailwind';

  import { chartContext } from './ChartContext.svelte';
  import Canvas from './layout/Canvas.svelte';
  import { transformContext } from './TransformContext.svelte';
  import { getColorStr, rgbColorGenerator } from '../utils/color.js';
  import { getPixelColor } from '../utils/canvas.js';

  const { width, height } = chartContext();

  // @ts-expect-error: this will immediately be defined on mount via `bind:context`
  export let context: CanvasRenderingContext2D = undefined;

  /** Show canvas for debugging */
  export let debug = false;

  export let onclick: ((e: MouseEvent, data: any) => void) | undefined = undefined;
  // export let onpointerenter: ((e: PointerEvent, data: any) => void) | undefined = undefined;
  export let onpointermove: ((e: PointerEvent, data: any) => void) | undefined = undefined;
  export let onpointerleave: ((e: PointerEvent) => void) | undefined = undefined;

  let colorGenerator = rgbColorGenerator();

  // Reset color generator whenever updated (width/height) so always reusing same colors (and not exhausting)
  const { translate, scale, dragging } = transformContext();
  $: {
    $width;
    $height;
    $translate;
    $scale;

    colorGenerator = rgbColorGenerator();
  }

  const dataByColor = new Map<string, any>();
  function setColorData(color: string, data: any) {
    dataByColor.set(color, data);
  }

  let activePointer = false;

  function getPointerData(e: PointerEvent | MouseEvent) {
    const color = getPixelColor(context, e.offsetX, e.offsetY);
    const colorKey = getColorStr(color);
    return dataByColor.get(colorKey);
  }

  function _onPointerMove(e: PointerEvent) {
    const data = getPointerData(e);

    if (data) {
      activePointer = true;
    }

    // Still dispatch with `undefined data` to hide tooltip, etc
    onpointermove?.(e, data);
  }
</script>

<Canvas
  bind:context
  willReadFrequently
  class={cls(
    'HitCanvas absolute w-full h-full border border-danger',
    // '[image-rendering:pixelated]', // https://developer.mozilla.org/en-US/docs/Web/CSS/image-rendering
    !debug && 'opacity-0'
  )}
  on:pointerenter={_onPointerMove}
  on:pointermove={_onPointerMove}
  on:pointerleave={(e) => {
    activePointer = false;
    onpointerleave?.(e);
  }}
  on:touchmove={(e) => {
    // Prevent touch to not interfer with pointer if over data
    if (activePointer) {
      e.preventDefault();
    }
  }}
  on:click={(e) => {
    const data = getPointerData(e);
    if (data) {
      onclick?.(e, data);
    }
  }}
>
  <!-- Do not render while dragging to improve interaction performance -->
  {#if !$dragging}
    <slot nextColor={() => getColorStr(colorGenerator.next().value)} {setColorData}></slot>
  {/if}
</Canvas>
