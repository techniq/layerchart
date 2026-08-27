<script lang="ts">
  /**
   * The stacked-waffle shape, matching the docs example: declared `series`, a legend, a band
   * tooltip, and one `Waffle` per visible series.  `Waffle` registers a mark whose info tracks
   * its props, so this is the shape that shows whether the colour channel's read of the mark
   * registry settles or feeds back into itself.
   */
  import Chart from '../../Chart/Chart.svelte';
  import Waffle from '../Waffle.svelte';

  let { data, series, ...props }: Record<string, any> = $props();
</script>

<Chart
  {data}
  x="period"
  bandPadding={0.2}
  yNice
  yBaseline={0}
  {series}
  tooltipContext={{ mode: 'band' }}
  width={400}
  height={400}
  rule
  grid
  legend
  {...props}
>
  {#snippet marks({ context }: any)}
    {#each context.series.visibleSeries as s (s.key)}
      <Waffle seriesKey={s.key} unit={50} tooltip />
    {/each}
  {/snippet}
</Chart>
