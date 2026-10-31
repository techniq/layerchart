<script lang="ts">
  import type { ComponentProps } from 'svelte';
  import { Chart, Points, Scene, Spline } from '../../index.js';
  import type { SceneState } from '../../contexts/scene.svelte.js';
  import Probe from './Probe.svelte';

  let {
    mark,
    chart,
    points,
    spline,
    onScene,
  }: {
    mark: 'points' | 'spline';
    chart: Partial<ComponentProps<typeof Chart>>;
    points?: ComponentProps<typeof Points>;
    spline?: ComponentProps<typeof Spline>;
    onScene: (scene: SceneState) => void;
  } = $props();
</script>

<div style="width: 400px; height: 300px">
  <Chart {...chart as any}>
    <Scene controls={false}>
      {#if mark === 'points'}
        <Points {...points} />
      {:else}
        <Spline {...spline} />
      {/if}
      <Probe {onScene} />
    </Scene>
  </Chart>
</div>
