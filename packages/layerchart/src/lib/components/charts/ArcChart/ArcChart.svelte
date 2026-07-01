<script lang="ts" module>
  export type { ArcChartProps } from './ArcChart.shared.svelte.js';
</script>

<script lang="ts" generics="TData">
  import ArcChartBase from './ArcChart.base.svelte';
  import Chart from '../../Chart/Chart.svelte';
  import Arc from '../../Arc/Arc.svelte';
  import ArcLabel from '../../ArcLabel/ArcLabel.svelte';
  import Group from '../../Group/Group.svelte';
  import type { ArcChartProps } from './ArcChart.shared.svelte.js';

  let { context = $bindable(), ...props }: ArcChartProps<TData> = $props();
</script>

<ArcChartBase {Chart} {Arc} {ArcLabel} {Group} bind:context {...props} />
