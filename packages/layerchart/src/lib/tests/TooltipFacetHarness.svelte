<script lang="ts">
  import LineChart from '$lib/components/charts/LineChart/LineChart.svelte';
  import * as Tooltip from '$lib/components/tooltip/index.js';

  let { data }: { data: any[] } = $props();
</script>

<!-- One tooltip per panel, each beside its own point -->
<LineChart
  {data}
  x="date"
  y="value"
  fx="region"
  width={400}
  height={300}
  tooltipContext={{ mode: 'bisect-x' }}
>
  {#snippet tooltip()}
    <Tooltip.Root facetAll>
      {#snippet children({ data })}
        {data.region}: {data.value}
      {/snippet}
    </Tooltip.Root>
  {/snippet}
</LineChart>
