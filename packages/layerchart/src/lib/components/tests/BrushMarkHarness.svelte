<script lang="ts">
  /** A `Brush` inside a layer, as an example composes it — the `Brush` component, not `BrushContext`. */
  import Chart from '../Chart/Chart.svelte';
  import Layer from '../layers/Layer.svelte';
  import Brush from '../Brush/Brush.svelte';
  import type { BrushState } from '$lib/states/brush.svelte.js';

  let {
    chartProps = {},
    brushProps = {},
    layer = 'svg',
    state = $bindable(),
  }: {
    chartProps?: Record<string, any>;
    brushProps?: Record<string, any>;
    layer?: 'svg' | 'html' | 'canvas';
    state?: BrushState;
  } = $props();

  const data = [
    { date: new Date('2024-01-01'), value: 10 },
    { date: new Date('2024-01-02'), value: 30 },
    { date: new Date('2024-01-03'), value: 20 },
  ];
</script>

<Chart {data} x="date" y="value" width={400} height={200} {...chartProps}>
  <Layer type={layer}>
    <Brush bind:state {...brushProps} />
  </Layer>
</Chart>
