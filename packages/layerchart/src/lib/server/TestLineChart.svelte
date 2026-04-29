<script lang="ts">
  import ServerChart from './ServerChart.svelte';
  import type { CaptureTarget } from './captureStore.js';
  import Area from '$lib/components/Area/Area.svelte';
  import Spline from '$lib/components/Spline/Spline.svelte';

  let {
    data,
    width,
    height,
    capture,
    onCapture,
  }: {
    data: { date: number; value: number }[];
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
  x="date"
  y="value"
  yDomain={[0, null]}
  padding={{ top: 20, right: 20, bottom: 20, left: 20 }}
>
  <Area fill="rgba(59, 130, 246, 0.15)" stroke="none" />
  <Spline stroke="rgb(59, 130, 246)" strokeWidth={2} />
</ServerChart>
