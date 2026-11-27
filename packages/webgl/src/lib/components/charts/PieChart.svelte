<script lang="ts" module>
  export type { PieChartProps } from 'layerchart';
</script>

<script lang="ts" generics="TData">
  import { PieChartBase } from 'layerchart/base';
  import type { PieChartProps } from 'layerchart';
  import Chart from '../Chart/Chart.svelte';
  import Arc from '../Arc/Arc.svelte';
  import ArcLabel from '../ArcLabel/ArcLabel.svelte';
  import Group from '../Group/Group.svelte';
  import Pie from '../Pie/Pie.svelte';

  let { ref = $bindable(), context = $bindable(), ...props }: PieChartProps<TData> = $props();
</script>

<!-- LayerChart's `PieChart`, drawn with the marks here in whichever layer it's in -->
<PieChartBase {Chart} {Arc} {ArcLabel} {Group} {Pie} bind:ref bind:context {...props} />
