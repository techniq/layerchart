<script lang="ts">
  import { untrack } from 'svelte';
  import LineChart from '../components/charts/LineChart/LineChart.svelte';
  import { setSettings } from '../contexts/settings.js';

  let {
    count = 20,
    lazy,
    settingsLazy,
  }: { count?: number; lazy?: boolean; settingsLazy?: boolean } = $props();

  // Settings are fixed for the life of the harness
  untrack(() => {
    if (settingsLazy !== undefined) setSettings({ lazy: settingsLazy });
  });

  const data = Array.from({ length: 10 }, (_, i) => ({ x: i, y: i * i }));
</script>

{#each { length: count }, i (i)}
  <div data-chart={i} style="height: 300px">
    <LineChart {data} x="x" y="y" {lazy}>
      {#snippet placeholder()}
        <div class="placeholder">Loading…</div>
      {/snippet}
    </LineChart>
  </div>
{/each}
