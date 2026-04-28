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
    ctx.registerComponent({
      name: 'GeoTile',
      kind: 'mark',
      canvasRender: {
        render,
        deps: () => [tiles],
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
