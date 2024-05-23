<script lang="ts">
  import { getContext, onMount, setContext } from 'svelte';
  import { writable } from 'svelte/store';
  import { scaleCanvas } from 'layercake';

  const { width, height, padding } = getContext('LayerCake');

  /** The `<canvas>` tag. Useful for bindings. */
  export let element: HTMLCanvasElement | undefined = undefined;

  /** The `<canvas>`'s 2d context. Useful for bindings. */
  export let context: CanvasRenderingContext2D = undefined;

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

  /** Apply scale transform */
  export let scale: number | undefined = undefined;

  /** Apply scale transform */
  export let translate = [0, 0];

  const cntxt = {
    ctx: writable({}),
  };

  onMount(() => {
    context = element?.getContext('2d') as CanvasRenderingContext2D;
  });

  $: if (context) {
    scaleCanvas(context, $width, $height);
    context.clearRect(0, 0, $width, $height);

    if (scale != null) {
      context.scale(scale, scale);
    }

    if (translate.some((x) => x !== 0)) {
      context.translate(translate[0], translate[1]);
    }
  }

  $: cntxt.ctx.set(context);
  setContext('canvas', cntxt);
</script>

<canvas
  bind:this={element}
  class="layercake-layout-canvas"
  style:z-index={zIndex}
  style:pointer-events={pointerEvents === false ? 'none' : null}
  style:top="{$padding.top}px"
  style:right="{$padding.right}px"
  style:bottom="{$padding.bottom}px"
  style:left="{$padding.left}px"
  style="width:100%;height:100%;position:absolute;"
  aria-label={label}
  aria-labelledby={labelledBy}
  aria-describedby={describedBy}
>
  <slot name="fallback">
    {fallback || ''}
  </slot>
</canvas>

<slot {element} {context}></slot>
