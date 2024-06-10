<script lang="ts">
  import { getContext } from 'svelte';

  const { width, height, padding } = getContext('LayerCake');

  /** Include padding area */
  export let full = false;

  /** Access underlying `<rect>` element */
  export let rectEl: SVGRectElement;
</script>

<rect
  x={full ? -$padding.left : 0}
  y={full ? -$padding.top : 0}
  width={$width + (full ? $padding.left + $padding.right : 0)}
  height={$height + (full ? $padding.top + $padding.bottom : 0)}
  on:click
  on:pointerdown
  on:dblclick
  bind:this={rectEl}
  {...$$restProps}
/>
