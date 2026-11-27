<script lang="ts">
  import type { ComponentProps } from 'svelte';
  import type { ChartState } from 'layerchart';
  import { Chart, GeoRaster, Grid, Raster, WebGL } from '../../index.js';
  import type { SceneState } from '../../contexts/scene.svelte.js';
  import Probe from './Probe.svelte';

  let {
    mark,
    chart,
    grid,
    raster,
    georaster,
    onScene,
  }: {
    mark: 'grid' | 'raster' | 'georaster';
    chart: Partial<ComponentProps<typeof Chart>>;
    grid?: ComponentProps<typeof Grid>;
    raster?: ComponentProps<typeof Raster>;
    georaster?: ComponentProps<typeof GeoRaster>;
    onScene: (scene: SceneState, chart: ChartState<any>) => void;
  } = $props();
</script>

<!-- The marks `Marks.svelte` has no case for, as `parity-scales.svelte.test.ts` draws them -->
<div style="width: 400px; height: 300px; pointer-events: none;">
  <Chart {...chart as any}>
    <WebGL>
      {#if mark === 'grid'}
        <Grid {...grid} />
      {:else if mark === 'raster'}
        <Raster {...raster} />
      {:else if mark === 'georaster' && georaster}
        <GeoRaster {...georaster} />
      {/if}
      <Probe {onScene} />
    </WebGL>
  </Chart>
</div>
