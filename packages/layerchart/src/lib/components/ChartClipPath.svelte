<script lang="ts">
  import { chartContext } from './ChartContext.svelte';
  import RectClipPath from './RectClipPath.svelte';

  const { width, height, padding } = chartContext();

  /** Include padding area (ex. axis) */
  export let full = false;

  /** Disable clipping (show all) */
  export let disabled: boolean = false;
</script>

<RectClipPath
  x={full && $padding.left ? -$padding.left : 0}
  y={full && $padding.top ? -$padding.top : 0}
  width={$width + (full ? ($padding?.left ?? 0) + ($padding?.right ?? 0) : 0)}
  height={$height + (full ? ($padding?.top ?? 0) + ($padding?.bottom ?? 0) : 0)}
  {disabled}
  {...$$restProps}
>
  <slot />
</RectClipPath>
