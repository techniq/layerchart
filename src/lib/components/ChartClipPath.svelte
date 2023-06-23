<script lang="ts">
  import { getContext } from 'svelte';

  import RectClipPath from './RectClipPath.svelte';

  const { width, height, padding } = getContext('LayerCake');
</script>

<RectClipPath
  x={-$padding.left}
  y={-$padding.top}
  width={$width + $padding.left + $padding.right}
  height={$height + $padding.top + $padding.bottom}
  on:click
  {...$$restProps}
>
  <slot />
</RectClipPath>
