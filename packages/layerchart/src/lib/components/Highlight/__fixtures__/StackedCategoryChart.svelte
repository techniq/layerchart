<script lang="ts">
  /**
   * A chart whose `data` is nested — a `stack()`, one array per key — with the rows it was built
   * from passed as `flatData`, and coloured by `c` rather than by declared `series`.
   *
   * The shape `Highlight` has to resolve points for without handing the chart's accessors a
   * series where they expect a row, and where a category's value is a span rather than a point.
   */
  import { stack } from 'd3-shape';

  import Chart from '../../Chart/Chart.svelte';
  import Layer from '../../layers/Layer.svelte';
  import Area from '../../Area/Area.svelte';
  import Highlight from '../Highlight.svelte';

  let { data, keys, ...props }: Record<string, any> = $props();

  const series = $derived(stack().keys(keys)(data) as any[]);
  const rows = $derived(series.flat());
</script>

<Chart
  data={series}
  flatData={rows}
  x={(d: any) => d.data.date}
  y={[0, 1]}
  c="key"
  cDomain={keys}
  cRange={['rgb(1, 1, 1)', 'rgb(2, 2, 2)']}
  tooltipContext={{ mode: 'quadtree-x' }}
  {...props}
>
  <Layer>
    {#each series as seriesData (seriesData.key)}
      <Area data={seriesData} />
    {/each}
    <Highlight points />
  </Layer>
</Chart>
