<script>import { getContext } from 'svelte';
import { motionStore } from '../stores/motionStore';
const { width, height } = getContext('LayerCake');
/**
 * Translate x
 */
export let x = undefined;
/**
 * Translate x
 */
export let y = undefined;
/**
 * Center within chart
 */
export let center = false;
export let spring = undefined;
export let tweened = undefined;
let tweened_x = motionStore(x, { spring, tweened });
let tweened_y = motionStore(y, { spring, tweened });
$: tweened_x.set(x);
$: tweened_y.set(y);
let transform = undefined;
$: if (x != null || y != null) {
    transform = `translate(${$tweened_x ?? 0}, ${$tweened_y ?? 0})`;
}
$: if (center) {
    transform = `translate(${$width / 2}, ${$height / 2})`;
}
</script>

<g {transform} {...$$restProps} on:click on:mousemove on:mouseleave>
	<slot />
</g>
