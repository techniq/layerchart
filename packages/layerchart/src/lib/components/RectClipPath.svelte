<script lang="ts" module>
  import Rect, { type RectPropsWithoutHTML } from './Rect.svelte';
  import type { MotionProps } from '$lib/stores/motionState.svelte.js';
  import type { Without } from '$lib/utils/types.js';
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
     * The default children snippet which provides
     * the id and url for the clipPath.
     */
    children?: Snippet<[{ id: string; url: string }]>;
  } & MotionProps;

  export type RectClipPathPropsWithoutHTML = BaseRectClipPathPropsWithoutHTML &
    Without<RectPropsWithoutHTML, BaseRectClipPathPropsWithoutHTML>;

  export type RectClipPathProps = RectClipPathPropsWithoutHTML &
    Without<SVGAttributes<SVGElement>, RectClipPathPropsWithoutHTML>;
</script>

<script lang="ts">
  import ClipPath from './ClipPath.svelte';
  import { createId } from '$lib/utils/createId.js';
  import { extractLayerProps } from '$lib/utils/attributes.js';

  const uid = $props.id();

  let {
    id = createId('clipPath-', uid),
    x = 0,
    y = 0,
    disabled = false,
    children: childrenProp,
    ...restProps
  }: RectClipPathProps = $props();
</script>

<ClipPath {id} {disabled}>
  {#snippet clip()}
    <Rect {x} {y} {...extractLayerProps(restProps, 'clip-path-rect')} />
  {/snippet}
  {#snippet children({ url })}
    {@render childrenProp?.({ id, url })}
  {/snippet}
</ClipPath>
