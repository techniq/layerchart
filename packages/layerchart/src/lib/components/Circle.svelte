<script lang="ts">
  import { onDestroy, tick } from 'svelte';
  import type { spring as springStore, tweened as tweenedStore } from 'svelte/motion';
  import { cls } from '@layerstack/tailwind';

  import { motionStore } from '$lib/stores/motionStore.js';
  import { getCanvasContext } from './layout/Canvas.svelte';
  import { circlePath } from '../utils/path.js';
  import { renderPathData } from '../utils/canvas.js';
  import { computedStyles } from '@layerstack/svelte-actions';

  export let cx: number = 0;
  export let initialCx = cx;

  export let cy: number = 0;
  export let initialCy = cy;

  export let r: number = 1;
  export let initialR = r;

  export let spring: boolean | Parameters<typeof springStore>[1] = undefined;
  export let tweened: boolean | Parameters<typeof tweenedStore>[1] = undefined;

  let tweened_cx = motionStore(initialCx, { spring, tweened });
  let tweened_cy = motionStore(initialCy, { spring, tweened });
  let tweened_r = motionStore(initialR, { spring, tweened });

  $: tick().then(() => {
    tweened_cx.set(cx);
    tweened_cy.set(cy);
    tweened_r.set(r);
  });

  const canvasContext = getCanvasContext();
  const renderContext = canvasContext ? 'canvas' : 'svg';
  let _styles: CSSStyleDeclaration;

  function render(ctx: CanvasRenderingContext2D) {
    const pathData = circlePath({ cx: $tweened_cx, cy: $tweened_cy, r: $tweened_r });
    renderPathData(ctx, pathData, _styles);
  }

  $: if (renderContext === 'canvas') {
    canvasContext.register(render);
  }

  onDestroy(() => {
    if (renderContext === 'canvas') {
      canvasContext.deregister(render);
    }
  });
</script>

{#if renderContext === 'svg'}
  <!-- svelte-ignore a11y-no-static-element-interactions -->
  <circle
    cx={$tweened_cx}
    cy={$tweened_cy}
    r={$tweened_r}
    class={cls($$props.fill == null && 'fill-surface-content')}
    {...$$restProps}
    on:click
    on:pointermove
    on:pointerleave
  />
{/if}

<!-- Hidden div to copy computed styles -->
{#if renderContext === 'canvas'}
  <div
    class={cls('Circle-classes hidden', $$props.class)}
    use:computedStyles={(styles) => (_styles = styles)}
  ></div>
{/if}
