<script lang="ts">
  import type { ComponentProps } from 'svelte';
  import type { ChartState } from 'layerchart';
  import { Axis, Chart, Grid, Group, WebGL } from '../../index.js';
  import type { SceneState } from '../../contexts/scene.svelte.js';
  import Probe from './Probe.svelte';

  let {
    chart,
    axes = [],
    grid,
    center = false,
    onScene,
  }: {
    chart: Partial<ComponentProps<typeof Chart>>;
    axes?: ComponentProps<typeof Axis>[];
    grid?: ComponentProps<typeof Grid>;
    /** In a `Group` about the plot's center, as a `Layer center` places a `radial` chart's marks */
    center?: boolean;
    onScene: (scene: SceneState, chart: ChartState<any>) => void;
  } = $props();
</script>

{#snippet marks()}
  {#each axes as axis, i (i)}
    <Axis {...axis} />
  {/each}
  {#if grid}
    <Grid {...grid} />
  {/if}
{/snippet}

<!-- Axes and a grid in a scene, as `parity-axis-2.svelte.test.ts` draws them -->
<div style="width: 400px; height: 300px; pointer-events: none;">
  <Chart {...chart as any}>
    <WebGL>
      {#if center}
        <Group center>{@render marks()}</Group>
      {:else}
        {@render marks()}
      {/if}
      <Probe {onScene} />
    </WebGL>
  </Chart>
</div>
