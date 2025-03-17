<script lang="ts" module>
  import { pack as d3Pack, type HierarchyCircularNode } from 'd3-hierarchy';
  import type { Snippet } from 'svelte';

  export type PackProps = {
    /**
     * The size of the pack layout.
     */
    size?: [number, number];

    /**
     * The padding between nodes in the pack layout.
     *
     * @see https://github.com/d3/d3-hierarchy#pack_padding
     */
    padding?: number;

    children?: Snippet<[{ nodes: HierarchyCircularNode<unknown>[] }]>;
  };
</script>

<script lang="ts">
  import { getChartContext } from './Chart.svelte';

  const ctx = getChartContext();

  let { size, padding, children }: PackProps = $props();

  const pack = $derived.by(() => {
    const _pack = d3Pack().size(size ?? [ctx.width, ctx.height]);
    if (padding) {
      _pack.padding(padding);
    }
    return _pack;
  });

  // @ts-expect-error - TODO: Can we fix this?
  const packData = $derived(pack(ctx.data));
</script>

{@render children?.({ nodes: packData.descendants() })}
