<script lang="ts">
  import type { Snippet } from 'svelte';
  import type { Object3D } from 'three';
  import { getParent, setParent } from '../../contexts/scene.svelte.js';

  /**
   * A `ClipPath`'s `clip` snippet, its marks drawn into `object` (kept out of the scene) rather
   * than shown: their shapes make the clip's mask, as the shapes in an SVG `<clipPath>` make it
   */
  let {
    object,
    id,
    clip,
    host = $bindable(),
  }: {
    object: Object3D;
    id: string;
    clip: Snippet<[{ id: string }]>;
    /** Where any SVG elements it has go (ex. a `<circle>`), never shown, to read their shapes */
    host?: SVGSVGElement;
  } = $props();

  const outer = getParent();
  // svelte-ignore state_referenced_locally
  setParent({
    object,
    get x() {
      return outer?.x ?? 0;
    },
    get y() {
      return outer?.y ?? 0;
    },
    get opacity() {
      return outer?.opacity;
    },
  });
</script>

<!-- Inside the scene's `<canvas>`, so not shown -->
<svg bind:this={host} style:display="none" aria-hidden="true">
  {@render clip({ id })}
</svg>
