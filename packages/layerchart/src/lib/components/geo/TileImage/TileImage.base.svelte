<script lang="ts" module>
  import type { Component } from 'svelte';
  import type { TileImageProps } from './TileImage.shared.svelte.js';

  export type TileImageBaseLayerComponents = {
    Text: Component<any>;
  };

  export type TileImageBaseProps = TileImageProps & TileImageBaseLayerComponents;
</script>

<script lang="ts">
  import { untrack } from 'svelte';
  import { extractLayerProps } from '$lib/utils/attributes.js';
  import { loadedAncestor, loadedTiles, loadTileWithAncestor } from './TileImage.shared.svelte.js';

  let {
    Text,
    x,
    y,
    z,
    tx,
    ty,
    scale,
    disableCache = false,
    debug = false,
    url,
    ...restProps
  }: TileImageBaseProps = $props();

  /**
   * Its own image once loaded (or its URL, not cached): from those loaded before at once, else
   * set as it arrives.  (Not following the cache, which may let it go while it's drawn)
   */
  let href = $derived.by(() => {
    const key = url(x, y, z);
    return disableCache ? key : untrack(() => loadedTiles.get(key)?.href ?? '');
  });

  $effect(() => {
    if (disableCache) return;
    const [col, row, zoom, tileUrl] = [x, y, z, url];
    let current = true;
    // (Letting older tiles go writes to the cache, which this shouldn't follow)
    untrack(() => loadTileWithAncestor(tileUrl, col, row, zoom)).then(
      (tile) => {
        if (current) href = tile.href;
      },
      () => {}
    );
    return () => {
      current = false;
    };
  });

  /** While its own loads, part of its nearest ancestor already loaded, enlarged */
  const standIn = $derived(href || disableCache ? null : loadedAncestor(url, x, y, z));
</script>

{#if href}
  {#key href}
    <image
      {href}
      x={(x + tx) * scale - 0.5}
      y={(y + ty) * scale - 0.5}
      width={scale + 1}
      height={scale + 1}
      {...extractLayerProps(restProps, 'lc-tile-image-lower')}
    />
    <image
      {href}
      x={(x + tx) * scale}
      y={(y + ty) * scale}
      width={scale}
      height={scale}
      {...extractLayerProps(restProps, 'lc-tile-image')}
    />
  {/key}
{:else if standIn}
  <!-- The part of the ancestor's image over this tile, a little larger to hide seams -->
  <svg
    x={(x + tx) * scale - 0.5}
    y={(y + ty) * scale - 0.5}
    width={scale + 1}
    height={scale + 1}
    viewBox="{standIn.u0} {standIn.v0} {standIn.size} {standIn.size}"
    preserveAspectRatio="none"
  >
    <image
      href={standIn.tile.href}
      width={1}
      height={1}
      preserveAspectRatio="none"
      {...extractLayerProps(restProps, 'lc-tile-image')}
    />
  </svg>
{/if}
{#if debug}
  <rect
    x={(x + tx) * scale}
    y={(y + ty) * scale}
    width={scale}
    height={scale}
    class="lc-tile-image-debug-rect"
  />
  <Text
    x={(x + tx) * scale}
    y={(y + ty) * scale}
    verticalAnchor="start"
    dx={2}
    dy={-2}
    value="{x}-{y}-{z}"
    class="lc-tile-image-debug-text"
  />
{/if}

<style>
  @layer components {
    :global(:where(.lc-tile-image-debug-rect)) {
      fill: none;
      stroke: var(--color-danger, red);
    }

    :global(:where(.lc-tile-image-debug-text)) {
      --fill-color: var(--color-danger, red);
      font-size: 14px;
      font-weight: 500;
    }
  }
</style>
