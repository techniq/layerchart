<script lang="ts">
  import Chart from '$lib/components/Chart/Chart.svelte';
  import Layer from '$lib/components/layers/Layer.svelte';
  import Area from '$lib/components/Area/Area.svelte';
  import type { ComponentProps } from 'svelte';
  import type { ChartState } from '../chart.svelte.js';

  let {
    count,
    x,
    motion,
    oncontext,
  }: {
    count: number;
    x: (d: { x: number; y: number }) => number;
    motion?: ComponentProps<typeof Chart>['motion'];
    oncontext?: (ctx: ChartState<any, any, any>) => void;
  } = $props();

  let show = $state(true);
  const series = $derived(
    Array.from({ length: count }, (_, i) => [
      { x: i, y: i },
      { x: i + 1, y: i + 1 },
    ])
  );
</script>

<button data-testid="toggle-marks" onclick={() => (show = !show)}>toggle</button>
<div style="width: 400px; height: 300px">
  <Chart {x} y="y" {motion} width={400} height={300}>
    {#snippet children({ context })}
      {oncontext?.(context)}
      <Layer>
        {#if show}
          {#each series as data, i (i)}
            <Area {data} />
          {/each}
        {/if}
      </Layer>
    {/snippet}
  </Chart>
</div>
