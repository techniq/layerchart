<script lang="ts" module>
  export type BaseRectClipPathPropsWithoutHTML = {
    /**
     * A unique id for the clipPath.
     *
     * @default `uniqueId('clipPath-')`
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
  import type { ComponentProps, Snippet } from 'svelte';
  import { uniqueId } from '@layerstack/utils';

  import ClipPath from './ClipPath.svelte';
  import Rect, { type RectPropsWithoutHTML } from './Rect.svelte';
  import type { MotionProps } from 'layerchart/stores/motionStore.js';
  import type { Without } from 'layerchart/utils/types.js';
  import type { SVGAttributes } from 'svelte/elements';

  let {
    id = uniqueId('clipPath-'),
    x = 0,
    y = 0,
    disabled = false,
    children: childrenProp,
    ...restProps
  }: RectClipPathProps = $props();
</script>

<ClipPath {id} {disabled}>
  {#snippet children({ url })}
    <Rect slot="clip" {x} {y} {...restProps} />
    {@render childrenProp?.({ id, url })}
    <slot {id} {url} />
  {/snippet}
</ClipPath>
