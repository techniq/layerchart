<script lang="ts" module>
  import type { MotionProps } from '$lib/stores/motionState.svelte.js';
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
     * A bindable reference to the underlying `<circle>` element'
     *
     * @bindable
     */
    ref?: SVGCircleElement;

    /**
     * The children snippet to render content inside the clipPath.
     */
    children?: ClipPathPropsWithoutHTML['children'];
  } & MotionProps;
</script>

<script lang="ts">
  import Circle from './Circle.svelte';
  import { createId } from '$lib/utils/createId.js';
  import { extractLayerProps } from '$lib/utils/attributes.js';

  const uid = $props.id();

  let {
    id = createId('clipPath-', uid),
    cx = 0,
    cy = 0,
    r,
    spring,
    tweened,
    disabled = false,
    ref = $bindable(),
    children,
    ...restProps
  }: CircleClipPathPropsWithoutHTML = $props();
</script>

<ClipPath {id} {disabled} {children}>
  {#snippet clip()}
    <Circle
      {cx}
      {cy}
      {r}
      {spring}
      {tweened}
      {...extractLayerProps(restProps, 'clip-path-circle')}
      bind:ref
    />
  {/snippet}
</ClipPath>
