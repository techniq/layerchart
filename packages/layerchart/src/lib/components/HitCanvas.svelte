<script lang="ts">
  import { createEventDispatcher } from 'svelte';
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

  const dispatch = createEventDispatcher<{
    pointermove: {
      event: PointerEvent;
      data: any;
    };
    click: {
      event: MouseEvent;
      data: any;
    };
  }>();

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

  function dispatchPointerMove(e: PointerEvent) {
    const data = getPointerData(e);

    if (data) {
      activePointer = true;
    }

    // Still dispatch with `undefined data` to hide tooltip, etc
    dispatch('pointermove', { event: e, data });
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
  on:pointerenter={dispatchPointerMove}
  on:pointermove={dispatchPointerMove}
  on:pointerleave={() => (activePointer = false)}
  on:pointerleave
  on:touchmove={(e) => {
    // Prevent touch to not interfer with pointer if over data
    if (activePointer) {
      e.preventDefault();
    }
  }}
  on:click={(e) => {
    const data = getPointerData(e);
    if (data) {
      dispatch('click', { event: e, data });
    }
  }}
>
  <!-- Do not render while dragging to improve interaction performance -->
  {#if !$dragging}
    <slot nextColor={() => getColorStr(colorGenerator.next().value)} {setColorData}></slot>
  {/if}
</Canvas>
