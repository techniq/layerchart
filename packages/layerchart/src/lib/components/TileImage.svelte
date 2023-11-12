<script context="module" lang="ts">
  let tileCache = new Map<string, Promise<string>>();
</script>

<script lang="ts">
  import Text from './Text.svelte';

  export let x: number;
  export let y: number;
  export let z: number;
  /** translate x */
  export let tx: number;
  /** scale */
  export let ty: number;
  export let k: number;
  export let disableCache = false;
  export let debug = false;

  export let url: (x: number, y: number, z: number) => string;

  // if disable cache, set href immediately, otherwise set from cache / dataUri
  let href = disableCache ? url(x, y, z) : '';
  function loadImage(url) {
    // const key = [x, y, z].join('-');
    const key = url;

    if (tileCache.has(key)) {
      tileCache.get(key)?.then((dataUri) => {
        // console.log('from cache', { x, y, z });
        href = dataUri;
      });
    } else {
      const promise = new Promise((resolve, reject) => {
        const img = new Image();
        img.crossOrigin = 'anonymous';
        img.onload = function () {
          var canvas = document.createElement('canvas');
          var context = canvas.getContext('2d');
          canvas.height = this.naturalHeight;
          canvas.width = this.naturalWidth;
          context.drawImage(this, 0, 0);
          var dataUri = canvas.toDataURL('image/jpeg');
          // console.log('from load', { x, y, z });
          href = dataUri;
          resolve(dataUri);
        };
        img.onerror = (err) => {
          cache.delete(key);
          reject(err);
        };
        img.src = url;
      });
      tileCache.set(key, promise);
    }
  }

  $: if (!disableCache) {
    // load using cache
    loadImage(url(x, y, z));
  }
</script>

<!-- To avoid aliasing artifacts (thin white lines) between tiles, two layers of tiles are drawn, with the lower layer’s tiles enlarged by one pixel -->
<image
  xlink:href={href}
  x={(x + tx) * k - 0.5}
  y={(y + ty) * k - 0.5}
  width={k + 1}
  height={k + 1}
/>
<image xlink:href={href} x={(x + tx) * k} y={(y + ty) * k} width={k} height={k} />
{#if debug}
  <rect
    x={(x + tx) * k}
    y={(y + ty) * k}
    width={k}
    height={k}
    class="stroke-red-500/50 fill-none"
  />
  <Text
    x={(x + tx) * k}
    y={(y + ty) * k}
    verticalAnchor="start"
    dx={2}
    dy={-2}
    value="{x}-{y}-{z}"
    class="text-[8px] fill-black/50"
  />
{/if}
