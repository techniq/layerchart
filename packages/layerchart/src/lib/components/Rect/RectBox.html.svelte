<!--
  @component
  A `Rect` stood up into a box on an `isometric` floor, in the html layer: each face a 1px square
  its own matrix stretches into place.  Part of the `isometric` view, so flat charts don't bundle it.
-->
<script lang="ts">
  import type { HTMLAttributes } from 'svelte/elements';
  import { cls } from '@layerstack/tailwind';
  import type { BoxFace } from '$lib/utils/isometric.js';

  let {
    faces,
    fill,
    opacity,
    class: className,
    attrs,
  }: {
    faces: BoxFace[];
    fill?: string;
    opacity?: number;
    class?: string;
    /** The `Rect`'s other attributes (ex. event handlers), on every face */
    attrs: HTMLAttributes<HTMLDivElement>;
  } = $props();
</script>

{#each faces as face}
  {@const [p0, p1, , p3] = face.points}
  <!-- svelte-ignore a11y_click_events_have_key_events -->
  <!-- svelte-ignore a11y_no_static_element_interactions -->
  <div
    {...attrs}
    style:position="absolute"
    style:left="0"
    style:top="0"
    style:width="1px"
    style:height="1px"
    style:transform-origin="0 0"
    style:transform="matrix({p1.x - p0.x}, {p1.y - p0.y}, {p3.x - p0.x}, {p3.y - p0.y}, {p0.x},
    {p0.y})"
    style:background={fill}
    style:box-shadow={face.shade ? `inset 0 0 0 9999px rgb(0 0 0 / ${face.shade})` : null}
    style:opacity
    class={cls('lc-rect', `lc-rect-${face.kind}`, className)}
  ></div>
{/each}
