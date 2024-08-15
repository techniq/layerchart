<script lang="ts">
  import { tick } from 'svelte';
  import type { spring as springStore, tweened as tweenedStore } from 'svelte/motion';
  import { cls } from '@layerstack/tailwind';

  import { motionStore } from '$lib/stores/motionStore.js';

  export let x1: number;
  export let initialX1 = x1;

  export let y1: number;
  export let initialY1 = y1;

  export let x2: number;
  export let initialX2 = x2;

  export let y2: number;
  export let initialY2 = y2;

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
</script>

<!-- svelte-ignore a11y-no-static-element-interactions -->
<line
  x1={$tweened_x1}
  y1={$tweened_y1}
  x2={$tweened_x2}
  y2={$tweened_y2}
  class={cls($$props.stroke === undefined && 'stroke-surface-content')}
  {...$$restProps}
  on:click
  on:pointermove
  on:pointerleave
/>
