<script lang="ts">
  import { createEventDispatcher, onMount, setContext } from 'svelte';
  import { writable } from 'svelte/store';
  import { scaleCanvas } from 'layercake';
  import { cls } from 'svelte-ux';

  import { chartContext } from './ChartContext.svelte';
  import Canvas from './layout/Canvas.svelte';
  import { transformContext } from './TransformContext.svelte';

  const { width, height } = chartContext();

  // @ts-ignore: this will immediately be defined on mount via `bind:context`
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

  const cntxt = {
    ctx: writable({}),
  };

  onMount(() => {
    // https://developer.mozilla.org/en-US/docs/Web/API/HTMLCanvasElement/getContext#willreadfrequently
    scaleCanvas(context, $width, $height);
  });

  $: cntxt.ctx.set(context);
  setContext('canvas', cntxt);

  function* rgbColorGenerator(step = 500) {
    let nextColor = 1;

    while (nextColor < 16777216) {
      const rgb = [
        nextColor & 0xff, // red
        (nextColor & 0xff00) >> 8, // green
        (nextColor & 0xff0000) >> 16, // blue
      ];

      nextColor += step;
      yield `rgb(${rgb.join(',')})`;
    }

    return 'rgb(0,0,0)';
  }

  $: colorGenerator = rgbColorGenerator();

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
    const { offsetX, offsetY } = e;

    const dpr = window.devicePixelRatio ?? 1;
    const imageData = context.getImageData(offsetX * dpr, offsetY * dpr, 1, 1);
    const [r, g, b, a] = imageData.data;
    const colorKey = `rgb(${r},${g},${b})`;
    const data = dataByColor.get(colorKey);

    return data;
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
/>

<!-- Do not render while dragging to improve interaction performance -->
{#if !$dragging}
  <slot nextColor={() => colorGenerator.next().value} {setColorData}></slot>
{/if}
