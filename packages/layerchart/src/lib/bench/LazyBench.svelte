<script lang="ts">
  import LineChart from '../components/charts/LineChart/LineChart.svelte';
  let { data, count, lazy }: { data: any[]; count: number; lazy: boolean } = $props();
</script>

{#each { length: count }, i (i)}
  <div style="height: 300px">
    <LineChart {data} x="date" y="value" {lazy} />
  </div>
{/each}
