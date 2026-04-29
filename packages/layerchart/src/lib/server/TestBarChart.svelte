<script lang="ts">
  import { scaleBand } from 'd3-scale';
  import ServerChart from './ServerChart.svelte';
  import type { CaptureTarget } from './captureStore.js';
  import Bars from '$lib/components/Bars/Bars.svelte';

  let {
    data,
    width,
    height,
    capture,
    onCapture,
  }: {
    data: { category: string; value: number }[];
    width: number;
    height: number;
    capture?: CaptureTarget;
    onCapture?: (data: CaptureTarget) => void;
  } = $props();
</script>

<ServerChart
  {capture}
  {onCapture}
  {width}
  {height}
  {data}
  x="category"
  xScale={scaleBand().paddingInner(0.2).paddingOuter(0.1)}
  y="value"
  yDomain={[0, null]}
  padding={{ top: 20, right: 20, bottom: 30, left: 40 }}
>
  <Bars fill="rgb(59, 130, 246)" radius={4} />
</ServerChart>
