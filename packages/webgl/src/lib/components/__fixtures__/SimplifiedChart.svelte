<script lang="ts">
  import { setSettings } from 'layerchart';
  import { BarChart, LineChart, PieChart } from '../../index.js';

  let { chart }: { chart: 'bar' | 'line' | 'pie' } = $props();

  setSettings({ layer: 'webgl' });

  const data = [
    { x: 'a', y: 3 },
    { x: 'b', y: 5 },
    { x: 'c', y: 2 },
  ];
</script>

<div style="width: 400px; height: 300px">
  {#if chart === 'bar'}
    <BarChart {data} x="x" y="y" />
  {:else if chart === 'line'}
    <LineChart {data} x="x" y="y" />
  {:else}
    <PieChart {data} key="x" value="y" />
  {/if}
</div>
