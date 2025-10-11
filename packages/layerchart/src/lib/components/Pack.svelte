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
    hierarchy: HierarchyNode<T>;

    /**
     * A bindable reference to the computed packed nodes.
     *
     * @bindable
     */
    nodes?: HierarchyCircularNode<T>[];

    children?: Snippet<[{ nodes: HierarchyCircularNode<T>[] }]>;
  };
</script>

<script lang="ts" generics="T">
  import { getChartContext } from '$lib/contexts/chart.js';

  const ctx = getChartContext();

  let {
    size,
    padding,
    children,
    hierarchy: hierarchyProp,
    nodes = $bindable(),
  }: PackProps<T> = $props();

  const packedData = $derived.by(() => {
    const h = hierarchyProp.copy();
    const _pack = d3Pack<T>().size(size ?? [ctx.width, ctx.height]);
    if (padding) {
      _pack.padding(padding);
    }
    return _pack(h).descendants();
  });

  $effect.pre(() => {
    nodes = packedData;
  });
</script>

{@render children?.({
  nodes: packedData,
})}
