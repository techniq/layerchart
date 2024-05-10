<script lang="ts">
  import { getContext } from 'svelte';
  import { scaleCanvas } from 'layercake';
  import { tile as d3Tile } from 'd3-tile';

  import { geoContext } from './GeoContext.svelte';
  import TileImage from './TileImage.svelte';

  export let url: (x: number, y: number, z: number) => string;
  export let zoomDelta = 0;
  export let tileSize = 256;
  export let disableCache = false;
  export let debug = false;

  const { width, height } = getContext('LayerCake');
  const canvas = getContext('canvas');
  const geo = geoContext();

  $: tile = d3Tile()
    .size([$width, $height])
    .scale($geo.scale() * 2 * Math.PI)
    .translate($geo([0, 0]) ?? [0, 0]) // TODO: Only works with Mercator
    .tileSize(tileSize)
    .zoomDelta(zoomDelta);

  $: tiles = tile();
  $: ({
    translate: [tx, ty],
    scale: k,
  } = tiles);

  $: renderContext = canvas ? 'canvas' : 'svg';

  $: ctx = canvas?.ctx;
  $: if (renderContext === 'canvas' && $ctx && url) {
    // console.count('render');
    scaleCanvas($ctx, $width, $height);
    $ctx.clearRect(0, 0, $width, $height);

    tiles.forEach(([x, y, z]) => {
      const image = new Image();
      image.onload = () => {
        $ctx.drawImage(image, (x + tx) * k, (y + ty) * k, k, k);
      };
      image.src = url(x, y, z);
    });
  }
</script>

{#if renderContext === 'svg' && url}
  <slot {tiles}>
    {#each tiles as [x, y, z] (url(x, y, z))}
      <TileImage {url} {x} {y} {z} {tx} {ty} {k} {disableCache} {debug} />
    {/each}
  </slot>
{/if}
