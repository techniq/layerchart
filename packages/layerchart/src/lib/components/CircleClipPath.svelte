<script lang="ts" module>
  import type { MotionProp } from '$lib/utils/motion.svelte.js';
  import ClipPath, { type ClipPathPropsWithoutHTML } from './ClipPath.svelte';

  export type CircleClipPathPropsWithoutHTML = {
    /**
     * A unique id for the clipPath.
     */
    id?: string;

    /**
     * The center x position of the circle.
     *
     * @default 0
     */
    cx?: number;

    /**
     * The center y position of the circle.
     *
     * @default 0
     */
    cy?: number;

    /**
     * The radius of the circle.
     *
     * @required
     */
    r: number;

    /**
     * Whether to disable clipping (show all).
     *
     * @default false
     */
    disabled?: boolean;

    /**
     * Invert the clip — content renders *outside* the circle.
     *
     * @default false
     */
    invert?: boolean;

    /**
     * A bindable reference to the underlying `<circle>` element'
     *
     * @bindable
     */
    ref?: SVGCircleElement;

    /**
     * The children snippet to render content inside the clipPath.
     */
    children?: ClipPathPropsWithoutHTML['children'];

    motion?: MotionProp;
  };
</script>

<script lang="ts">
  import { createId } from '$lib/utils/createId.js';

  const uid = $props.id();

  let {
    id = createId('clipPath-', uid),
    cx = 0,
    cy = 0,
    r,
    disabled = false,
    invert = false,
    children,
  }: CircleClipPathPropsWithoutHTML = $props();

  // Two 180° arcs produce a full circle that Path2D / `clip-path: path()` accept.
  const path = $derived(
    `M${cx - r},${cy} a${r},${r} 0 1,0 ${2 * r},0 a${r},${r} 0 1,0 ${-2 * r},0 Z`
  );
</script>

<ClipPath {id} {disabled} {invert} {children} {path} />
