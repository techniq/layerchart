<script lang="ts" module>
  import type { ComponentProps, Snippet } from 'svelte';

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
     * Additional props to apply to the `Group` component.
     */
    group?: Partial<ComponentProps<typeof Group>>;

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

  import { getChartContext } from '$lib/contexts/chart.js';
  import { getLayerContext } from '$lib/contexts/layer.js';
  import { registerCanvasComponent } from './layout/Canvas.svelte';
  import Group from './Group.svelte';
  import TileImage from './TileImage.svelte';
  import { getGeoContext } from './GeoContext.svelte';
  import { extractLayerProps } from '$lib/utils/attributes.js';

  let {
    url,
    zoomDelta = 0,
    tileSize = 256,
    disableCache = false,
    debug = false,
    group,
    children,
  }: GeoTilePropsWithoutHTML = $props();

  const ctx = getChartContext();
  const geoCtx = getGeoContext();
  const layerCtx = getLayerContext();

  const center = $derived(geoCtx.projection?.([0, 0]) ?? [0, 0]);

  const tiles = $derived(
    d3Tile()
      .size([ctx.containerWidth, ctx.containerHeight])
      .translate([center[0] + ctx.padding.left, center[1] + ctx.padding.top])
      // TODO: is this fine to add the 0 as a default?
      .scale(geoCtx.projection ? geoCtx.projection.scale() * 2 * Math.PI : undefined)
      .tileSize(tileSize)
      .zoomDelta(zoomDelta)()
  );

  const translate = $derived(tiles.translate);
  const scale = $derived(tiles.scale);

  function render(ctx: CanvasRenderingContext2D) {
    for (const [x, y, z] of tiles) {
      const image = new Image();
      image.onload = () => {
        ctx.drawImage(image, (x + translate[0]) * scale, (y + translate[1]) * scale, scale, scale);
      };
      image.src = url(x, y, z);
    }
  }

  if (layerCtx === 'canvas') {
    registerCanvasComponent({
      name: 'GeoTile',
      render,
      deps: () => [tiles],
    });
  }
</script>

{#if layerCtx === 'svg' && url}
  {#if children}
    {@render children({ tiles })}
  {:else}
    <Group
      x={-ctx.padding.left}
      y={-ctx.padding.top}
      {...extractLayerProps(group, 'lc-geo-tile-group')}
    >
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
