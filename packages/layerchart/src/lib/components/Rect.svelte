<script lang="ts">
  import { tick } from 'svelte';
  import {
    motionStore,
    resolveOptions,
    type SpringOptions,
    type TweenedOptions,
  } from '$lib/stores/motionStore';

  export let x = 0;
  export let initialX = x;

  export let y = 0;
  export let initialY = y;

  export let width: number;
  export let initialWidth = width;

  export let height: number;
  export let initialHeight = height;

  export let spring: boolean | SpringOptions | { [prop: string]: SpringOptions } = undefined;
  export let tweened: boolean | TweenedOptions | { [prop: string]: TweenedOptions } = undefined;

  let tweened_x = motionStore(initialX, resolveOptions('x', { spring, tweened }));
  let tweened_y = motionStore(initialY, resolveOptions('y', { spring, tweened }));
  let tweened_width = motionStore(initialWidth, resolveOptions('width', { spring, tweened }));
  let tweened_height = motionStore(initialHeight, resolveOptions('height', { spring, tweened }));

  $: tick().then(() => {
    tweened_x.set(x);
    tweened_y.set(y);
    tweened_width.set(width);
    tweened_height.set(height);
  });
</script>

<!-- svelte-ignore a11y-mouse-events-have-key-events -->
<rect
  x={$tweened_x}
  y={$tweened_y}
  width={$tweened_width}
  height={$tweened_height}
  class="fill-surface-content"
  {...$$restProps}
  on:click
  on:mouseover
  on:mousemove
  on:mouseout
  on:mouseleave
/>
