<script lang="ts" module>
  import type { Component } from 'svelte';
  import type { GeoTilePropsWithoutHTML } from './GeoTile.shared.svelte.js';

  export type GeoTileBaseLayerComponents = {
    Group: Component<any>;
    TileImage: Component<any>;
  };

  export type GeoTileBaseProps = GeoTilePropsWithoutHTML & GeoTileBaseLayerComponents;
</script>

<script lang="ts">
  // @ts-expect-error
  import { tile as d3Tile } from 'd3-tile';

  import { getChartContext } from '$lib/contexts/chart.js';
  import { getGeoContext } from '$lib/contexts/geo.js';
  import { getLayerContext } from '$lib/contexts/layer.js';
  import { extractLayerProps } from '$lib/utils/attributes.js';
  import {
    loadedAncestor,
    loadedTiles,
    loadTileWithAncestor,
  } from '../TileImage/TileImage.shared.svelte.js';

  let {
    Group,
    TileImage,
    url,
    zoomDelta = 0,
    tileSize = 256,
    disableCache = false,
    debug = false,
    group,
    children,
  }: GeoTileBaseProps = $props();

  const ctx = getChartContext();
  const geo = getGeoContext();
  const layerCtx = getLayerContext();

  const center = $derived(geo.projection?.([0, 0]) ?? [0, 0]);

  const tiles = $derived(
    d3Tile()
      .size([ctx.containerWidth, ctx.containerHeight])
      .translate([center[0] + ctx.padding.left, center[1] + ctx.padding.top])
      .scale(geo.projection ? geo.projection.scale() * 2 * Math.PI : undefined)
      .tileSize(tileSize)
      .zoomDelta(zoomDelta)()
  );

  const translate = $derived(tiles.translate);
  const scale = $derived(tiles.scale);

  /** Bumped as tiles arrive, to draw the canvas again */
  let arrived = $state(0);
  /** Tiles asked for and not yet arrived */
  const awaiting = new Set<string>();

  function render(ctx: CanvasRenderingContext2D) {
    for (const [x, y, z] of tiles) {
      const dx = (x + translate[0]) * scale;
      const dy = (y + translate[1]) * scale;
      if (disableCache) {
        const image = new Image();
        image.onload = () => ctx.drawImage(image, dx, dy, scale, scale);
        image.src = url(x, y, z);
        continue;
      }
      const key = url(x, y, z);
      const own = loadedTiles.get(key);
      if (own) {
        ctx.drawImage(own.image, dx, dy, scale, scale);
        continue;
      }
      if (!awaiting.has(key)) {
        awaiting.add(key);
        loadTileWithAncestor(url, x, y, z)
          .then(
            () => arrived++,
            () => {}
          )
          .finally(() => awaiting.delete(key));
      }
      // While its own loads, part of its nearest ancestor already loaded, enlarged
      const standIn = loadedAncestor(url, x, y, z);
      if (standIn) {
        const { image } = standIn.tile;
        const w = image.naturalWidth;
        const h = image.naturalHeight;
        ctx.drawImage(
          image,
          standIn.u0 * w,
          standIn.v0 * h,
          standIn.size * w,
          standIn.size * h,
          dx,
          dy,
          scale,
          scale
        );
      }
    }
  }

  if (layerCtx === 'canvas') {
    ctx.registerComponent({
      name: 'GeoTile',
      kind: 'mark',
      canvasRender: {
        render,
        deps: () => [tiles, arrived],
      },
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
