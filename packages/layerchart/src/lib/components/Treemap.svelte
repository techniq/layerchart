<script lang="ts" module>
  export type TreemapProps<T> = {
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
     * Modify tiling function for approapriate aspect ratio when treemap is zoomed in
     *
     * @default false
     */
    maintainAspectRatio?: boolean;

    hierarchy?: HierarchyNode<T>;

    children?: Snippet<[{ nodes: HierarchyRectangularNode<T>[] }]>;
  };
</script>

<script lang="ts" generics="T">
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
  import { getChartContext } from './Chart.svelte';
  import type { Snippet } from 'svelte';

  let {
    hierarchy,
    tile = treemapSquarify,
    padding = 0,
    paddingInner = 0,
    paddingOuter = 0,
    paddingTop = 0,
    paddingBottom = 0,
    paddingLeft,
    paddingRight,
    maintainAspectRatio = false,
    selected = $bindable(null),
    children,
  }: TreemapProps<T> = $props();

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

  const treemapData = $derived.by(() => {
    const _treemap = d3treemap<T>()
      .size([ctx.width, ctx.height])
      .tile(maintainAspectRatio ? aspectTile(tileFunc, ctx.width, ctx.height) : tileFunc);

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

    if (hierarchy) {
      const h = hierarchy.copy();
      const treemapData = _treemap(h);
      return {
        links: treemapData.links(),
        nodes: treemapData.descendants(),
      };
    }

    return {
      links: [],
      nodes: [],
    };
  });
</script>

{@render children?.({ nodes: treemapData.nodes })}
