<script lang="ts" module>
  export type { ArcChartProps } from 'layerchart';
</script>

<script lang="ts" generics="TData">
  import { ArcChartBase } from 'layerchart/base';
  import type { ArcChartProps } from 'layerchart';
  import Chart from '../Chart/Chart.svelte';
  import Arc from '../Arc/Arc.svelte';
  import ArcLabel from '../ArcLabel/ArcLabel.svelte';
  import Group from '../Group/Group.svelte';

  let { ref = $bindable(), context = $bindable(), ...props }: ArcChartProps<TData> = $props();
</script>

<!-- LayerChart's `ArcChart`, drawn with the marks here in whichever layer it's in -->
<ArcChartBase {Chart} {Arc} {ArcLabel} {Group} bind:ref bind:context {...props} />
