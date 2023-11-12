<script>import { getContext } from 'svelte';
import { tree as d3Tree } from 'd3-hierarchy';
const { data, width, height, padding } = getContext('LayerCake');
/**
 * Sets this tree layout’s node size to the specified two-element array of numbers `[width, height]`.
 * If unset, layout size is used instead.  When a node size is specified, the root node is always
 * positioned at `⟨0, 0⟩`.
 *
 * see: https://github.com/d3/d3-hierarchy#tree_nodeSize
 */
export let nodeSize = undefined;
/**
 * see: https://github.com/d3/d3-hierarchy#tree_separation
 */
export let separation = undefined;
export let orientation = 'horizontal';
let tree;
$: {
    tree = d3Tree().size(orientation === 'horizontal' ? [$height, $width] : [$width, $height]);
    if (nodeSize) {
        tree.nodeSize(nodeSize);
    }
    if (separation) {
        tree.separation(separation);
    }
}
$: treeData = tree($data);
</script>

<slot nodes={treeData.descendants()} links={treeData.links()} />
