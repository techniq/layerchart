<script lang="ts" module>
  let tileCache = new Map<string, Promise<string>>();

  export type TileImageProps = {
    /**
     * x position of the tile
     */
    x: number;
    /**
     * y position of the tile
     */
    y: number;

    /**
     * z position of the tile
     */
    z: number;

    /**
     * translate x
     */
    tx: number;

    /**
   * translate y

   */
    ty: number;

    /**
     * scale of the tile
     */
    scale: number;

    /**
     * Whether to disable cache
     *
     * @default false
     */
    disableCache?: boolean;

    /**
     * Whether to enable debug mode
     *
     * @default false
     */
    debug?: boolean;

    /**
     * URL function to get the tile image
     */
    url: (x: number, y: number, z: number) => string;
  };
</script>

<script lang="ts">
  import { createDataAttr } from '$lib/utils/attributes.js';

  import Text from './Text.svelte';

  let {
    x,
    y,
    z,
    tx,
    ty,
    scale,
    disableCache = false,
    debug = false,
    url,
  }: TileImageProps = $props();

  // if disable cache, set href immediately, otherwise set from cache / dataUri
  let href = $state(disableCache ? url(x, y, z) : '');

  function loadImage(url: string) {
    // const key = [x, y, z].join('-');
    const key = url;

    if (tileCache.has(key)) {
      tileCache
        .get(key)
        ?.then((dataUri) => {
          // console.log('from cache', { x, y, z });
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
          // console.log('from load', { x, y, z });
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

<!-- To avoid aliasing artifacts (thin white lines) between tiles, two layers of tiles are drawn, with the lower layer’s tiles enlarged by one pixel -->
<image
  {...createDataAttr('tile-image')}
  xlink:href={href}
  x={(x + tx) * scale - 0.5}
  y={(y + ty) * scale - 0.5}
  width={scale + 1}
  height={scale + 1}
/>
<image
  {...createDataAttr('tile-image')}
  xlink:href={href}
  x={(x + tx) * scale}
  y={(y + ty) * scale}
  width={scale}
  height={scale}
/>
{#if debug}
  <rect
    x={(x + tx) * scale}
    y={(y + ty) * scale}
    width={scale}
    height={scale}
    class="stroke-danger/50 fill-none"
  />
  <Text
    x={(x + tx) * scale}
    y={(y + ty) * scale}
    verticalAnchor="start"
    dx={2}
    dy={-2}
    value="{x}-{y}-{z}"
    class="text-[8px] fill-black/50"
  />
{/if}
