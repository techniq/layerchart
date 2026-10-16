<!--
  @component
  A `Highlight`'s `shadows` on an `isometric` floor: a path in the svg and canvas layers, and a round
  `Rect` laid on its plane in the html layer, which has no paths.  Part of the `isometric` view.
-->
<script lang="ts">
  import type { Component } from 'svelte';
  import { extractLayerProps } from '$lib/utils/attributes.js';
  import type { HighlightShadow } from './Highlight.isometric.js';

  let {
    Path,
    Rect,
    shadows,
    opacity,
    props,
  }: {
    Path?: Component<any>;
    Rect: Component<any>;
    shadows: HighlightShadow[];
    opacity?: number;
    /** The `shadows` prop's styling */
    props: Record<string, any>;
  } = $props();

  const attrs = $derived(extractLayerProps(props, 'lc-highlight-shadow'));
</script>

{#each shadows as { pathData, c, u, v, r }}
  {#if Path}
    <Path {pathData} {opacity} {...attrs} />
  {:else}
    <Rect
      x={c.x - r}
      y={c.y - r}
      width={r * 2}
      height={r * 2}
      rx={r}
      style="transform: matrix({u.x}, {u.y}, {v.x}, {v.y}, 0, 0); transform-origin: center"
      {opacity}
      {...attrs}
    />
  {/if}
{/each}
