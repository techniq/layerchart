<script lang="ts">
  import { chartContext } from './ChartContext.svelte';
  import Rect from './Rect.svelte';

  const { width, height, padding } = chartContext();

  /** Include padding area */
  export let full = false;

  /** Access underlying `<rect>` element */
  export let element: SVGRectElement | undefined = undefined;
</script>

<!-- svelte-ignore a11y-no-static-element-interactions -->
<Rect
  x={full && $padding?.left ? -$padding.left : 0}
  y={full && $padding?.top ? -$padding.top : 0}
  width={$width + (full ? ($padding?.left ?? 0) + ($padding?.right ?? 0) : 0)}
  height={$height + (full ? ($padding?.top ?? 0) + ($padding?.bottom ?? 0) : 0)}
  bind:element
  {...$$restProps}
/>
