<script lang="ts">
  import type { Snippet } from 'svelte';
  import Chart from '$lib/components/Chart.svelte';
  import type { ChartProps } from '$lib/components/Chart.svelte';
  import Canvas from '$lib/components/layers/Canvas.svelte';
  import type { CaptureTarget } from './captureStore.js';

  let {
    children,
    capture,
    _onCapture,
    ...chartProps
  }: {
    children?: Snippet;
    capture?: CaptureTarget;
    /** @internal Callback used by server-side render helpers to capture chart state during SSR. */
    _onCapture?: (data: CaptureTarget) => void;
  } & Omit<ChartProps<any>, 'children'> = $props();
</script>

<Chart ssr={true} {...chartProps}>
  <Canvas ssrCapture={capture} ssrCaptureCallback={_onCapture}>
    {#if children}
      {@render children()}
    {/if}
  </Canvas>
</Chart>
