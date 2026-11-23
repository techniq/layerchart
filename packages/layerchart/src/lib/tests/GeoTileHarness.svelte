<script lang="ts">
  /** A `GeoTile` over a small area, in a layer of the given type */
  import { geoMercator } from 'd3-geo';
  import Chart from '$lib/components/Chart/Chart.svelte';
  import Layer from '$lib/components/layers/Layer.svelte';
  import GeoTile from '$lib/components/geo/GeoTile/GeoTile.svelte';

  let {
    url,
    zoomDelta = 0,
    layer = 'svg',
  }: {
    url: (x: number, y: number, z: number) => string;
    zoomDelta?: number;
    layer?: 'svg' | 'canvas';
  } = $props();

  const area = {
    type: 'Polygon' as const,
    coordinates: [
      [
        [-10, -10],
        [-10, 10],
        [10, 10],
        [10, -10],
        [-10, -10],
      ],
    ],
  };
</script>

<Chart geo={{ projection: geoMercator, fitGeojson: area }} width={400} height={300}>
  <Layer type={layer}>
    <!-- (`debug` outlines each tile, for the test to count them) -->
    <GeoTile {url} {zoomDelta} debug={layer === 'svg'} />
  </Layer>
</Chart>
