<script lang="ts" module>
  import type { Component } from 'svelte';
  import type { RectClipPathProps } from './RectClipPath.shared.svelte.js';

  export type RectClipPathBaseLayerComponents = {
    ClipPath: Component<any>;
  };

  export type RectClipPathBaseProps = RectClipPathProps & RectClipPathBaseLayerComponents;
</script>

<script lang="ts">
  import { createId } from '$lib/utils/createId.js';

  const uid = $props.id();

  let {
    ClipPath,
    id = createId('clipPath-', uid),
    x = 0,
    y = 0,
    width,
    height,
    disabled = false,
    invert = false,
    children: childrenProp,
  }: RectClipPathBaseProps = $props();

  const path = $derived(`M${x},${y} h${width} v${height} h${-width} Z`);
</script>

<ClipPath {id} {disabled} {invert} {path}>
  {#snippet children({ url }: { url: string })}
    {@render childrenProp?.({ id, url })}
  {/snippet}
</ClipPath>
