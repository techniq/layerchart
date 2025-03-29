<script lang="ts" module>
  import { pack as d3Pack, type HierarchyCircularNode, type HierarchyNode } from 'd3-hierarchy';
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
    hierarchy?: HierarchyNode<T>;

    children?: Snippet<[{ nodes: HierarchyCircularNode<T>[] }]>;
  };
</script>

<script lang="ts" generics="T">
  import { getChartContext } from './Chart.svelte';

  const ctx = getChartContext();

  let { size, padding, children, hierarchy: hierarchyProp }: PackProps<T> = $props();

  const packedData = $derived.by(() => {
    const h = hierarchyProp?.copy();
    if (!h) return [];
    const _pack = d3Pack<T>().size(size ?? [ctx.width, ctx.height]);
    if (padding) {
      _pack.padding(padding);
    }
    if (hierarchyProp) {
      hierarchyProp = _pack(hierarchyProp);
    }
    return _pack(h).descendants();
  });

  $effect(() => {
    console.log('packedData', packedData);
  });
</script>

{@render children?.({
  nodes: packedData,
})}
