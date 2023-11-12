<script lang="ts">
  import { getContext, tick } from 'svelte';
  import type { spring as springStore, tweened as tweenedStore } from 'svelte/motion';

  import { motionStore } from '$lib/stores/motionStore';

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
  export let center: boolean = false;

  export let spring: boolean | Parameters<typeof springStore>[1] = undefined;
  export let tweened: boolean | Parameters<typeof tweenedStore>[1] = undefined;

  let tweened_x = motionStore(initialX, { spring, tweened });
  let tweened_y = motionStore(initialY, { spring, tweened });

  $: tick().then(() => {
    tweened_x.set(x);
    tweened_y.set(y);
  });

  let transform: string | undefined = undefined;
  $: if (x != null || y != null) {
    transform = `translate(${$tweened_x ?? 0}, ${$tweened_y ?? 0})`;
  }
  $: if (center) {
    transform = `translate(${$width / 2}, ${$height / 2})`;
  }
</script>

<g {transform} {...$$restProps} on:click on:mousemove on:mouseleave>
  <slot />
</g>
