<script lang="ts">
  import type { ComponentProps } from 'svelte';
  import type { ChartState } from 'layerchart';
  import { Chart, GeoPath, Light, Points, Scene, Spline, Surface } from '../../index.js';
  import type { SceneState } from '../../contexts/scene.svelte.js';
  import Probe from './Probe.svelte';

  let {
    mark,
    chart,
    scene: sceneProps,
    points,
    spline,
    surface,
    geopath,
    offset = 0,
    onScene,
  }: {
    mark: 'points' | 'spline' | 'surface' | 'geopath' | 'light';
    chart: Partial<ComponentProps<typeof Chart>>;
    scene?: Partial<ComponentProps<typeof Scene>>;
    points?: ComponentProps<typeof Points>;
    spline?: ComponentProps<typeof Spline>;
    surface?: ComponentProps<typeof Surface>;
    geopath?: ComponentProps<typeof GeoPath>;
    /** Pixels down the page to put the chart, to test it off screen */
    offset?: number;
    onScene: (scene: SceneState, chart: ChartState<any>) => void;
  } = $props();
</script>

<div style="width: 400px; height: 300px; margin-top: {offset}px">
  <Chart {...chart as any}>
    <Scene {...sceneProps}>
      {#if mark === 'points'}
        <Points {...points} />
      {:else if mark === 'spline'}
        <Spline {...spline} />
      {:else if mark === 'surface'}
        <Surface {...surface} />
      {:else if mark === 'geopath'}
        <GeoPath {...geopath!} />
      {:else if mark === 'light'}
        <Light shadow />
        <Points />
      {/if}
      <Probe {onScene} />
    </Scene>
  </Chart>
</div>
