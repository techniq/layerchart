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
    type TreemapLayout,
  } from 'd3-hierarchy';

  import { chartContext } from './ChartContext.svelte';
  import { aspectTile } from '../utils/treemap.js';

  const { data, width, height } = chartContext();

  export let tile:
    | typeof treemapSquarify
    | 'binary'
    | 'squarify'
    | 'resquarify'
    | 'dice'
    | 'slice'
    | 'sliceDice' = treemapSquarify;
  export let padding = 0;
  export let paddingInner = 0;
  export let paddingOuter = 0;
  export let paddingTop = 0;
  export let paddingBottom = 0;
  export let paddingLeft: number | undefined = undefined;
  export let paddingRight: number | undefined = undefined;

  export let selected: HierarchyRectangularNode<any> | null | undefined = null;

  $: tileFunc =
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
                : tile;

  let treemap: TreemapLayout<any>;
  $: {
    treemap = d3treemap()
      .size([$width, $height])
      .tile(aspectTile(tileFunc, $width, $height));

    if (padding) {
      treemap.padding(padding);
    }
    if (paddingInner) {
      treemap.paddingInner(paddingInner);
    }
    if (paddingOuter) {
      treemap.paddingOuter(paddingOuter);
    }
    if (paddingTop) {
      treemap.paddingTop(paddingTop);
    }
    if (paddingBottom) {
      treemap.paddingBottom(paddingBottom);
    }
    if (paddingLeft) {
      treemap.paddingLeft(paddingLeft);
    }
    if (paddingRight) {
      treemap.paddingRight(paddingRight);
    }
  }

  $: treemapData = treemap($data as HierarchyNode<any>);

  // TODO: Remove selected
  $: selected = treemapData; // set initial selection
</script>

<slot nodes={treemapData.descendants()} />
