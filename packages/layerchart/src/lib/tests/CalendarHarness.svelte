<script lang="ts">
  import Chart from '$lib/components/Chart/Chart.svelte';
  import Layer from '$lib/components/layers/Layer.svelte';
  import Calendar from '$lib/components/Calendar/Calendar.svelte';

  let {
    chartProps = {},
    calendarProps,
  }: { chartProps?: Record<string, any>; calendarProps: Record<string, any> } = $props();
</script>

<!-- `TestHarness` always passes `children`, which `Calendar` draws its cells with instead -->
<Chart {...chartProps} data-testid="test-lc-chart">
  <Layer center={false}>
    <Calendar start={calendarProps.start} end={calendarProps.end} {...calendarProps} />
  </Layer>
</Chart>
