<script lang="ts">
  import { getContext } from 'svelte';

  import RectClipPath from './RectClipPath.svelte';

  const { width, height, padding } = getContext('LayerCake');

  /** Whether clipping should include chart padding (ex. axis) */
  export let includePadding = false;
</script>

<RectClipPath
  x={includePadding ? -$padding.left : 0}
  y={includePadding ? -$padding.top : 0}
  width={$width + (includePadding ? $padding.left + $padding.right : 0)}
  height={$height + (includePadding ? $padding.top + $padding.bottom : 0)}
  on:click
  {...$$restProps}
>
  <slot />
</RectClipPath>
