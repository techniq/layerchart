<script lang="ts" module>
  import {
    pack as d3Pack,
    type HierarchyCircularNode,
    type HierarchyNode,
    type PackLayout,
  } from 'd3-hierarchy';
  import type { Snippet } from 'svelte';

  export type PackProps<T> = {
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

    /**
     * The hierarchy data to be packed.
     */
    hierarchy: HierarchyNode<T>;

    children?: Snippet<[{ nodes: HierarchyCircularNode<T>[] }]>;
  };
</script>

<script lang="ts" generics="T">
  import { getChartContext } from './Chart.svelte';

  const ctx = getChartContext();

  let { size, padding, children, hierarchy }: PackProps<T> = $props();

  const pack = $derived.by(() => {
    const _pack = d3Pack<T>().size(size ?? [ctx.width, ctx.height]);
    if (padding) {
      _pack.padding(padding);
    }
    return _pack;
  });

  const packData = $derived(pack(hierarchy));
</script>

{@render children?.({ nodes: packData.descendants() })}
