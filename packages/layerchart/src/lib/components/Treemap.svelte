<script lang="ts" module>
  export type TreemapProps = {
    /**
     * The tile function to use for the treemap layout.
     *
     * @default treemapSquarify
     */
    tile?:
      | typeof treemapSquarify
      | 'binary'
      | 'squarify'
      | 'resquarify'
      | 'dice'
      | 'slice'
      | 'sliceDice';
    /**
     * The padding between nodes.
     *
     * @default 0
     */
    padding?: number;

    /**
     * The inner padding between nodes.
     *
     * @default 0
     */
    paddingInner?: number;

    /**
     * The outer padding between nodes.
     *
     * @default 0
     */
    paddingOuter?: number;

    /**
     * The top padding between nodes.
     *
     * @default 0
     */
    paddingTop?: number;

    /**
     * The bottom padding between nodes.
     *
     * @default 0
     */
    paddingBottom?: number;
    /**
     * The left padding between nodes.
     *
     */
    paddingLeft?: number;

    /**
     * The right padding between nodes.
     *
     */
    paddingRight?: number;

    /**
     * The selected node.
     *
     * @default null
     */
    selected?: HierarchyRectangularNode<any> | null;

    children?: Snippet<[{ nodes: HierarchyRectangularNode<unknown>[] }]>;
  };
</script>

<script lang="ts">
  import {
    treemap as d3treemap,
    treemapBinary,
    treemapDice,
    treemapResquarify,
    treemapSlice,
    treemapSliceDice,
    treemapSquarify,
    type HierarchyNode,
    type HierarchyRectangularNode,
  } from 'd3-hierarchy';

  import { aspectTile } from '../utils/treemap.js';
  import { getChartContext } from './Chart-Next.svelte';
  import type { Snippet } from 'svelte';

  let {
    tile = treemapSquarify,
    padding = 0,
    paddingInner = 0,
    paddingOuter = 0,
    paddingTop = 0,
    paddingBottom = 0,
    paddingLeft,
    paddingRight,
    selected = null,
    children,
  }: TreemapProps = $props();

  const ctx = getChartContext();

  const tileFunc = $derived(
    tile === 'squarify'
      ? treemapSquarify
      : tile === 'resquarify'
        ? treemapResquarify
        : tile === 'binary'
          ? treemapBinary
          : tile === 'dice'
            ? treemapDice
            : tile === 'slice'
              ? treemapSlice
              : tile === 'sliceDice'
                ? treemapSliceDice
                : tile
  );

  const treemap = $derived.by(() => {
    const _treemap = d3treemap()
      .size([ctx.width, ctx.height])
      .tile(aspectTile(tileFunc, ctx.width, ctx.height));

    if (padding) {
      _treemap.padding(padding);
    }

    if (paddingInner) {
      _treemap.paddingInner(paddingInner);
    }

    if (paddingOuter) {
      _treemap.paddingOuter(paddingOuter);
    }

    if (paddingTop) {
      _treemap.paddingTop(paddingTop);
    }

    if (paddingBottom) {
      _treemap.paddingBottom(paddingBottom);
    }

    if (paddingLeft) {
      _treemap.paddingLeft(paddingLeft);
    }
    if (paddingRight) {
      _treemap.paddingRight(paddingRight);
    }
    return _treemap;
  });

  const treemapData = $derived(treemap(ctx.data as HierarchyNode<any>));

  $effect(() => {
    selected = treemapData;
  });
</script>

{@render children?.({ nodes: treemapData.descendants() })}
