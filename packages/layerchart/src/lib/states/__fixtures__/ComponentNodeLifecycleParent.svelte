<script lang="ts">
  import type { Snippet } from 'svelte';

  import { getChartContext } from '$lib/contexts/chart.js';
  import type { ComponentNode } from '$lib/states/chart.svelte.js';

  let {
    onparentnode,
    children,
  }: {
    onparentnode?: (node: ComponentNode) => void;
    children?: Snippet;
  } = $props();

  const ctx = getChartContext();
  const node = ctx.registerComponent({
    name: 'ComponentNodeLifecycleParent',
    kind: 'group',
  });

  $effect(() => {
    onparentnode?.(node);
  });
</script>

{@render children?.()}
