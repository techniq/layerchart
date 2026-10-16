<script lang="ts">
  /**
   * Renders any simplified chart with a `marks` snippet that draws a single marker element, so
   * tests can assert the custom snippet (and not the default marks) was rendered.
   */
  import type { Component } from 'svelte';

  let { component, ...props }: { component: Component<any> } & Record<string, any> = $props();

  const Chart = $derived(component);
</script>

<Chart {...props}>
  {#snippet marks()}
    <g class="custom-marks"></g>
  {/snippet}
</Chart>
