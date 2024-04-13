<script lang="ts">
  import { getContext } from 'svelte';

  import RectClipPath from './RectClipPath.svelte';

  const { width, height, padding } = getContext('LayerCake');

  /** Include padding area (ex. axis) */
  export let full = false;
</script>

<RectClipPath
  x={full ? -$padding.left : 0}
  y={full ? -$padding.top : 0}
  width={$width + (full ? $padding.left + $padding.right : 0)}
  height={$height + (full ? $padding.top + $padding.bottom : 0)}
  on:click
  {...$$restProps}
>
  <slot />
</RectClipPath>
