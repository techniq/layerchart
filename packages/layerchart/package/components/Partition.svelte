<script>import { getContext } from 'svelte';
import { partition as d3Partition } from 'd3-hierarchy';
const { data, width, height } = getContext('LayerCake');
export let orientation = 'horizontal';
export let size = undefined;
/**
 * see: https://github.com/d3/d3-hierarchy#tree_nodeSize
 */
export let padding = undefined;
/**
 * see: https://github.com/d3/d3-hierarchy#tree_nodeSize
 */
export let round = undefined;
let partition;
$: {
    partition = d3Partition().size(size ?? (orientation === 'horizontal' ? [$height, $width] : [$width, $height]));
    if (padding) {
        partition.padding(padding);
    }
    if (round) {
        partition.round(round);
    }
}
$: partitionData = partition($data);
</script>

<slot nodes={partitionData.descendants()} />
