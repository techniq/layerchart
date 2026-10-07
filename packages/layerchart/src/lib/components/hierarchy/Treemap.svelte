<script lang="ts" module>
  export type TreemapProps<T> = {
    /** d3 hierarchy node */
    hierarchy: HierarchyNode<T>;

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
    padding?: number | ((node: HierarchyRectangularNode<T>) => number);

    /**
     * The inner padding between nodes.
     *
     * @default 0
     */
    paddingInner?: number | ((node: HierarchyRectangularNode<T>) => number);

    /**
     * The outer padding between nodes.
     *
     * @default 0
     */
    paddingOuter?: number | ((node: HierarchyRectangularNode<T>) => number);

    /**
     * The top padding between nodes.
     *
     * @default 0
     */
    paddingTop?: number | ((node: HierarchyRectangularNode<T>) => number);

    /**
     * The bottom padding between nodes.
     *
     * @default 0
     */
    paddingBottom?: number | ((node: HierarchyRectangularNode<T>) => number);
    /**
     * The left padding between nodes.
     *
     */
    paddingLeft?: number | ((node: HierarchyRectangularNode<T>) => number);

    /**
     * The right padding between nodes.
     *
     */
    paddingRight?: number | ((node: HierarchyRectangularNode<T>) => number);

    /**
     * Modify tiling function for approapriate aspect ratio when treemap is zoomed in
     *
     * @default false
     */
    maintainAspectRatio?: boolean;

    /** Render the nodes, in back-to-front paint order on an `isometric` chart */
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

  import { aspectTile } from '../../utils/treemap.js';
  import { getChartContext } from '$lib/contexts/chart.js';
  import { getLayerIsometric } from '$lib/contexts/isometric.js';
  import { paintOrder } from '$lib/utils/isometric.js';
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
    children,
  }: TreemapProps<T> = $props();

  const ctx = getChartContext();
  const layerIsometric = getLayerIsometric();

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
      // Make Typescript happy to pick the correct overload
      // TODO: Better way to do this?
      if (typeof padding === 'number') {
        _treemap.padding(padding);
      } else {
        _treemap.padding(padding);
      }
    }

    if (paddingInner) {
      if (typeof paddingInner === 'number') {
        _treemap.paddingInner(typeof paddingInner === 'number' ? paddingInner : paddingInner);
      } else {
        _treemap.paddingInner(paddingInner);
      }
    }

    if (paddingOuter) {
      if (typeof paddingOuter === 'number') {
        _treemap.paddingOuter(paddingOuter);
      } else {
        _treemap.paddingOuter(paddingOuter);
      }
    }

    if (paddingTop) {
      if (typeof paddingTop === 'number') {
        _treemap.paddingTop(paddingTop);
      } else {
        _treemap.paddingTop(paddingTop);
      }
    }

    if (paddingBottom) {
      if (typeof paddingBottom === 'number') {
        _treemap.paddingBottom(paddingBottom);
      } else {
        _treemap.paddingBottom(paddingBottom);
      }
    }

    if (paddingLeft) {
      if (typeof paddingLeft === 'number') {
        _treemap.paddingLeft(paddingLeft);
      } else {
        _treemap.paddingLeft(paddingLeft);
      }
    }
    if (paddingRight) {
      if (typeof paddingRight === 'number') {
        _treemap.paddingRight(paddingRight);
      } else {
        _treemap.paddingRight(paddingRight);
      }
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

  /**
   * On an isometric floor, depth first with siblings back to front.  Children sit inside their
   * parent and siblings tile it, so only siblings need comparing.
   */
  const nodes = $derived.by(() => {
    const m = layerIsometric();
    const root = treemapData.nodes[0];
    if (!m || !root) return treemapData.nodes;
    const order: HierarchyRectangularNode<T>[] = [];
    const visit = (node: HierarchyRectangularNode<T>) => {
      order.push(node);
      for (const child of node.children ? paintOrder(node.children, m) : []) visit(child);
    };
    visit(root);
    return order;
  });
</script>

{@render children?.({ nodes })}
