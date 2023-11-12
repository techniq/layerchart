<script>import { getContext } from 'svelte';
import { pack as d3Pack } from 'd3-hierarchy';
const { data, width, height } = getContext('LayerCake');
export let size = undefined;
/**
 * see: https://github.com/d3/d3-hierarchy#pack_padding
 */
export let padding = undefined;
let pack;
$: {
    pack = d3Pack().size(size ?? [$width, $height]);
    if (padding) {
        pack.padding(padding);
    }
}
$: packData = pack($data);
</script>

<slot nodes={packData.descendants()} />
