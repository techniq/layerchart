<script lang="ts">
  import { getContext, tick } from 'svelte';
  import type { spring as springStore, tweened as tweenedStore } from 'svelte/motion';

  import { motionStore } from '$lib/stores/motionStore.js';

  const { width, height } = getContext('LayerCake');

  /**
   * Translate x
   */
  export let x: number | undefined = undefined;
  export let initialX = x;

  /**
   * Translate x
   */
  export let y: number | undefined = undefined;
  export let initialY = y;

  /**
   * Center within chart
   */
  export let center: boolean | 'x' | 'y' = false;

  export let spring: boolean | Parameters<typeof springStore>[1] = undefined;
  export let tweened: boolean | Parameters<typeof tweenedStore>[1] = undefined;

  let tweened_x = motionStore(initialX, { spring, tweened });
  let tweened_y = motionStore(initialY, { spring, tweened });

  $: tick().then(() => {
    tweened_x.set(x ?? (center === 'x' || center === true ? $width / 2 : 0));
    tweened_y.set(y ?? (center === 'y' || center === true ? $height / 2 : 0));
  });

  let transform: string | undefined = undefined;
  $: if (center || x != null || y != null) {
    transform = `translate(${$tweened_x ?? 0}, ${$tweened_y ?? 0})`;
  }
</script>

<g {transform} {...$$restProps} on:click on:pointermove on:pointerleave>
  <slot />
</g>
