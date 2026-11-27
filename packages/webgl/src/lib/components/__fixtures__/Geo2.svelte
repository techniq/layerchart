<script lang="ts">
  import type { ComponentProps } from 'svelte';
  import type { ChartState } from 'layerchart';
  import { Chart, Circle, GeoPath, GeoPoint, Hull, Points, Vector, WebGL } from '../../index.js';
  import type { SceneState } from '../../contexts/scene.svelte.js';
  import Probe from './Probe.svelte';

  let {
    mark,
    chart,
    geopoint,
    hull,
    geopath,
    vector,
    circle,
    points,
    onScene,
  }: {
    mark: 'geopoint' | 'geopoint-children' | 'hull' | 'geopath' | 'vector' | 'circle' | 'points';
    chart: Partial<ComponentProps<typeof Chart>>;
    geopoint?: ComponentProps<typeof GeoPoint>;
    hull?: ComponentProps<typeof Hull>;
    geopath?: ComponentProps<typeof GeoPath>;
    vector?: ComponentProps<typeof Vector>;
    circle?: ComponentProps<typeof Circle>;
    points?: ComponentProps<typeof Points>;
    onScene: (scene: SceneState, chart: ChartState<any>) => void;
  } = $props();
</script>

<div style="width: 400px; height: 300px">
  <Chart {...chart as any}>
    <WebGL>
      {#if mark === 'geopoint'}
        <GeoPoint {...geopoint!} />
      {:else if mark === 'geopoint-children'}
        <!-- Placed by the point, as in an `Svg` layer -->
        <GeoPoint {...geopoint!}>
          <Circle r={4} fill="red" />
        </GeoPoint>
      {:else if mark === 'hull'}
        <Hull {...hull} />
      {:else if mark === 'geopath'}
        <GeoPath {...geopath!} />
      {:else if mark === 'vector'}
        <Vector {...vector} />
      {:else if mark === 'circle'}
        <Circle {...circle} />
      {:else if mark === 'points'}
        <Points {...points} />
      {/if}
      <Probe {onScene} />
    </WebGL>
  </Chart>
</div>

<style>
  :global(.geo2-stroke-none) {
    stroke: none;
  }
  :global(.geo2-fill-red) {
    fill: rgb(255, 0, 0);
  }
  :global(.geo2-fill-blue) {
    fill: rgb(0, 0, 255);
  }
</style>
