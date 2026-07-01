<script lang="ts">
  import Chart from '../components/Chart/Chart.svelte';
  import Layer from '../components/layers/Layer.svelte';
  import GeoPath from '../components/geo/GeoPath/GeoPath.svelte';

  type Props = {
    features: any[];
    fitGeojson: any;
    projection: any;
    layer?: 'svg' | 'canvas';
    height?: number;
    width?: number;
  };

  let { features, fitGeojson, projection, layer = 'svg', height = 400, width }: Props = $props();
</script>

<Chart geo={{ projection, fitGeojson }} {width} {height}>
  <Layer type={layer}>
    {#each features as feature, i (i)}
      <GeoPath geojson={feature} class="fill-surface-content/10 stroke-surface-content/20" />
    {/each}
  </Layer>
</Chart>
