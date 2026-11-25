<script lang="ts">
  /**
   * A 200px square plot (`[0, 100]` on both axes, so data units are half a pixel, y flipped), or a
   * geo chart with `projection`, whose `<Voronoi>` cells are handed to `oncells`
   */
  import Chart from '../../Chart/Chart.svelte';
  import Layer from '../../layers/Layer.svelte';
  import Voronoi from '../Voronoi.svelte';
  import type { VoronoiCell } from '../Voronoi.shared.svelte.js';

  let {
    data,
    projection,
    fitGeojson,
    oncells,
    ...props
  }: Record<string, any> & { oncells?: (cells: VoronoiCell[]) => void } = $props();
</script>

{#if projection}
  <Chart {data} x="x" y="y" geo={{ projection, fitGeojson }} width={200} height={200}>
    <Layer type="svg">
      <Voronoi {...props}>
        {#snippet children({ cells })}
          {oncells?.(cells)}
        {/snippet}
      </Voronoi>
    </Layer>
  </Chart>
{:else}
  <Chart {data} x="x" y="y" xDomain={[0, 100]} yDomain={[0, 100]} width={200} height={200}>
    <Layer type="svg">
      <Voronoi {...props}>
        {#snippet children({ cells })}
          {oncells?.(cells)}
        {/snippet}
      </Voronoi>
    </Layer>
  </Chart>
{/if}
