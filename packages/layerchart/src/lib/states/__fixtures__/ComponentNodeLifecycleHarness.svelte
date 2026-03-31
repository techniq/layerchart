<script lang="ts">
  import Chart from '$lib/components/Chart.svelte';
  import Layer from '$lib/components/layers/Layer.svelte';
  import type { ChartState, ComponentNode } from '$lib/states/chart.svelte.js';

  import ComponentNodeLifecycleChild from './ComponentNodeLifecycleChild.svelte';
  import ComponentNodeLifecycleParent from './ComponentNodeLifecycleParent.svelte';

  let {
    oncontext,
    onparentnode,
  }: {
    oncontext?: (ctx: ChartState<any, any, any>) => void;
    onparentnode?: (node: ComponentNode) => void;
  } = $props();

  let chartContext = $state<ChartState<any, any, any>>();
  let showChild = $state(true);

  $effect(() => {
    if (chartContext) {
      oncontext?.(chartContext);
    }
  });

  function toggleChild() {
    showChild = !showChild;
  }
</script>

<button type="button" data-testid="toggle-child" onclick={toggleChild}>toggle</button>

<Chart
  data={[{ date: '2024-01', value: 10 }]}
  x="date"
  y="value"
  width={300}
  height={300}
  bind:context={chartContext}
>
  <Layer type="html">
    <ComponentNodeLifecycleParent {onparentnode}>
      {#if showChild}
        <ComponentNodeLifecycleChild />
      {/if}
    </ComponentNodeLifecycleParent>
  </Layer>
</Chart>
