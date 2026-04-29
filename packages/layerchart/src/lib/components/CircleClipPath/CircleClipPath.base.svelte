<script lang="ts" module>
  import type { Component } from 'svelte';
  import type { CircleClipPathPropsWithoutHTML } from './CircleClipPath.shared.svelte.js';

  export type CircleClipPathBaseLayerComponents = {
    ClipPath: Component<any>;
  };

  export type CircleClipPathBaseProps = CircleClipPathPropsWithoutHTML &
    CircleClipPathBaseLayerComponents;
</script>

<script lang="ts">
  import { createId } from '$lib/utils/createId.js';

  const uid = $props.id();

  let {
    ClipPath,
    id = createId('clipPath-', uid),
    cx = 0,
    cy = 0,
    r,
    disabled = false,
    invert = false,
    children,
  }: CircleClipPathBaseProps = $props();

  const path = $derived(
    `M${cx - r},${cy} a${r},${r} 0 1,0 ${2 * r},0 a${r},${r} 0 1,0 ${-2 * r},0 Z`
  );
</script>

<ClipPath {id} {disabled} {invert} {children} {path} />
