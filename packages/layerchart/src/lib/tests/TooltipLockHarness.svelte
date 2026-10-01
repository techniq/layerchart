<script lang="ts">
  import LineChart from '$lib/components/charts/LineChart/LineChart.svelte';

  let {
    data,
    locked = $bindable(false),
  }: {
    data: any[];
    locked?: boolean;
  } = $props();
</script>

<!-- Tap (click) on the chart pins its tooltip, and tapping again unpins it -->
<LineChart
  {data}
  x="date"
  y="value"
  width={400}
  height={300}
  tooltipContext={{ mode: 'bisect-x', locked, onclick: () => (locked = !locked) }}
/>
<span class="locked">{locked}</span>
