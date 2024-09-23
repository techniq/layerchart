<script lang="ts">
  import { tick } from 'svelte';
  import type { spring as springStore, tweened as tweenedStore } from 'svelte/motion';
  import { cls } from '@layerstack/tailwind';

  import { motionStore } from '$lib/stores/motionStore.js';

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
</script>

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
