<script lang="ts">
  import { hierarchy } from 'd3-hierarchy';

  import Chart from '$lib/components/Chart/Chart.svelte';
  import Layer from '$lib/components/layers/Layer.svelte';
  import Treemap from '$lib/components/hierarchy/Treemap.svelte';

  let {
    data,
    chartProps = {},
    treemapProps = {},
  }: {
    data: any;
    chartProps?: Record<string, any>;
    treemapProps?: Record<string, any>;
  } = $props();

  const root = $derived(hierarchy(data).sum((d: any) => d.value));
</script>

<!-- Each node as an empty `<g>`, in the order `Treemap` hands them out -->
<Chart width={400} height={400} {...chartProps}>
  <Layer>
    <Treemap hierarchy={root} {...treemapProps}>
      {#snippet children({ nodes })}
        {#each nodes as node}
          <g class="treemap-node" data-name={node.data.name}></g>
        {/each}
      {/snippet}
    </Treemap>
  </Layer>
</Chart>
