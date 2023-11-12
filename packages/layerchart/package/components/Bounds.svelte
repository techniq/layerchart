<script>import { getContext } from 'svelte';
import { scaleLinear } from 'd3-scale';
import { motionScale } from '../utils/scales';
const { width, height } = getContext('LayerCake');
export let domain;
export let range;
export let spring = undefined;
export let tweened = undefined;
function getExtents(extents, axis, fallback) {
    const resolvedExtents = typeof extents === 'function' ? extents({ width: $width, height: $height }) : extents;
    return [
        resolvedExtents?.[axis + '0'] ?? 0,
        resolvedExtents?.[axis + '1'] ?? fallback // x1 or y1, fallback as $width or $height
    ];
}
const xScale = motionScale(scaleLinear, { spring, tweened });
$: xScale.domain(getExtents(domain, 'x', $width));
$: xScale.range(getExtents(range, 'x', $width));
const yScale = motionScale(scaleLinear, { spring, tweened });
$: yScale.domain(getExtents(domain, 'y', $height));
$: yScale.range(getExtents(range, 'y', $height));
</script>

<slot xScale={$xScale} yScale={$yScale} />
