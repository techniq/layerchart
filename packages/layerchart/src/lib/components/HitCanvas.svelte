<script lang="ts">
  import { createEventDispatcher, getContext, onMount, setContext } from 'svelte';
  import { writable } from 'svelte/store';
  import { scaleCanvas } from 'layercake';
  import { cls } from 'svelte-ux';

  const { width, height, padding } = getContext('LayerCake');

  export let element: HTMLCanvasElement = undefined;
  export let context: CanvasRenderingContext2D = undefined;

  /** Show canvas for debugging */
  export let debug = false;

  const dispatch = createEventDispatcher<{
    mousemove: {
      event: MouseEvent;
      data: any;
    };
  }>();

  const cntxt = {
    ctx: writable({}),
  };

  onMount(() => {
    context = element.getContext('2d');
    scaleCanvas(context, $width, $height);
  });

  $: cntxt.ctx.set(context);
  setContext('canvas', cntxt);

  function* rgbColorGenerator(step = 500) {
    let nextColor = 1;

    while (nextColor < 16777216) {
      const rgb = [];

      rgb.push(nextColor & 0xff); // R.
      rgb.push((nextColor & 0xff00) >> 8); // G.
      rgb.push((nextColor & 0xff0000) >> 16); // B.

      nextColor += step;
      yield `rgb(${rgb.join(',')})`;
    }
  }

  const colorGenerator = rgbColorGenerator();

  const dataByColor = new Map<string, any>();
  function setColorData(color: string, data: any) {
    dataByColor.set(color, data);
  }
</script>

<canvas
  bind:this={element}
  style:top="{$padding.top}px"
  style:bottom="{$padding.bottom}px"
  style:left="{$padding.left}px"
  style:right="{$padding.right}px"
  class={cls('HitCanvas absolute w-full h-full border border-danger', !debug && 'opacity-0')}
  on:mousemove={(e) => {
    const { offsetX, offsetY } = e;

    const dpr = window.devicePixelRatio ?? 1;
    const imageData = context.getImageData(offsetX * dpr, offsetY * dpr, 1, 1);
    const [r, g, b, a] = imageData.data;
    const colorKey = `rgb(${r},${g},${b})`;
    const data = dataByColor.get(colorKey);

    dispatch('mousemove', { event: e, data });
  }}
  on:mouseleave
/>

<slot {element} {context} nextColor={() => colorGenerator.next().value} {setColorData}></slot>
