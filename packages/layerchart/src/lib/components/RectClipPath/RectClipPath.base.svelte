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
  import { createMotion, parseMotionProp } from '$lib/utils/motion.svelte.js';

  const uid = $props.id();

  let {
    ClipPath,
    id = createId('clipPath-', uid),
    x = 0,
    y = 0,
    initialX,
    initialY,
    width,
    height,
    initialWidth,
    initialHeight,
    disabled = false,
    invert = false,
    motion,
    children: childrenProp,
  }: RectClipPathBaseProps = $props();

  // When `motion` is undefined `createMotion` returns a passthrough that just
  // reads the getter, so we can call it unconditionally and let the fast path
  // handle the no-motion case.
  const motionX = createMotion(initialX ?? x, () => x, motion && parseMotionProp(motion, 'x'));
  const motionY = createMotion(initialY ?? y, () => y, motion && parseMotionProp(motion, 'y'));
  const motionWidth = createMotion(
    initialWidth ?? width,
    () => width,
    motion && parseMotionProp(motion, 'width')
  );
  const motionHeight = createMotion(
    initialHeight ?? height,
    () => height,
    motion && parseMotionProp(motion, 'height')
  );

  const path = $derived(
    `M${motionX.current},${motionY.current} h${motionWidth.current} v${motionHeight.current} h${-motionWidth.current} Z`
  );
</script>

<ClipPath {id} {disabled} {invert} {path}>
  {#snippet children({ url }: { url: string })}
    {@render childrenProp?.({ id, url })}
  {/snippet}
</ClipPath>
