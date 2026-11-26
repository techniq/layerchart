<script lang="ts">
  import type { ComponentProps } from 'svelte';
  import type { ChartState } from 'layerchart';
  import { Area, Chart, Spline, WebGL } from '../../index.js';
  import type { SceneState } from '../../contexts/scene.svelte.js';
  import Probe from './Probe.svelte';

  let {
    chart = {},
    spline,
    area,
    onScene,
  }: {
    chart?: Partial<ComponentProps<typeof Chart>>;
    spline?: ComponentProps<typeof Spline>;
    area?: ComponentProps<typeof Area>;
    onScene: (scene: SceneState, chart: ChartState<any>) => void;
  } = $props();
</script>

<div style="width: 400px; height: 300px; pointer-events: none">
  <Chart {...chart as any}>
    <WebGL>
      {#if area}
        <Area {...area} />
      {/if}
      {#if spline}
        <Spline {...spline} />
      {/if}
      <Probe {onScene} />
    </WebGL>
  </Chart>
</div>

<style>
  /* As the docs' Tailwind `stroke-2` and `[stroke-dasharray:4_4]` */
  :global(.test-wide) {
    stroke-width: 2px;
  }
  :global(.test-dashed) {
    stroke-dasharray: 4 4;
  }
</style>
