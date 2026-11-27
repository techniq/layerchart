<script lang="ts" module>
  export type { AreaChartProps } from 'layerchart';
</script>

<script lang="ts" generics="TData">
  import { AreaChartBase } from 'layerchart/base';
  import type { AreaChartProps } from 'layerchart';
  import Chart from '../Chart/Chart.svelte';
  import Area from '../Area/Area.svelte';

  let { ref = $bindable(), context = $bindable(), ...props }: AreaChartProps<TData> = $props();
</script>

<!-- LayerChart's `AreaChart`, drawn with the marks here in whichever layer it's in -->
<AreaChartBase {Chart} {Area} bind:ref bind:context {...props} />
