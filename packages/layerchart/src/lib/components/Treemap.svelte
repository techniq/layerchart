<script lang="ts">
  import { getContext } from 'svelte';

  import * as d3 from 'd3-hierarchy';

  import { aspectTile } from '../utils/treemap';

  const { data, width, height } = getContext('LayerCake');

  export let tile:
    | typeof d3.treemapSquarify
    | 'binary'
    | 'squarify'
    | 'resquarify'
    | 'dice'
    | 'slice'
    | 'sliceDice' = d3.treemapSquarify;
  export let padding = 0;
  export let paddingInner = 0;
  export let paddingOuter = 0;
  export let paddingTop = 0;
  export let paddingBottom = 0;
  export let paddingLeft = undefined;
  export let paddingRight = undefined;

  export let selected = null;

  $: tileFunc =
    tile === 'squarify'
      ? d3.treemapSquarify
      : tile === 'resquarify'
      ? d3.treemapResquarify
      : tile === 'binary'
      ? d3.treemapBinary
      : tile === 'dice'
      ? d3.treemapDice
      : tile === 'slice'
      ? d3.treemapSlice
      : tile === 'sliceDice'
      ? d3.treemapSliceDice
      : tile;

  let treemap;
  $: {
    treemap = d3.treemap().size([$width, $height]).tile(aspectTile(tileFunc, $width, $height));

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

  $: treemapData = treemap($data);
  // TODO: Remove selected
  $: selected = treemapData; // set initial selection
</script>

<slot nodes={treemapData.descendants()} />
