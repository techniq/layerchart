<script lang="ts">
  import type { Snippet } from 'svelte';
  import { Group } from 'three';
  import { getParent, getSceneContext, setParent } from '../../contexts/scene.svelte.js';

  /** One placed `Group`: the marks inside move with it, as an SVG `<g>`'s contents do */
  let {
    x = 0,
    y = 0,
    z = 0,
    opacity,
    children,
  }: {
    x?: number;
    y?: number;
    /** Its height off the floor, in pixels (ex. a raised line's end, for its `endContent`) */
    z?: number;
    opacity?: number;
    children?: Snippet;
  } = $props();

  const scene = getSceneContext();
  const outer = getParent();
  const object = new Group();
  (outer?.object ?? scene.root).add(object);

  $effect(() => {
    // Across and down the floor (the scene's `x` and `z`), and up off it
    object.position.set(x, z, y);
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
