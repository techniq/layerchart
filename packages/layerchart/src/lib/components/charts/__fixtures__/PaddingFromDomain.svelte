<script lang="ts">
  /**
   * Sizes `padding` from the bound context's `yDomain` — the domain must not depend on the plot
   * size (and so on padding) unless a domain transform is in play.
   */
  import type { Component } from 'svelte';
  import type { ChartState } from '$lib/states/chart.svelte.js';

  let {
    component,
    onbind,
    ...props
  }: { component: Component<any>; onbind: (context: ChartState | undefined) => void } & Record<
    string,
    any
  > = $props();

  const Chart = $derived(component);

  let context = $state<ChartState>();
  const padding = $derived({
    top: 8,
    right: 8,
    bottom: 24,
    left: String(context?.yDomain?.[1] ?? 0).length * 8 + 16,
  });

  $effect(() => {
    onbind(context);
  });
</script>

<Chart bind:context {padding} {...props} />
