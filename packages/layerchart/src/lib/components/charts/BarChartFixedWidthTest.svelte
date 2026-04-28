<script lang="ts">
  import { scaleBand } from 'd3-scale';
  import Chart from "../Chart/Chart.svelte";
  import Layer from '../layers/Layer.svelte';
  import Bars from '../Bars.svelte';

  let {
    data,
    x,
    y,
    orientation = 'vertical',
    barWidth,
    barHeight,
  }: {
    data: any[];
    x: string;
    y: string;
    orientation?: 'horizontal' | 'vertical';
    barWidth?: number;
    barHeight?: number;
  } = $props();

  const valueAxis = $derived(orientation === 'horizontal' ? 'x' : 'y');

  const xScale = $derived(valueAxis === 'y' ? scaleBand().padding(0.4) : undefined);
  const yScale = $derived(valueAxis === 'x' ? scaleBand().padding(0.4) : undefined);
</script>

<Chart
  {data}
  {x}
  {y}
  {xScale}
  {yScale}
  {valueAxis}
  xBaseline={valueAxis === 'x' ? 0 : undefined}
  yBaseline={valueAxis === 'y' ? 0 : undefined}
  yDomain={valueAxis === 'y' ? [0, null] : undefined}
  xDomain={valueAxis === 'x' ? [0, null] : undefined}
  yNice={valueAxis === 'y'}
  xNice={valueAxis === 'x'}
  height={300}
>
  <Layer>
    <Bars width={barWidth} height={barHeight} />
  </Layer>
</Chart>
