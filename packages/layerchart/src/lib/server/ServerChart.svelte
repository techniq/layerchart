<script lang="ts">
  import type { Snippet } from 'svelte';
  import Chart from '$lib/components/Chart/Chart.svelte';
  import type { ChartProps } from '$lib/components/Chart/Chart.svelte';
  import Canvas from '$lib/components/layers/Canvas.svelte';
  import type { CaptureTarget } from './captureStore.js';

  let {
    children,
    capture,
    onCapture,
    ...chartProps
  }: {
    children?: Snippet;
    capture?: CaptureTarget;
    onCapture?: (data: CaptureTarget) => void;
  } & Omit<ChartProps<any>, 'children'> = $props();
</script>

<Chart ssr={true} {...chartProps}>
  <Canvas ssrCapture={capture} ssrCaptureCallback={onCapture}>
    {#if children}
      {@render children()}
    {/if}
  </Canvas>
</Chart>
