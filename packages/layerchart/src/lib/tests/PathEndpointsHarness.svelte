<script lang="ts">
  import Chart from '$lib/components/Chart/Chart.svelte';
  import Layer from '$lib/components/layers/Layer.svelte';
  import Spline from '$lib/components/Spline/Spline.svelte';
  import type { PathProps } from '$lib/components/Path/Path.shared.svelte.js';

  let {
    data = [
      { x: 1, y: 10 },
      { x: 2, y: 30 },
      { x: 3, y: 20 },
    ],
    draw,
    motion,
  }: {
    data?: Array<{ x: number; y: number }>;
    draw?: PathProps['draw'];
    motion?: PathProps['motion'];
  } = $props();
</script>

<Chart
  {data}
  x="x"
  y="y"
  width={200}
  height={100}
  padding={{ top: 0, right: 0, bottom: 0, left: 0 }}
>
  <Layer>
    <Spline {draw} {motion}>
      {#snippet startContent()}
        <circle r={5} data-testid="start-dot" />
      {/snippet}
      {#snippet endContent()}
        <circle r={5} data-testid="end-dot" />
      {/snippet}
    </Spline>
  </Layer>
</Chart>
