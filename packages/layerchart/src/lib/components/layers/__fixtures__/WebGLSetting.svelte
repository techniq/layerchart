<script lang="ts">
  import { setSettings } from '$lib/contexts/settings.js';
  import Chart from '$lib/components/Chart/Chart.svelte';
  import Layer from '../Layer.svelte';
  import Points from '$lib/components/Points/Points.svelte';

  /** `children`: a `<Layer>` with no `type`; `props`: a chart drawn from its props (`ChartChildren`) */
  let { mode }: { mode: 'children' | 'props' } = $props();

  setSettings({ layer: 'webgl' });

  const data = [
    { x: 0, y: 0 },
    { x: 1, y: 2 },
  ];
</script>

<div style="width: 400px; height: 200px; pointer-events: none;">
  {#if mode === 'children'}
    <Chart {data} x="x" y="y">
      <Layer>
        <Points />
      </Layer>
    </Chart>
  {:else}
    <Chart {data} x="x" y="y" points />
  {/if}
</div>
