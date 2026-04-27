<script lang="ts" module>
  import { type RectPropsWithoutHTML } from './Rect/Rect.svelte';
  import type { CommonEvents, Without } from '$lib/utils/types.js';
  import type { SVGAttributes } from 'svelte/elements';
  import type { Snippet } from 'svelte';

  export type BaseRectClipPathPropsWithoutHTML = {
    /**
     * A unique id for the clipPath.
     */
    id?: string;

    /**
     * The x position of the clipPath.
     *
     * @default 0
     */
    x?: number;

    /**
     * The y position of the clipPath.
     *
     * @default 0
     */
    y?: number;

    /**
     * The width of the clipPath.
     *
     * @required
     */
    width: number;

    /**
     * The height of the clipPath.
     *
     * @required
     */
    height: number;

    /**
     * Whether to disable clipping (show all).
     *
     * @default false
     */
    disabled?: boolean;

    /**
     * Invert the clip — content renders *outside* the rect.
     *
     * @default false
     */
    invert?: boolean;

    /**
     * The default children snippet which provides
     * the id and url for the clipPath.
     */
    children?: Snippet<[{ id: string; url: string }]>;

    motion?: MotionProp<'x' | 'y' | 'width' | 'height'>;
  };

  export type RectClipPathPropsWithoutHTML = BaseRectClipPathPropsWithoutHTML &
    Without<RectPropsWithoutHTML, BaseRectClipPathPropsWithoutHTML>;

  export type RectClipPathProps = RectClipPathPropsWithoutHTML &
    Without<SVGAttributes<SVGElement>, RectClipPathPropsWithoutHTML> &
    CommonEvents;
</script>

<script lang="ts">
  import ClipPath from './ClipPath.svelte';
  import { createId } from '$lib/utils/createId.js';
  import type { MotionProp } from '$lib/utils/motion.svelte.js';

  const uid = $props.id();

  let {
    id = createId('clipPath-', uid),
    x = 0,
    y = 0,
    width,
    height,
    disabled = false,
    invert = false,
    children: childrenProp,
  }: RectClipPathProps = $props();

  const path = $derived(`M${x},${y} h${width} v${height} h${-width} Z`);
</script>

<ClipPath {id} {disabled} {invert} {path}>
  {#snippet children({ url })}
    {@render childrenProp?.({ id, url })}
  {/snippet}
</ClipPath>
