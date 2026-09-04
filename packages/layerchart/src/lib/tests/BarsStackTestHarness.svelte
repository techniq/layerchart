<script lang="ts">
  import Chart from '$lib/components/Chart/Chart.svelte';
  import Layer from '$lib/components/layers/Layer.svelte';
  import Bars from '$lib/components/Bars/Bars.svelte';

  // `Bars` renders a `children` snippet in place of its bars when given one, so the shared
  // `TestHarness` (which always passes one) can't be used to exercise them
  let { chartProps = {}, barsProps = {} }: { chartProps?: any; barsProps?: any } = $props();
</script>

<Chart {...chartProps}>
  <Layer>
    <Bars {...barsProps} />
  </Layer>
</Chart>
