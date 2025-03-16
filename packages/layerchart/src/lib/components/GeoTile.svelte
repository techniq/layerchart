<script lang="ts" module>
  import type { Snippet } from 'svelte';

  export type GeoTilePropsWithoutHTML = {
    url: (x: number, y: number, z: number) => string;
    /**
     * The zoom delta for the tile.
     *
     * @default 0
     */
    zoomDelta?: number;

    /**
     * The tile size for the tile.
     *
     * @default 256
     */
    tileSize?: number;

    /**
     * Whether to disable the cache for the tile.
     *
     * @default false
     */
    disableCache?: boolean;

    /**
     * Whether to enable debug mode for the tile.
     *
     * @default false
     */
    debug?: boolean;

    children?: Snippet<[{ tiles: any[] }]>;
  };
</script>

<script lang="ts">
  // @ts-expect-error
  import { tile as d3Tile } from 'd3-tile';

  import { getRenderContext } from './Chart.svelte';
  import { getCanvasContext } from './layout/Canvas.svelte';
  import Group from './Group.svelte';
  import TileImage from './TileImage.svelte';
  import { getChartContext } from './Chart-Next.svelte';
  import { getGeoContext } from './GeoContext.svelte';

  let {
    url,
    zoomDelta = 0,
    tileSize = 256,
    disableCache = false,
    debug = false,
    children,
  }: GeoTilePropsWithoutHTML = $props();

  const ctx = getChartContext();
  const geoCtx = getGeoContext();
  const renderCtx = getRenderContext();
  const canvasCtx = getCanvasContext();

  const center = $derived(geoCtx.projection?.([0, 0]) ?? [0, 0]);

  const tile = $derived(
    d3Tile()
      .size([ctx.containerWidth, ctx.containerHeight])
      .translate([center[0] + ctx.padding.left, center[1] + ctx.padding.top])
      // TODO: is this fine to add the 0 as a default?
      .scale(geoCtx.projection?.scale() ?? 0 * 2 * Math.PI)
      .tileSize(tileSize)
      .zoomDelta(zoomDelta)
  );

  const tiles = $derived(tile());

  const translate = $derived(tiles.translate);
  const scale = $derived(tiles.scale);

  function render(ctx: CanvasRenderingContext2D) {
    tiles.forEach(([x, y, z]: number[]) => {
      const image = new Image();
      image.onload = () => {
        ctx.drawImage(image, (x + translate[0]) * scale, (y + translate[1]) * scale, scale, scale);
      };
      image.src = url(x, y, z);
    });
  }

  $effect(() => {
    if (renderCtx !== 'canvas') return;
    tile;
    canvasCtx.invalidate();
  });

  $effect(() => {
    if (renderCtx !== 'canvas') return;
    return canvasCtx.register({
      name: 'GeoTile',
      render,
    });
  });
</script>

{#if renderCtx === 'svg' && url}
  {#if children}
    {@render children({ tiles })}
  {:else}
    <Group x={-ctx.padding.left} y={-ctx.padding.top}>
      {#each tiles as [x, y, z] (url(x, y, z))}
        <TileImage
          {url}
          {x}
          {y}
          {z}
          tx={translate[0]}
          ty={translate[1]}
          {scale}
          {disableCache}
          {debug}
        />
      {/each}
    </Group>
  {/if}
{/if}
