<script lang="ts">
  import BarChart from '$lib/components/charts/BarChart/BarChart.svelte';
  import * as Tooltip from '$lib/components/tooltip/index.js';

  const data = [
    { year: '2019', apples: 10, bananas: 20, cherries: 30 },
    { year: '2020', apples: 40, bananas: 50, cherries: 60 },
  ];
</script>

<BarChart
  {data}
  x="year"
  series={[
    { key: 'apples', label: 'Apples', color: 'red' },
    { key: 'bananas', color: 'yellow' },
    { key: 'cherries', color: 'pink', selected: false },
  ]}
  seriesLayout="group"
  width={400}
  height={300}
>
  {#snippet tooltip({ context })}
    <Tooltip.Root {context} portal={false}>
      {#snippet children({ data })}
        <Tooltip.List>
          <Tooltip.Item seriesKey="apples" />
          <Tooltip.Item seriesKey="bananas" value={data.bananas * 2} label="Doubled" />
          <Tooltip.Item seriesKey="cherries" />
        </Tooltip.List>
      {/snippet}
    </Tooltip.Root>
  {/snippet}
</BarChart>
