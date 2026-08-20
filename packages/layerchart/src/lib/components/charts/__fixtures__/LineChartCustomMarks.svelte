<script lang="ts">
  /**
   * A chart drawing its series by hand: the `marks` snippet replaces the default splines, so
   * nothing inside registers as a mark.  Exposes the resolved context for assertions.
   */
  import type { Component } from 'svelte';
  import LineChart from '../LineChart/LineChart.svelte';

  let {
    component = LineChart as unknown as Component<any>,
    oncontext,
    ...props
  }: Record<string, any> = $props();

  const Chart = $derived(component);

  let context = $state<any>();

  $effect(() => {
    if (context) oncontext?.(context);
  });
</script>

<Chart bind:context {...props}>
  {#snippet marks()}
    <!-- deliberately empty: the series are drawn elsewhere -->
  {/snippet}
</Chart>
