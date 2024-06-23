<script lang="ts">
  import { chartContext } from './ChartContext.svelte';

  const { width, height, padding } = chartContext();

  /** Include padding area */
  export let full = false;

  /** Access underlying `<rect>` element */
  export let rectEl: SVGRectElement;
</script>

<!-- svelte-ignore a11y-no-static-element-interactions -->
<rect
  x={full && $padding?.left ? -$padding.left : 0}
  y={full && $padding?.top ? -$padding.top : 0}
  width={$width + (full ? ($padding?.left ?? 0) + ($padding?.right ?? 0) : 0)}
  height={$height + (full ? ($padding?.top ?? 0) + ($padding?.bottom ?? 0) : 0)}
  on:click
  on:pointerdown
  on:dblclick
  bind:this={rectEl}
  {...$$restProps}
/>
