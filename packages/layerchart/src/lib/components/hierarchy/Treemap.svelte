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

    /**
     * Node to zoom into (matched by `data`).  Its subtree is laid out again to fill the chart, so
     * tiles keep their proportions and padding stays in pixels, while every other node is scaled
     * off around it.  Pair with mark `motion` to animate between zoom levels.
     */
    selected?: HierarchyNode<T> | null;

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
    selected,
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

      const selectedNode = selected && h.find((n) => n.data === selected.data);
      if (selectedNode && selectedNode !== h) {
        // Scale everything so the selected node fills the chart (pushing siblings off)...
        const { x0, y0, x1, y1 } = selectedNode;
        const kx = ctx.width / (x1 - x0);
        const ky = ctx.height / (y1 - y0);
        h.each((n) => {
          n.x0 = (n.x0 - x0) * kx;
          n.x1 = (n.x1 - x0) * kx;
          n.y0 = (n.y0 - y0) * ky;
          n.y1 = (n.y1 - y0) * ky;
        });

        // ...then tile the selected subtree again at that size rather than stretching it.  Laid out
        // on a copy since the layout indexes its padding by depth from the root it is given.
        const selectedLayout = _treemap(selectedNode.copy()).descendants();
        selectedNode.descendants().forEach((n, i) => {
          const { x0, y0, x1, y1 } = selectedLayout[i];
          Object.assign(n, { x0, y0, x1, y1 });
        });
      }
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
      for (const child of node.children ? ctx.isometric!.paintOrder(node.children, m) : [])
        visit(child);
    };
    visit(root);
    return order;
  });
</script>

{@render children?.({ nodes })}
