<script lang="ts">
  import type { Snippet } from 'svelte';
  import { Group } from 'three';
  import { getParent, getSceneContext, setParent } from '../../contexts/scene.svelte.js';

  /** One placed `Group`: the marks inside move with it, as an SVG `<g>`'s contents do */
  let {
    x = 0,
    y = 0,
    opacity,
    children,
  }: { x?: number; y?: number; opacity?: number; children?: Snippet } = $props();

  const scene = getSceneContext();
  const outer = getParent();
  const object = new Group();
  (outer?.object ?? scene.root).add(object);

  $effect(() => {
    // Across and down the floor (the scene's `x` and `z`)
    object.position.set(x, 0, y);
    scene.invalidate();
  });
  $effect(() => () => {
    object.parent?.remove(object);
    scene.invalidate();
  });

  setParent({
    object,
    get x() {
      return (outer?.x ?? 0) + x;
    },
    get y() {
      return (outer?.y ?? 0) + y;
    },
    get opacity() {
      return (outer?.opacity ?? 1) * (opacity ?? 1);
    },
  });
</script>

{@render children?.()}
