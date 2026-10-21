<script lang="ts">
  /** A 200px square plot of `[0, 100]` on both axes, so data units are half a pixel */
  import Chart from '../../Chart/Chart.svelte';
  import Layer from '../../layers/Layer.svelte';
  import Bin from '../Bin.svelte';

  let { data, layer = 'svg', ...props }: Record<string, any> = $props();
</script>

<Chart {data} x="x" y="y" xDomain={[0, 100]} yDomain={[0, 100]} width={200} height={200}>
  <Layer type={layer}>
    <Bin {...props} />
  </Layer>
</Chart>
