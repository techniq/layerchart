<script lang="ts">
  import type { ComponentProps } from 'svelte';
  import type { ChartState } from 'layerchart';
  import { Chart, Points, Rule, WebGL } from '../../index.js';
  import type { SceneState } from '../../contexts/scene.svelte.js';
  import Probe from './Probe.svelte';

  /** A `Rule` and `Points` over the same rows, in either order, to see which covers which */
  let {
    order,
    chart,
    onScene,
  }: {
    order: 'rule-first' | 'points-first';
    chart: Partial<ComponentProps<typeof Chart>>;
    onScene: (scene: SceneState, chart: ChartState<any>) => void;
  } = $props();
</script>

<div style="width: 400px; height: 300px">
  <Chart {...chart as any}>
    <WebGL>
      {#if order === 'rule-first'}
        <Rule />
        <Points />
      {:else}
        <Points />
        <Rule />
      {/if}
      <Probe {onScene} />
    </WebGL>
  </Chart>
</div>
