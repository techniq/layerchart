<script lang="ts">
  import ArcChart from '../ArcChart.svelte';

  const data = [
    { browser: 'other', visitors: 90, color: 'gray' },
    { browser: 'edge', visitors: 173, color: 'green' },
    { browser: 'firefox', visitors: 187, color: 'orange' },
    { browser: 'safari', visitors: 200, color: 'blue' },
    { browser: 'chrome', visitors: 275, color: 'red' },
  ];

  const series = data.map((datum) => ({
    key: datum.browser,
    label: datum.browser,
    color: datum.color,
    data: [datum],
  }));
</script>

<ArcChart
  {data}
  label="browser"
  value="visitors"
  innerRadius={40}
  outerRadius={70}
  height={240}
  width={240}
  {series}
>
  {#snippet tooltip({ context })}
    {@const visibleSeries = context.tooltip.series.filter((series) => series.value !== undefined)}
    <div class="arc-chart-tooltip">
      {#each visibleSeries as series (series.key)}
        <span class="arc-chart-tooltip-label">{series.label}</span>
        <span class="arc-chart-tooltip-value">{series.value}</span>
      {/each}
    </div>
  {/snippet}
</ArcChart>
