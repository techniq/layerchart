<script lang="ts" module>
  import type { Component } from 'svelte';
  import type { TileImageProps } from './TileImage.shared.svelte.js';

  export type TileImageBaseLayerComponents = {
    Text: Component<any>;
  };

  export type TileImageBaseProps = TileImageProps & TileImageBaseLayerComponents;
</script>

<script lang="ts">
  import { extractLayerProps } from '$lib/utils/attributes.js';
  import { tileCache } from './TileImage.shared.svelte.js';

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

  let href = $state(disableCache ? url(x, y, z) : '');

  function loadImage(url: string) {
    const key = url;

    if (tileCache.has(key)) {
      tileCache
        .get(key)
        ?.then((dataUri) => {
          href = dataUri;
        })
        .catch(() => {});
    } else {
      const promise = new Promise<string>((resolve, reject) => {
        const img = new Image();
        img.crossOrigin = 'anonymous';
        img.onload = function () {
          var canvas = document.createElement('canvas');
          var context = canvas.getContext('2d')!;
          // @ts-expect-error
          canvas.height = this.naturalHeight;
          // @ts-expect-error
          canvas.width = this.naturalWidth;
          // @ts-expect-error
          context.drawImage(this, 0, 0);
          var dataUri = canvas.toDataURL('image/jpeg');
          href = dataUri;
          resolve(dataUri);
        };
        img.onerror = (err) => {
          tileCache.delete(key);
          reject(err);
        };
        img.src = url;
      });
      tileCache.set(key, promise);
    }
  }

  $effect(() => {
    if (disableCache) return;
    loadImage(url(x, y, z));
  });
</script>

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
